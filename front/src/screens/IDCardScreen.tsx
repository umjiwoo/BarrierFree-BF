import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
  CameraRuntimeError,
  VisionCameraProxy,
  useFrameProcessor,
  CameraDeviceFormat
} from 'react-native-vision-camera';
import {Worklets} from 'react-native-worklets-core';
import {useNavigation} from '@react-navigation/native';

// idcard 플러그인 및 타입 정의 import
import {IdCardPluginResult} from '../camera/plugins/idcard';

// 네이티브 플러그인 초기화
const idcardDetecterPlugin = VisionCameraProxy.initFrameProcessorPlugin('idcardDetecter', {});

// 코너 점 색상 정의
const CORNER_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

// 카메라가 현재 처리 중인지 추적하는 상태 변수
let isProcessingFrame = false;

// 화면 크기 구하기
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const IDCardScreen = () => {
  // 네비게이션
  const navigation = useNavigation();
  
  // 카메라 참조 객체
  const cameraRef = useRef<Camera>(null);

  // 상태 관리
  const [isActive, setIsActive] = useState(true);
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastProcessingTime, setLastProcessingTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('카메라 초기화 중...');
  const [initRetries, setInitRetries] = useState(0);
  const [showDebug, setShowDebug] = useState(false); // 디버그 정보 표시 토글
  const [detectionResults, setDetectionResults] = useState<IdCardPluginResult | null>(null);

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    return true;
  }, [navigation]);

  // 카메라 권한 관리
  const {hasPermission: hasCameraPermission, requestPermission: requestCameraPermission} =
    useCameraPermission();
  const {hasPermission: hasMicPermission, requestPermission: requestMicPermission} =
    useMicrophonePermission();
    
  // 카메라 디바이스 설정
  const device = useCameraDevice('back');
  
  // 포맷 설정 - 조건부 Hook 호출 방지
  const format = useCameraFormat(device || undefined, [
    {videoResolution: {width: 640, height: 480}}, // 640x480 (4:3)
    {videoResolution: {width: 720, height: 480}}, // 720x480 (3:2)
  ]);

  // 포맷 정보 로깅 (디버깅용)
  useEffect(() => {
    if (format) {
      console.log(`📊 카메라 포맷 정보: 
      해상도: ${format.videoWidth}x${format.videoHeight}
      FPS 범위: ${format.minFps} ~ ${format.maxFps}
      HDR 지원: ${format.supportsVideoHdr ? '예' : '아니오'}`);
      
      // 사용 가능한 모든 포맷 로깅 (디버깅용)
      if (device && device.formats) {
        console.log(`📷 사용 가능한 카메라 포맷 총 ${device.formats.length}개:`);
        device.formats.forEach((fmt: CameraDeviceFormat, index: number) => {
          console.log(`[${index}] ${fmt.videoWidth}x${fmt.videoHeight}, FPS: ${fmt.minFps}-${fmt.maxFps}`);
        });
      }
    }
  }, [format, device]);

  // 권한 요청 함수
  const requestPermissions = useCallback(async () => {
    const cameraGranted = await requestCameraPermission();
    await requestMicPermission();

    if (!cameraGranted) {
      Alert.alert('카메라 권한 필요', '카메라를 사용하려면 권한이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => Linking.openSettings() },
      ]);
    }
  }, [requestCameraPermission, requestMicPermission]);

  // 탐지 결과 처리 함수
  const onDetectionsReceived = useCallback((
    result: IdCardPluginResult
  ) => {
    // 현재 시각을 로그에 기록 - 정확한 디버깅을 위함
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
    
    console.log(`⏱️ [${timeStr}] 프레임 처리 시간: ${result.processingTimeMs}ms, 방향: ${result.orientation || '알 수 없음'}`);
    
    // 이미지 정보 저장
    if (result.imageInfo) {
      console.log(`ℹ️ 이미지 정보:
원본크기: ${result.imageInfo.originalWidth || result.imageInfo.width}x${result.imageInfo.originalHeight || result.imageInfo.height}
패딩(L:${result.imageInfo.paddingLeft?.toFixed(1) || 0}, T:${result.imageInfo.paddingTop?.toFixed(1) || 0})
스케일: ${result.imageInfo.scale?.toFixed(3) || 0}`);
    }
    
    // 박스 정보
    const boxes = result.boxes;
    
    if (boxes && Array.isArray(boxes) && boxes.length > 0) {
      // 박스 정보 로깅
      console.log(`📦 감지된 박스: ${boxes.length}개`);
      
      // 첫 번째 박스의 코너 좌표 로깅
      if (boxes[0].corners && boxes[0].corners.length === 4) {
        const corners = boxes[0].corners;
        console.log(`📍 코너 좌표: 
        - 좌상: (${corners[0].x.toFixed(1)}, ${corners[0].y.toFixed(1)})
        - 우상: (${corners[1].x.toFixed(1)}, ${corners[1].y.toFixed(1)})
        - 우하: (${corners[2].x.toFixed(1)}, ${corners[2].y.toFixed(1)})
        - 좌하: (${corners[3].x.toFixed(1)}, ${corners[3].y.toFixed(1)})`);
      }
      
      // 디버그 정보 업데이트
      setDetectionCount(prev => prev + 1);
      setLastProcessingTime(result.processingTimeMs);
      setDebugInfo(`신분증 감지: ${boxes.length}개 (${result.processingTimeMs}ms)`);
      
      // 결과 저장
      setDetectionResults(result);
    } else {
      console.log(`📦 감지된 박스 없음`);
      setDebugInfo('신분증을 화면에 비춰주세요');
      setDetectionResults(null);
    }
  }, []);

  // Worklet에서 JS 스레드로 데이터 전달 함수
  const runOnJSHandleDetection = Worklets.createRunOnJS(onDetectionsReceived);

  // 카메라 오류 처리
  const handleCameraError = useCallback((error: CameraRuntimeError) => {
    console.error('카메라 오류:', error.code, error.message);
    setDebugInfo(`카메라 오류: ${error.code}`);
    
    // 초기화 재시도 카운터 증가
    if (initRetries < 3) {
      setInitRetries(prev => prev + 1);
      setTimeout(() => {
        console.log('📷 카메라 초기화 재시도');
        setDebugInfo('카메라 초기화 재시도 중...');
      }, 1000); // 1초 후 재시도
    }
  }, [initRetries]);

  // temptodo.md 예제 코드 기반 프레임 프로세서
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // 이미 처리 중이면 스킵
    if (isProcessingFrame) {
      return;
    }
    
    // 프레임 정보 로깅
    console.log(`📸 프레임 정보: ${frame.width}x${frame.height}, 포맷: ${frame.pixelFormat}, 방향: ${frame.orientation}`);
    
    // 처리 시작 표시
    isProcessingFrame = true;
    
    try {
      // 네이티브 플러그인 호출
      if (idcardDetecterPlugin) {
        // 플러그인 호출 및 결과 가져오기
        const rawResult = idcardDetecterPlugin.call(frame);
        
        // 결과 확인 및 JS 스레드로 전달
        if (rawResult) {
          // 타입 변환 (unknown을 통해 안전하게 변환)
          const result = rawResult as unknown as IdCardPluginResult;
          runOnJSHandleDetection(result);
        } else {
          // 결과가 없을 경우 빈 결과 객체 전달
          runOnJSHandleDetection({
            boxes: [],
            processingTimeMs: 0,
            orientation: frame.orientation?.toString() || 'landscape-right'
          });
        }
      } else {
        console.log('❌ idcardDetecter 플러그인 초기화 실패');
      }
    } catch (e) {
      console.error('FrameProcessor 오류:', e);
    } finally {
      // 처리 상태 초기화
      isProcessingFrame = false;
    }
  }, [runOnJSHandleDetection]);

  // ID 카드 시각화 컴포넌트 
  const IDCardVisualization = useCallback(() => {
    // 시각화할 데이터가 없으면 빈 컴포넌트 반환
    if (!detectionResults || !detectionResults.boxes || detectionResults.boxes.length === 0) {
      return null;
    }
    
    // 첫 번째 감지된 박스만 사용
    const box = detectionResults.boxes[0];
    
    // 코너 점이 없으면 빈 컴포넌트 반환
    if (!box.corners || box.corners.length !== 4) {
      return null;
    }
    
    // 이미지 정보가 있으면 스케일링 계수 계산
    const scaleX = detectionResults.imageInfo?.originalWidth 
      ? screenWidth / detectionResults.imageInfo.originalWidth
      : 1;
    const scaleY = detectionResults.imageInfo?.originalHeight
      ? screenHeight / detectionResults.imageInfo.originalHeight
      : 1;
    
    // SVG를 이용한 시각화 (Skia 대신 간단한 방법으로 시각화)
    return (
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.boxOverlay}>
          {/* 바운딩 박스 테두리 */}
          <View style={[
            styles.boxBorder,
            {
              left: box.corners[0].x * scaleX,
              top: box.corners[0].y * scaleY,
              width: box.width * scaleX,
              height: box.height * scaleY,
              transform: [{ rotate: `${box.angleDeg}deg` }]
            }
          ]} />
          
          {/* 코너 점 */}
          {box.corners.map((corner, index) => (
            <View 
              key={index}
              style={[
                styles.cornerPoint,
                {
                  left: corner.x * scaleX - 5,
                  top: corner.y * scaleY - 5,
                  backgroundColor: CORNER_COLORS[index]
                }
              ]} 
            />
          ))}
          
          {/* 디버그 정보 (선택적) */}
          {showDebug && (
            <View style={styles.debugBox}>
              <Text style={styles.debugText}>신뢰도: {(box.confidence * 100).toFixed(1)}%</Text>
              <Text style={styles.debugText}>각도: {box.angleDeg.toFixed(1)}°</Text>
              <Text style={styles.debugText}>
                크기: {box.width.toFixed(0)}x{box.height.toFixed(0)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [detectionResults, showDebug]);

  // 카메라 토글
  const toggleCamera = useCallback(() => {
    setIsActive(prev => !prev);
    setDebugInfo(prev => prev === '카메라 중지됨' ? '카메라 다시 시작됨' : '카메라 중지됨');
  }, []);
  
  // 디버그 모드 토글
  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    // 상태 초기화
    setDebugInfo('카메라 초기화 중...');
    isProcessingFrame = false;
    
    // 마운트 시 로그
    console.log('📷 IDCardScreen 마운트됨');
    
    // 언마운트 시 정리
    return () => {
      console.log('📷 IDCardScreen 언마운트됨');
      isProcessingFrame = false;
      setIsActive(false);
    };
  }, []);

  // 렌더링 - 권한이 없는 경우
  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>카메라 권한이 필요합니다</Text>
        <Text style={styles.subTitle}>신분증 인식을 위해 카메라 접근 권한이 필요합니다.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermissions}>
          <Text style={styles.primaryButtonText}>권한 요청</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoBack}>
          <Text style={styles.text}>뒤로 가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 렌더링 - 카메라를 찾을 수 없는 경우
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>카메라를 찾을 수 없습니다</Text>
        <Text style={styles.subTitle}>기기에서 카메라를 감지할 수 없습니다.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoBack}>
          <Text style={styles.text}>뒤로 가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 렌더링 - 메인 카메라 화면
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={isActive}
        frameProcessor={frameProcessor}
        fps={format?.maxFps || 30}
        resizeMode="contain"
        enableZoomGesture={false}
        onError={handleCameraError}
        onInitialized={() => {
          console.log('📷 카메라 초기화 완료');
          setDebugInfo('카메라 준비 완료');
        }}
        pixelFormat="yuv"
        outputOrientation="preview"
        androidPreviewViewType="texture-view"
        onPreviewStarted={() => console.log('카메라 프리뷰 시작')}
        onPreviewStopped={() => console.log('카메라 프리뷰 중지')}
      />
      
      {/* ID 카드 시각화 오버레이 */}
      <IDCardVisualization />
      
      <SafeAreaView style={styles.overlay}>
        <Text style={styles.overlayTitle}>신분증 인식</Text>
        <Text style={styles.debugInfo}>{debugInfo}</Text>
        {detectionCount > 0 && (
          <View style={styles.detectionInfo}>
            <Text style={styles.detectionText}>
              감지 횟수: {detectionCount} | 처리 시간: {lastProcessingTime}ms
            </Text>
          </View>
        )}
      </SafeAreaView>
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.button}
          onPress={toggleCamera}>
          <Text style={styles.text}>{isActive ? '카메라 중지' : '카메라 시작'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoBack}>
          <Text style={styles.text}>뒤로 가기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.debugButton]}
          onPress={toggleDebug}>
          <Text style={styles.text}>{showDebug ? '디버그 끄기' : '디버그 켜기'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 40,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  debugInfo: {
    fontSize: 14,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
    textAlign: 'center',
    maxWidth: '80%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -0.5, height: 0.5},
    textShadowRadius: 5,
  },
  detectionInfo: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'rgba(0, 150, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
    width: '80%',
  },
  detectionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    margin: 10,
    width: '50%',
    borderRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    padding: 12,
    margin: 10,
    width: '50%',
    borderRadius: 4,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  text: {
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: '#9c27b0', // 보라색
    width: '40%',
  },
  // ID 카드 시각화를 위한 스타일
  boxOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  boxBorder: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
  cornerPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  debugBox: {
    position: 'absolute',
    top: 200,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 3,
  },
});

export default IDCardScreen;

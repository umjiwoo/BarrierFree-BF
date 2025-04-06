import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  BackHandler,
  Alert,
  Linking
} from 'react-native';
import {
  Camera,
  useFrameProcessor,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
  CameraRuntimeError,
} from 'react-native-vision-camera';
import {Worklets} from 'react-native-worklets-core';
import {useNavigation} from '@react-navigation/native';

// idcard 플러그인 및 타입 정의 import
import {IdCardPluginResult, idcardDetecterPlugin, initIdCardDetecterPlugin} from '../camera/plugins/idcard';

// 글로벌 상태 타입 확장 - 초기화 안전성 보장
declare global {
  var _isProcessingFrame: boolean;
  var _cameraInitialized: boolean;
}

// 안전하게 글로벌 변수 초기화
if (global._isProcessingFrame === undefined) {
  global._isProcessingFrame = false;
}

if (global._cameraInitialized === undefined) {
  global._cameraInitialized = false;
}

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
  const cameraFormat = useCameraFormat(device || undefined, [
    {videoResolution: {width: 640, height: 480}}, // 640x480 (4:3)
    {videoResolution: {width: 720, height: 480}}, // 720x480 (3:2)
  ]);
  
  // 조건부 할당
  const format = device ? cameraFormat : undefined;

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


  // 카메라 초기화 시도 함수
  const initializeCamera = useCallback(() => {
    if (!hasCameraPermission || !device) {
      return;
    }

    try {
      setDebugInfo('카메라 초기화 중...');
      
      // 플러그인 사용 전 초기화 상태 확인
      try {
        if (idcardDetecterPlugin) {
          console.log('✅ idcardDetecter 플러그인 사용 가능');
        } else {
          console.warn('⚠️ idcardDetecter 플러그인을 찾을 수 없음');
          // 대체 초기화 메서드 시도
          const altPlugin = initIdCardDetecterPlugin();
          if (altPlugin) {
            console.log('✅ 대체 메서드로 플러그인 초기화 성공');
          } else {
            console.error('❌ 플러그인 초기화 실패');
          }
        }
      } catch (pluginError) {
        console.error('❌ 플러그인 초기화 오류:', pluginError);
      }
      
      global._cameraInitialized = true;
      console.log('📷 카메라 초기화 시도 #', initRetries + 1);
      
      // 여기서 필요한 추가 초기화 작업 수행
      // 예: 모델 초기화, 플러그인 준비 등
    } catch (e) {
      console.error('카메라 초기화 오류:', e);
      global._cameraInitialized = false;

      // 3회까지만 재시도
      if (initRetries < 3) {
        setInitRetries(prev => prev + 1);
        setTimeout(initializeCamera, 500); // 500ms 후 재시도
      } else {
        setDebugInfo('카메라 초기화 실패');
      }
    }
  }, [device, hasCameraPermission, initRetries]);

  // 안드로이드 하드웨어 뒤로가기 처리
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleGoBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    };
  }, [handleGoBack]);

  // 권한 요청 처리
  useEffect(() => {
    if (!hasCameraPermission || !hasMicPermission) {
      requestPermissions();
    }
  }, [hasCameraPermission, hasMicPermission, requestPermissions]);

  // 카메라 초기화
  useEffect(() => {
    if (hasCameraPermission && device && !global._cameraInitialized) {
      initializeCamera();
    }
  }, [hasCameraPermission, device, initializeCamera]);

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
원본크기: ${result.imageInfo.originalWidth}x${result.imageInfo.originalHeight}
패딩(L:${result.imageInfo.paddingLeft?.toFixed(1) || 0}, T:${result.imageInfo.paddingTop?.toFixed(1) || 0})
스케일: ${result.imageInfo.scale?.toFixed(3) || 0}`);
    }
    
    // 박스 정보
    const boxes = result.boxes;
    
    if (boxes && Array.isArray(boxes) && boxes.length > 0) {
      // 박스 정보 로깅
      console.log(`📦 감지된 박스: ${boxes.length}개`);
      
      // 디버그 정보 업데이트
      setDetectionCount(prev => prev + 1);
      setLastProcessingTime(result.processingTimeMs);
      setDebugInfo(`신분증 감지: ${boxes.length}개 (${result.processingTimeMs}ms)`);
    } else {
      console.log(`📦 감지된 박스 없음`);
      setDebugInfo('신분증을 화면에 비춰주세요');
    }
  }, []);

  // Worklet에서 JS 스레드로 데이터 전달 함수
  const runOnJSHandleDetection = Worklets.createRunOnJS(onDetectionsReceived);

  // 카메라 오류 처리
  const handleCameraError = useCallback((error: CameraRuntimeError) => {
    console.error('카메라 오류:', error.code, error.message);
    setDebugInfo(`카메라 오류: ${error.code}`);

    // 카메라 초기화 상태 재설정
    global._cameraInitialized = false;
    
    // 초기화 재시도 카운터 증가
    if (initRetries < 3) {
      setInitRetries(prev => prev + 1);
      setTimeout(initializeCamera, 1000); // 1초 후 재시도
    }
  }, [initRetries, initializeCamera]);

  // 프레임 프로세서
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // 플러그인 또는 프레임 유효성 검사
    if (!frame?.isValid) {
      console.log('⚠️ 유효하지 않은 프레임 스킵');
      return;
    }
    
    // 이미 처리 중이면 스킵
    if (global._isProcessingFrame === true) {
      return;
    }
    
    // 픽셀 포맷 확인 (yuv 권장)
    const pixelFormat = frame.pixelFormat;
    const isYuvFormat = pixelFormat === 'yuv';
    
    // 프레임 정보 로깅 (픽셀 포맷 포함)
    console.log(`📸 프레임 정보: ${frame.width}x${frame.height}, 포맷: ${pixelFormat} ${isYuvFormat ? '(권장)' : '(비권장)'}, 방향: ${frame.orientation}`);
    
    // 처리 시작 표시
    global._isProcessingFrame = true;
    
    try {
      // 플러그인 유효성 검사
      if (!idcardDetecterPlugin) {
        console.log('❌ idcardDetecter 플러그인 초기화 실패');
        global._isProcessingFrame = false;
        return;
      }
      
      // pixelFormat이 'yuv'가 아닌 경우 경고
      if (!isYuvFormat) {
        console.warn(`⚠️ 최적화되지 않은 픽셀 포맷: ${pixelFormat}. ML 모델은 'yuv' 포맷을 권장합니다.`);
      }
      
      try {
        // 네이티브 플러그인 직접 호출 - try/catch로 감싸서 오류 처리 강화
        const result = idcardDetecterPlugin.call(frame) as Record<string, any>;
        
        if (result) {
          // 결과 기본 타입 처리
          const processedResult: IdCardPluginResult = {
            boxes: Array.isArray(result.boxes) ? result.boxes : [],
            processingTimeMs: result.processingTimeMs || 0,
            imageInfo: result.imageInfo,
            rawOutputs: result.rawOutputs,
            orientation: result.orientation || (frame.orientation?.toString() || 'landscape-right')
          };
          
          // 박스 탐지 결과 로깅
          console.log(`📦 네이티브에서 반환된 박스: ${processedResult.boxes.length}개, 처리시간: ${processedResult.processingTimeMs}ms`);
          
          // 전체 result를 전달하여 처리
          runOnJSHandleDetection(processedResult);
        } else {
          // 결과가 없는 경우
          console.log('📦 탐지된 박스 없음');
          runOnJSHandleDetection({
            boxes: [],
            processingTimeMs: 0,
            orientation: frame.orientation?.toString() || 'landscape-right'
          });
        }
      } catch (pluginError) {
        // 플러그인 호출 오류 처리
        console.error('플러그인 호출 오류:', JSON.stringify(pluginError));
        runOnJSHandleDetection({
          boxes: [],
          processingTimeMs: 0,
          orientation: frame.orientation?.toString() || 'landscape-right'
        });
      }
    } catch (e) {
      console.error('FrameProcessor 오류:', JSON.stringify(e));
    } finally {
      // 처리 상태 초기화
      global._isProcessingFrame = false;
    }
  }, [runOnJSHandleDetection]);

  // 카메라 토글
  const toggleCamera = useCallback(() => {
    setIsActive(prev => !prev);
    setDebugInfo(prev => prev === '카메라 중지됨' ? '카메라 다시 시작됨' : '카메라 중지됨');
  }, []);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    // 상태 초기화
    setDebugInfo('카메라 초기화 중...');
    global._isProcessingFrame = false;
    
    // 마운트 시 로그
    console.log('📷 IDCardScreen 마운트됨');
    
    // 언마운트 시 정리
    return () => {
      console.log('📷 IDCardScreen 언마운트됨');
      global._isProcessingFrame = false;
      global._cameraInitialized = false;
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
        frameProcessorFps={5}
        resizeMode="contain"
        enableZoomGesture={false}
        onError={handleCameraError}
        onInitialized={() => {
          console.log('📷 카메라 초기화 완료');
          setDebugInfo('카메라 준비 완료');
          
          // 카메라 초기화 후 일정 시간 지연 후 프레임 처리 활성화
          setTimeout(() => {
            global._isProcessingFrame = false;
            console.log('📷 프레임 처리 준비 완료');
          }, 1000);
        }}
        pixelFormat="yuv"
        outputOrientation="preview"
        androidPreviewViewType="texture-view"
        onPreviewStarted={() => {
          console.log('카메라 프리뷰 시작');
          // 프리뷰가 시작되면 일정 시간 후에 프레임 처리 시작
          setTimeout(() => {
            global._isProcessingFrame = false;
          }, 500);
        }}
        onPreviewStopped={() => {
          console.log('카메라 프리뷰 중지');
          global._isProcessingFrame = true; // 프리뷰 중지 시 프레임 처리 중지
        }}
      />
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
});

export default IDCardScreen;

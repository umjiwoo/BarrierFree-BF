import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Linking,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useFrameProcessor,
  useCameraFormat,
} from 'react-native-vision-camera';

// worklets-core 사용
import { Worklets } from 'react-native-worklets-core';

// idcardPlugin 직접 import
import { idcardPlugin, Box, IdCardPluginResult, Corner } from '../camera/plugins/idcard';

// Skia import
import {
  Canvas,
  Line,
  Path,
  Paint,
  Skia,
  Group,
  vec,
} from '@shopify/react-native-skia';

// 모델 관련 상수 정의
const MODEL = {
  INPUT_SIZE: 640,       // 모델 입력 크기 (640x640)
  OUTPUT_CHANNELS: 6,    // 출력 채널 수 (cx, cy, width, height, confidence, angle)
  MAX_DETECTIONS: 8400,  // 최대 감지 객체 수
}

// 전역 변수 타입 선언
declare global {
  var _isProcessingFrame: boolean;
}

// 바운딩 박스 색상 설정
const BOX_COLORS = {
  HIGH_CONFIDENCE: '#00FF00', // 높은 신뢰도: 녹색
  MEDIUM_CONFIDENCE: '#FFFF00', // 중간 신뢰도: 노란색
  LOW_CONFIDENCE: '#FF0000', // 낮은 신뢰도: 빨간색
};

// 신뢰도 임계값
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.7,
};

// 박스 그리기 속성
const BOX_STYLES = {
  STROKE_WIDTH: 3,
  CORNER_RADIUS: 4,
};

const CameraTest = () => {
  // 기본 상태 관리
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [detectedBoxes, setDetectedBoxes] = useState<Box[]>([]);
  const [imageInfo, setImageInfo] = useState<any>(null);
  const [frameOrientation, setFrameOrientation] = useState<string>("landscape-right");
  
  // 변환 모드 상태 변수들
  const [rotationMode, setRotationMode] = useState<string>("ROT_270"); // 회전 모드
  const [isFlipX, setIsFlipX] = useState<boolean>(false); // X축 반전 토글
  const [isFlipY, setIsFlipY] = useState<boolean>(false); // Y축 반전 토글
  const [isFlipXY, setIsFlipXY] = useState<boolean>(false); // XY 교환 토글
  
  // 화면 크기 정보
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // 카메라 관련 훅
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    // 640x640 모델에 최적화된 포맷 우선순위
    { videoResolution: { width: MODEL.INPUT_SIZE, height: MODEL.INPUT_SIZE } }, // 정확히 일치
    { videoResolution: { width: MODEL.INPUT_SIZE, height: 480 } }, // 640x480 (4:3)
    { videoResolution: { width: 720, height: 480 } }, // 720x480 (3:2)
  ]);
  
  // 프레임 표시 크기 계산
  const getDisplayDimensions = () => {
    // 이미지 정보가 없으면 기본값 사용
    if (!imageInfo) return { width: screenWidth, height: screenHeight, left: 0, top: 0 };
    
    const { originalWidth, originalHeight } = imageInfo;
    
    // 프레임 비율 계산
    const frameRatio = originalWidth / originalHeight;
    const screenRatio = screenWidth / screenHeight;
    
    let displayWidth, displayHeight, left, top;
    
    if (frameRatio > screenRatio) {
      // 프레임이 화면보다 더 가로로 긴 경우
      displayWidth = screenWidth;
      displayHeight = screenWidth / frameRatio;
      left = 0;
      top = Math.round((screenHeight - displayHeight) / 2);
    } else {
      // 프레임이 화면보다 더 세로로 긴 경우
      displayHeight = screenHeight;
      displayWidth = screenHeight * frameRatio;
      top = 0;
      left = Math.round((screenWidth - displayWidth) / 2);
    }
    
    return { width: displayWidth, height: displayHeight, left, top };
  };
  
  // 바운딩 박스 좌표 변환 함수 (이미지 좌표 -> 화면 좌표)
  const transformBoxToScreenCoords = (box: Box) => {
    if (!box.corners || !imageInfo) return null;
    
    const { width: displayWidth, height: displayHeight, left, top } = getDisplayDimensions();
    const { originalWidth, originalHeight } = imageInfo;
    
    // 방향에 따른 좌표 변환 함수 - 다양한 변환 모드 지원
    const transformCoordinatesByOrientation = (x: number, y: number) => {
      let transformedX = x;
      let transformedY = y;
      
      // 1. 회전 모드 적용
      switch (rotationMode) {
        case "ROT_0": // 회전 없음
          transformedX = x;
          transformedY = y;
          break;
          
        case "ROT_90": // 90° 회전 (시계 방향)
          transformedX = originalHeight - y;
          transformedY = x;
          break;
          
        case "ROT_180": // 180° 회전
          transformedX = originalWidth - x;
          transformedY = originalHeight - y;
          break;
          
        case "ROT_270": // 270° 회전 (시계 반대 방향)
          transformedX = y;
          transformedY = originalWidth - x;
          break;
          
        case "ROT_45": // 45° 회전
          const center45X = originalWidth / 2;
          const center45Y = originalHeight / 2;
          const dx45 = x - center45X;
          const dy45 = y - center45Y;
          const rad45 = Math.PI / 4; // 45도
          const cos45 = Math.cos(rad45);
          const sin45 = Math.sin(rad45);
          transformedX = center45X + (dx45 * cos45 - dy45 * sin45);
          transformedY = center45Y + (dx45 * sin45 + dy45 * cos45);
          break;
          
        case "ROT_135": // 135° 회전
          const center135X = originalWidth / 2;
          const center135Y = originalHeight / 2;
          const dx135 = x - center135X;
          const dy135 = y - center135Y;
          const rad135 = (Math.PI * 3) / 4; // 135도
          const cos135 = Math.cos(rad135);
          const sin135 = Math.sin(rad135);
          transformedX = center135X + (dx135 * cos135 - dy135 * sin135);
          transformedY = center135Y + (dx135 * sin135 + dy135 * cos135);
          break;
          
        case "ROT_270_CENTER": // 중심점 기준 270° 회전
          const centerX270 = originalWidth / 2;
          const centerY270 = originalHeight / 2;
          const dx270 = x - centerX270;
          const dy270 = y - centerY270;
          const rad270 = (Math.PI * 3) / 2; // 270도
          const cos270 = Math.cos(rad270);
          const sin270 = Math.sin(rad270);
          transformedX = centerX270 + (dx270 * cos270 - dy270 * sin270);
          transformedY = centerY270 + (dx270 * sin270 + dy270 * cos270);
          break;
          
        default:
          // 기본값은 270° 회전
          transformedX = y;
          transformedY = originalWidth - x;
          break;
      }
      
      // 2. 반전 토글 적용 (XY 교환이 먼저, 그다음 X/Y 반전)
      if (isFlipXY) {
        // XY 교환 - x와 y 값 교환
        const temp = transformedX;
        transformedX = transformedY;
        transformedY = temp;
      }
      
      // X축 반전 적용
      if (isFlipX) {
        transformedX = originalWidth - transformedX;
      }
      
      // Y축 반전 적용
      if (isFlipY) {
        transformedY = originalHeight - transformedY;
      }
      
      return { x: transformedX, y: transformedY };
    };
    
    // 모서리 좌표 변환
    const transformedCorners = box.corners.map((corner: Corner) => {
      // 카메라 방향에 따른 좌표 보정
      const { x: cornerX, y: cornerY } = transformCoordinatesByOrientation(corner.x, corner.y);
      
      // 이미지 내에서의 상대적 위치 (0-1 범위)
      const relativeX = cornerX / originalWidth;
      const relativeY = cornerY / originalHeight;
      
      // 화면 좌표로 변환
      const screenX = left + (relativeX * displayWidth);
      const screenY = top + (relativeY * displayHeight);
      
      return { x: screenX, y: screenY };
    });
    
    // 중심점 좌표 변환
    const { x: centerX, y: centerY } = transformCoordinatesByOrientation(box.cx, box.cy);
    
    // 화면 좌표로 변환
    const screenCx = left + ((centerX / originalWidth) * displayWidth);
    const screenCy = top + ((centerY / originalHeight) * displayHeight);
    
    // 디버그용 로그
    console.log(`🔄 좌표 변환: 원본(${box.cx}, ${box.cy}) -> 보정(${centerX}, ${centerY}) -> 화면(${screenCx}, ${screenCy})`);
    
    return {
      ...box,
      screenCorners: transformedCorners,
      // 화면상의 중심점 계산
      screenCx,
      screenCy,
      // 화면상의 크기 계산
      screenWidth: (box.width / originalWidth) * displayWidth,
      screenHeight: (box.height / originalHeight) * displayHeight,
    };
  };
  
  // 신뢰도에 따른 박스 색상 결정
  const getBoxColorByConfidence = (confidence: number) => {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return BOX_COLORS.HIGH_CONFIDENCE;
    } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return BOX_COLORS.MEDIUM_CONFIDENCE;
    } else {
      return BOX_COLORS.LOW_CONFIDENCE;
    }
  };

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

  // 프레임 처리 함수
  const onFrameProcessed = useCallback((result: IdCardPluginResult, time: number, orientation?: string) => {
    // 현재 시각을 로그에 기록 - 정확한 디버깅을 위함
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
    
    console.log(`⏱️ [${timeStr}] 프레임 처리 시간: ${time}ms, 방향: ${orientation || '알 수 없음'}`);
    
    // 결과에서 필요한 정보 추출
    const { boxes, imageInfo: frameImageInfo, orientation: resultOrientation } = result;
    
    // 이미지 정보 저장
    if (frameImageInfo) {
      setImageInfo(frameImageInfo);
      console.log(`ℹ️ 이미지 정보:
원본크기: ${frameImageInfo.originalWidth}x${frameImageInfo.originalHeight}
패딩(L:${frameImageInfo.paddingLeft?.toFixed(1) || 0}, T:${frameImageInfo.paddingTop?.toFixed(1) || 0})
스케일: ${frameImageInfo.scale?.toFixed(3) || 0}`);
    }
    
    // 방향 정보 저장
    if (resultOrientation) {
      setFrameOrientation(resultOrientation);
      console.log(`📱 프레임 방향: ${resultOrientation}`);
    }
    
    // 바운딩 박스 정보 로깅
    if (boxes && Array.isArray(boxes) && boxes.length > 0) {
      console.log(`📦 감지된 박스: ${boxes.length}개`);
      
      // 각 박스 정보 상세 로깅
      boxes.forEach((box: Box, index: number) => {
        console.log(`  박스 #${index + 1}:
위치(중심): (${box.cx.toFixed(1)}, ${box.cy.toFixed(1)})
크기: ${box.width.toFixed(1)}x${box.height.toFixed(1)}
신뢰도: ${(box.confidence * 100).toFixed(1)}%
각도: ${box.angleDeg.toFixed(1)}°`);
        
        // 코너 좌표 로깅 (있는 경우)
        if (box.corners && box.corners.length > 0) {
          const cornerStr = box.corners.map((c, i) => 
            `    코너 #${i+1}: (${c.x.toFixed(1)}, ${c.y.toFixed(1)})`
          ).join('\n');
          console.log(`  코너점 좌표:\n${cornerStr}`);
        }
      });
      
      // UI 업데이트용 상태 설정
      setDetectedBoxes(boxes);
      
      // 디버그 정보 업데이트 (첫 번째 박스 기준)
      const firstBox = boxes[0];
      const infoText = `객체 정보:\n중심(${firstBox.cx.toFixed(0)}, ${firstBox.cy.toFixed(0)})\n` +
                       `크기(${firstBox.width.toFixed(0)}x${firstBox.height.toFixed(0)})\n` +
                       `신뢰도: ${(firstBox.confidence * 100).toFixed(0)}%\n` +
                       `각도: ${firstBox.angleDeg.toFixed(0)}°\n` +
                       `변환: ${rotationMode}${isFlipX ? ' +X반전' : ''}${isFlipY ? ' +Y반전' : ''}${isFlipXY ? ' +XY교환' : ''}`;
      
      setDebugInfo(infoText);
    } else {
      console.log(`📦 감지된 박스 없음`);
      setDetectedBoxes([]);
      setDebugInfo(`탐지된 객체 없음, 처리시간: ${time}ms`);
    }
    
    // 처리 완료 표시
    setIsProcessing(false);
  }, [rotationMode, isFlipX, isFlipY, isFlipXY]);

  // Worklets 함수 생성
  const onDetectionsReceived = Worklets.createRunOnJS(onFrameProcessed);
  const logError = Worklets.createRunOnJS(console.error);
  const setDebugInfoJS = Worklets.createRunOnJS(setDebugInfo);
  const setIsProcessingJS = Worklets.createRunOnJS(setIsProcessing);

  // 프레임 프로세서
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // 프레임 정보 로깅
    console.log(`📸 프레임 정보: ${frame.width}x${frame.height}, 포맷: ${frame.pixelFormat}, 방향: ${frame.orientation}`);
    
    // 이미 처리 중이면 스킵
    if (global._isProcessingFrame === true) {
      return;
    }
    
    // 처리 시작 표시
    global._isProcessingFrame = true;
    setIsProcessingJS(true);
    
    try {
      // 프레임 유효성 검사 추가
      if (!frame.isValid) {
        console.log('⚠️ 유효하지 않은 프레임 스킵');
        global._isProcessingFrame = false;
        return;
      }
      
      // 플러그인 유효성 검사
      if (!idcardPlugin) {
        console.log('❌ idcard 플러그인 초기화 실패');
        global._isProcessingFrame = false;
        return;
      }
      
      // 네이티브 플러그인 직접 호출
      const result = idcardPlugin.call(frame) as any;
      
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
        onDetectionsReceived(processedResult, processedResult.processingTimeMs, frame.orientation);
      } else {
        // 결과가 없는 경우
        console.log('📦 탐지된 박스 없음');
        onDetectionsReceived(
          { 
            boxes: [], 
            processingTimeMs: 0,
            orientation: frame.orientation?.toString() || 'landscape-right'
          }, 
          0, 
          frame.orientation
        );
      }
    } catch (e) {
      logError('FrameProcessor 오류:', e);
      setDebugInfoJS('🚫 프레임 처리 중 오류 발생');
    } finally {
      // 처리 상태 초기화
      global._isProcessingFrame = false;
    }
  }, []);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    if (!hasCameraPermission || !hasMicPermission) {
      requestPermissions();
    }
    
    // 전역 처리 상태 초기화
    global._isProcessingFrame = false;
    
    return () => {
      global._isProcessingFrame = false;
    };
  }, [hasCameraPermission, hasMicPermission, requestPermissions]);

  // 카메라 토글
  const toggleCamera = () => setIsActive((prev) => !prev);

  // Skia를 이용한 바운딩 박스 그리기
  const renderBoxes = () => {
    if (!detectedBoxes.length || !imageInfo) return null;
    
    const { width: displayWidth, height: displayHeight, left: offsetLeft, top: offsetTop } = getDisplayDimensions();
    
    // 프레임 디버그 표시용 경계 스타일
    const frameDebugStyle = {
      position: 'absolute',
      left: offsetLeft,
      top: offsetTop,
      width: displayWidth,
      height: displayHeight,
      borderWidth: 2,
      borderColor: 'rgba(0, 255, 0, 0.5)',
      backgroundColor: 'transparent',
    };
    
    return (
      <>
        {/* 프레임 표시 영역 시각화 */}
        <View style={frameDebugStyle as any} />
        
        {/* Skia Canvas를 이용한 바운딩 박스 그리기 */}
      <Canvas style={StyleSheet.absoluteFill}>
          {detectedBoxes.map((box, idx) => {
            // 이미지 좌표를 화면 좌표로 변환
            const transformedBox = transformBoxToScreenCoords(box);
            if (!transformedBox || !transformedBox.screenCorners) return null;
            
            // 신뢰도에 따른 색상 결정
            const boxColor = getBoxColorByConfidence(box.confidence);
            
            // 4개의 코너를 이용해 경계선 그리기
            return (
              <Group key={idx}>
                {/* 4개의 선을 그려서 경계 상자 표시 */}
                {transformedBox.screenCorners.map((corner, cornerIdx) => {
                  const nextCorner = transformedBox.screenCorners[(cornerIdx + 1) % 4];
                  return (
                    <Line
                      key={`line-${idx}-${cornerIdx}`}
                      p1={vec(corner.x, corner.y)}
                      p2={vec(nextCorner.x, nextCorner.y)}
                      strokeWidth={BOX_STYLES.STROKE_WIDTH}
                      color={boxColor}
                    />
                  );
                })}
                
                {/* 중심점 표시 (선택적) */}
                <Path
                  path={Skia.Path.Make().addCircle(transformedBox.screenCx, transformedBox.screenCy, 5)}
                  color={boxColor}
                >
                  <Paint style="fill" />
                </Path>
              </Group>
            );
          })}
      </Canvas>
      </>
    );
  };

  // 회전 모드 변경 함수
  const changeRotationMode = (mode: string) => {
    setRotationMode(mode);
    console.log(`회전 모드 변경: ${mode}`);
    
    // 디버그 정보 업데이트
    updateDebugInfo();
  };
  
  // 반전 토글 변경 함수
  const toggleFlipX = (value: boolean) => {
    if (value) {
      // X축 반전을 켜면 Y축 반전은 끔
      setIsFlipX(true);
      setIsFlipY(false);
    } else {
      setIsFlipX(false);
    }
    
    // 디버그 정보 업데이트
    updateDebugInfo();
  };
  
  const toggleFlipY = (value: boolean) => {
    if (value) {
      // Y축 반전을 켜면 X축 반전은 끔
      setIsFlipY(true);
      setIsFlipX(false);
    } else {
      setIsFlipY(false);
    }
    
    // 디버그 정보 업데이트
    updateDebugInfo();
  };
  
  const toggleFlipXY = (value: boolean) => {
    setIsFlipXY(value);
    
    // 디버그 정보 업데이트
    updateDebugInfo();
  };
  
  // 디버그 정보 업데이트 함수
  const updateDebugInfo = () => {
    if (detectedBoxes.length > 0) {
      const firstBox = detectedBoxes[0];
      const infoText = `객체 정보:\n중심(${firstBox.cx.toFixed(0)}, ${firstBox.cy.toFixed(0)})\n` +
                       `크기(${firstBox.width.toFixed(0)}x${firstBox.height.toFixed(0)})\n` +
                       `신뢰도: ${(firstBox.confidence * 100).toFixed(0)}%\n` +
                       `각도: ${firstBox.angleDeg.toFixed(0)}°\n` +
                       `변환: ${rotationMode}${isFlipX ? ' +X반전' : ''}${isFlipY ? ' +Y반전' : ''}${isFlipXY ? ' +XY교환' : ''}`;
      setDebugInfo(infoText);
    }
  };
  
  // 회전 모드 버튼 렌더링
  const renderRotationButtons = () => {
    const modes = [
      // 기본 회전
      { key: "ROT_0", label: "0°" },
      { key: "ROT_90", label: "90°" },
      { key: "ROT_180", label: "180°" },
      { key: "ROT_270", label: "270°" },
      
      // 추가 회전
      { key: "ROT_45", label: "45°" },
      { key: "ROT_135", label: "135°" },
      { key: "ROT_270_CENTER", label: "270°(중심)" },
    ];
    
    return (
      <View style={styles.controlButtonsContainer}>
        <Text style={styles.controlTitle}>회전:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.controlScroll}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.controlButton,
                rotationMode === mode.key ? styles.activeControlButton : null
              ]}
              onPress={() => changeRotationMode(mode.key)}
            >
              <Text 
                style={[
                  styles.controlButtonText,
                  rotationMode === mode.key ? styles.activeControlButtonText : null
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // 반전 토글 렌더링
  const renderFlipToggles = () => {
    return (
      <View style={styles.toggleContainer}>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>X반전:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isFlipX ? "#2196F3" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleFlipX}
            value={isFlipX}
          />
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>Y반전:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isFlipY ? "#2196F3" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleFlipY}
            value={isFlipY}
          />
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>XY교환:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isFlipXY ? "#2196F3" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleFlipXY}
            value={isFlipXY}
          />
        </View>
      </View>
    );
  };
  
  // 메인 렌더링
  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>카메라를 찾을 수 없습니다</Text>
      </View>
    );
  }

  if (!hasCameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>카메라 권한 필요</Text>
        <Button title="권한 요청" onPress={requestPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isActive ? (
        <>
          {/* 카메라 컨테이너 */}
          <View style={styles.cameraContainer}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            format={format}
            isActive={isActive}
            pixelFormat="yuv"
            frameProcessor={frameProcessor}
              resizeMode="contain"
              enableZoomGesture={false}
              outputOrientation="preview"
          />
          
          {/* 바운딩 박스 오버레이 */}
            {renderBoxes()}
          </View>
          
          {/* 회전 모드 버튼 */}
          {renderRotationButtons()}
          
          {/* 반전 토글 스위치 */}
          {renderFlipToggles()}
          
          {/* 화면 내 로그 표시 영역 */}
          <View style={styles.logContainer}>
            <Text style={styles.logText}>
              📦 감지된 박스: {detectedBoxes.length}개
              {detectedBoxes.length > 0 && detectedBoxes[0] ? '\n🎯 첫번째 박스: ' +
                `중심(${detectedBoxes[0].cx.toFixed(1)}, ${detectedBoxes[0].cy.toFixed(1)}), ` +
                `크기(${detectedBoxes[0].width.toFixed(1)}x${detectedBoxes[0].height.toFixed(1)})` : ''}
            </Text>
          </View>
          
          {/* 디버그 컨테이너 */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>📱 객체 감지 결과</Text>
            <Text style={styles.debugText}>
              {debugInfo || '추론 대기 중...'}
            </Text>
            <Text style={styles.modelStatus}>
              ✅ TF Lite 활성화됨 {isProcessing ? '(처리 중...)' : ''} 
              {'\n'}📱 방향: {frameOrientation}
              {imageInfo ? `\n📐 원본크기: ${imageInfo.originalWidth}x${imageInfo.originalHeight}` : ''}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.title}>카메라 테스트</Text>
          <Text style={styles.description}>
            카메라를 켜고 객체 탐지를 확인하세요.
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={isActive ? '카메라 끄기' : '카메라 켜기'}
          onPress={toggleCamera}
        />
      </View>
    </View>
  );
};

export default CameraTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00FF00',
    elevation: 8,
    zIndex: 20,
  },
  debugTitle: {
    color: '#00FF00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelStatus: {
    color: '#00FF00',
    fontSize: 14,
    marginTop: 5,
  },
  logContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00FF00',
    elevation: 8,
    zIndex: 20,
  },
  logText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlButtonsContainer: {
    position: 'absolute',
    top: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 10,
    padding: 8,
    zIndex: 30,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  controlTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  controlScroll: {
    flexDirection: 'row',
  },
  controlButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 6,
    backgroundColor: 'rgba(30,30,30,0.8)',
    borderWidth: 1,
    borderColor: '#555',
  },
  activeControlButton: {
    backgroundColor: '#0088FF',
    borderColor: '#00FFFF',
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeControlButtonText: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    position: 'absolute',
    top: 140,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 10,
    padding: 10,
    zIndex: 30,
    borderWidth: 2,
    borderColor: '#FF00FF',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
});

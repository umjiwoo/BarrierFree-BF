import {View, Text, StyleSheet, Button, Linking, Alert, Platform} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  Canvas,
  RoundedRect,
  Paint,
} from '@shopify/react-native-skia';
import {runOnJS, useSharedValue} from 'react-native-reanimated';

// YOLO 객체 감지 유틸리티 함수 가져오기
import {detectObjects, Detection, CLASSES, COLORS, TensorflowDelegate} from '../utils/yoloDetector';

// TFLite 모델 경로 설정
const MODEL_PATH = 'bs32.tflite';

// 현재 플랫폼에 맞는 가속 델리게이트 선택
// Android 15부터는 NNAPI가 지원 중단되므로 GPU 사용
const getOptimalDelegate = (): TensorflowDelegate => {
  if (Platform.OS === 'android') {
    // 안드로이드 12 이상인 경우 GPU 가속, 그 이하는 NNAPI 사용
    return Platform.Version >= 31 ? 'gpu' : 'nnapi';
  }
  return 'cpu'; // iOS는 기본 CPU 사용
};

const CameraTest = () => {
  // 카메라 권한 관련 훅
  const {hasPermission: hasCameraPermission, requestPermission: requestCameraPermission} = useCameraPermission();
  // 마이크 권한 관련 훅
  const {hasPermission: hasMicPermission, requestPermission: requestMicPermission} = useMicrophonePermission();
  
  // 카메라 디바이스 가져오기 (후면 카메라 사용)
  const device = useCameraDevice('back');
  
  // 카메라 활성화 상태
  const [isActive, setIsActive] = useState(false);
  
  // 감지된 객체 상태
  const detections = useSharedValue<Detection[]>([]);
  
  // 감지된 객체를 JS에서 사용하기 위한 상태
  const [jsDetections, setJsDetections] = useState<Detection[]>([]);

  // 객체 감지 결과를 JS로 전달하는 함수
  const onDetectionsUpdated = useCallback((newDetections: Detection[]) => {
    setJsDetections(newDetections);
  }, []);
  
  // 프레임 프로세서 설정
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    
    try {
      // YOLO 모델을 사용하여 객체 감지
      const detected = detectObjects(frame, {
        modelPath: MODEL_PATH,
        scoreThreshold: 0.5,
        delegate: getOptimalDelegate(),
      });
      
      // 감지 결과 업데이트
      detections.value = detected;
      
      // JS 스레드로 결과 전송
      runOnJS(onDetectionsUpdated)(detected);
    } catch (error) {
      console.error('프레임 처리 오류:', error);
    }
  }, [onDetectionsUpdated]);

  // 권한 요청 함수
  const requestPermissions = useCallback(async () => {
    const cameraPermission = await requestCameraPermission();
    await requestMicPermission(); // 마이크 권한도 요청하지만 결과값은 사용하지 않음
    
    if (!cameraPermission) {
      Alert.alert(
        '카메라 권한 필요',
        '카메라를 사용하기 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [
          {text: '취소', style: 'cancel'},
          {text: '설정으로 이동', onPress: () => Linking.openSettings()},
        ],
      );
    }
  }, [requestCameraPermission, requestMicPermission]);

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    if (!hasCameraPermission || !hasMicPermission) {
      requestPermissions();
    }
  }, [hasCameraPermission, hasMicPermission, requestPermissions]);

  // 카메라 활성화/비활성화 토글
  const toggleCamera = () => {
    setIsActive(prev => !prev);
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>카메라를 찾을 수 없습니다</Text>
        <Text style={styles.description}>
          기기의 카메라에 접근할 수 없습니다.
        </Text>
      </View>
    );
  }

  if (!hasCameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>카메라 권한이 필요합니다</Text>
        <Text style={styles.description}>
          카메라 기능을 사용하기 위해 권한이 필요합니다.
        </Text>
        <Button title="권한 요청" onPress={requestPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isActive ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            frameProcessor={frameProcessor}
          />
          
          {/* 객체 감지 결과를 표시하는 캔버스 */}
          <Canvas style={StyleSheet.absoluteFill}>
            {jsDetections.map((detection, index) => {
              const classId = detection.class;
              const fieldName = CLASSES[classId] || `필드 ${classId}`;
              const color = COLORS[classId % COLORS.length];
              const score = Math.round(detection.score * 100);
              const label = `${fieldName} (${score}%)`;
              
              const box = detection.box;
              const x = box.x;
              const y = box.y;
              const width = box.width;
              const height = box.height;
              
              return (
                <React.Fragment key={index}>
                  {/* 바운딩 박스 */}
                  <RoundedRect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    r={2}
                    color="transparent"
                    strokeWidth={2}
                    style="stroke"
                  >
                    <Paint color={color} />
                  </RoundedRect>
                  
                  {/* 레이블 배경 */}
                  <RoundedRect
                    x={x}
                    y={y - 20}
                    width={label.length * 6}
                    height={20}
                    r={4}
                    color={color}
                  />
                </React.Fragment>
              );
            })}
          </Canvas>
        </>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.title}>주민등록증 필드 감지</Text>
          <Text style={styles.description}>
            아래 버튼을 눌러 카메라를 켜면 주민등록증 필드를 감지합니다.
          </Text>
          <Text style={styles.description}>
            {Platform.OS === 'android' 
              ? `가속 모드: ${getOptimalDelegate().toUpperCase()}` 
              : '가속 모드: CPU'}
          </Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isActive ? "카메라 끄기" : "카메라 켜기"} 
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
}); 
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import * as tf from 'react-native-fast-tflite';
import {Canvas, Path, Skia, Paint} from '@shopify/react-native-skia';
import {runOnJS} from 'react-native-reanimated';

// 색상 목록 (각 클래스마다 다른 색상 지정)
const COLORS = [
  '#FF0000', // red - title
  '#00FF00', // green - name_kor
  '#0000FF', // blue - name_hanja
  '#FFFF00', // yellow - idnum
  '#800080', // purple - address
  '#FFA500', // orange - issue_date
  '#00FFFF', // cyan - issue_location
  '#FF00FF', // magenta - address_box
  '#00FF00', // lime - full_image
  '#FFC0CB', // pink - id_card
];

// 화면 크기 가져오기
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// 감지 결과 타입
interface Detection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  class: number;
  score: number;
}

// 프레임 리사이징 worklet 함수
function resizeFrame(
  srcData: ArrayBuffer,
  srcWidth: number,
  srcHeight: number,
  srcStride: number,
  dstWidth: number,
  dstHeight: number,
  pixelFormat: string
): Float32Array {
  'worklet';
  
  // 출력 버퍼 (Float32Array, 0-1 범위로 정규화된 RGB 값)
  const dstBuffer = new Float32Array(dstWidth * dstHeight * 3);
  
  // 크기 비율 계산
  const scaleX = srcWidth / dstWidth;
  const scaleY = srcHeight / dstHeight;
  
  // 소스 데이터를 Uint8Array로 변환
  const srcBuffer = new Uint8Array(srcData);
  
  if (pixelFormat === 'rgb') {
    // RGB 형식 처리
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        // 소스 이미지에서의 위치 계산
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        
        // 소스 이미지에서의 인덱스 (RGB 형식, 픽셀당 3바이트)
        const srcIdx = (srcY * srcWidth + srcX) * 3;
        
        // 대상 이미지에서의 인덱스
        const dstIdx = (y * dstWidth + x) * 3;
        
        // RGB 값 복사 (0-1 범위로 정규화)
        dstBuffer[dstIdx] = srcBuffer[srcIdx] / 255.0;     // R
        dstBuffer[dstIdx + 1] = srcBuffer[srcIdx + 1] / 255.0; // G
        dstBuffer[dstIdx + 2] = srcBuffer[srcIdx + 2] / 255.0; // B
      }
    }
  } else if (pixelFormat === 'yuv' || pixelFormat === 'yuv420') {
    // YUV 형식 처리 (간소화된 버전)
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        // 소스 이미지에서의 위치 계산
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        
        // Y값만 사용 (YUV420에서 Y 플레인은 이미지 전체 크기)
        const srcIdx = srcY * srcStride + srcX;
        const yValue = srcBuffer[srcIdx];
        
        // 간단하게 Y값을 R, G, B에 동일하게 적용 (그레이스케일)
        const dstIdx = (y * dstWidth + x) * 3;
        dstBuffer[dstIdx] = yValue / 255.0;     // R
        dstBuffer[dstIdx + 1] = yValue / 255.0; // G
        dstBuffer[dstIdx + 2] = yValue / 255.0; // B
      }
    }
  } else {
    // 지원되지 않는 형식은 회색으로 채움
    for (let i = 0; i < dstBuffer.length; i++) {
      dstBuffer[i] = 0.5; // 회색 (0.5)
    }
  }
  
  return dstBuffer;
}

const ObjectDetection = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [model, setModel] = useState<tf.TensorflowModel | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  const device = useCameraDevice('back');
  
  // 권한 요청
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    })();
  }, []);

  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        // TensorFlow 모델 초기화
        const tfliteModel = await tf.loadTensorflowModel(require('../assets/bs32.tflite'));
        
        setModel(tfliteModel);
        setIsModelLoaded(true);
        console.log('모델 로드 완료');
      } catch (error) {
        console.error('모델 로드 오류:', error);
      }
    };

    loadModel();

    return () => {
      // 모델 해제는 필요 없음 - react-native-fast-tflite에서 자동 관리됨
    };
  }, []);

  // IoU(Intersection over Union) 계산
  const calculateIoU = useCallback((boxA: any, boxB: any) => {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);
    
    // 겹치는 영역 계산
    const intersectionArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    
    // 두 박스 영역 합
    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;
    
    return intersectionArea / (boxAArea + boxBArea - intersectionArea);
  }, []);

  // NMS 알고리즘
  const applyNMS = useCallback((detections: any[], iouThreshold = 0.45) => {
    if (detections.length === 0) return [];
    
    // 점수 기준 내림차순 정렬
    const sortedDetections = [...detections].sort((a, b) => b.score - a.score);
    const selected = [];
    const rejected = new Set();
    
    for (let i = 0; i < sortedDetections.length; i++) {
      if (rejected.has(i)) continue;
      
      selected.push(sortedDetections[i]);
      
      for (let j = i + 1; j < sortedDetections.length; j++) {
        if (rejected.has(j)) continue;
        
        // 같은 클래스에 대해서만 NMS 적용
        if (sortedDetections[i].class === sortedDetections[j].class) {
          const iou = calculateIoU(sortedDetections[i].box, sortedDetections[j].box);
          if (iou >= iouThreshold) {
            rejected.add(j);
          }
        }
      }
    }
    
    return selected;
  }, [calculateIoU]);

  // 감지 결과 처리 함수
  const processDetections = useCallback((outputBuffer: any, threshold = 0.5) => {
    if (!outputBuffer || !outputBuffer.length) return [];
    
    try {
      // 출력 형식 가정: [1, 14, 8400] 형태의 텐서, 직접 배열로 접근
      const rows = 14; // 4개 좌표 + 10개 클래스
      const anchors = 8400; // 앵커 박스 수
      const result = [];
      
      for (let i = 0; i < anchors; i++) {
        // 클래스 점수 계산
        let maxScore = 0;
        let maxClassId = -1;
        
        for (let c = 4; c < rows; c++) {
          const score = outputBuffer[c * anchors + i];
          if (score > maxScore) {
            maxScore = score;
            maxClassId = c - 4;
          }
        }
        
        if (maxScore >= threshold) {
          // 박스 좌표 추출 (YOLO 형식: cx, cy, w, h)
          const cx = outputBuffer[0 * anchors + i];
          const cy = outputBuffer[1 * anchors + i];
          const w = outputBuffer[2 * anchors + i];
          const h = outputBuffer[3 * anchors + i];
          
          // 정규화된 좌표 (0~1)
          result.push({
            box: {
              x: cx - w / 2,
              y: cy - h / 2,
              width: w,
              height: h
            },
            class: maxClassId,
            score: maxScore
          });
        }
      }
      
      // NMS(Non-Maximum Suppression) 적용
      return applyNMS(result, 0.45);
    } catch (error) {
      console.error('감지 결과 처리 오류:', error);
      return [];
    }
  }, [applyNMS]);
  
  // 오류 처리 함수
  const onError = useCallback((errorMessage: string) => {
    setProcessingError(errorMessage);
  }, []);
  
  // JS 스레드에서 실행할 추론 함수
  const runInference = useCallback((inputData: Float32Array) => {
    if (!model) return;
    
    try {
      // 모델 실행 
      const outputs = model.runSync([inputData]);
      
      // 결과 처리
      if (outputs && outputs.length > 0) {
        const outputData = outputs[0];
        
        // 결과 처리
        const detectionResults = processDetections(outputData, 0.5);
        
        // 결과 업데이트
        setDetections(detectionResults);
      }
    } catch (error) {
      console.error('모델 추론 오류:', error);
      setProcessingError('모델 추론 중 오류가 발생했습니다');
    }
  }, [model, processDetections]);

  // 프레임 프로세서 구현 - 실시간 프레임 처리
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    if (!model) return;
    
    try {
      // 1. 카메라 프레임 데이터 추출
      const width = frame.width;
      const height = frame.height;
      const bytesPerRow = frame.bytesPerRow;
      const pixelFormat = frame.pixelFormat;
      const data = frame.toArrayBuffer();
      
      if (!data) {
        runOnJS(onError)('프레임 데이터를 추출할 수 없습니다');
        return;
      }
      
      // 2. 모델 입력 크기에 맞게 이미지 리사이징 및 전처리
      const inputWidth = 640;
      const inputHeight = 640;
      
      // 프레임 리사이징 및 정규화 (0-1 범위)
      const inputData = resizeFrame(
        data,
        width,
        height,
        bytesPerRow,
        inputWidth,
        inputHeight,
        pixelFormat || 'rgb'
      );
      
      // 모델 실행은 JS 스레드에서 수행해야 함
      runOnJS(runInference)(inputData);
    } catch (error) {
      // 오류 내용 로깅
      let errorMessage = '알 수 없는 오류';
      
      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      runOnJS(onError)(errorMessage);
    }
  }, [model, onError]);

  // 카메라 활성화/비활성화 토글
  const toggleCamera = useCallback(() => {
    setCameraActive(!cameraActive);
    setProcessingError(null); // 카메라 상태 변경 시 오류 초기화
  }, [cameraActive]);

  // 권한 없는 경우
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>카메라 권한이 필요합니다</Text>
      </SafeAreaView>
    );
  }

  // 디바이스를 찾을 수 없는 경우
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>카메라를 찾을 수 없습니다</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isModelLoaded ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>모델 로딩 중...</Text>
        </View>
      ) : (
        <>
          {cameraActive ? (
            <View style={styles.cameraContainer}>
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                pixelFormat="rgb"
                photo={false}
                video={false}
              />
              
              {/* 감지 결과 렌더링 */}
              <Canvas style={StyleSheet.absoluteFill}>
                {detections.map((detection, index) => {
                  const classId = detection.class;
                  const colorValue = COLORS[classId % COLORS.length];
                  
                  // 정규화된 좌표를 화면 좌표로 변환
                  const box = detection.box;
                  const x = box.x * SCREEN_WIDTH;
                  const y = box.y * SCREEN_HEIGHT;
                  const width = box.width * SCREEN_WIDTH;
                  const height = box.height * SCREEN_HEIGHT;
                  
                  // 바운딩 박스 직접 그리기
                  const rect = {
                    x: x,
                    y: y,
                    width: width,
                    height: height
                  };
                  
                  return (
                    <React.Fragment key={index}>
                      {/* 바운딩 박스 */}
                      <Path
                        path={Skia.Path.Make().addRect(rect)}
                        color="transparent"
                        style="stroke"
                        strokeWidth={2}
                      >
                        <Paint color={colorValue} />
                      </Path>
                      
                      {/* 텍스트 배경 */}
                      <Path
                        path={Skia.Path.Make().addRRect({
                          rect: {
                            x: x,
                            y: y - 20,
                            width: 120,
                            height: 20
                          },
                          rx: 4,
                          ry: 4
                        })}
                        color={colorValue}
                      />
                    </React.Fragment>
                  );
                })}
              </Canvas>
              
              <View style={styles.infoOverlay}>
                <Text style={styles.infoText}>
                  감지된 객체: {detections.length}개
                </Text>
                {processingError && (
                  <Text style={styles.errorText}>
                    오류: {processingError}
                  </Text>
                )}
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="카메라 종료"
                  onPress={toggleCamera}
                  color="red"
                />
              </View>
            </View>
          ) : (
            <View style={styles.startContainer}>
              <Text style={styles.title}>주민등록증 필드 감지</Text>
              <Text style={styles.description}>
                카메라를 시작하고 주민등록증을 비추면 각 필드를 자동으로 감지합니다.
              </Text>
              <Text style={styles.description}>
                사용 중인 가속 모드: {
                  Platform.OS === 'android' && Platform.Version >= 31 
                    ? 'GPU' 
                    : Platform.OS === 'android' 
                      ? 'NNAPI' 
                      : 'CPU'
                }
              </Text>
              <Button
                title="카메라 시작"
                onPress={toggleCamera}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  },
});

export default ObjectDetection; 
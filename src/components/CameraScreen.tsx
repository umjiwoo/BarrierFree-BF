import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  NativeModules,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  ScrollView,
  NativeEventEmitter,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Polygon, Text as SvgText } from 'react-native-svg';

// 네이티브 모듈 가져오기
const { CameraPreviewModule } = NativeModules;

// TFLite 모델 및 라벨 파일 이름 (assets 폴더에 저장된 실제 파일명)
const MODEL_FILE_NAME = 'sadtearsmallcat.tflite';
const LABELS_FILE_NAME = 'sadtearsmallcatlabel.txt';

// 모델 정보 타입 정의
interface ModelInfo {
  modelName: string;
  inputWidth: number;
  inputHeight: number;
  outputTensors: number;
  isQuantized: boolean;
  modelPath: string;
}

// 성능 정보 타입 정의
interface PerformanceInfo {
  averageInferenceTime: number;
  minInferenceTime: number;
  maxInferenceTime: number;
  sampleCount: number;
}

// 감지 결과 타입 정의
interface DetectionResult {
  score: number;
  label: string;
  boundingBox: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  angle?: number;
  angleDegrees?: number;
  corners?: Array<{x: number, y: number}>;
}

const CameraScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [performanceInfo, setPerformanceInfo] = useState<PerformanceInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // 이벤트 리스너 등록
  useEffect(() => {
    console.log('이벤트 리스너 등록 시작');
    const eventEmitter = new NativeEventEmitter(CameraPreviewModule);
    
    // 사용 가능한 이벤트 리스너 로깅
    console.log('CameraPreviewModule 확인:', CameraPreviewModule);
    
    // DETECTION_EVENT의 실제 이름인 'onDetectionResults' 구독
    const subscription = eventEmitter.addListener('onDetectionResults', (results) => {
      console.log('감지 결과 수신:', JSON.stringify(results));
      setDetectionResults(results);
    });
    
    console.log('이벤트 리스너 등록 완료');

    // 컴포넌트 언마운트 시 이벤트 리스너 해제
    return () => {
      console.log('이벤트 리스너 해제');
      if (isDetecting) {
        CameraPreviewModule.stopObjectDetection()
          .then(() => console.log('객체 감지 중지됨'))
          .catch((err: any) => console.error('감지 중지 오류:', err));
      }
      subscription.remove();
    };
  }, [isDetecting]);

  // 성능 정보 정기적 업데이트
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (modelLoaded) {
      // 5초마다 성능 정보 업데이트
      intervalId = setInterval(async () => {
        try {
          const perfInfo = await CameraPreviewModule.getModelPerformance(MODEL_FILE_NAME);
          setPerformanceInfo(perfInfo);
        } catch (error: any) {
          console.error('성능 정보 가져오기 오류:', error);
        }
      }, 5000);
      
      // 초기 성능 정보 가져오기
      CameraPreviewModule.getModelPerformance(MODEL_FILE_NAME)
        .then(setPerformanceInfo)
        .catch((error: any) => console.error('초기 성능 정보 가져오기 오류:', error));
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [modelLoaded]);

  // 모델 정보 가져오기
  const getModelInfo = useCallback(async () => {
    if (!modelLoaded) return;
    
    try {
      const info = await CameraPreviewModule.getModelInfo(MODEL_FILE_NAME);
      console.log('모델 정보:', info);
      setModelInfo(info);
    } catch (error) {
      console.error('모델 정보 가져오기 오류:', error);
    }
  }, [modelLoaded]);

  // 모델 로드 완료 후 모델 정보 가져오기
  useEffect(() => {
    if (modelLoaded) {
      getModelInfo();
    }
  }, [modelLoaded, getModelInfo]);

  // 모델 로드 함수
  const loadTFLiteModel = useCallback(async () => {
    try {
      setModelLoading(true);
      
      // 모델이 이미 로드되었는지 확인 (모델 파일명 전달)
      const isLoaded = await CameraPreviewModule.isModelLoaded(MODEL_FILE_NAME);
      if (isLoaded) {
        setModelLoaded(true);
        setModelLoading(false);
        return;
      }
      
      // 모델 로드
      const result = await CameraPreviewModule.loadTFLiteModel(MODEL_FILE_NAME, LABELS_FILE_NAME);
      if (result && result.success) {
        console.log('모델 로드 성공:', result);
        setModelLoaded(true);
      } else {
        console.error('모델 로드 실패');
        Alert.alert('오류', '모델을 로드할 수 없습니다.');
      }
    } catch (error) {
      console.error('모델 로드 오류:', error);
      Alert.alert('오류', '모델을 로드하는 중 오류가 발생했습니다.');
    } finally {
      setModelLoading(false);
    }
  }, []);

  // 감지 시작/중지 처리
  const toggleDetection = useCallback(() => {
    if (isDetecting) {
      CameraPreviewModule.stopObjectDetection()
        .then(() => {
          setIsDetecting(false);
          setDetectionResults([]);
          setDetectionError(null);
        })
        .catch((err: any) => {
          console.error('감지 중지 오류:', err);
          setDetectionError('감지 중지 오류: ' + err);
        });
    } else {
      CameraPreviewModule.startObjectDetection(MODEL_FILE_NAME)
        .then(() => {
          setIsDetecting(true);
          setDetectionError(null);
        })
        .catch((err: any) => {
          console.error('감지 시작 오류:', err);
          setDetectionError('감지 시작 오류: ' + err);
        });
    }
  }, [isDetecting]);

  // 권한 요청 함수
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '카메라 권한 필요',
          message: '이 앱은 사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '거부',
          buttonPositive: '허용',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('카메라 권한이 허용되었습니다');
        setHasCameraPermission(true);
        
        // 권한을 얻은 후 TF Lite 모델 로드
        await loadTFLiteModel();
        
        return true;
      } else {
        console.log('카메라 권한이 거부되었습니다');
        setHasCameraPermission(false);
        return false;
      }
    } catch (err) {
      console.error('권한 요청 오류:', err);
      return false;
    }
  };

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    if (Platform.OS === 'android') {
      const checkPermission = async () => {
        try {
          // 네이티브 모듈을 통한 권한 체크
          const hasPermission = await CameraPreviewModule.hasPermission();
          setHasCameraPermission(hasPermission);
          
          // 권한이 있으면 모델 로드
          if (hasPermission) {
            loadTFLiteModel();
          }
        } catch (error) {
          console.error('권한 확인 오류:', error);
          // 네이티브 권한 체크에 실패한 경우 PermissionsAndroid API 사용
          const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          setHasCameraPermission(result);
          
          // 권한이 있으면 모델 로드
          if (result) {
            loadTFLiteModel();
          }
        }
      };
      
      checkPermission();
    }
  }, [loadTFLiteModel]);

  // 카메라 열기 함수
  const openCamera = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // 권한이 없으면 요청
        if (hasCameraPermission !== true) {
          const permissionGranted = await requestCameraPermission();
          if (!permissionGranted) {
            Alert.alert('알림', '카메라 권한이 필요합니다');
            return;
          }
        }
        
        // 모델이 로드되지 않았으면 로드
        if (!modelLoaded && !modelLoading) {
          await loadTFLiteModel();
        }
        
        setLoading(true);
        
        const result = await CameraPreviewModule.openCamera();
        
        // 사용자가 뒤로가기로 취소한 경우
        if (result && result.cancelled) {
          console.log('카메라 취소됨');
          return;
        }
        
        if (result && result.uri) {
          console.log('이미지 경로:', result.uri);
          setImageUri(result.uri);
        }
      } else {
        Alert.alert('알림', 'iOS는 지원하지 않습니다');
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      // 오류 메시지를 더 자세히 표시
      if ((error as any)?.message) {
        Alert.alert('오류', `카메라를 열 수 없습니다: ${(error as any).message}`);
      } else {
        Alert.alert('오류', '카메라를 열 수 없습니다');
      }
    } finally {
      setLoading(false);
    }
  }, [hasCameraPermission, modelLoaded, modelLoading, loadTFLiteModel]);

  // 이미지 초기화 함수
  const resetImage = useCallback(() => {
    setImageUri(null);
  }, []);

  // 권한 요청 UI
  const renderPermissionRequest = () => (
    <View style={styles.cameraButtonContainer}>
      <Text style={styles.title}>카메라 권한 필요</Text>
      <Text style={styles.text}>이 앱은 사진 촬영을 위해 카메라 접근 권한이 필요합니다.</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={requestCameraPermission}
      >
        <Text style={styles.buttonText}>
          권한 허용하기
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 성능 정보 표시 컴포넌트
  const renderPerformanceInfo = () => {
    if (!performanceInfo) return null;
    
    return (
      <View style={styles.performanceContainer}>
        <Text style={styles.performanceTitle}>성능 정보</Text>
        <View style={styles.performanceContent}>
          <Text style={styles.performanceText}>
            평균 추론 시간: {performanceInfo.averageInferenceTime.toFixed(2)} ms
          </Text>
          <Text style={styles.performanceText}>
            최소 추론 시간: {performanceInfo.minInferenceTime.toFixed(2)} ms
          </Text>
          <Text style={styles.performanceText}>
            최대 추론 시간: {performanceInfo.maxInferenceTime.toFixed(2)} ms
          </Text>
          <Text style={styles.performanceText}>
            측정 샘플 수: {performanceInfo.sampleCount}
          </Text>
        </View>
      </View>
    );
  };

  // 모델 정보 표시 컴포넌트
  const renderModelInfo = () => {
    if (!modelInfo) return null;
    
    return (
      <View style={styles.modelInfoContainer}>
        <Text style={styles.modelInfoTitle}>모델 정보</Text>
        <ScrollView style={styles.modelInfoScroll}>
          <Text style={styles.modelInfoText}>모델명: {modelInfo.modelName}</Text>
          <Text style={styles.modelInfoText}>입력 크기: {modelInfo.inputWidth}x{modelInfo.inputHeight}</Text>
          <Text style={styles.modelInfoText}>출력 텐서 수: {modelInfo.outputTensors}</Text>
          <Text style={styles.modelInfoText}>양자화 모델: {modelInfo.isQuantized ? 'Yes' : 'No'}</Text>
          <Text style={styles.modelInfoText}>모델 경로: {modelInfo.modelPath}</Text>
        </ScrollView>
      </View>
    );
  };

  // 바운딩 박스 렌더링
  const renderDetections = () => {
    if (!isDetecting || detectionResults.length === 0) return null;

    return (
      <View style={styles.detectionOverlay}>
        <Svg height="100%" width="100%" viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}>
          {detectionResults.map((detection, index) => {
            const { boundingBox, score, label, corners } = detection;
            const color = getColorForLabel(label);
            
            if (corners) {
              // 회전된 바운딩 박스 (OBB)
              const pointsStr = corners.map(p => `${p.x},${p.y}`).join(' ');
              return (
                <React.Fragment key={index}>
                  <Polygon
                    points={pointsStr}
                    stroke={color}
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <SvgText
                    x={corners[0].x}
                    y={corners[0].y - 10}
                    fill={color}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {`${label} ${Math.round(score * 100)}%`}
                  </SvgText>
                </React.Fragment>
              );
            } else {
              // 일반 바운딩 박스 (AABB)
              return (
                <React.Fragment key={index}>
                  <Rect
                    x={boundingBox.left}
                    y={boundingBox.top}
                    width={boundingBox.width}
                    height={boundingBox.height}
                    stroke={color}
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <SvgText
                    x={boundingBox.left}
                    y={boundingBox.top - 10}
                    fill={color}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {`${label} ${Math.round(score * 100)}%`}
                  </SvgText>
                </React.Fragment>
              );
            }
          })}
        </Svg>
      </View>
    );
  };

  // 레이블별 고유한 색상 생성
  const getColorForLabel = (label: string) => {
    // 간단한 해시 함수로 레이블에 따른 색상 생성
    const hash = label.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // HSL 색상 생성 (일관된 채도와 밝기로 색상만 다양하게)
    return `hsl(${Math.abs(hash) % 360}, 80%, 60%)`;
  };

  return (
    <View style={styles.container}>
      {loading || modelLoading ? (
        // 로딩 인디케이터 표시
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.text}>
            {modelLoading ? '모델 로드 중...' : '카메라 여는 중...'}
          </Text>
        </View>
      ) : imageUri ? (
        // 촬영된 이미지를 표시
        <View style={styles.imageContainer}>
          <Text style={styles.title}>촬영된 이미지</Text>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={resetImage}
          >
            <Text style={styles.buttonText}>
              다시 촬영하기
            </Text>
          </TouchableOpacity>
        </View>
      ) : hasCameraPermission === false ? (
        // 권한 요청 화면 표시
        renderPermissionRequest()
      ) : (
        // 카메라 버튼을 표시
        <View style={styles.cameraButtonContainer}>
          <Text style={styles.title}>카메라 프리뷰</Text>
          <Text style={styles.text}>카메라를 열어 사진을 촬영하세요</Text>
          {modelLoaded && (
            <View>
              <Text style={styles.modelStatus}>TF Lite 모델 로드 완료</Text>
              <TouchableOpacity 
                style={[styles.button, isDetecting ? styles.buttonStop : styles.buttonStart]}
                onPress={toggleDetection}
                disabled={!modelLoaded}
              >
                <Text style={styles.buttonText}>
                  {isDetecting ? "객체 감지 중지" : "객체 감지 시작"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {detectionError && <Text style={styles.errorText}>{detectionError}</Text>}
          {renderDetections()}
          <View style={styles.statsContainer}>
            {isDetecting && (
              <Text style={styles.statsText}>감지된 객체: {detectionResults.length}</Text>
            )}
          </View>
          {renderModelInfo()}
          {renderPerformanceInfo()}
          <TouchableOpacity 
            style={styles.button}
            onPress={openCamera}
          >
            <Text style={styles.buttonText}>
              카메라 열기
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// 화면 크기
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '70%',
    marginVertical: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modelStatus: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 5,
  },
  modelInfoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    width: '100%',
    maxWidth: 350,
  },
  modelInfoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modelInfoScroll: {
    maxHeight: 150,
  },
  modelInfoText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
  },
  performanceContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    width: '100%',
    maxWidth: 350,
  },
  performanceTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  performanceContent: {
    maxHeight: 150,
  },
  performanceText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
  },
  detectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  statsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonStart: {
    backgroundColor: '#4682B4',
  },
  buttonStop: {
    backgroundColor: '#FF6347',
  },
});

export default CameraScreen; 
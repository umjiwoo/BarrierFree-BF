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
} from 'react-native';

// 네이티브 모듈 가져오기
const { CameraPreviewModule } = NativeModules;

// TFLite 모델 및 라벨 파일 이름 (assets 폴더에 저장해야 함)
const MODEL_FILE_NAME = 'model.tflite';
const LABELS_FILE_NAME = 'labels.txt';

const CameraScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);

  // 모델 로드 함수
  const loadTFLiteModel = useCallback(async () => {
    try {
      setModelLoading(true);
      
      // 모델이 이미 로드되었는지 확인
      const isLoaded = await CameraPreviewModule.isModelLoaded();
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
            <Text style={styles.modelStatus}>TF Lite 모델 로드 완료</Text>
          )}
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
  }
});

export default CameraScreen; 
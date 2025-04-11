import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {useTapNavigationHandler} from '../../components/utils/useTapNavigationHandler ';
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

// 환경 변수나 설정 파일에서 가져오는 것이 바람직합니다
const API_CONFIG = {
  // IP 주소 대신 HTTPS URL 사용 (네트워크 보안 필요시)
  OCR_ENDPOINT: 'http://43.201.95.134:8000/ocr',
  TIMEOUT: 60000, // 60초로 늘려서 느린 네트워크 대응
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  TARGET_IMAGE_WIDTH: 720, // 이미지 너비를 720픽셀로 설정
  TARGET_IMAGE_HEIGHT: 720, // 이미지 높이도 720픽셀로 설정
  IMAGE_QUALITY: 80, // 이미지 품질
  RETRY_COUNT: 3, // 재시도 횟수
  DEBUG: true, // 디버그 모드 활성화
};

// API URL 가져오기
const getApiUrl = () => {
  return API_CONFIG.OCR_ENDPOINT;
};

const CreateAccountCheck = () => {
  useTTSOnFocus(`
    본인 인증 페이지입니다.
    본인 인증을 진행합니다. 신분증을 준비해주세요.
    왼쪽 아래에는 돌아가기 버튼, 오른쪽 아래에는 선택 버튼이 있습니다.
    왼쪽 위에는 이전 버튼, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateAccountCheck'>>();
  const goods = route.params?.goods;

  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkAvailable, setNetworkAvailable] = useState(true);
  const camera = useRef<Camera>(null);
  const isMounted = useRef(true); // 컴포넌트 마운트 상태 추적

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMounted.current = true;

    // 네트워크 연결 상태 모니터링 시작
    const unsubscribe = NetInfo.addEventListener(state => {
      if (isMounted.current) {
        setNetworkAvailable(state.isConnected ?? false);
        if (!state.isConnected) {
          console.warn('네트워크 연결이 끊어졌습니다.');
        }
      }
    });

    // 초기 네트워크 상태 확인
    NetInfo.fetch().then(state => {
      if (isMounted.current) {
        setNetworkAvailable(state.isConnected ?? false);
        console.log(
          '현재 네트워크 상태:',
          state.isConnected ? '연결됨' : '연결 안됨',
        );
      }
    });

    return () => {
      isMounted.current = false;
      // 네트워크 모니터링 구독 취소
      unsubscribe();
      // 임시 파일 정리
      cleanupTempFiles();
    };
  }, []);

  // 임시 파일 정리 함수
  const cleanupTempFiles = async () => {
    try {
      // react-native-fs 필요
      const cacheDir =
        Platform.OS === 'android'
          ? RNFS.CachesDirectoryPath
          : RNFS.TemporaryDirectoryPath;

      // 캐시 디렉토리 파일 목록 읽기
      const files = await RNFS.readDir(cacheDir);

      // mrousavy로 시작하는 Vision Camera 임시 파일 찾기
      const tempImages = files.filter(
        file => file.name.startsWith('mrousavy') && file.name.endsWith('.jpg'),
      );

      // 임시 파일 삭제
      for (const file of tempImages) {
        try {
          await RNFS.unlink(file.path);
          console.log('임시 파일 삭제:', file.path);
        } catch (e) {
          console.warn('임시 파일 삭제 실패:', file.path, e);
        }
      }

      console.log(`${tempImages.length}개의 임시 파일 정리 완료`);
    } catch (error) {
      console.warn('임시 파일 정리 실패:', error);
    }
  };

  const handleLowerRightTextPress = async () => {
    // 네트워크 연결 확인
    if (!networkAvailable) {
      Alert.alert('네트워크 오류', '인터넷 연결을 확인해주세요.');
      return;
    }

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          '카메라 권한 필요',
          '본인 인증을 위해 카메라 권한이 필요합니다',
        );
        return;
      }
    }
    setShowCamera(true);

    navigation.navigate('SendInputPage', {
      type: 'password',
      goods: goods,
    });
  };

  // 이미지 최적화 함수 - ImageResizer 라이브러리 사용
  const optimizeImage = async (photoPath: string): Promise<string> => {
    try {
      // 원본 파일 정보 확인
      const fileInfo = await RNFS.stat(photoPath);
      console.log(
        '원본 이미지 크기:',
        (fileInfo.size / 1024 / 1024).toFixed(2),
        'MB',
      );

      // 최적화된 이미지 생성 (720픽셀 해상도로 변경)
      const resizedImage = await ImageResizer.createResizedImage(
        photoPath.startsWith('file://') ? photoPath.substring(7) : photoPath, // file:// 제거
        API_CONFIG.TARGET_IMAGE_WIDTH, // 타겟 너비 (720px)
        API_CONFIG.TARGET_IMAGE_HEIGHT, // 타겟 높이 (720px)
        'JPEG', // 포맷
        API_CONFIG.IMAGE_QUALITY, // 품질 (80)
        0, // 회전 각도
        undefined, // 출력 경로 (기본값 사용)
        true, // 비율 유지
        {onlyScaleDown: true}, // 이미 작은 이미지는 확대하지 않음
      );

      console.log('이미지 최적화 완료');
      console.log('- 최적화 후 경로:', resizedImage.uri);
      console.log(
        '- 최적화 후 크기:',
        (resizedImage.size / 1024 / 1024).toFixed(2),
        'MB',
      );
      console.log(
        '- 최적화 후 너비/높이:',
        resizedImage.width,
        'x',
        resizedImage.height,
      );

      return resizedImage.uri;
    } catch (error) {
      console.warn('이미지 최적화 실패:', error);
      return photoPath; // 오류 시 원본 경로 반환
    }
  };

  const sendImageToOCR = async (photoPath: string) => {
    try {
      console.log('이미지 읽기 시작:', photoPath);

      // 파일을 base64로 읽음
      const base64Data = await RNFS.readFile(photoPath, 'base64');

      console.log('Base64 길이:', base64Data.length); // <- base64 제대로 읽히는지 확인

      // 서버에 전송할 데이터 구성
      const payload = {
        image: base64Data,
        filename: photoPath.split('/').pop(),
        mimetype: 'image/jpeg', // 필요하면 png 등으로 변경
      };

      const apiUrl = 'http://43.201.95.134:8000/ocr';
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log('서버 응답:', response.data);
      return response.data;
    } catch (error: any) {
      // console.error('이미지 전송 오류:', error.message);
      if (axios.isAxiosError(error)) {
        console.log('axios error response:', error.response?.data);
      }
      throw error;
    }
  };

  const handleTakePhoto = async () => {
    if (!camera.current) return;

    try {
      // 네트워크 연결 확인
      if (!networkAvailable) {
        Alert.alert(
          '네트워크 오류',
          '인터넷 연결을 확인한 후 다시 시도해주세요.',
        );
        return;
      }

      // 로딩 표시 시작
      setIsLoading(true);

      // 비동기 작업: 고화질 사진 촬영 (await 사용)
      const photo = await camera.current.takePhoto({
        flash: 'off', // 플래시 켜기
        enableShutterSound: false, // 셔터 소리 비활성화
      });

      if (!isMounted.current) return; // 컴포넌트 언마운트 확인

      // 파일 정보 출력
      console.log('사진 촬영 완료');
      console.log('- 파일 경로:', photo.path);
      console.log('- 이미지 너비/높이:', photo.width, 'x', photo.height);
      console.log('※ 임시 파일이므로 앱 종료 시 삭제될 수 있음');

      try {
        console.log('OCR 요청 시작...');

        // 비동기 작업: OCR 요청 (await 사용)
        const ocrResult = await sendImageToOCR(photo.path);

        if (!isMounted.current) return; // 컴포넌트 언마운트 확인

        console.log('OCR 요청 완료!');

        // OCR 처리 완료 후 카메라 닫기
        setShowCamera(false);

        // 결과 값이 없는 경우 (컴포넌트 언마운트 등의 이유로)
        if (!ocrResult) {
          return;
        }

        // 결과 로그
        console.log('isCorrect 값:', ocrResult.isCorrect);
        console.log('name 값:', ocrResult.name);
        console.log('birth 값:', ocrResult.birth);

        // OCR 결과 확인 (서버 응답 형식: {isCorrect, name, birth})
        if (ocrResult.isCorrect === true) {
          // 인증 성공 - 모달 표시 후 네비게이션 수행
          const alertPromise = new Promise(resolve => {
            Alert.alert(
              '본인 인증 성공 ✅',
              `이름: ${ocrResult.name || '정보 없음'}\n생년월일: ${
                ocrResult.birth || '정보 없음'
              }\n\nisCorrect: true (인증 성공)`,
              [
                {
                  text: '확인',
                  onPress: () => {
                    // 비동기 작업 완료를 알림
                    resolve(true);

                    if (!isMounted.current) return; // 컴포넌트 언마운트 확인

                    // 다음 화면으로 이동
                    navigation.navigate('SendInputPage', {
                      type: 'password',
                      goods: goods,
                    });

                    // 임시 파일 정리
                    cleanupTempFiles();
                  },
                },
              ],
              {cancelable: false},
            );
          });

          // Alert가 처리될 때까지 대기
          await alertPromise;
        } else if (ocrResult.isCorrect === false) {
          // 신분증은 인식됐으나 인증 실패 (isCorrect가 명시적으로 false)
          const alertPromise = new Promise(resolve => {
            Alert.alert(
              '본인 인증 실패 ❌',
              `이름: ${ocrResult.name || '정보 없음'}\n생년월일: ${
                ocrResult.birth || '정보 없음'
              }\n\nisCorrect: false (인증 실패)`,
              [
                {
                  text: '다시 시도',
                  onPress: () => {
                    resolve(true);

                    if (!isMounted.current) return; // 컴포넌트 언마운트 확인

                    // 카메라 다시 열기
                    setShowCamera(true);

                    // 임시 파일 정리
                    cleanupTempFiles();
                  },
                },
              ],
              {cancelable: false},
            );
          });

          // Alert가 처리될 때까지 대기
          await alertPromise;
        } else {
          // isCorrect 값이 없거나 예상치 못한 값인 경우
          const alertPromise = new Promise(resolve => {
            Alert.alert(
              '인식 오류',
              `신분증을 인식할 수 없습니다.\nisCorrect 값: ${ocrResult.isCorrect}`,
              [
                {
                  text: '다시 시도',
                  onPress: () => {
                    resolve(true);

                    if (!isMounted.current) return; // 컴포넌트 언마운트 확인

                    // 카메라 다시 열기
                    setShowCamera(true);

                    // 임시 파일 정리
                    cleanupTempFiles();
                  },
                },
              ],
              {cancelable: false},
            );
          });

          // Alert가 처리될 때까지 대기
          await alertPromise;
        }
      } catch (error: any) {
        if (!isMounted.current) return; // 컴포넌트 언마운트 확인

        const errorMessage = error.message || '신분증 인식에 실패했습니다';
        const alertPromise = new Promise(resolve => {
          Alert.alert(
            'OCR 처리 실패',
            errorMessage,
            [
              {
                text: '다시 시도',
                onPress: () => {
                  resolve(true);

                  if (!isMounted.current) return; // 컴포넌트 언마운트 확인

                  // 카메라 다시 열기
                  setShowCamera(true);

                  // 임시 파일 정리
                  cleanupTempFiles();
                },
              },
            ],
            {cancelable: false},
          );
        });

        // Alert가 처리될 때까지 대기
        await alertPromise;
      }
    } catch (error) {
      if (!isMounted.current) return; // 컴포넌트 언마운트 확인

      // console.error('사진 촬영 실패:', error);
      const alertPromise = new Promise(resolve => {
        Alert.alert(
          '오류',
          '사진 촬영에 실패했습니다',
          [
            {
              text: '확인',
              onPress: () => resolve(true),
            },
          ],
          {cancelable: false},
        );
      });

      // Alert가 처리될 때까지 대기
      await alertPromise;
    } finally {
      if (isMounted.current) {
        // 모든 비동기 작업 완료 후 로딩 상태 해제
        setIsLoading(false);
      }
    }
  };

  // 로딩 인디케이터 컴포넌트
  const LoadingOverlay = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>처리 중...</Text>
    </View>
  );

  if (!device) {
    return <Text style={styles.errorText}>카메라를 찾을 수 없습니다</Text>;
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.buttonContainer}>
          <Text style={styles.captureButton} onPress={handleTakePhoto}>
            촬영하기
          </Text>
          <Text
            style={styles.cancelButton}
            onPress={() => setShowCamera(false)}>
            취소
          </Text>
        </View>
        {isLoading && <LoadingOverlay />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
            <ArrowLeftIcon width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        UpperRightText={
          <View style={styles.textContainer}>
            <HomeIcon width={100} height={100} />
            <Text style={styles.text}>메인</Text>
          </View>
        }
        LowerLeftText={
          <View style={styles.textContainer}>
            <CancelIcon width={100} height={100} />
            <Text style={styles.text}>취소</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <CheckIcon width={100} height={100} />
            <Text style={styles.text}>확인</Text>
          </View>
        }
        MainText={
          <View style={styles.goodsContainer}>
            <Text style={styles.goodsName}>본인 인증</Text>
            <View style={styles.goodsDescriptionContainer}>
              <Text style={styles.goodsDescription}>
                본인 인증을 진행합니다.
              </Text>
              <Text style={styles.goodsDescription}>
                신분증을 준비해주세요.
              </Text>
            </View>
          </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', ['back'])}
        onUpperRightTextPress={() => handleDefaultPress('홈', ['Main'])}
        onLowerLeftTextPress={() => handleDefaultPress('이전', ['back'])}
        onLowerRightTextPress={() =>
          handleDefaultPress('확인', undefined, handleLowerRightTextPress)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  goodsContainer: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goodsName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  goodsDescription: {
    fontSize: 30,
    color: 'white',
  },
  goodsDescriptionContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    color: 'white',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
});

export default CreateAccountCheck;

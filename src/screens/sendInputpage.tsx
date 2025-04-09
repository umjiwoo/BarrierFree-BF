import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import BackButton from '../components/BackButton';
// import {TextInput} from 'react-native-gesture-handler';
import TimerBasedDigitInput from '../components/TimerBasedDigitInput';
import { TensorflowModel, loadTensorflowModel } from 'react-native-fast-tflite';

// 라우트 파라미터 타입 정의
type SendInputPageParams = {
  SendInputPage: {
    type: 'directMyAccount' | 'directOtherAccount' | 'money' | 'password';
  };
};

// 라우트 타입 정의
type SendInputPageRouteProp = RouteProp<SendInputPageParams, 'SendInputPage'>;

const SendInputPage = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [accountNumber, setAccountNumber] = React.useState('');
  const [isHandwritingVisible, setIsHandwritingVisible] = useState(false);
  const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
  const [tfliteModel, setTfliteModel] = useState<TensorflowModel | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // TFLite 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await loadTensorflowModel(require('../assets/handwriting_model.tflite'));
        setTfliteModel(model);
        setModelLoaded(true);
        console.log('TFLite 모델 로드 성공');
      } catch (error) {
        console.error('TFLite 모델 로드 실패:', error);
      }
    };
    loadModel();
  }, []);

  const route = useRoute<SendInputPageRouteProp>();
  const {type = 'directMyAccount'} = route.params || {};

  // 손글씨로 인식된 숫자 처리
  const handleDigitRecognized = (digit: string) => {
    setAccountNumber(prev => {
      const newNumber = prev + digit;
      console.log('인식된 계좌번호:', newNumber);
      return newNumber;
    });
    setCurrentDigitIndex(prev => prev + 1);
  };

  // 타입에 따라 헤더 타이틀 설정
  useEffect(() => {
    let title = '입력 화면';

    if (type === 'directMyAccount') {
      title = '내 계좌 직접 입력';
    } else if (type === 'directOtherAccount') {
      title = '상대방 계좌 직접 입력';
    } else if (type === 'money') {
      title = '금액 입력';
    } else if (type === 'password') {
      title = '비밀번호 입력';
    }

    navigation.setOptions({title});
  }, [navigation, type]);

  // 컴포넌트 마운트 시 directMyAccount인 경우 바로 손글씨 입력 표시
  useEffect(() => {
    if (type === 'directMyAccount') {
      setIsHandwritingVisible(true);
    }
  }, [type]);

  // 조건에 따라 다른 내용 렌더링
  const renderContent = () => {
    if (type === 'directMyAccount') {
      return (
        <View style={styles.contentContainer}>
          <TimerBasedDigitInput
            visible={isHandwritingVisible}
            onClose={() => navigation.goBack()}
            onDigitRecognized={handleDigitRecognized}
            currentDigitIndex={currentDigitIndex}
            maxDigits={12}
            externalModel={tfliteModel}
            externalModelLoaded={modelLoaded}
          />
        </View>
      );
    } else if (type === 'directOtherAccount') {
      // 2. 상대방 계좌 직접 입력을 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>상대방 계좌 직접 입력 화면입니다.</Text>
          <View style={styles.buttonContainer}>
            <BackButton
              text="확인"
              style={{
                backgroundColor: '#373DCC',
                width: '100%',
                height: 70,
                marginTop: 10,
                marginBottom: 5,
              }}
              textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
              onPress={() => {
                navigation.navigate('SendInputPage', {type: 'money'});
              }}
            />
            <BackButton
              text="뒤로 가기"
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
        </View>
      );
    } else if (type === 'money') {
      // 3. 금액 입력을 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>금액 입력 화면입니다.</Text>
          <View style={styles.buttonContainer}>
            <BackButton
              text="확인"
              style={{
                backgroundColor: '#373DCC',
                width: '100%',
                height: 70,
                marginTop: 10,
                marginBottom: 5,
              }}
              textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
              onPress={() => {
                navigation.navigate('RemittanceInformation');
              }}
            />
            <BackButton
              text="뒤로 가기"
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
        </View>
      );
    } else if (type === 'password') {
      // 4. 비밀번호 입력을 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>비밀번호 입력 화면입니다.</Text>
          <View style={styles.buttonContainer}>
            <BackButton
              text="확인"
              style={{
                backgroundColor: '#373DCC',
                width: '100%',
                height: 70,
                marginTop: 10,
                marginBottom: 5,
              }}
              textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
              onPress={() => {
                navigation.navigate('RemittanceConfirm');
              }}
            />
            <BackButton
              text="뒤로 가기"
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
        </View>
      );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    // marginBottom: 20,
    width: '100%',
    bottom: 0,
  },
  backButton: {
    backgroundColor: '#B6010E',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
});

export default SendInputPage;

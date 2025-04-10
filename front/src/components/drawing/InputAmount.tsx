import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DrawingModal from './DrawingModal'; // 손글씨 입력 컴포넌트 (예: Skia 사용)
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { TestAccountItemProps } from '../../components/types/CheckAccount';
import {useUserStore} from '../../stores/userStore';
import {playTTS} from '../utils/tts';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTTSOnFocus } from '../utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../utils/useTapNavigationHandler ';
import DrawIcon from '../../assets/icons/Draw.svg';

interface Props {
  type: string;
  selectedAccount?: TestAccountItemProps;
}

const InputAmount: React.FC<Props> = ({ type, selectedAccount }) => {

  useTTSOnFocus(`
    송금할 금액을 입력하는 화면입니다.
    숫자를 손으로 그려서 입력할 수 있습니다.
    입력한 숫자를 지우려면 X자를 그려주세요.
    입력이 끝났다면 V자를 그려서 마무리해주세요.
    다음 단계로 넘어가시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼, 오른쪽 위에는 홈 버튼이 있습니다.
  `)

  const [amountNumber, setAmountNumber] = useState('');
  const [showModal, setShowModal] = useState(true);

  const handlePrediction = (digit: string) => {
    if (digit === '11') {
      console.log('"X" 지우기');
      deleteLastDigit();
      playTTS('지우기');
    } else if (digit === "10") {
      closeModal();
      playTTS('입력 완료');
      playTTS(amountNumber);
    } else {
      console.log('digit', digit);
      setAmountNumber(prev => prev + digit);
      playTTS(digit); // 현재 digit 읽기
    }
  };

  const deleteLastDigit = () => {
    setAmountNumber(prev => prev.slice(0, -1));
  };

  // 전체 지우기
  // const clearAll = () => {
  //   setAccountNumber('');
  // };

  const closeModal = () => {
    setShowModal(false);
  };

  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const {user} = useUserStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const handleDirectInput = () => {
    navigation.navigate('SendInputPage', {type: 'directOtherAccount'});
    console.log('직접 입력 버튼 클릭');
  };
 
  const handleSend = () => {
    console.log('금액 입력 완료');
    if (selectedAccount) {  // 입력한 계좌 있어야만 함
      navigation.navigate('RemittanceInformation', {money: Number(amountNumber), selectedAccount: selectedAccount});  // 입력한 계좌로 변경
    }
  };

  const renderAmountNumber = () => {
    if (!amountNumber || isNaN(Number(amountNumber)))
      return '송금할 금액을 입력';
    return Number(amountNumber).toLocaleString('ko-KR') + '원';
  };

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
            <DrawIcon width={100} height={100} />
            <Text style={styles.text}>입력</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <CheckIcon width={100} height={100} />
            <Text style={styles.text}>확인</Text>
          </View>
        }
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.title}>금액 입력</Text>
            <Text style={styles.accountDisplay}>{renderAmountNumber()}</Text>
            <Text style={styles.description}>"X" 그려서 지우기{"\n"} "V" 그려서 완료</Text>
            <DrawingModal visible={showModal} onPredict={handlePrediction} />
          </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={() => handleDefaultPress('이전', undefined, handleDirectInput)}
        onLowerRightTextPress={() => handleDefaultPress('입력 확인', undefined, handleSend)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    // marginTop: 50,
  },
  mainTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 50,
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'white',
  },
  accountDisplay: {
    fontSize: 30,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 280,
    color: 'white',
  },
  description: {
    fontSize: 25,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 280,
    color: 'white',
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
});

export default InputAmount;

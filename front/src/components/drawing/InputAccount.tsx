import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DrawingModal from './DrawingModal'; // 손글씨 입력 컴포넌트 (예: Skia 사용)
import {NavigationProp, useNavigation} from '@react-navigation/native';

// import {useUserStore} from '../../stores/userStore';
import {playTTS} from '../utils/tts';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {DirectAccountItemProps} from '../../components/types/CheckAccount';

interface Props {
  type: string;
}

const InputAccount: React.FC<Props> = ({type}) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [showModal, setShowModal] = useState(true);

  const handlePrediction = (digit: string) => {
    if (digit === '11') {
      console.log('"X" 지우기');
      deleteLastDigit();
    } else if (digit === '10') {
      closeModal();
    } else {
      console.log('digit', digit);
      setAccountNumber(prev => prev + digit);
      playTTS(digit); // 현재 digit 읽기
    }
  };

  const deleteLastDigit = () => {
    setAccountNumber(prev => prev.slice(0, -1));
  };

  // 전체 지우기
  // const clearAll = () => {
  //   setAccountNumber('');
  // };

  const closeModal = () => {
    setShowModal(false);
  };

  const {handlePressBack, handlePressHome} = useHandlePress();
  // const {user} = useUserStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // const route = useRoute<RouteProp<RootStackParamList, 'RemittanceConfirm'>>();
  // const money = route.params?.money;
  // const selectedAccount = route.params?.selectedAccount;
  const [selectedAccount, setSelectedAccount] =
    useState<DirectAccountItemProps | null>(null);

  const handleSend = () => {
    console.log('계좌 입력 완료');
    console.log('account: ', accountNumber);
    setSelectedAccount({
      receiverAccount: accountNumber,
      receiverName: '엄지우',
    });
    if (selectedAccount) {
      navigation.navigate('ReceivingAccountScreen', {selectedAccount});
    }
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소"
        LowerRightText="입력 확인"
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.title}>계좌번호 입력</Text>
            <Text style={styles.accountDisplay}>
              {accountNumber || '계좌번호를 입력해주세요'}
            </Text>
            <DrawingModal visible={showModal} onPredict={handlePrediction} />
          </View>
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
        onLowerRightTextPress={handleSend}
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
    fontSize: 30,
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  accountDisplay: {
    fontSize: 30,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(127,53,212, 0.1)',
    textAlign: 'center',
    minWidth: 280,
  },
});

export default InputAccount;

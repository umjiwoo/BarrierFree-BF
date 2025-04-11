import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import SendAccountBox from './SendAccountBox';
import DefaultPage from '../../components/utils/DefaultPage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import DrawIcon from '../../assets/icons/Draw.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {playTTS} from '../../components/utils/tts';
import {useTapNavigationHandler} from '../../components/utils/useTapNavigationHandler ';
import {getTransactionsHistory} from '../../api/axiosTransaction';
import VolumeIcon from '../../assets/icons/Volume.svg';
import formatDateManually from '../../components/utils/makeDate';

const SendFavoriteAccount = () => {
  useTTSOnFocus(`
    최근 송금한 계좌 목록입니다.
    화면 가운데를 좌우로 움직여 송금할 계좌를 선택해주세요.
    계좌 번호를 직접 입력하시려면 왼쪽 아래를,
    선택을 완료하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [accountData, setAccountData] = useState<any>([]);

  useEffect(() => {
    const fetchRecentAccounts = async () => {
      const recentAccounts = await getTransactionsHistory();
      setAccountData(recentAccounts);
    };
    fetchRecentAccounts();
  }, []);

  const [selectedAccount, setSelectedAccount] = useState<any>(accountData[0]);

  // 캐러셀
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = accountData[currentIndex];

  const handleSelectAccount = (account: any) => {
    const message = [
      `${account.receiverName}`,
      `${account.receiverAccount}`,
      `${account.transactionDate}`,
      `송금`,
    ].join('\n\n');

    setSelectedAccount(account);
    handleDefaultPress(message);
  };

  useEffect(() => {
    if (currentItem) {
      const dateInfo = formatDateManually(currentItem.transactionDate);

      const message = [
        `${currentItem.receiverName}`,
        `${currentItem.receiverAccount.split('').join(' ')}`,
        `$${dateInfo.date} ${dateInfo.time}에`,
        `송금한 계좌입니다.`,
      ].join('\n\n');

      playTTS(message);
    }
  }, [currentIndex]);


  const handleSendMoney = () => {
    if (selectedAccount) {
      navigation.navigate('ReceivingAccountScreen', {selectedAccount});
    } else {
    }
  };

  const handleDirectInput = () => {
    navigation.navigate('SendInputPage', {type: 'directOtherAccount'});
  };

  const carouselRef = useRef<any>(null);

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
            <Text style={styles.text}>선택</Text>
          </View>
        }
        MainText={
        <View style={styles.welcomeBox}>
          <View style={styles.voiceButton}>
            <VolumeIcon width={30} height={30} />
            <Text style={styles.voiceButtonText}>송금 하기</Text>
          </View>
          <SendAccountBox
            accountData={accountData}
            carouselRef={carouselRef}
            selectedAccount={selectedAccount}
            onSelectAccount={handleSelectAccount}
          />
        </View>
        }
        onUpperLeftTextPress={() =>
          handleDefaultPress('이전', undefined, handlePressBack)
        }
        onUpperRightTextPress={() =>
          handleDefaultPress('홈', undefined, handlePressHome)
        }
        onLowerLeftTextPress={() =>
          handleDefaultPress('직접 입력', undefined, handleDirectInput)
        }
        onLowerRightTextPress={() =>
          handleDefaultPress('선택 완료', undefined, handleSendMoney)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  star: {
    fontSize: 24,
    color: 'blue',
    marginRight: 5,
  },
  favoriteText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
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
  voiceButton: {
    marginBottom: 20,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center'
  },
  welcomeBox: {
    alignItems: 'center',
  },
});

export default SendFavoriteAccount;

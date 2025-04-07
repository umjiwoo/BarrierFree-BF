import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import SendAccountBox from './SendAccountBox';
import DefaultPage from '../../components/utils/DefaultPage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import {getTransactionsHistory} from '../../api/axiosAccount';

const SendFavoriteAccount = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // const accountData = [
  //   {
  //     name: '홍길동',
  //     date: '2023-04-01',
  //     accountBank: '신한은행',
  //     accountNumber: '110-123-456789',
  //   },
  //   {
  //     name: '김철수',
  //     date: '2023-04-02',
  //     accountBank: '국민은행',
  //     accountNumber: '123-45-678910',
  //   },
  //   {
  //     name: '이영희',
  //     date: '2023-04-03',
  //     accountBank: '우리은행',
  //     accountNumber: '111-222-333444',
  //   },
  //   // 필요에 따라 더 많은 계정을 추가할 수 있습니다
  // ];

  const [accountData, setAccountData] = useState<any>([]);

  useEffect(() => {
    const fetchRecentAccounts = async () => {
      const recentAccounts = await getTransactionsHistory();
      setAccountData(recentAccounts);
      console.log('최근 보낸 계좌 조회 성공: ', recentAccounts);
    };
    fetchRecentAccounts();
  }, []);

  const [selectedAccount, setSelectedAccount] = useState<any>(accountData[0]);

  const handleSelectAccount = (account: any) => {
    setSelectedAccount(account);
    console.log('Selected account:', account);
  };

  const handleSendMoney = () => {
    if (selectedAccount) {
      navigation.navigate('ReceivingAccountScreen', {selectedAccount});
    } else {
      console.log('계좌를 선택해주세요');
    }
  };

  const handleDirectInput = () => {
    navigation.navigate('SendInputPage', {type: 'directOtherAccount'});
    console.log('직접 입력 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="직접 입력"
        LowerRightText="선택 / 송금"
        MainText={
          <SendAccountBox
            accountData={accountData}
            onSelectAccount={handleSelectAccount}
            selectedAccount={selectedAccount}
          />
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handleDirectInput}
        onLowerRightTextPress={handleSendMoney}
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
});

export default SendFavoriteAccount;

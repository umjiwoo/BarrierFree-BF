import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import SendAccountBox from './SendAccountBox';
import DefaultPage from '../../components/utils/DefaultPage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {getTransactionsHistory} from '../../api/axiosTransaction';

const SendFavoriteAccount = () => {
  useTTSOnFocus(`
    최근 송금한 계좌 목록입니다.
    화면 가운데를 좌우로 움직여 송금할 계좌를 선택해주세요.
    계좌 번호를 직접 입력하시려면 왼쪽 아래를,
    선택을 완료하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const {handlePressBack, handlePressHome} = useHandlePress();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [accountData, setAccountData] = useState<any>([]);

  useEffect(() => {
    const fetchRecentAccounts = async () => {
      const recentAccounts = await getTransactionsHistory();
      setAccountData(recentAccounts);
      console.log('최근 보낸 계좌 조회 성공: ', recentAccounts);
    };
    fetchRecentAccounts();
  }, []);

  // 더미 데이터
  // const accountData = [
  //   {
  //     receiverAccount: '1190101022222222',
  //     receiverAccountId: 1,
  //     receiverName: '엄지우',
  //     transactionDate: '2025-04-06T12:47:10',
  //   },
  //   {
  //     receiverAccount: '1190101022222222',
  //     receiverAccountId: 1,
  //     receiverName: '박지우',
  //     transactionDate: '2025-04-06T12:47:10',
  //   },
  //   {
  //     receiverAccount: '1190101022222222',
  //     receiverAccountId: 1,
  //     receiverName: '최지우',
  //     transactionDate: '2025-04-06T12:47:10',
  //   },
  // ];

  const [selectedAccount, setSelectedAccount] = useState<any>(accountData[0]);

  const handleSelectAccount = useCallback(
    (account: any) => {
      setSelectedAccount(account);
      console.log('Selected account:', account);
    },
    [setSelectedAccount],
  );

  const handleSendMoney = () => {
    if (selectedAccount) {
      console.log('selectedAccount: ', selectedAccount);
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

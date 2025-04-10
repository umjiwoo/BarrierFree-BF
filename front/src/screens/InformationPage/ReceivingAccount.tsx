import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import DetailBox from '../../components/information/DetailBoxAccount';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import {useHandlePress} from '../../components/utils/handlePress';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {postCheckAccount} from '../../api/axiosTransaction';
import {useAccountStore} from '../../stores/accountStore';

const ReceivingAccountScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'ReceivingAccountScreen'>>();
  const accountInfo = route.params?.selectedAccount;
  console.log('accountInfo: ', accountInfo);

  const {accounts} = useAccountStore();
  const [checkAccount, setCheckAccount] = useState<any>(null);
  console.log('accounts: ', accounts);

  useEffect(() => {
    const fetchCheckAccounts = async () => {
      const checkAccounts = await postCheckAccount();
      // setAccountData(checkAccounts);
      if (checkAccounts.length === 0) {
        console.log('계좌 조회 실패');
      } else {
        setCheckAccount(checkAccounts);
        console.log('계좌 조회 성공: ', checkAccounts);
      }
    };
    fetchCheckAccounts();
  }, [accountInfo.receiverAccount]);

  useTTSOnFocus(`
    ${accountInfo.receiverName}님에게 송금할 계좌입니다.
    계좌번호는 ${accountInfo.receiverAccount.split('').join(' ')}입니다.
    취소하시려면 왼쪽 아래를, 송금하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const handleSend = () => {
    console.log('송금하기 버튼 클릭');
    // Alert.alert('송금하기 버튼 클릭됨!');
    navigation.navigate('SendInputPage', {
      type: 'money',
      selectedAccount: accountInfo,
      receiverAccountId: checkAccount.receiverAccountId,
    }); // 금액 입력 페이지로 이동
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소하기"
        LowerRightText="송금하기"
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>받는 사람 정보를 확인하세요.</Text>
            <DetailBox
              receiverName={accountInfo.receiverName}
              receiverAccount={accountInfo.receiverAccount}
            />
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
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    // marginTop: 50,
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  sendButton: {
    backgroundColor: '#373DCC',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: '#B6010E',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
  mainText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#7F35D4',
  },
  mainTextContainer: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    // justifyContent: 'center',
  },
});

export default ReceivingAccountScreen;

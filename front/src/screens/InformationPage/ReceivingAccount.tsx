import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import DetailBox from '../../components/information/DetailBoxAccount';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage2';
import {useHandlePress} from '../../components/utils/handlePress';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';
import {postCheckAccount} from '../../api/axiosTransaction';
import {useAccountStore} from '../../stores/accountStore';
import VolumeIcon from '../../assets/icons/Volume.svg';

const ReceivingAccountScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
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
          <TouchableOpacity style={styles.welcomeBox}>
            <View style={styles.voiceButton}>
              <VolumeIcon width={30} height={30} />
              <Text style={styles.voiceButtonText}>송금 하기</Text>
            </View>
            <Text style={styles.mainText}>받는 사람 정보를 확인하세요.</Text>
            <DetailBox
                receiverName={accountInfo.receiverName}
                receiverAccount={accountInfo.receiverAccount}
            />
          </TouchableOpacity>

          // <TouchableOpacity
          // onPress={() => ()}
          // >
          //   <View style={styles.accountItem}>
          //   <View style={styles.voiceButton}>
          //       <VolumeIcon width={30} height={30} />
          //       <Text style={styles.voiceButtonText}>송금 하기</Text>
          //   </View>
          // {/* 날짜 */}
          // <View style={styles.dateContainer}>
          //   <Text style={styles.date}>{date}</Text>
          //   <Text style={styles.time}>{time}</Text>
          // </View>
  
          // {/* 거래 이름 */}
          // <Text style={styles.name}>{item.transactionName}</Text>
  
          // {/* 거래 금액 */}
          // <View style={styles.bankContainer}>
          //   <Text style={[styles.bankType, isWithdrawal ? styles.withdrawalBg : styles.depositBg]}>
          //     {typeLabel}
          //   </Text>
          //   <Text style={[styles.amount, isWithdrawal ? styles.withdrawal : styles.deposit]}>
          //     {item.transactionAmount.toLocaleString()} 원
          //   </Text>
          // </View>
          // </View>
          //   {/* <View style={styles.voiceButton}>
                // <VolumeIcon width={30} height={30} />
                // <Text style={styles.voiceButtonText}>음성 안내 듣기</Text>
            // </View> */}
        // </TouchableOpacity>
          // <View style={styles.mainTextContainer}>
          //   <Text style={styles.mainText}>받는 사람 정보를 확인하세요.</Text>
          //   <DetailBox
          //     receiverName={accountInfo.receiverName}
          //     receiverAccount={accountInfo.receiverAccount}
          //   />
          // </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onLowerRightTextPress={() => handleDefaultPress('송금하기', undefined, handleSend)}
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainTextContainer: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    // justifyContent: 'center',
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

  accountItem: {
    width: '100%',
    // marginVertical: 10,
    // paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    // gap: 28,
  },
  dateContainer: {
    gap: 8,
  },
  date: {
    fontSize: 30,
    color: '#ccc',
    fontWeight: '600',
  },
  time: {
    fontSize: 30,
    color: '#ccc',
    fontWeight: '500',
  },
  name: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginTop: 8,
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
  },
  bankType: {
    fontSize: 35,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#DC3545', // 기본은 출금 색상
    color: '#fff',
    textAlignVertical: 'center'
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    color: '#fff',
    textAlignVertical: 'center'
    // fontSize: 40,
    // fontWeight: 'bold',
    // color: '#fff',
  },
  withdrawalBg: {
    backgroundColor: '#DC3545',
    color: '#fff',
  },
  depositBg: {
    backgroundColor: '#34C759',
    color: '#fff',
  },
  withdrawal: {
    color: '#DC3545',
  },
  deposit: {
    color: '#34C759',
  },
  voiceButton: {
    // marginTop: 20,
    marginBottom: 32,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'center', 
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center'
  },

  welcomeBox: {
    alignItems: 'center',
    marginVertical: 32,
  },
  welcome: {
    color: '#fff',
    fontSize: 55,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ReceivingAccountScreen;

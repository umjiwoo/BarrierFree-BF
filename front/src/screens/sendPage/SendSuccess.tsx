import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DefaultPage from '../../components/DefaultPage';

const SendSuccess = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // 유저 계좌 하드코딩 -> 추후 수정 필요
  const selectedAccount = {
    accountBalance: 1000000,
    accountNo: '110262000720',
    accountState: 'ACTIVE',
    bankId: '001',
    createdAt: '2025-04-03',
    dailyTransferLimit: 1000000,
    failedAttempts: 0,
    id: 1,
    oneTimeTransferLimit: 1000000,
    updatedAt: '2025-04-03',
  };

  // 송금 내역 하드코딩 -> 추후 수정 필요
  const history = [
    {
      id: 1,
      transactionStatus: true,
      transactionBankId: 1,
      transactionBalance: 100000,
      transactionAccount: '110262000720',
      transactionAmount: 100000,
      transactionType: 'WITHDRAW',
      transactionDate: '2025-04-03',
      transactionName: '홍길동',
    },
  ];

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText="이전으로"
        UpperRightText="홈"
        LowerLeftText="내역 조회"
        LowerRightText="확인"
        MainText={<Text>이체가 완료되었습니다.</Text>}
        onUpperLeftTextPress={() => navigation.goBack()}
        onUpperRightTextPress={() => navigation.navigate('Main')}
        onLowerLeftTextPress={() =>
          navigation.navigate('CheckHistory', {
            selectedAccount: selectedAccount,
            history: history,
          })
        }
        onLowerRightTextPress={() => navigation.navigate('Main')}
      />
    </View>
  );
};

export default SendSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 50,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    // gap: 50,
    // borderWidth: 1,
  },
  titleTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    gap: 10,
  },
  titleText: {
    fontSize: 40,
    fontWeight: '800',
  },
  checkCircle: {
    alignSelf: 'center',
    width: 100,
    height: 100,
  },
});

import {View, StyleSheet, Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import Title from '../../components/Title';
import CheckAccountBox from './CheckAccountBox';
import BackButton from '../../components/BackButton';
import {RootStackParamList} from '../../navigation/types';
import {getHistories} from '../../api/axiosAccount';
import {
  AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';

// const histories: HistoryItemProps[] = [
//   {
//     id: 1,
//     transactionStatus: true,
//     transactionBankId: 1,
//     transactionBalance: 100000,
//     transactionAccount: '110-262-000720',
//     transactionAmount: 100000,
//     transactionType: 'withdraw',
//     transactionDate: '2024-01-01',
//     transactionName: '박수연',
//   },
//   {
//     id: 2,
//     transactionStatus: true,
//     transactionBankId: 1,
//     transactionBalance: 100000,
//     transactionAccount: '110-262-000720',
//     transactionAmount: 100000,
//     transactionDate: '2024-01-01',
//     transactionType: 'deposit',
//     transactionName: '박수연',
//   },
//   {
//     id: 3,
//     transactionStatus: true,
//     transactionBankId: 1,
//     transactionBalance: 100000,
//     transactionAccount: '110-262-000720',
//     transactionDate: '2024-01-01',
//     transactionType: 'withdraw',
//     transactionAmount: 100000,
//     transactionName: '박수연',
//   },
// ];

const CheckHistory = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CheckHistory'>>();

  const accounts = route.params?.selectedAccount;
  const [histories, setHistories] = useState<HistoryItemProps[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await getHistories(accounts.id);
      setHistories(data);
    };
    fetchAccounts();
  }, [accounts.id]);

  const handleSelectAccount = (item: AccountItemProps | HistoryItemProps) => {
    // 계좌 선택 시 처리할 로직
    navigation.navigate('CheckHistoryDetail', {
      history: item as HistoryItemProps,
    });
  };

  return (
    <View style={styles.container}>
      <Title title="내역 조회" />
      {/* 선택된 계좌 정보 표시 */}
      <View style={styles.accountInfo}>
        {/* <Text style={styles.accountBank}>{accounts?.accountBank}</Text> */}
        <Text style={styles.accountNumber}>{accounts?.accountNo}</Text>
        <Text style={styles.balance}>잔액: {accounts?.accountBalance}원</Text>
      </View>
      <CheckAccountBox
        data={histories}
        type="history"
        onSelect={handleSelectAccount}
      />

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton
          text="이전으로"
          onPress={() => navigation.goBack()}
          type="back"
        />
      </View>
    </View>
  );
};

export default CheckHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 50,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  accountInfo: {
    width: '100%',
    // marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderColor: '#373DCC',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  accountBank: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  accountNumber: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  balanceContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  balanceTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  balance: {
    fontSize: 35,
    fontWeight: 'bold',
  },
});

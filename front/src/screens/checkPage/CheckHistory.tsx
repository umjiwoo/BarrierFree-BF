import {View, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import CheckAccountBox from './CheckAccountBox';
import {getHistories} from '../../api/axiosAccount';
import {
  // AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';
import DefaultPage from '../../components/DefaultPage';
import {useAccountStore} from '../../stores/accountStore';

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
  const {accounts} = useAccountStore();

  const [histories, setHistories] = useState<HistoryItemProps[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const fetchAccounts = async () => {
  //     const data = await getHistories(accounts.id);
  //     setHistories(data);
  //   };
  //   fetchAccounts();
  // }, [accounts.id]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        if (!accounts?.id) {
          setIsLoading(false);
          return;
        }
        const data = await getHistories(accounts.id);
        setHistories(data);
      } catch (error) {
        console.error('거래 내역 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, [accounts?.id]);

  const handleSelectHistory = (item: HistoryItemProps) => {
    // 계좌 선택 시 처리할 로직
    navigation.navigate('CheckHistoryDetail', {
      history: item as HistoryItemProps,
    });
  };
  if (!accounts) {
    return (
      <View style={styles.container}>
        <DefaultPage
          UpperLeftText="이전으로"
          UpperRightText="홈"
          MainText={
            <View>
              <Text>등록된 계좌가 없습니다. 계좌를 먼저 생성해주세요.</Text>
            </View>
          }
          onUpperLeftTextPress={() => navigation.goBack()}
          onUpperRightTextPress={() => navigation.navigate('Main')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Title title="내역 조회" /> */}
      {/* 선택된 계좌 정보 표시 */}
      {/* <View style={styles.accountInfo}>
        <Text style={styles.accountBank}>{accounts?.accountBank}</Text>
        <Text style={styles.accountNumber}>{accounts?.accountNo}</Text>
        <Text style={styles.balance}>잔액: {accounts?.accountBalance}원</Text>
      </View> */}
      <DefaultPage
        UpperLeftText="이전으로"
        UpperRightText="홈"
        LowerLeftText="<"
        LowerRightText=">"
        MainText={
          <CheckAccountBox data={histories} onSelect={handleSelectHistory} />
        }
        onUpperLeftTextPress={() => navigation.goBack()}
        onUpperRightTextPress={() => navigation.navigate('Main')}
        onLowerLeftTextPress={() => {}}
        onLowerRightTextPress={() => {}}
      />

      {/* 버튼 */}
      {/* <View style={styles.buttonContainer}>
        <BackButton
          text="이전으로"
          onPress={() => navigation.goBack()}
          type="back"
        />
      </View> */}
    </View>
  );
};

export default CheckHistory;

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

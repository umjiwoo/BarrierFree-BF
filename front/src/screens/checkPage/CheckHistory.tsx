import {View, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import Title from '../../components/Title';
import CheckAccountBox from './CheckAccountBox';
import BackButton from '../../components/BackButton';
import {getHistories} from '../../api/axiosAccount';
import {HistoryItemProps} from '../../components/types/CheckAccount';
import {useAccountStore} from '../../stores/accountStore';

const CheckHistory = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {selectedAccount} = useAccountStore();
  const [histories, setHistories] = useState<HistoryItemProps[]>([]);

  console.log('selectedAccount', selectedAccount);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!selectedAccount) {
        console.log('계좌 조회 실패');
        console.log(selectedAccount);
      } else {
        const data = await getHistories(selectedAccount.id);
        setHistories(data);
      }
    };
    fetchAccounts();
  }, [selectedAccount]);

  const handleSelectHistory = (item: HistoryItemProps) => {
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
        <Text style={styles.accountNumber}>{selectedAccount?.accountNo}</Text>
        <Text style={styles.balance}>
          잔액: {selectedAccount?.accountBalance}원
        </Text>
      </View>
      {histories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>내역이 없습니다.</Text>
        </View>
      ) : (
        <CheckAccountBox
          data={histories}
          type="history"
          onSelect={handleSelectHistory}
        />
      )}

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#373DCC',
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
});

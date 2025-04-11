import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {AccountItemProps} from '../../components/types/CheckAccount';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface MyAccountDetailProps {
  data: AccountItemProps;
  length: number;
  onSelect?: (item: AccountItemProps) => void;
}

const MyAccountDetail: React.FC<MyAccountDetailProps> = ({
  data,
  length,
  onSelect,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };

  const renderItem = ({item}: {item: AccountItemProps}) => {
    if (length === 0) {
      return (
        <TouchableOpacity
          style={[styles.item, styles.accountBox]}
          activeOpacity={0.9}
          onPress={handleCreateAccount}>
          <View style={styles.account}>
            <Text style={styles.accountNumber}>계좌를 만들어 주세요!</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      const accountItem = item as AccountItemProps;
      const createdAt = new Date(accountItem.createdAt);
      const formattedCreatedAt = createdAt.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return (
        <TouchableOpacity
          style={[styles.item, styles.accountBox]}
          onPress={() => onSelect && onSelect(item)}
          activeOpacity={0.9}>
          <View style={styles.account}>
            <View style={styles.accountBankContainer}>
              {accountItem.bankId === 999 ? (
                <Text style={styles.accountBank}>싸피은행</Text>
              ) : (
                <Text style={styles.accountBank}>타은행</Text>
              )}
              <Text style={styles.accountNumber}>{accountItem.accountNo}</Text>
            </View>

            <Text style={styles.accountBalance}>
              잔액 : {accountItem.accountBalance} 원
            </Text>

            <View style={styles.accountCreatedAtContainer}>
              <Text style={styles.accountCreatedAt}>계좌 생성일</Text>
              <Text style={styles.accountCreatedAt}>{formattedCreatedAt}</Text>
            </View>

            {accountItem.accountState === 'ACTIVE' ? null : (
              <View style={styles.accountLockContainer}>
                <Text style={styles.accountLock}>계좌 잠금 상태입니다.</Text>
              </View>
            )}

            <View style={styles.accountTransferContainer}>
              <View style={styles.accountDailyTransferLimitContainer}>
                <Text style={styles.accountDailyTransfer}>일일 송금 한도</Text>
                <Text style={styles.accountDailyTransfer}>
                  {accountItem.dailyTransferLimit} 원
                </Text>
              </View>
              <View style={styles.accountOneTimeTransferLimitContainer}>
                <Text style={styles.accountOneTimeTransfer}>1회 송금 한도</Text>
                <Text style={styles.accountOneTimeTransfer}>
                  {accountItem.oneTimeTransferLimit} 원
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return <View style={styles.container}>{renderItem({item: data})}</View>;
};

const styles = StyleSheet.create({
  accountBoxContainer: {
    width: '100%',
    marginVertical: 10,
    flex: 1,
  },
  accountBox: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 0,
    borderWidth: 2,
    borderColor: '#373DCC',
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
  },
  account: {
    display: 'flex',
    flexDirection: 'column',
    gap: 60,
  },
  accountBankContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountBank: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountNumber: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountBalance: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
  },
  container: {
    width: '100%',
    height: '100%',
  },
  item: {
    width: '100%',
    height: '100%',
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  accountCreatedAtContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountCreatedAt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountLockContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountLock: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountTransferContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  accountDailyTransferLimitContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  accountOneTimeTransferLimitContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  accountDailyTransfer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountOneTimeTransfer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
});

export default MyAccountDetail;

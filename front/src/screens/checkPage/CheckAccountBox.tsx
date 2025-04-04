import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {HistoryItemProps} from '../../components/types/CheckAccount';

interface CheckAccountBoxProps {
  data: HistoryItemProps[];
  onSelect: (item: HistoryItemProps) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CheckAccountBox = ({data, onSelect}: CheckAccountBoxProps) => {
  console.log('data', data);
  return (
    <View style={styles.container}>
      <Carousel
        loop={false}
        width={SCREEN_WIDTH}
        height={SCREEN_WIDTH / 2}
        data={data}
        onSnapToItem={index => onSelect(data[index])}
        renderItem={({item}) => {
          return (
            <View
              style={
                [
                  // styles.accountItem,
                  // isSelected && styles.selectedAccount,
                ]
              }>
              <Text style={styles.name}>{item.transactionName}</Text>
              <Text style={styles.bank}>{item.transactionType}</Text>
              <Text style={styles.number}>{item.transactionAmount}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  accountItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  selectedAccount: {
    backgroundColor: '#e0e0ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bank: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  number: {
    fontSize: 14,
    color: '#999',
=======
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
    // paddingHorizontal: CONTAINER_PADDING, // 컨테이너에 패딩 추가
  },
  item: {
    // width: ITEM_WIDTH, // 아이템 너비 적용
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
>>>>>>> 6b09425b89777b54444b4ad44d914b530da43d7e
  },
});

export default CheckAccountBox;

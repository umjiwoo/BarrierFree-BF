import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {HistoryItemProps} from '../../components/types/CheckAccount';

interface CheckAccountBoxProps {
  data: HistoryItemProps[];
  carouselRef: any;
  onSelect: (item: HistoryItemProps) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const formatDateTime = (dateString: string) => {
  const newDate = new Date(dateString);
  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, '0');
  const day = String(newDate.getDate()).padStart(2, '0');
  const hours = String(newDate.getHours()).padStart(2, '0');
  const minutes = String(newDate.getMinutes()).padStart(2, '0');
  const seconds = String(newDate.getSeconds()).padStart(2, '0');

  const date = `${year}년 ${month}월 ${day}일`;
  const time = `${hours}:${minutes}:${seconds}`;

  return {date, time};
};

const CheckAccountBox = ({
  data,
  carouselRef,
  onSelect,
}: CheckAccountBoxProps) => {
  console.log('data', data);
  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SCREEN_WIDTH}
        // height={'100%'}
        data={data}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={styles.accountItem}>
              <Text style={styles.name}>{item.transactionName}</Text>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>
                  {formatDateTime(item.transactionDate).date}
                </Text>
                <Text style={styles.time}>
                  {formatDateTime(item.transactionDate).time}
                </Text>
              </View>
              <View style={styles.bankContainer}>
                {item.transactionType === 'WITHDRAWAL' ? (
                  <Text style={[styles.bank, styles.withdrawal]}>출금</Text>
                ) : (
                  <Text style={[styles.bank, styles.deposit]}>입금</Text>
                )}
                <Text style={styles.number}>{item.transactionAmount} 원</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  accountItem: {
    flex: 1,
    gap: 10,
    width: '100%',
    height: '100%',
    // padding: 20,
    paddingVertical: 20,
    paddingRight: 60,
    paddingLeft: 20,
    borderRadius: 10,
    // margin: 10,
  },
  name: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  date: {
    fontSize: 25,
    color: '#666',
    marginBottom: 10,
  },
  time: {
    fontSize: 25,
    color: '#666',
    marginBottom: 10,
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bank: {
    fontSize: 35,
    color: '#666',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 35,
    color: '#999',
    flexShrink: 1,
    textAlign: 'right',
  },
  withdrawal: {
    color: '#373DCC',
  },
  deposit: {
    color: '#B6010E',
  },
});

export default CheckAccountBox;

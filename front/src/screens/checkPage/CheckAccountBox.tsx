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
import formatDateManually from '../../components/utils/makeDate';

interface CheckAccountBoxProps {
  data: HistoryItemProps[];
  carouselRef: any;
  onSelect: (item: HistoryItemProps) => void;
  onSnapToItem?: (index: number) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CheckAccountBox = ({
  data,
  carouselRef,
  onSelect,
  onSnapToItem,
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
              {item.transactionType === 'WITHDRAWAL' ? (
                <View style={styles.bankContainer}>
                  <Text style={[styles.bank, styles.withdrawal]}>출금</Text>
                  <Text style={[styles.number, styles.withdrawal]}>
                    {item.transactionAmount} 원
                  </Text>
                </View>
              ) : (
                <View style={styles.bankContainer}>
                  <Text style={[styles.bank, styles.deposit]}>입금</Text>
                  <Text style={[styles.number, styles.deposit]}>
                    {item.transactionAmount} 원
                  </Text>
                </View>
              )}
              <View style={styles.dateContainer}>
                <Text style={styles.date}>
                  {formatDateManually(item.transactionDate).date}
                </Text>
                <Text style={styles.time}>
                  {formatDateManually(item.transactionDate).time}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        onSnapToItem={onSnapToItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000', // 고대비 배경
  },
  accountItem: {
    flex: 1,
    justifyContent: 'center',
    width: '90%',
    height: '100%',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    // marginHorizontal: '5%',
    backgroundColor: '#000', // 카드 배경
  },
  name: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  date: {
    fontSize: 40,
    color: '#fff',
    marginBottom: 4,
    fontWeight: '600',
  },
  time: {
    fontSize: 40,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    // marginTop: 'auto',
  },
  bank: {
    fontSize: 45,
    fontWeight: '600',
  },
  number: {
    fontSize: 45,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  withdrawal: {
    color: '#DC3545', // 빨간 계열 출금
  },
  deposit: {
    color: '#B6010E', // 녹색 계열 입금
  },
});

export default CheckAccountBox;

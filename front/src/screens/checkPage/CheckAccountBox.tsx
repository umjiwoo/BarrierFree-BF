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
              <View style={styles.dateContainer}>
                <Text style={styles.date}>
                  {formatDateManually(item.transactionDate).date}
                </Text>
                <Text style={styles.time}>
                  {formatDateManually(item.transactionDate).time}
                </Text>
              </View>
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
  },
  accountItem: {
    flex: 1,
    gap: 20,
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
    fontSize: 35,
    color: '#24282B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 30,
    color: '#24282B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bank: {
    fontSize: 35,
    color: '#24282B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 35,
    color: '#24282B',
    fontWeight: 'bold',
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

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
  },
});

export default CheckAccountBox;

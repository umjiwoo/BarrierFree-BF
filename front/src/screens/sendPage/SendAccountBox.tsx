import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {TestAccountItemProps} from '../../components/types/CheckAccount';
import formatDateManually from '../../components/utils/makeDate';

interface SendAccountBoxProps {
  accountData: TestAccountItemProps[];
  carouselRef: any;
  selectedAccount: TestAccountItemProps | null;
  onSelectAccount: (account: TestAccountItemProps) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const SendAccountBox = ({
  accountData,
  carouselRef,
  selectedAccount,
  onSelectAccount,
}: SendAccountBoxProps) => {
  useEffect(() => {
    if (accountData.length > 0) {
      onSelectAccount(accountData[0]);
    }
  }, [accountData, onSelectAccount]);

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SCREEN_WIDTH}
        data={accountData}
        onSnapToItem={index => {
          if (index >= 0 && index < accountData.length) {
            onSelectAccount(accountData[index]);
          }
        }}
        renderItem={({item}) => {
          const isSelected =
            selectedAccount &&
            selectedAccount.receiverAccount === item.receiverAccount;
          const {date, time} = formatDateManually(item.transactionDate);

          return (
            <View
              style={[
                styles.accountItem,
                isSelected && styles.selectedAccount,
              ]}>
              <View style={styles.transactionDateContainer}>
                <Text style={styles.number}>{date}</Text>
                <Text style={styles.number}>{time}</Text>
              </View>
              <Text style={styles.bank}>{item.receiverName}</Text>
              <Text style={styles.bank}>{item.receiverAccount}</Text>
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
    width: '100%',
    height: '100%',
  },
  accountItem: {
    flex: 1,
    gap: 20,
    width: '100%',
    height: '100%',
    paddingVertical: 20,
    paddingRight: 60,
    paddingLeft: 20,
    borderRadius: 10,
  },
  selectedAccount: {
    // backgroundColor: 'rgba(127,53,212, 0.1)',
  },
  transactionDateContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bank: {
    fontSize: 35,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 35,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default SendAccountBox;

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  // ScrollView,
  Dimensions,
  // NativeSyntheticEvent,
  // NativeScrollEvent,
} from 'react-native';
import formatDateManually from '../../components/utils/makeDate';
import {TestAccountItemProps} from '../../components/types/CheckAccount.ts';
// import Carousel from 'react-native-snap-carousel';
import Carousel from 'react-native-reanimated-carousel';

interface SendAccountBoxProps {
  accountData: Array<TestAccountItemProps>;
  onSelectAccount: (account: any) => void;
  selectedAccount: any;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
// const ITEM_WIDTH = SCREEN_WIDTH * 0.89;

const SendAccountBox = ({
  accountData,
  onSelectAccount,
  selectedAccount,
}: SendAccountBoxProps) => {
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    if (
      accountData.length > 0 &&
      (!selectedAccount ||
        selectedAccount.receiverAccount !== accountData[0].receiverAccount)
    ) {
      onSelectAccount(accountData[0]);
    }
  }, [accountData, selectedAccount, onSelectAccount]);

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SCREEN_WIDTH}
        data={accountData}
        onSnapToItem={(index: number) => {
          onSelectAccount(accountData[index]);
        }}
        renderItem={({item}: {item: TestAccountItemProps}) => {
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  accountItem: {
    width: SCREEN_WIDTH,
    height: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    gap: 10,
    // marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAccount: {
    height: '100%',
    backgroundColor: '#e0e0ff',
    // borderWidth: 2,
    // borderColor: '#007AFF',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#7F35D4',
  },
  bank: {
    fontSize: 30,
    color: '#7F35D4',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  number: {
    fontSize: 25,
    color: '#7F35D4',
    fontWeight: 'bold',
  },
  transactionDateContainer: {
    flexDirection: 'column',
    // justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});

export default SendAccountBox;

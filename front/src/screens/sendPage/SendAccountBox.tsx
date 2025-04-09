import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import formatDateManually from '../../components/utils/makeDate';

interface SendAccountBoxProps {
  accountData: Array<{
    // name: string;
    transactionDate: string;
    // accountBank: string;
    receiverAccount: string;
  }>;
  onSelectAccount: (account: any) => void;
  selectedAccount: any;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.89;

const SendAccountBox = ({
  accountData,
  onSelectAccount,
  selectedAccount,
}: SendAccountBoxProps) => {
  useEffect(() => {
    if (accountData.length > 0) {
      onSelectAccount(accountData[0]);
    }
  }, [accountData, onSelectAccount]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / SCREEN_WIDTH);
    if (currentIndex >= 0 && currentIndex < accountData.length) {
      onSelectAccount(accountData[currentIndex]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}>
        {accountData.map((item, index) => {
          const isSelected =
            selectedAccount &&
            selectedAccount.receiverAccount === item.receiverAccount;

          const {date, time} = formatDateManually(item.transactionDate);

          return (
            <View
              key={index}
              style={[
                styles.accountItem,
                isSelected && styles.selectedAccount,
              ]}>
              {/* <Text style={styles.name}>{item.name}</Text> */}
              <View style={styles.transactionDateContainer}>
                <Text style={styles.number}>{date}</Text>
                <Text style={styles.number}>{time}</Text>
              </View>
              <Text style={styles.bank}>{item.receiverAccount}</Text>
            </View>
          );
        })}
      </ScrollView>
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
    width: ITEM_WIDTH,
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

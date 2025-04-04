import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

interface SendAccountBoxProps {
  accountData: Array<{
    name: string;
    date: string;
    accountBank: string;
    accountNumber: string;
  }>;
  onSelectAccount: (account: any) => void;
  selectedAccount: any;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.9;

const SendAccountBox = ({
  accountData,
  onSelectAccount,
  selectedAccount,
}: SendAccountBoxProps) => {
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
            selectedAccount.accountNumber === item.accountNumber;

          return (
            <View
              key={index}
              style={[
                styles.accountItem,
                isSelected && styles.selectedAccount,
              ]}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.bank}>{item.accountBank}</Text>
              <Text style={styles.number}>{item.accountNumber}</Text>
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
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    // marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
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

export default SendAccountBox;

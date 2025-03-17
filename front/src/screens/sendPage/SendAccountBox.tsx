import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface AccountProps {
  name: string;
  date: string;
  accountBank: string;
  accountNumber: string;
}

const SendAccountBox: React.FC<AccountProps> = ({
  name,
  date,
  accountBank,
  accountNumber,
}) => {
  return (
    <View style={styles.accountBox}>
      <Text style={styles.accountName}>{name}</Text>
      <Text style={styles.accountDate}>{date}</Text>
      <View style={styles.account}>
        <Text style={styles.accountBank}>{accountBank}</Text>
        <Text style={styles.accountNumber}>{accountNumber}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountBox: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#373DCC',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'white',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    elevation: 3,
  },
  accountName: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  accountDate: {
    fontSize: 20,
    // color: 'gray',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  account: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  accountBank: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  accountNumber: {
    fontSize: 25,
    fontWeight: 'bold',
  },
});

export default SendAccountBox;

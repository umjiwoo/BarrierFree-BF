import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface DetailBoxProps {
  name: string;
  bank: string;
  account: string;
}

const DetailBoxAccount: React.FC<DetailBoxProps> = ({name, bank, account}) => {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>받는사람</Text>
          <Text style={styles.detailValue}>{name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>계좌 정보</Text>
          <View style={styles.detailValueContainer}>
            <Text style={styles.detailValue}>{bank}</Text>
            <Text style={styles.accountNumber}>{account}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailContainer: {
    marginVertical: 10,
    flex: 1,
    width: '100%',
    height: '100%',
    // alignItems: 'center',
  },
  detailBox: {
    width: '100%',
    height: '100%',
    // borderWidth: 2,
    // borderColor: '#373DCC',
    paddingVertical: 30,
    // paddingVertical: 0,
    // borderRadius: 12,
    marginBottom: 30,
    gap: 5,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
    // gap: 10,
  },
  detailLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7F35D4',
  },
  detailValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountNumber: {
    fontSize: 24,
    color: '#24282B',
  },
  detailValueContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
});

export default DetailBoxAccount;

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface DetailBoxProps {
  recipient: string;
  bank: string;
  account: string;
  remitter: string;
  amount: number;
}

const DetailBoxInformation: React.FC<DetailBoxProps> = ({
  recipient,
  bank,
  account,
  remitter,
  amount,
}) => {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>받는사람</Text>
          <Text style={styles.detailValue}>{recipient}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>계좌 정보</Text>
          <View style={styles.detailValueContainer}>
            <Text style={styles.detailValue}>{bank}</Text>
            <Text style={styles.accountNumber}>{account}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>보내는사람</Text>
          <Text style={styles.detailValue}>{remitter}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>금액</Text>
          <Text style={styles.detailValue}>{amount}원</Text>
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
  },
  detailBox: {
    width: '100%',
    height: '100%',
    // borderWidth: 2,
    // borderColor: '#373DCC',
    paddingVertical: 30,
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

export default DetailBoxInformation;

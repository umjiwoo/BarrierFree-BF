import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface DetailBoxProps {
  recipient: string;
  receiverAccount: string;
  remitter: string;
  amount: number;
}

const DetailBoxInformation: React.FC<DetailBoxProps> = ({
  recipient,
  receiverAccount,
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
            <Text style={styles.detailValue}>{receiverAccount}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>보내는사람</Text>
          <Text style={styles.detailValue}>{remitter}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>금액</Text>
          <Text style={styles.detailValue}>{amount} 원</Text>
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
    paddingVertical: 30,
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailValueContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
});

export default DetailBoxInformation;

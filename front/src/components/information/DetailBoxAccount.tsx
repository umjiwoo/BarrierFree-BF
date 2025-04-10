import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface DetailBoxProps {
  receiverName: string;
  receiverAccount: string;
}

const DetailBoxAccount: React.FC<DetailBoxProps> = ({
  receiverName,
  receiverAccount,
}) => {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>받는사람</Text>
          <Text style={styles.detailValue}>{receiverName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>계좌 정보</Text>
          <View style={styles.detailValueContainer}>
            <Text style={styles.accountNumber}>{receiverAccount}</Text>
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
    gap: 15,
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
  accountNumber: {
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

export default DetailBoxAccount;

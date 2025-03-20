import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface DetailBoxProps {
  name: string;
  amount: number;
}

const DetailBoxConfirm: React.FC<DetailBoxProps> = ({name, amount}) => {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{name}</Text>
          <Text style={styles.detailLabel}>님께</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{amount}</Text>
          <Text style={styles.detailLabel}>원</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {fontSize: 30}]}>
            정말 이체하시겠습니까?
          </Text>
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
  },
  detailBox: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#373DCC',
    padding: 30,
    borderRadius: 12,
    // marginBottom: 30,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  accountNumber: {
    fontSize: 24,
    color: '#333',
  },
});

export default DetailBoxConfirm;

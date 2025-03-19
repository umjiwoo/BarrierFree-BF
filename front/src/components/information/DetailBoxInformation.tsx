import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface DetailBoxProps {
  recipient: string;
  bank: string;
  account: string;
  remitter: string;
  amount: number;
}

const DetailBoxInformation: React.FC<DetailBoxProps> = ({ recipient, bank, account, remitter, amount }) => {
  return (
    <View style={styles.detailBox}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>받는사람</Text>
        <Text style={styles.detailValue}>{recipient}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>계좌 정보</Text>
        <View>
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
  );
};

const styles = StyleSheet.create({
  detailBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "blue",
    padding: 15,
    borderRadius: 5,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  accountNumber: {
    fontSize: 24,
    color: "#333",
  },
});

export default DetailBoxInformation;

import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface DetailBoxProps {
  name: string;
  bank: string;
  account: string;
}

const DetailBoxAccount: React.FC<DetailBoxProps> = ({ name, bank, account }) => {
  return (
    <View style={styles.detailBox}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>받는사람</Text>
        <Text style={styles.detailValue}>{name}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>계좌 정보</Text>
        <View>
          <Text style={styles.detailValue}>{bank}</Text>
          <Text style={styles.accountNumber}>{account}</Text>
        </View>
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

export default DetailBoxAccount;

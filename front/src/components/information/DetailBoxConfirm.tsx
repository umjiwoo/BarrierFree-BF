import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface DetailBoxProps {
  name: string;
  amount: number;
}

const DetailBoxConfirm: React.FC<DetailBoxProps> = ({ name, amount }) => {
  return (
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
        <Text style={styles.detailLabel}>정말 이체하시겠습니까?</Text>
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
    justifyContent: "flex-start",
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

export default DetailBoxConfirm;

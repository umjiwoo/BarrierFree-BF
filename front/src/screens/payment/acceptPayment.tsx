import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

const AcceptPaymentScreen = ({route}: {route: any;}) => {
    const messageData = route?.params;
  
    return (
        <View style={styles.container}>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.button}>
            </TouchableOpacity>
          </View>
    
          {messageData && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>User ID: {messageData.userId}</Text>
              <Text style={styles.infoText}>금액: {messageData.transactionAmount}원</Text>
              <Text style={styles.infoText}>판매자 계좌: {messageData.sellerAccountNo}</Text>
              <Text style={styles.infoText}>은행 코드: {messageData.sellerAccountBankCode}</Text>
              <Text style={styles.infoText}>WebSocket ID: {messageData.transactionWebSocketId}</Text>
            </View>
          )}
        </View>
      );
    };

export default AcceptPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%',
    height: '45%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 18,
    marginVertical: 2,
  },
});

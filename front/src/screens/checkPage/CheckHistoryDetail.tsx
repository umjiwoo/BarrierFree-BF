import {View, StyleSheet, Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/DefaultPage';

const CheckHistoryDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const route = useRoute<RouteProp<RootStackParamList, 'CheckHistoryDetail'>>();
  const history = route.params?.history;

  const formatDateManually = (isoString: string): any => {
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 0부터 시작
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return {
      date: `${year}년 ${month}월 ${day}일`,
      time: `${hour}:${minute}:${second}`,
    };
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText="이전으로"
        UpperRightText="홈  "
        LowerLeftText="<"
        LowerRightText=">"
        MainText={
          <View style={styles.historyContainer}>
            {/* 날짜 */}
            <View style={styles.historyDateContainer}>
              <Text style={styles.historyDate}>
                {formatDateManually(history.transactionDate).date}
              </Text>
              <Text style={styles.historyTime}>
                {formatDateManually(history.transactionDate).time}
              </Text>
            </View>

            {/* 거래 장소 */}
            <Text style={styles.historyWhere}>{history.transactionName}</Text>

            {/* 거래 계좌 */}
            {history.transactionAccount && (
              <View style={styles.historyAccountContainer}>
                <Text style={styles.historyAccountTitle}>거래 계좌</Text>
                <Text style={styles.historyAccount}>
                  {history.transactionAccount}
                </Text>
              </View>
            )}

            {/* 거래 금액 */}
            {history.transactionType === 'DEPOSIT' ? (
              <View style={styles.historyAmountContainer}>
                <Text style={[styles.historyAmount, styles.plusAmount]}>
                  입금
                </Text>
                <Text style={[styles.historyAmount, styles.plusAmount]}>
                  {history.transactionAmount} 원
                </Text>
              </View>
            ) : (
              <View style={styles.historyAmountContainer}>
                <Text style={[styles.historyAmount, styles.minusAmount]}>
                  출금
                </Text>
                <Text style={[styles.historyAmount, styles.minusAmount]}>
                  {history.transactionAmount} 원
                </Text>
              </View>
            )}

            {/* 거래 후 잔액 */}
            <View style={styles.historyBalance}>
              <Text style={styles.historyBalanceTitle}>거래 후 잔액</Text>
              <Text style={styles.historyBalanceAmount}>
                {history.transactionBalance} 원
              </Text>
            </View>
          </View>
        }
        onUpperLeftTextPress={() => navigation.goBack()}
        onUpperRightTextPress={() => navigation.navigate('Main')}
        onLowerLeftTextPress={() => {}}
        onLowerRightTextPress={() => {}}
      />
    </View>
  );
};

export default CheckHistoryDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  historyContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    padding: 20,
  },
  historyDateContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyDate: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyTime: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyTypeContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTypeTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
    alignSelf: 'flex-end',
  },
  historyType: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhereContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyWhereTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhere: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
    marginBottom: 20,
  },
  historyAccountContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  historyAccountTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#24282B',
  },
  historyAccount: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyBalance: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  historyBalanceTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyBalanceAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmountContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    marginBottom: 20,
  },
  historyAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  plusAmount: {
    color: '#B6010E',
  },
  minusAmount: {
    color: '#373DCC',
  },
});

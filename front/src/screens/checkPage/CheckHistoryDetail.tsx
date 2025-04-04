import {View, StyleSheet, Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import Title from '../../components/Title';
import BackButton from '../../components/BackButton';
import {RootStackParamList} from '../../navigation/types';

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
  // formatDateManually(history.transactionDate);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title title="상세 내역" />
      </View>
      <View style={styles.historyContainer}>
        <View style={styles.historyDateContainer}>
          <Text style={styles.historyDate}>
            {formatDateManually(history.transactionDate).date}
          </Text>
          <Text style={styles.historyTime}>
            {formatDateManually(history.transactionDate).time}
          </Text>
        </View>
        <Text style={styles.historyWhere}>{history.transactionName}</Text>
        {history.transactionAccount && (
          <Text style={styles.historyAccount}>
            {history.transactionAccount}
          </Text>
        )}
        {history.transactionType === 'DEPOSIT' ? (
          <Text style={[styles.historyAmount, styles.plusAmount]}>
            입금 {history.transactionAmount} 원
          </Text>
        ) : (
          <Text style={[styles.historyAmount, styles.minusAmount]}>
            출금 {history.transactionAmount} 원
          </Text>
        )}
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton
          text="이전으로"
          onPress={() => navigation.goBack()}
          type="back"
        />
      </View>
    </View>
  );
};

export default CheckHistoryDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 50,
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    marginTop: 20,
    borderBottomColor: '#373DCC',
    borderBottomWidth: 3,
    borderRadius: 12,
    paddingBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  historyContainer: {
    width: '100%',
    // height: '100%',
    flex: 1,
    gap: 50,
    margin: 20,
    paddingTop: 20,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#373DCC',
    borderRadius: 12,
  },
  historyDateContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    // alignItems: 'center',
    gap: 5,
  },
  historyDateTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyDateContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
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
    gap: 5,
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
    gap: 5,
  },
  historyWhereTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhere: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhereContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },
  historyAccount: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmountContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  historyAmountTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmountPositiveContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },
  historyAmountNegativeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },
  plusAmount: {
    color: '#B6010E',
  },
  minusAmount: {
    color: '#373DCC',
  },
});

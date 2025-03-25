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

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title title="상세 내역" />
      </View>
      <View style={styles.historyContainer}>
        <View style={styles.historyDateContainer}>
          <Text style={styles.historyDateTitle}>일시</Text>
          <View style={styles.historyDateContent}>
            <Text style={styles.historyDate}>{history.historyDate}</Text>
            <Text style={styles.historyTime}>{history.historyTime}</Text>
          </View>
        </View>
        <View style={styles.historyTypeContainer}>
          <Text style={styles.historyTypeTitle}>거래유형</Text>
          <Text style={styles.historyType}>{history.historyType}</Text>
        </View>
        <View style={styles.historyWhereContainer}>
          <Text style={styles.historyWhereTitle}>거래구분</Text>
          <View style={styles.historyWhereContent}>
            <Text style={styles.historyWhere}>{history.historyWhere}</Text>
            {history.historyAccount && (
              <Text style={styles.historyAccount}>
                {history.historyAccount}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.historyAmountContainer}>
          <Text style={styles.historyAmountTitle}>거래금액</Text>
          {history.historyType === '계좌 입금' ? (
            <View style={styles.historyAmountPositiveContainer}>
              <Text
                style={[styles.historyAmount, styles.historyAmountPositive]}>
                입금
              </Text>
              <Text
                style={[styles.historyAmount, styles.historyAmountPositive]}>
                {history.historyAmount} 원
              </Text>
            </View>
          ) : (
            <View style={styles.historyAmountNegativeContainer}>
              <Text
                style={[styles.historyAmount, styles.historyAmountNegative]}>
                출금
              </Text>
              <Text
                style={[styles.historyAmount, styles.historyAmountNegative]}>
                {history.historyAmount} 원
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton
          text="이전으로"
          onPress={() => navigation.goBack()}
          style={styles.button}
          textStyle={styles.buttonText}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  historyAmountPositive: {
    color: '#B6010E',
  },
  historyAmountNegative: {
    color: '#373DCC',
  },
  button: {
    backgroundColor: '#B6010E',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
});

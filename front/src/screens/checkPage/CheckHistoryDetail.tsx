import {View, StyleSheet, Text} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import formatDateManually from '../../components/utils/makeDate';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';

const CheckHistoryDetail = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const route = useRoute<RouteProp<RootStackParamList, 'CheckHistoryDetail'>>();
  const history = route.params?.history;
  const dateInfo = formatDateManually(history.transactionDate);
  const transactionType = history.transactionType === 'DEPOSIT' ? '입금' : '출금';

  useTTSOnFocus(`
    ${dateInfo.date} ${dateInfo.time}에 ${history.transactionName}에서 ${transactionType}되었습니다.
    금액은 ${history.transactionAmount}이며, 거래 후 잔액은 ${history.transactionBalance}입니다.
    계좌번호는 ${history.transactionAccount.split('').join(' ')}입니다.
    아래 버튼을 누르면 계좌 조회 페이지로 이동됩니다.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `)

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="돌아가기"
        LowerRightText={<CheckIcon width={80} height={80} />}
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
                <Text style={styles.historyAccountTitle}>내 계좌</Text>
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
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
        onLowerRightTextPress={handlePressBack}
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
    justifyContent: 'center',
    flex: 1,
    // padding: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  historyDateContainer: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  historyAccountTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    // alignSelf: 'flex-start',
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

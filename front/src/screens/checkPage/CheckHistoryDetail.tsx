import {View, StyleSheet, Text, Pressable, TouchableOpacity} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import formatDateManually from '../../components/utils/makeDate';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';
import VolumeIcon from '../../assets/icons/Volume.svg';

const CheckHistoryDetail = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();

  const route = useRoute<RouteProp<RootStackParamList, 'CheckHistoryDetail'>>();
  const history = route.params?.history;
  const dateInfo = formatDateManually(history.transactionDate);
  const transactionType =
    history.transactionType === 'DEPOSIT' ? '입금' : '출금';

  useTTSOnFocus(`
    ${dateInfo.date} ${dateInfo.time}에 ${
    history.transactionName
  }에서 ${transactionType}되었습니다.
    금액은 ${history.transactionAmount}이며, 거래 후 잔액은 ${
    history.transactionBalance
  }입니다.
    계좌번호는 ${history.transactionAccount.split('').join(' ')}입니다.
    아래 버튼을 누르면 계좌 조회 페이지로 이동됩니다.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const typeLabel =
  history.transactionType === 'WITHDRAWAL' ? '출금' : '입금';
  const fullMessage = [
    `거래유형: ${typeLabel}`,
    `거래명: ${history.transactionName}`,
    `거래금액: ${history.transactionAmount.toLocaleString()}원`,
    `잔액: ${history.transactionBalance.toLocaleString()}원`,
    `계좌번호: ${history.transactionAccount}`,
    `거래일시: ${history.transactionDate}`,
  ].join('\n\n');

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
            <ArrowLeftIcon width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        UpperRightText={
          <View style={styles.textContainer}>
            <HomeIcon width={100} height={100} />
            <Text style={styles.text}>메인</Text>
          </View>
        }
        LowerLeftText={
          <View style={styles.textContainer}>
            <CancelIcon width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <CheckIcon width={100} height={100} />
            <Text style={styles.text}>확인</Text>
          </View>
        }
        MainText={
          <TouchableOpacity
          // onPress={() => ()}
          >
            <View style={styles.accountItem}>
            <View style={styles.voiceButton}>
                <VolumeIcon width={30} height={30} />
                <Text style={styles.voiceButtonText}>계좌 상세 조회</Text>
            </View>
          {/* 날짜 */}
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDateManually(history.transactionDate).date}</Text>
            <Text style={styles.time}>{formatDateManually(history.transactionDate).time}</Text>
          </View>
  
          {/* 거래 이름 */}
          <Text style={styles.name}>{history.transactionName}</Text>
  
          {/* 거래 금액 */}
          <View style={styles.bankContainer}>
            <Text style={[styles.bankType, history.transactionType === 'WITHDRAWAL' ? styles.withdrawalBg : styles.depositBg]}>
              {typeLabel}
            </Text>
            <Text style={[styles.amount, history.transactionType === 'WITHDRAWAL' ? styles.withdrawal : styles.deposit]}>
              {history.transactionAmount.toLocaleString()} 원
            </Text>
          </View>
          </View>
        </TouchableOpacity>

          // <Pressable onPress={() => handleDefaultPress(fullMessage, undefined)}>
          // <View style={styles.historyContainer}>
          //   {/* 날짜 */}
          //   <View style={styles.historyDateContainer}>
          //     <Text style={styles.historyDate}>
          //       {formatDateManually(history.transactionDate).date}
          //     </Text>
          //     <Text style={styles.historyTime}>
          //       {formatDateManually(history.transactionDate).time}
          //     </Text>
          //   </View>

          //   {/* 거래 장소 */}
          //   <Text style={styles.historyWhere}>{history.transactionName}</Text>

          //   {/* 거래 계좌 */}
          //   {history.transactionAccount && (
          //     <View style={styles.historyAccountContainer}>
          //       <Text style={styles.historyAccountTitle}>내 계좌</Text>
          //       <Text style={styles.historyAccount}>
          //         {history.transactionAccount}
          //       </Text>
          //     </View>
          //   )}

          //   {/* 거래 금액 */}
          //   {history.transactionType === 'DEPOSIT' ? (
          //     <View style={styles.historyAmountContainer}>
          //       <Text style={[styles.historyAmount, styles.plusAmount]}>
          //         입금
          //       </Text>
          //       <Text style={[styles.historyAmount, styles.plusAmount]}>
          //         {history.transactionAmount} 원
          //       </Text>
          //     </View>
          //   ) : (
          //     <View style={styles.historyAmountContainer}>
          //       <Text style={[styles.historyAmount, styles.minusAmount]}>
          //         출금
          //       </Text>
          //       <Text style={[styles.historyAmount, styles.minusAmount]}>
          //         {history.transactionAmount} 원
          //       </Text>
          //     </View>
          //   )}

          //   {/* 거래 후 잔액 */}
          //   <View style={styles.historyBalance}>
          //     <Text style={styles.historyBalanceTitle}>거래 후 잔액</Text>
          //     <Text style={styles.historyBalanceAmount}>
          //       {history.transactionBalance} 원
          //     </Text>
          //   </View>
          // </View>
          // </Pressable>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={undefined}
        onLowerRightTextPress={undefined}
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
  accountItem: {
    width: '100%',
    // marginVertical: 10,
    // paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    // gap: 28,
  },
  dateContainer: {
    gap: 8,
  },
  date: {
    fontSize: 30,
    color: '#ccc',
    fontWeight: '600',
  },
  time: {
    fontSize: 30,
    color: '#ccc',
    fontWeight: '500',
  },
  name: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginTop: 8,
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
  },
  bankType: {
    fontSize: 35,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#DC3545', // 기본은 출금 색상
    color: '#fff',
    textAlignVertical: 'center'
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    color: '#fff',
    textAlignVertical: 'center'
    // fontSize: 40,
    // fontWeight: 'bold',
    // color: '#fff',
  },
  withdrawalBg: {
    backgroundColor: '#DC3545',
    color: '#fff',
  },
  depositBg: {
    backgroundColor: '#34C759',
    color: '#fff',
  },
  withdrawal: {
    color: '#DC3545',
  },
  deposit: {
    color: '#34C759',
  },
  voiceButton: {
    // marginTop: 20,
    marginBottom: 32,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'center', 
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center'
  },




  // historyContainer: {
  //   width: '100%',
  //   height: '100%',
  //   justifyContent: 'center',
  //   flex: 1,
  //   // padding: 20,
  //   paddingHorizontal: 10,
  //   paddingVertical: 10,
  // },
  // historyDateContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   // justifyContent: 'space-between',
  //   alignItems: 'baseline',
  //   gap: 10,
  //   marginBottom: 20,
  // },
  // historyDate: {
  //   fontSize: 30,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyTime: {
  //   fontSize: 25,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyTypeContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 20,
  // },
  // historyTypeTitle: {
  //   fontSize: 25,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  //   alignSelf: 'flex-end',
  // },
  // historyType: {
  //   fontSize: 30,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyWhereContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 20,
  // },
  // historyWhereTitle: {
  //   fontSize: 25,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyWhere: {
  //   fontSize: 35,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  //   marginBottom: 20,
  // },
  // historyAccountContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'flex-end',
  //   marginBottom: 20,
  // },
  // historyAccountTitle: {
  //   fontSize: 25,
  //   fontWeight: 'bold',
  //   // alignSelf: 'flex-start',
  //   color: '#24282B',
  // },
  // historyAccount: {
  //   fontSize: 25,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyBalance: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'flex-end',
  //   marginBottom: 20,
  // },
  // historyBalanceTitle: {
  //   fontSize: 25,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyBalanceAmount: {
  //   fontSize: 30,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // historyAmountContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   // alignItems: 'center',
  //   marginBottom: 20,
  // },
  // historyAmount: {
  //   fontSize: 30,
  //   fontWeight: 'bold',
  //   color: '#24282B',
  // },
  // plusAmount: {
  //   color: '#B6010E',
  // },
  // minusAmount: {
  //   color: '#373DCC',
  // },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

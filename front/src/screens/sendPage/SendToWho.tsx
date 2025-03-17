import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BackButton from '../../components/BackButton'; // 재사용 버튼 컴포넌트
import SendAccountBox from './SendAccountBox';

const accountData = [
  {
    name: '박수연',
    date: '2025년 03월 11일',
    accountBank: '신한',
    accountNumber: '110-262-000720',
  },
  {
    name: '김민수',
    date: '2025년 02월 05일',
    accountBank: '국민',
    accountNumber: '123-456-789012',
  },
  {
    name: '이영희',
    date: '2025년 01월 20일',
    accountBank: '우리',
    accountNumber: '987-654-321098',
  },
];

const SendScreen = ({navigation}: {navigation: any}) => {
  // const renderItem = ({item}: {item: any}) => (
  //   <SendAccountBox
  //     name={item.name}
  //     date={item.date}
  //     accountBank={item.accountBank}
  //     accountNumber={item.accountNumber}
  //   />
  // );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>누구에게 보낼까요?</Text>

      {/* 자주 보내는 계좌 */}
      <View style={styles.favoriteContainer}>
        <Text style={styles.star}>⭐</Text>
        <Text style={styles.favoriteText}>자주 보낸 계좌</Text>
      </View>

      {/* 계좌 정보 */}
      {/* <View style={styles.accountBox}>
        <View>
          <Text style={styles.accountName}>박수연</Text>
          <Text style={styles.date}>2025년 03월 11일</Text>
        </View>
        <View>
          <Text style={styles.bank}>신한</Text>
          <Text style={styles.accountNumber}>110-262-000720</Text>
        </View>
      </View> */}
      <SendAccountBox
        name={accountData[0].name}
        date={accountData[0].date}
        accountBank={accountData[0].accountBank}
        accountNumber={accountData[0].accountNumber}
      />

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton
          text="직접 입력"
          onPress={() => console.log('직접 입력')}
          style={{
            backgroundColor: '#373DCC',
            width: '100%',
            height: 70,
            marginTop: 10,
            marginBottom: 5,
          }}
          textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
        />
        <BackButton
          text="이전으로"
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: '#B6010E',
            width: '100%',
            height: 70,
            marginTop: 10,
            marginBottom: 5,
          }}
          textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  star: {
    fontSize: 24,
    color: 'blue',
    marginRight: 5,
  },
  favoriteText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default SendScreen;

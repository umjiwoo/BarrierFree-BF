import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BackButton from '../../components/BackButton'; // 재사용 버튼 컴포넌트
import SendAccountBox from './SendAccountBox';
import Title from '../../components/Title';

const SendToWho = ({navigation}: {navigation: any}) => {
  const accountData = [
    {
      name: '홍길동',
      date: '2023-04-01',
      accountBank: '신한은행',
      accountNumber: '110-123-456789',
    },
    {
      name: '김철수',
      date: '2023-04-02',
      accountBank: '국민은행',
      accountNumber: '123-45-678910',
    },
    {
      name: '이영희',
      date: '2023-04-03',
      accountBank: '우리은행',
      accountNumber: '111-222-333444',
    },
    // 필요에 따라 더 많은 계정을 추가할 수 있습니다
  ];

  const handleSelectAccount = (account: any) => {
    // 계좌 선택 시 처리할 로직
    // 계좌 선택 시 계좌 정보를 전달하고 저장하는 로직
    navigation.navigate('ReceivingAccountScreen', {selectedAccount: account});
    console.log('Selected account:', account);
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>누구에게 보낼까요?</Text> */}
      <Title title="누구에게 보낼까요?" />

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
        accountData={accountData}
        onSelectAccount={handleSelectAccount}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 50,
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

export default SendToWho;

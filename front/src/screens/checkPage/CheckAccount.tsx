import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import Title from '../../components/Title';
import CheckAccountBox from './CheckAccountBox';
import BackButton from '../../components/BackButton';

const SendFromWhere = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const accounts = [
    {
      accountBank: '신한',
      accountNumber: '110-262-000720',
      balance: '7000000',
    },
    {
      accountBank: '국민',
      accountNumber: '110-262-000720',
      balance: '7000000',
    },
  ];

  const handleSelectAccount = (account: any) => {
    // 계좌 선택 시 처리할 로직
    // 계좌 선택 시 계좌 정보를 전달하고 저장하는 로직
    navigation.navigate('CheckHistory', {selectedAccount: account});
    console.log('Selected account:', account);
  };

  return (
    <View style={styles.container}>
      <Title title="계좌 조회" />
      <CheckAccountBox
        accountData={accounts}
        onSelectAccount={handleSelectAccount}
      />

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
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

export default SendFromWhere;

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
});

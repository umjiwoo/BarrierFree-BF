import {View, StyleSheet} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
import React from 'react';
import Title from '../../components/Title';
import SendAccountBox from './SendAccountBox';
import BackButton from '../../components/BackButton';
import useTab from '../../components/vibration/useTab';

const SendFromWhere = ({navigation}: {navigation: any}) => {
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

  const useTap = useTab();

  const handleSelectAccount = (account: any) => {
    // 계좌 선택 시 처리할 로직
    // 계좌 선택 시 계좌 정보를 전달하고 저장하는 로직
    useTap.handlePress(() =>
      navigation.navigate('SendToWho', {selectedAccount: account}),
    );
    console.log('Selected account:', account);
  };

  const handleDirectInput = () => {
    useTap.handlePress(() =>
      navigation.navigate('SendInputPage', {type: 'directMyAccount'}),
    );
    console.log('직접 입력 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <Title title="어느 계좌에서 보낼까요?" />
      <SendAccountBox
        accountData={accounts}
        onSelectAccount={handleSelectAccount}
      />

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton text="직접 입력" onPress={handleDirectInput} type="input" />
        <BackButton
          text="이전으로"
          onPress={() => useTap.handlePress(() => navigation.goBack())}
          type="back"
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

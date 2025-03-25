import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import Title from '../../components/Title';
import CheckAccountBox from './CheckAccountBox';
import BackButton from '../../components/BackButton';
import {
  AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';

const SendFromWhere = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const accounts: AccountItemProps[] = [
    {
      accountBank: '신한',
      accountNumber: '110-262-000720',
      balance: 7000000,
    },
    {
      accountBank: '국민',
      accountNumber: '110-262-000720',
      balance: 7000000,
    },
  ];

  const handleSelectAccount = (item: AccountItemProps | HistoryItemProps) => {
    // 계좌 선택 시 처리할 로직
    // 계좌 선택 시 계좌 정보를 전달하고 저장하는 로직
    navigation.navigate('CheckHistory', {
      selectedAccount: item,
    });
    console.log('Selected account:', item);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title title="계좌 조회" />
        {/* <Image
          source={require('../../assets/home.png')}
          style={styles.checkAccountImage}
        /> */}
      </View>
      <CheckAccountBox
        data={accounts}
        type="account"
        onSelect={handleSelectAccount}
      />

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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'space-around',
  },
  checkAccountImage: {
    width: 40,
    height: 40,
  },
});

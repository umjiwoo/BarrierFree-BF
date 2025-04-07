import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import Title from '../../components/utils/Title';
import BackButton from '../../components/utils/BackButton';
import {AccountItemProps} from '../../components/types/CheckAccount';
import {getAccounts} from '../../api/axiosAccount';
import MyAccountDetail from './MyAccountDetail';

const MyAccount = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [accounts, setAccounts] = useState<AccountItemProps[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await getAccounts();
      if (!data) {
        console.log('계좌 조회 실패');
      } else {
        setAccounts(data);
      }
    };
    fetchAccounts();
  }, []);

  // const handleCreateAccount = () => {
  //   navigation.navigate('CreateAccount');
  // };

  console.log('accounts', accounts);
  console.log('accounts.length', accounts.length);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title title="내 계좌 조회" />
      </View>
      <MyAccountDetail data={accounts[0]} length={accounts.length} />
      {/* {accounts.length > 0 ? (
        <CheckAccountBox
          data={accounts}
          type="account"
          onSelect={handleSelectAccount}
        />
      ) : (
        <CheckAccountBox
          data={accounts}
          type="null"
          onSelect={handleCreateAccount}
        />
      )} */}

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

export default MyAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
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

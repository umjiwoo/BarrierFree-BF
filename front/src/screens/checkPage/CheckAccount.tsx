import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import CheckAccountBox from './CheckAccountBox';
import {AccountItemProps} from '../../components/types/CheckAccount';
import {getAccounts} from '../../api/axiosAccount';

const CheckAccount = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [accounts, setAccounts] = useState<AccountItemProps[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await getAccounts();
      if (!data) {
        console.log('계좌 조회 실패');
      } else {
        setAccounts(data);
        if (data.length > 0) {
          navigation.navigate('CheckHistory', {
            selectedAccount: data[0],
            id: data[0].id,
          });
        }
      }
    };
    fetchAccounts();
  }, [navigation]);

  const handleCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };

  console.log('accounts', accounts);
  console.log('accounts.length', accounts.length);

  return (
    <View style={styles.container}>
      {accounts.length > 0 ? null : (
        <CheckAccountBox
          // data={accounts}
          type="createAccount"
          onSelect={handleCreateAccount}
        />
      )}
    </View>
  );
};

export default CheckAccount;

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

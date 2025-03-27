import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import Title from '../../components/Title';
import CheckAccountBox from './CheckAccountBox';
import BackButton from '../../components/BackButton';
import {
  AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';
// import {getAccounts} from '../../api/axios';
import useTab from '../../components/vibration/useTab';

const SendFromWhere = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  // const [accounts, setAccounts] = useState<AccountItemProps[]>([]);

  // useEffect(() => {
  //   const fetchAccounts = async () => {
  //     const data = await getAccounts();
  //     setAccounts(data);
  //   };
  //   fetchAccounts();
  // }, []);

  const accounts: AccountItemProps[] = [
    {
      accountNo: '110-262-000720',
      accountBalance: 7000000,
      accountState: 'active',
      bankId: 1,
      createdAt: '2021-01-01',
      dailyTransferLimit: 1000000,
      failedAttempts: 0,
      id: 1,
      oneTimeTransferLimit: 1000000,
      updatedAt: '2021-01-01',
    },
    {
      accountNo: '110-123-456789',
      accountBalance: 100000,
      accountState: 'active',
      bankId: 1,
      createdAt: '2021-01-01',
      dailyTransferLimit: 1000000,
      failedAttempts: 0,
      id: 1,
      oneTimeTransferLimit: 1000000,
      updatedAt: '2025-03-26',
    },
  ];

  const useTap = useTab();

  const handleSelectAccount = (item: AccountItemProps | HistoryItemProps) => {
    useTap.handlePress(() =>
      navigation.navigate('CheckHistory', {
        selectedAccount: item,
        id: item.id,
      }),
    );
  };
  // const handleSelectAccount = (item: AccountItemProps | HistoryItemProps) => {
  //   navigation.navigate('CheckHistory', {
  //     selectedAccount: item,
  //     id: item.id,
  //   });
  //   console.log('Selected account:', item);
  // };

  console.log(accounts);
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title title="계좌 조회" />
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

import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAccountStore} from '../../stores/accountStore';
import {getAccounts} from '../../api/axiosAccount';
const Main = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {selectedAccount, setSelectedAccount} = useAccountStore();

  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await getAccounts();
      console.log('response', response[0]);
      setSelectedAccount(response[0]);
    };
    fetchAccounts();
  }, [setSelectedAccount]);

  useEffect(() => {
    console.log('selectedAccount', selectedAccount);
  }, [selectedAccount]);

  const handleCheckHistoryPress = async () => {
    if (!selectedAccount) {
      console.log('계좌 생성 필요');
      navigation.navigate('CheckAccount');
    } else {
      navigation.navigate('CheckHistory');
    }
  };

  const handleMyPagePress = () => {
    navigation.navigate('MyAccount');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCheckHistoryPress}>
          <Text style={styles.text}>조회</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SendFromWhere')}>
          <Text style={styles.text}>송금</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.text}>결제</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleMyPagePress}>
          <Text style={styles.text}>마이 페이지</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  grid: {
    // flex: 1,
    width: '100%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%', // 2x2 그리드 배치
    height: '50%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Main;

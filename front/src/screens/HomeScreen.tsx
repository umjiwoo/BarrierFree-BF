import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {loginUser} from '../api/axiosUser';
import {useUserStore} from '../stores/userStore';
import {useAccountStore} from '../stores/accountStore';
import {getAccounts} from '../api/axiosAccount';
// import {UserItemProps} from '../components/types/UserInfo';

const HomeScreen = ({navigation}: {navigation: any}) => {
  // const [user, setUser] = useState<UserItemProps>({} as UserItemProps);
  const {setUser} = useUserStore();
  const {setAccounts} = useAccountStore();
  const handleTestButtonPress = async () => {
    const data = await loginUser({
      phoneNumber: '01011111111',
      password: '1111',
    });
    console.log(data);
    setUser(data.body);

    const accountData = await getAccounts();
    console.log(accountData);
    setAccounts(accountData[0]);

    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTestButtonPress}>
          <Text style={styles.text}>test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('IDCardScreen')}>
          <Text style={styles.text}>신분증 인식</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%',
    height: 120,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 10,
  },
  idCardButton: {
    backgroundColor: '#e74c3c',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

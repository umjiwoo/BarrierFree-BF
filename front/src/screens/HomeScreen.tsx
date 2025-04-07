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

    navigation.navigate('CreateAccountScreen');
  };
  return (
    <View style={styles.container}>
      {/* <View style={styles.grid}> */}
      <TouchableOpacity
        style={styles.button}
        // navigation.navigate('~~') : ~~ 안에 test 버튼 누르면 이동하고 싶은 스크린 이름 적기
        onPress={handleTestButtonPress}>
        <Text style={styles.text}>시작하기</Text>
        <Text style={styles.touchText}>화면을 터치하세요!</Text>
      </TouchableOpacity>
      {/* </View> */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    width: '100%',
    height: '100%',
    gap: 30,
    // backgroundColor: '#7F35D4',
    borderWidth: 2,
    borderColor: '#7F35D4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: '#7F35D4',
    fontWeight: 'bold',
  },
  touchText: {
    fontSize: 35,
    color: '#7F35D4',
    fontWeight: 'bold',
  },
});

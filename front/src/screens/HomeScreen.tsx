import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, { useEffect } from 'react';
import {loginUser, sendFcmToken} from '../api/axiosUser';
import {useUserStore} from '../stores/userStore';
import {useAccountStore} from '../stores/accountStore';
import {getAccounts} from '../api/axiosAccount';
import { getFCMToken, foregroundMessageListener, backgroundMessageOpenedListener }from '../firebase/messaging';
// import {UserItemProps} from '../components/types/UserInfo';

const HomeScreen = ({navigation}: {navigation: any}) => {
  useEffect(() => {
    foregroundMessageListener(navigation);
    backgroundMessageOpenedListener(navigation);
  }, []);

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

    const fcmToken = await sendFcmToken({
      fcmToken: await getFCMToken(), 
      userId:data.body.id
    });

    console.log(fcmToken);

    const accountData = await getAccounts();
    console.log('계좌: ',accountData);
    setAccounts(accountData[0]);

    navigation.navigate('Main');
  };
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          // navigation.navigate('~~') : ~~ 안에 test 버튼 누르면 이동하고 싶은 스크린 이름 적기
          onPress={handleTestButtonPress}>
          <Text style={styles.text}>test</Text>
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
    height: '45%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

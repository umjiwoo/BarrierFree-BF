import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {loginUser, sendFcmToken} from '../api/axiosUser';
import {useUserStore} from '../stores/userStore';
import {useAccountStore} from '../stores/accountStore';
import {getAccounts} from '../api/axiosAccount';
import {
  getFCMToken,
  foregroundMessageListener,
  backgroundMessageOpenedListener,
} from '../firebase/messaging';
// import {UserItemProps} from '../components/types/UserInfo';
import { useTTSOnFocus } from '../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../components/utils/useTapNavigationHandler ';
import VolumeIcon from '../assets/icons/Volume.svg';

// type HomeScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'HomeScreen'
// >;

// const HomeScreen = () => {
const HomeScreen = ({navigation}: {navigation: any}) => {

  useTTSOnFocus(`
      안녕하세요. Barrier Free입니다.
      한 번 탭하면 화면의 내용을 읽어드리고,
      두 번 연속 탭하면 선택이 됩니다.
      시작하려면 화면을 두 번 터치해주세요.
    `)

  // const [user, setUser] = useState<UserItemProps>({} as UserItemProps);
  const {setUser} = useUserStore();
  const {setAccounts} = useAccountStore();
  const handleDefaultPress = useTapNavigationHandler();

  const handleTestButtonPress = async () => {
    const data = await loginUser({
      phoneNumber: '01011111111',
      password: '1111',
    });
    console.log(data);

    // setUser(data.body);
    // const fcmToken = await sendFcmToken({
    //   fcmToken: await getFCMToken(),
    //   userId: data.body.id,
    // });

    const token = await getFCMToken(); // FCM 토큰 발급
    
    setUser({
      ...data.body,
      fcmToken: token,
    });

    const fcmToken = await sendFcmToken({
      fcmToken: token,
      userId: data.body.id,
    });

    console.log(fcmToken);

    const accountData = await getAccounts();
    console.log('계좌: ', accountData);
    setAccounts(accountData[0]);

    navigation.navigate('CreateAccountScreen');
  };

  return (
    
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        // navigation.navigate('~~') : ~~ 안에 test 버튼 누르면 이동하고 싶은 스크린 이름 적기
        onPress={() => handleDefaultPress('화면을 두 번 터치해서 시작하세요', undefined, handleTestButtonPress)}>
      {/* <BarrierFree width={350} height={100} title="메인페이지" /> */}
      <Text style={styles.welcome}>시작하기</Text>
      <Text style={styles.subWelcome}>화면을 두 번 터치하세요!</Text>
      <View style={styles.voiceButton}>
        <VolumeIcon width={30} height={30} />
        <Text style={styles.voiceButtonText}>음성 안내 듣기</Text>
      </View>
      </TouchableOpacity>
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
    backgroundColor: 'black',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    // gap: 30,
    // backgroundColor: '#7F35D4',
    // borderWidth: 2,
    // borderColor: '#7F35D4',
    // borderRadius: 10,
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
  welcome: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subWelcome: {
    color: '#ccc',
    fontSize: 35,
    textAlign: 'center',
    marginTop: 8,
  },
  voiceButton: {
    marginTop: 100,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center'
  },
});

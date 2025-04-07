import React from 'react';
import {StyleSheet, SafeAreaView, View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import {useUserStore} from '../../stores/userStore';
import {useAccountStore} from '../../stores/accountStore';
import {getAccounts} from '../../api/axiosAccount';
import BarrierFree from '../../assets/BarrierFree.svg';
// import {Image, View} from 'react-native-reanimated/lib/typescript/Animated';

const Main = () => {
  const {user} = useUserStore();
  const {accounts} = useAccountStore();
  console.log(user);
  console.log(accounts);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleUpperLeftTextPress = async () => {
    const data = await getAccounts();
    console.log(data);

    navigation.navigate('CheckHistory');
  };

  const handleUpperRightTextPress = () => {
    navigation.navigate('SendMain');
  };

  const handleLowerLeftTextPress = () => {
    // navigation.navigate('Payment');
  };

  const handleLowerRightTextPress = () => {
    // navigation.navigate('Setting');
  };

  return (
    <SafeAreaView style={styles.container}>
      <DefaultPage
        UpperLeftText="조회"
        UpperRightText="송금"
        LowerLeftText="결제"
        LowerRightText="설정"
        MainText={
          <View style={styles.mainTextContainer}>
            <BarrierFree width={350} height={100} title="메인페이지" />
            <Text style={styles.userName}>{user.username} 님, 환영합니다.</Text>
          </View>
        }
        // MainText="메인 텍스트 들어갈 자리"
        onUpperLeftTextPress={handleUpperLeftTextPress}
        onUpperRightTextPress={handleUpperRightTextPress}
        onLowerLeftTextPress={handleLowerLeftTextPress}
        onLowerRightTextPress={handleLowerRightTextPress}
      />
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
  mainTextContainer: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 40,
    color: '#7F35D4',
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default Main;

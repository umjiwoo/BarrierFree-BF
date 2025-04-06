import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/DefaultPage';
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
      {/* <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CheckAccount')}>
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.text}>마이 페이지</Text>
        </TouchableOpacity>
      </View> */}
      <DefaultPage
        UpperLeftText="조회"
        UpperRightText="송금"
        LowerLeftText="결제"
        LowerRightText="설정"
        MainText={
          <View>
            <BarrierFree width={350} height={400} title="메인페이지" />
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

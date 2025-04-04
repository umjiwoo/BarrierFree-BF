import React from 'react';
import {View, StyleSheet} from 'react-native';
import DefaultPage from '../../components/DefaultPage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const SendMain = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleDirectInput = () => {
    navigation.navigate('SendInputPage', {type: 'directOtherAccount'});
    console.log('직접 입력 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText="이전으로"
        UpperRightText="홈"
        LowerLeftText="직접 입력"
        LowerRightText="자주 보낸 계좌"
        MainText="송금 페이지 텍스트 들어갈 자리"
        onUpperLeftTextPress={() => navigation.goBack()}
        onUpperRightTextPress={() => navigation.navigate('Main')}
        onLowerLeftTextPress={handleDirectInput}
        onLowerRightTextPress={() => navigation.navigate('SendFavoriteAccount')}
      />
    </View>
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
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  star: {
    fontSize: 24,
    color: 'blue',
    marginRight: 5,
  },
  favoriteText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default SendMain;

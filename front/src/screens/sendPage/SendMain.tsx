import React from 'react';
import {View, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';

const SendMain = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleDirectInput = () => {
    navigation.navigate('SendInputPage', {type: 'directOtherAccount'});
    console.log('직접 입력 버튼 클릭');
  };

  const handleRecentAccount = () => {
    navigation.navigate('SendRecentAccount');
    console.log('최근 보낸 계좌 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="직접 입력"
        LowerRightText="최근 보낸 계좌"
        MainText="송금하실 계좌를 선택해주세요."
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handleDirectInput}
        onLowerRightTextPress={handleRecentAccount}
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

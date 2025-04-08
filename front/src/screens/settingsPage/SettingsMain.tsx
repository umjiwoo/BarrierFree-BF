import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';
import Home from '../../assets/Home.svg';
import {useHandlePress} from '../../components/utils/handlePress';

const SettingMain = () => {
  // const navigation =
  //   useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {handlePressBack, handlePressHome} = useHandlePress();

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeft />}
        UpperRightText={<Home />}
        LowerLeftText={<ArrowLeft />}
        LowerRightText={<ArrowRight />}
        MainText={<Text>설정 메인페이지 입니다.</Text>}
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
        onLowerRightTextPress={handlePressHome}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default SettingMain;

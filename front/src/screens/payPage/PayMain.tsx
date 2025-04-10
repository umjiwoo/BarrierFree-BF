import React from 'react';
import {View, StyleSheet} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeft from '../../assets/icons/ArrowLeft.svg';
import ArrowRight from '../../assets/icons/ArrowRight.svg';
import Home from '../../assets/icons/Home.svg';
import {useHandlePress} from '../../components/utils/handlePress';
import PaymentMainScreen from '../../components/qrPage/PaymentMainScreen';

const PayMain = () => {
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
        MainText={<PaymentMainScreen />}
        // MainText={<Text>결제 메인페이지 입니다.</Text>}
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

export default PayMain;

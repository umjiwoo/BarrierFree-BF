import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeft from '../../assets/icons/ArrowLeft.svg';
import ArrowRight from '../../assets/icons/ArrowRight.svg';
import Home from '../../assets/icons/Home.svg';
import {useHandlePress} from '../../components/utils/handlePress';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';

const PayMain = () => {
  // const navigation =
  //   useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useTTSOnFocus(`
      결제 페이지입니다.
      QR를 스캔하여 송금할 계좌와 금액을 입력해주세요.
    `)
  
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeft />}
        UpperRightText={<Home />}
        LowerLeftText={<ArrowLeft />}
        LowerRightText={<ArrowRight />}
        MainText={<Text>결제 메인페이지 입니다.</Text>}
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={undefined}
        onLowerRightTextPress={undefined}
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

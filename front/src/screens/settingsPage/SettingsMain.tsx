import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage2';
import ArrowLeft from '../../assets/icons/ArrowLeft.svg';
import ArrowRight from '../../assets/icons/ArrowRight.svg';
import Home from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useHandlePress} from '../../components/utils/handlePress';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';

const SettingMain = () => {
  // const navigation =
  //   useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();

  return (
    <View style={styles.container}>
      <DefaultPage
      UpperLeftText={
        <View style={styles.textContainer}>
          <ArrowLeft width={100} height={100} />
          <Text style={styles.text}>이전</Text>
        </View>
      }
      UpperRightText={
        <View style={styles.textContainer}>
          <Home width={100} height={100} />
          <Text style={styles.text}>메인</Text>
        </View>
      }
      LowerLeftText={
        <View style={styles.textContainer}>
          <CancelIcon width={100} height={100} />
          <Text style={styles.text}>취소</Text>
        </View>
      }
      LowerRightText={
        <View style={styles.textContainer}>
          <CheckIcon width={100} height={100} />
          <Text style={styles.text}>확인</Text>
        </View>
      }
        MainText={<Text>설정 메인페이지 입니다.</Text>}
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
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SettingMain;

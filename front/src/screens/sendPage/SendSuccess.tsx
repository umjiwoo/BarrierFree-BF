import {View, Text, StyleSheet, NativeModules} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DefaultPage from '../../components/utils/DefaultPage';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';
import DrawIcon from '../../assets/icons/Draw.svg';

const {CustomVibration} = NativeModules;

const SendSuccess = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();

  const handleCheckHistory = () => {
    navigation.navigate('CheckHistory');
  };

  useTTSOnFocus(`
    송금이 완료 되었습니다.
    내역을 확인하시려면 왼쪽 아래를, 메인 화면으로 돌아가시려면 오른쪽 아래를 눌러주세요.
  `);

    useEffect(() => {
      CustomVibration.vibrateCustomSequence("success"); 
    }, []);

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
            <ArrowLeftIcon width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        UpperRightText={
          <View style={styles.textContainer}>
            <HomeIcon width={100} height={100} />
            <Text style={styles.text}>메인</Text>
          </View>
        }
        LowerLeftText={
          <View style={styles.textContainer}>
            <DrawIcon width={100} height={100} />
            <Text style={styles.text}>내역</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <CheckIcon width={100} height={100} />
            <Text style={styles.text}>확인</Text>
          </View>
        }
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>이체가 완료되었습니다.</Text>
            <CheckIcon style={styles.checkCircle} />
          </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={() => handleDefaultPress('내역 조회', undefined, handleCheckHistory)}
        onLowerRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
      />
    </View>
  );
};

export default SendSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  titleTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
  },
  titleText: {
    fontSize: 40,
    fontWeight: '800',
  },
  checkCircle: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    color: '#7F35D4',
  },
  mainText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  mainTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
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

import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import DrawIcon from '../../assets/icons/Draw.svg';
import RecentIcon from '../../assets/icons/Recent.svg';
import VolumeIcon from '../../assets/icons/Volume.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';

const SendMain = () => {
  useTTSOnFocus(`
    송금 화면입니다.
    계좌 번호를 직접 입력하려면 왼쪽 아래,
    최근 계좌를 선택하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();

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
            <Text style={styles.text}>입력</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <RecentIcon width={100} height={100} />
            <Text style={styles.text}>최근 계좌</Text>
          </View>
        }
        MainText={
          <View style={styles.welcomeBox}>
            <View style={styles.voiceButton}>
              <VolumeIcon width={30} height={30} />
              <Text style={styles.voiceButtonText}>송금 하기</Text>
            </View>
            <Text style={styles.welcome}>송금할 계좌를{"\n"} 입력해주세요.</Text>
            {/* <Text style={styles.subWelcome}>Barrier Free 금융을{"\n"} 시작합니다.</Text> */}
          </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={() => handleDefaultPress('직접 입력', undefined, handleDirectInput)}
        onLowerRightTextPress={() => handleDefaultPress('최근 보낸 계좌', undefined, handleRecentAccount)}
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
  welcomeBox: {
    alignItems: 'center',
    marginVertical: 32,
  },
  welcome: {
    color: '#fff',
    fontSize: 55,
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
    marginBottom: 20,
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

export default SendMain;

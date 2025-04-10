import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  NativeModules,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import {useUserStore} from '../../stores/userStore';
import {useAccountStore} from '../../stores/accountStore';
import {getAccounts} from '../../api/axiosAccount';
import BarrierFree from '../../assets/icons/BarrierFree.svg';
import ChargeIcon from '../../assets/icons/QR.svg';
import SettingIcon from '../../assets/icons/Settings2.svg';
import HistoryIcon from '../../assets/icons/History2.svg';
import SendIcon from '../../assets/icons/Send2.svg';
import VolumeIcon from '../../assets/icons/Volume.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';
import { center } from '@shopify/react-native-skia';

const Main = () => {
  useTTSOnFocus(`
    메인 화면입니다.
    계좌 조회를 원하시면 왼쪽 위,
    송금을 원하시면 오른쪽 위,
    결제를 원하시면 왼쪽 아래,
    설정을 원하시면 오른쪽 아래를 눌러주세요.
  `);

  const {user} = useUserStore();
  const {accounts} = useAccountStore();
  const {CustomVibration} = NativeModules;
  const [lastTap, setLastTap] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  console.log(user);
  console.log(accounts);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDefaultPress = useTapNavigationHandler();
  // const handleDefaultPress = async (
  //   page: 'CheckHistory' | 'SendMain' | 'PayMain' | 'SettingsMain',
  // ) => {
  //   const now = Date.now();
  //   const DOUBLE_TAP_DELAY = 300;

  //   if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
  //     // 더블 탭
  //     if (tapTimeout.current) {
  //       clearTimeout(tapTimeout.current);
  //     }
  //     CustomVibration.vibrateCustomSequence('double_tick');
  //     const data = await getAccounts();
  //     console.log(data);
  //     navigation.navigate(page);
  //   } else {
  //     // 싱글 탭
  //     CustomVibration.vibrateCustomSequence('tick');
  //     tapTimeout.current = setTimeout(() => {
  //       setLastTap(0);
  //     }, DOUBLE_TAP_DELAY);
  //   }
  //   setLastTap(now);
  // };

  return (
    <SafeAreaView style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
          <ChargeIcon width={100} height={100} />
          <Text style={styles.text}>결제</Text>
        </View>
        }
        // UpperLeftText="조회"
        UpperRightText={
          <View style={styles.textContainer}>
            <SettingIcon width={100} height={100} />
            <Text style={styles.text}>설정</Text>
          </View>
        }
        // UpperRightText="송금"
        LowerLeftText={
          <View style={styles.textContainer}>
            <HistoryIcon width={100} height={100} />
            <Text style={styles.text}>조회</Text>
          </View>
        }
        // LowerLeftText="결제"
        LowerRightText={
          <View style={styles.textContainer}>
            <SendIcon width={100} height={100} />
            <Text style={styles.text}>송금</Text>
          </View>
        }
        // LowerRightText="설정"
        MainText={
          <View style={styles.welcomeBox}>
            <View style={styles.voiceButton}>
              <VolumeIcon width={30} height={30} />
              <Text style={styles.voiceButtonText}>음성 안내 듣기</Text>
            </View>
            <Text style={styles.welcome}>{user.username} 님,{"\n"} 환영합니다.</Text>
            <Text style={styles.subWelcome}>Barrier Free 금융을{"\n"} 시작합니다.</Text>
            {/* <BarrierFree width={350} height={100} title="메인페이지" /> */}
          </View>
        }
        // MainText="메인 텍스트 들어갈 자리"
        onUpperLeftTextPress={() => handleDefaultPress('결제',['PayMain'])}
        onUpperRightTextPress={() => handleDefaultPress('설정',['SettingsMain'])}
        onLowerLeftTextPress={() => handleDefaultPress('조회', ['CheckHistory'])}
        onLowerRightTextPress={() => handleDefaultPress('송금',['SendMain'])}
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 20,
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
    fontSize: 60,
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

export default Main;

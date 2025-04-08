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
import ChargeIcon from '../../assets/icons/Charge.svg';
import SettingIcon from '../../assets/icons/Settings.svg';
import HistoryIcon from '../../assets/icons/History.svg';
import SendIcon from '../../assets/icons/Send.svg';

const Main = () => {
  const {user} = useUserStore();
  const {accounts} = useAccountStore();
  const {CustomVibration} = NativeModules;
  const [lastTap, setLastTap] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  console.log(user);
  console.log(accounts);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDefaultPress = async (
    page: 'CheckHistory' | 'SendMain' | 'PayMain' | 'SettingsMain',
  ) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // 더블 탭
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      CustomVibration.vibrateCustomSequence('double_tick');
      const data = await getAccounts();
      console.log(data);
      navigation.navigate(page);
    } else {
      // 싱글 탭
      CustomVibration.vibrateCustomSequence('tick');
      tapTimeout.current = setTimeout(() => {
        setLastTap(0);
      }, DOUBLE_TAP_DELAY);
    }
    setLastTap(now);
  };

  return (
    <SafeAreaView style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
            <HistoryIcon width={110} height={110} />
            <Text style={styles.text}>조회</Text>
          </View>
        }
        // UpperLeftText="조회"
        UpperRightText={
          <View style={styles.textContainer}>
            <SendIcon width={150} height={110} />
            <Text style={styles.text}>송금</Text>
          </View>
        }
        // UpperRightText="송금"
        LowerLeftText={
          <View style={styles.textContainer}>
            <ChargeIcon width={110} height={110} />
            <Text style={styles.text}>결제</Text>
          </View>
        }
        // LowerLeftText="결제"
        LowerRightText={
          <View style={styles.textContainer}>
            <SettingIcon width={110} height={110} />
            <Text style={styles.text}>설정</Text>
          </View>
        }
        // LowerRightText="설정"
        MainText={
          <View style={styles.mainTextContainer}>
            <BarrierFree width={350} height={100} title="메인페이지" />
            <Text style={styles.userName}>{user.username} 님, 환영합니다.</Text>
          </View>
        }
        // MainText="메인 텍스트 들어갈 자리"
        onUpperLeftTextPress={() => handleDefaultPress('CheckHistory')}
        // onUpperLeftTextPress={handleUpperLeftTextPress}
        onUpperRightTextPress={() => handleDefaultPress('SendMain')}
        // onUpperRightTextPress={handleUpperRightTextPress}
        onLowerLeftTextPress={() => handleDefaultPress('PayMain')}
        onLowerRightTextPress={() => handleDefaultPress('SettingsMain')}
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
    color: '#7F35D4',
    fontWeight: 'bold',
    marginTop: 20,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 35,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Main;

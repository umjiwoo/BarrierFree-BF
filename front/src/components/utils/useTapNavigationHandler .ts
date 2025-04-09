import { useRef } from 'react';
import { NativeModules } from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { playTTS } from './tts';

const DOUBLE_TAP_DELAY = 300;
const {CustomVibration} = NativeModules;

export const useTapNavigationHandler = () => {
  const lastTapRef = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // const handlePress = async (doubleTap: string, page: string, singleTap: string, message: string) => {
  const handlePress = async (
    // doubleTap: string = 'double_tick',
    // singleTap: string = 'tick',
    message: string,
    page?: keyof RootStackParamList,
  ) => {
    const now = Date.now();

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      CustomVibration.vibrateCustomSequence('double_tick');  // 진동 (ex. 'double_tick')
      // CustomVibration.vibrateCustomSequence(doubleTap);  // 진동 (ex. 'double_tick')
      if (page) {
        navigation.navigate(page as never); // 페이지 이동 (타입 안전성에 따라 조정)
      }
    } else {
      CustomVibration.vibrateCustomSequence('tick');  // 진동 (ex. 'tick')
      // CustomVibration.vibrateCustomSequence(singleTap);  // 진동 (ex. 'tick')
      if (message) {
        playTTS(message);  // 메세지 출력
      }
      tapTimeout.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, DOUBLE_TAP_DELAY);
    }

    lastTapRef.current = now;
  };

  return handlePress;
};

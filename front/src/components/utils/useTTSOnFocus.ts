import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { playTTS, stopTTS } from './tts'; // 경로는 실제 위치에 맞게 수정

export const useTTSOnFocus = (message: string) => {
  useFocusEffect(
    useCallback(() => {
      playTTS(message);
      return () => {
        stopTTS();
      };
    }, [message])
  );
};

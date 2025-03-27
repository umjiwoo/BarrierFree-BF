import {ButtonDoubleTabVibrationPress} from './buttonVibrationPress';

import {useState} from 'react';
import {ButtonTabVibrationPress} from './buttonVibrationPress';

const useTab = () => {
  const [lastTap, setLastTap] = useState<number>(0);

  const handlePress = (navigateFn?: () => void) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 250;

    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      // 더블 탭: 진동과 화면 전환
      if (navigateFn) {
        navigateFn();
      }
      setTimeout(() => {
        ButtonDoubleTabVibrationPress();
      }, DOUBLE_PRESS_DELAY);
    } else {
      // 싱글 탭: 진동만
      setTimeout(() => {
        ButtonTabVibrationPress();
      }, DOUBLE_PRESS_DELAY);
    }
    setLastTap(now);
  };

  return {handlePress};
};

export default useTab;

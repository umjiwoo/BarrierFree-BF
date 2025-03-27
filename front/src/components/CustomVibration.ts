import {NativeModules} from 'react-native';

const {CustomVibration} = NativeModules;

export default {
  vibrateWithAmplitude: (duration: number, amplitude: number) => {
    CustomVibration.vibrateWithAmplitude(duration, amplitude);
  },
};

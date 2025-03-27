import {NativeModules} from 'react-native';

const {CustomVibration} = NativeModules;

export default {
  vibrateWithAmplitude: (duration: number, amplitude: number) => {
    CustomVibration.vibrateWithAmplitude(duration, amplitude);
  },
  vibrateWithPattern: (pattern: number[], repeat: boolean = false) => {
    CustomVibration.vibrateWithPattern(pattern, repeat);
  },
  vibratePatternWithAmplitude: (
    pattern: number[],
    amplitudes: number[],
    repeat: boolean = false,
  ) => {
    CustomVibration.vibratePatternWithAmplitude(pattern, amplitudes, repeat);
  },
};

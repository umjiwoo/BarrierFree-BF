import CustomVibration from './customVibration';

// CustomVibration.vibrateWithAmplitude(100, 25); // 100ms 동안 25% 진동

// const pattern = [0, 100, 10, 100]; // [대기, 진동, 대기, 진동, ...] (ms 단위)

const timings = [0, 100, 50, 300]; // [대기, 진동, 대기, 진동, 대기, 진동, ...] (ms 단위)
const amplitudes = [0, 25, 0, 25]; // [진동 강도, 진동 강도, 진동 강도, ...] (0-255 범위)

const ButtonTabVibrationPress = () => {
  CustomVibration.vibrateWithAmplitude(100, 25);
};

const ButtonDoubleTabVibrationPress = () => {
  // CustomVibration.vibrateWithPattern(pattern, false);
  CustomVibration.vibratePatternWithAmplitude(timings, amplitudes, false);
};

const CarouselSwipeVibrationPress = () => {
  CustomVibration.vibrateWithAmplitude(150, 25);
};

export {
  ButtonTabVibrationPress,
  ButtonDoubleTabVibrationPress,
  CarouselSwipeVibrationPress,
};

import CustomVibration from '../CustomVibration';

// CustomVibration.vibrateWithAmplitude(200, 50); // 200ms 동안 50% 진동

const pattern = [0, 100, 30, 100]; // [대기, 진동, 대기, 진동, ...] (ms 단위)

// const timings = [0, 200, 200, 400, 200, 200]; // [대기, 진동, 대기, 진동, 대기, 진동, ...] (ms 단위)
// const amplitudes = [0, 50, 0, 255, 0, 100]; // [진동 강도, 진동 강도, 진동 강도, ...] (0-255 범위)

const ButtonTabVibrationPress = () => {
  CustomVibration.vibrateWithPattern(pattern, false);
};

const ButtonDoubleTabVibrationPress = () => {
  CustomVibration.vibrateWithPattern(pattern, false);
};

export {ButtonTabVibrationPress, ButtonDoubleTabVibrationPress};

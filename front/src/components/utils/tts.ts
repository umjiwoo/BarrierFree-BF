import Tts from 'react-native-tts';

// Function to initialize Text-to-Speech (TTS) settings and listeners
export const initializeTtsListeners = async () => {
  // Check the initialization status of the TTS engine
  Tts.getInitStatus().then(
    e => {},
    err => {
      // If there is no TTS engine installed, request to install one
      if (err.code === 'no_engine') {
        Tts.requestInstallEngine();
      }
    },
  );

  // 한국어 설정
  Tts.setDefaultLanguage('ko-KR');

  // Set the default speaking rate. Lower values are slower, and higher values are faster
  Tts.setDefaultRate(1.5, true);

  // Ignore the silent switch on the device, allowing TTS to play even if the device is set to silent
  Tts.setIgnoreSilentSwitch('ignore');

  // Set the default pitch. Lower values result in a lower pitch, and higher values in a higher pitch
  Tts.setDefaultPitch(0.7);

  // Set up listeners for various TTS events
  // Listener for when TTS starts speaking
  Tts.addEventListener('tts-start', event => {});

  // Listener for TTS progress (triggered repeatedly while speaking)
  Tts.addEventListener('tts-progress', event => {});

  // Listener for when TTS finishes speaking
  Tts.addEventListener('tts-finish', event => {});

  // Listener for when TTS is canceled
  Tts.addEventListener('tts-cancel', event => {});
};

// Function to play a message using TTS
export const playTTS = async (message: string) => {
  // Ensure TTS is initialized before speaking
  await Tts.getInitStatus().then(
    e => {},
    err => {
      // If there is no TTS engine installed, request to install one
      if (err.code === 'no_engine') {
        Tts.requestInstallEngine();
      }
    },
  );

  // Use TTS to speak the provided message
  await Tts.stop();
  Tts.speak(message);
};

// Function to stop a message
export const stopTTS = async () => {
  try {
    await Tts.getInitStatus();
    Tts.stop();
  } catch (err: any) {
    if (err.code === 'no_engine') {
    }
  }
};

export const cleanupTTS = () => {
  // 1. 모든 발화 중단
  Tts.stop();

  // 2. 모든 리스너 제거
  Tts.removeAllListeners('tts-start');
  Tts.removeAllListeners('tts-finish');
  Tts.removeAllListeners('tts-cancel');
  Tts.removeAllListeners('tts-progress');
};

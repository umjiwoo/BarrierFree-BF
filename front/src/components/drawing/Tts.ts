import Tts from 'react-native-tts';

// Function to initialize Text-to-Speech (TTS) settings and listeners
export const initializeTtsListeners = async () => {

  // Check the initialization status of the TTS engine
  Tts.getInitStatus().then(
   (e) => {
      console.log('ALL OK TTS ✅'); // TTS is initialized successfully
    },
    (err) => {
      // If there is no TTS engine installed, request to install one
      if (err.code === 'no_engine') {
        console.log('NO ENGINE TTS ✅');
        Tts.requestInstallEngine();
      }
    }
  );

  // The following commented-out code can be used to list available voices and set a default voice
  // const voices = await Tts.voices()
  // console.log(voices)
  // Tts.setDefaultVoice('com.apple.speech.synthesis.voice.Albert')

  // 한국어 설정
  Tts.setDefaultLanguage('ko-KR'); 

  // Set the default speaking rate. Lower values are slower, and higher values are faster
  Tts.setDefaultRate(2, true);

  // Ignore the silent switch on the device, allowing TTS to play even if the device is set to silent
  Tts.setIgnoreSilentSwitch('ignore');

  // Set the default pitch. Lower values result in a lower pitch, and higher values in a higher pitch
  Tts.setDefaultPitch(0.7);

  // Set up listeners for various TTS events
  // Listener for when TTS starts speaking
  Tts.addEventListener('tts-start', (event) => {
    console.log('TTS Started: ', event);
  });

  // Listener for TTS progress (triggered repeatedly while speaking)
  Tts.addEventListener('tts-progress', (event) => {
    // console.log('TTS progress: ', event) // Uncomment to log progress events
  });

  // Listener for when TTS finishes speaking
  Tts.addEventListener('tts-finish', (event) => {
    console.log('TTS finished: ', event);
  });

  // Listener for when TTS is canceled
  Tts.addEventListener('tts-cancel', (event) => {
    console.log('TTS Cancel: ', event);
  });
};

// Function to play a message using TTS
export const playTTS = async (message: string) => {
  // Ensure TTS is initialized before speaking
  Tts.getInitStatus().then(
    (e) => {
      console.log('ALL OK TTS ✅'); // TTS is initialized successfully
    },
    (err) => {
      // If there is no TTS engine installed, request to install one
      if (err.code === 'no_engine') {
        console.log('NO ENGINE TTS ✅');
        Tts.requestInstallEngine();
      }
    }
  );

  // Use TTS to speak the provided message
  Tts.speak(message);
};

export const cleanupTTS = () => {
  // 1. 모든 발화 중단
  Tts.stop();

  // 2. 모든 리스너 제거
  Tts.removeAllListeners('tts-start');
  Tts.removeAllListeners('tts-finish');
  Tts.removeAllListeners('tts-cancel');
  Tts.removeAllListeners('tts-progress');

  console.log('🧹 TTS 정리 완료 (stop + removeAllListeners)');
};
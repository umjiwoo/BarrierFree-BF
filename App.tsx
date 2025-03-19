import React, {useState, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
  TextInput,
} from 'react-native';
import TimerBasedDigitInput from './screens/TimerBasedDigitInput';
import DoubleTapDigitInput from './screens/DoubleTapDigitInput';

// 앱 메인 컴포넌트
function App(): React.JSX.Element {
  const [isTimerDigitInputVisible, setIsTimerDigitInputVisible] = useState<boolean>(false);
  const [isDoubleTapDigitInputVisible, setIsDoubleTapDigitInputVisible] = useState<boolean>(false);
  
  // 인식된 숫자 상태 추가 (문자열에서 배열로 변경)
  const [timerRecognizedDigits, setTimerRecognizedDigits] = useState<string[]>([]);
  const [doubleTapRecognizedDigits, setDoubleTapRecognizedDigits] = useState<string[]>([]);

  const openTimerDigitInput = useCallback(() => {
    setIsTimerDigitInputVisible(true);
  }, []);

  const closeTimerDigitInput = useCallback(() => {
    setIsTimerDigitInputVisible(false);
  }, []);
  
  const openDoubleTapDigitInput = useCallback(() => {
    setIsDoubleTapDigitInputVisible(true);
  }, []);

  const closeDoubleTapDigitInput = useCallback(() => {
    setIsDoubleTapDigitInputVisible(false);
  }, []);
  
  // 인식된 숫자를 받는 콜백 함수
  const handleTimerDigitRecognized = useCallback((digit: string) => {
    setTimerRecognizedDigits(prev => {
      // 최대 3글자까지만 추가
      if (prev.length < 3) {
        return [...prev, digit];
      }
      return prev;
    });
  }, []);
  
  // 더블탭 인식된 숫자를 받는 콜백 함수
  const handleDoubleTapDigitRecognized = useCallback((digit: string) => {
    setDoubleTapRecognizedDigits(prev => {
      // 최대 3글자까지만 추가
      if (prev.length < 3) {
        return [...prev, digit];
      }
      return prev;
    });
  }, []);
  
  // 타이머 인식 초기화 함수
  const resetTimerDigits = useCallback(() => {
    setTimerRecognizedDigits([]);
  }, []);
  
  // 더블탭 인식 초기화 함수
  const resetDoubleTapDigits = useCallback(() => {
    setDoubleTapRecognizedDigits([]);
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <SafeAreaView style={styles.container}>
        <View style={styles.mainContainer}>
          <Text style={styles.mainTitle}>숫자 인식 앱</Text>
          <Text style={styles.mainSubtitle}>
            원하는 입력 방식을 선택하세요
          </Text>
          
          {/* 시간 기반 인식 UI */}
          <View style={styles.recognitionSection}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>시간 기반 인식 결과:</Text>
              <View style={styles.digitGroup}>
                {[0, 1, 2].map((index) => (
                  <TextInput
                    key={index}
                    style={styles.digitInput}
                    value={timerRecognizedDigits[index] || ''}
                    editable={false}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => {
                resetTimerDigits();
                openTimerDigitInput();
              }}>
              <Text style={styles.mainButtonText}>시간 기반 숫자 인식</Text>
            </TouchableOpacity>
          </View>
          
          {/* 더블탭 인식 UI */}
          <View style={styles.recognitionSection}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>더블탭 인식 결과:</Text>
              <View style={styles.digitGroup}>
                {[0, 1, 2].map((index) => (
                  <TextInput
                    key={index}
                    style={styles.digitInput}
                    value={doubleTapRecognizedDigits[index] || ''}
                    editable={false}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => {
                resetDoubleTapDigits();
                openDoubleTapDigitInput();
              }}>
              <Text style={styles.mainButtonText}>더블탭 종료 숫자 인식</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 시간 기반 숫자 인식 오버레이 */}
        <TimerBasedDigitInput 
          visible={isTimerDigitInputVisible} 
          onClose={closeTimerDigitInput}
          onDigitRecognized={handleTimerDigitRecognized}
          currentDigitIndex={timerRecognizedDigits.length}
          maxDigits={3}
        />
        
        {/* 더블탭 숫자 인식 모달 */}
        <DoubleTapDigitInput 
          visible={isDoubleTapDigitInputVisible} 
          onClose={closeDoubleTapDigitInput}
          onDigitRecognized={handleDoubleTapDigitRecognized}
          currentDigitIndex={doubleTapRecognizedDigits.length}
          maxDigits={3}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  recognitionSection: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  digitGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  digitInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  mainButton: {
    backgroundColor: '#4dabf7',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
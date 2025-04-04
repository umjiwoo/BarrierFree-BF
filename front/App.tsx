import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
} from 'react-native';

// 커스텀 진동 모듈 가져오기
const {CustomVibration} = NativeModules;

const App = () => {
  const DoubleTapHandler = () => {
    let lastTap = 0;

    return () => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300; // 300ms

      if (now - lastTap < DOUBLE_TAP_DELAY) {
        // 더블 탭 감지됨
        CustomVibration.vibrateCustomSequence('double_tick');
        console.log('Double tap detected');
      } else {
        lastTap = now;
      }
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>커스텀 진동 모듈 테스트</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진동</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPressIn={() => CustomVibration.vibrateWithAmplitude(300, 255)}>
              <Text style={styles.buttonText}>일반 진동</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPressIn={() =>
                CustomVibration.vibrateCustomSequence('notification')
              }>
              <Text style={styles.buttonText}>알림</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPressIn={() =>
                CustomVibration.vibrateCustomSequence('success')
              }>
              <Text style={styles.buttonText}>성공</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.errorButton]}
              onPressIn={() => CustomVibration.vibrateCustomSequence('error')}>
              <Text style={styles.buttonText}>실패</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPressIn={() =>
                CustomVibration.vibrateCustomSequence('warning')
              }>
              <Text style={styles.buttonText}>경고</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPressIn={() => CustomVibration.vibrateCustomSequence('tick')}>
              <Text style={styles.buttonText}>한번 탭</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPressIn={DoubleTapHandler()}>
              <Text style={styles.buttonText}>더블 탭</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPressIn={() =>
                CustomVibration.vibrateCustomSequence('heartbeat_start')
              }>
              <Text style={styles.buttonText}>드로잉 중</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPressIn={() => CustomVibration.vibrateCustomSequence('typing')}>
              <Text style={styles.buttonText}>로딩중</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPressIn={() =>
                CustomVibration.vibrateCustomSequence('cheerful_success')
              }>
              <Text style={styles.buttonText}>송금 성공</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stopSection}>
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPressIn={() => CustomVibration.cancelVibration()}>
            <Text style={styles.buttonText}>진동 중지</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            참고: 안드로이드 API 레벨 26(Oreo) 이상에서만 진동 강도 조절이
            가능합니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  stopButton: {
    backgroundColor: '#9E9E9E',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stopSection: {
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#FFFDE7',
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  infoText: {
    color: '#333333',
    fontSize: 14,
  },
});

export default App;

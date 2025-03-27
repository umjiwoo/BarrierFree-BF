import {View, Text, StyleSheet, Button, Linking, Alert} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

const CameraTest = () => {
  // 카메라 권한 관련 훅
  const {hasPermission: hasCameraPermission, requestPermission: requestCameraPermission} = useCameraPermission();
  // 마이크 권한 관련 훅
  const {hasPermission: hasMicPermission, requestPermission: requestMicPermission} = useMicrophonePermission();
  
  // 카메라 디바이스 가져오기 (후면 카메라 사용)
  const device = useCameraDevice('back');
  
  // 카메라 활성화 상태
  const [isActive, setIsActive] = useState(false);

  // 권한 요청 함수
  const requestPermissions = useCallback(async () => {
    const cameraPermission = await requestCameraPermission();
    await requestMicPermission(); // 마이크 권한도 요청하지만 결과값은 사용하지 않음
    
    if (!cameraPermission) {
      Alert.alert(
        '카메라 권한 필요',
        '카메라를 사용하기 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [
          {text: '취소', style: 'cancel'},
          {text: '설정으로 이동', onPress: () => Linking.openSettings()},
        ],
      );
    }
  }, [requestCameraPermission, requestMicPermission]);

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    if (!hasCameraPermission || !hasMicPermission) {
      requestPermissions();
    }
  }, [hasCameraPermission, hasMicPermission, requestPermissions]);

  // 카메라 활성화/비활성화 토글
  const toggleCamera = () => {
    setIsActive(prev => !prev);
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>카메라를 찾을 수 없습니다</Text>
        <Text style={styles.description}>
          기기의 카메라에 접근할 수 없습니다.
        </Text>
      </View>
    );
  }

  if (!hasCameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>카메라 권한이 필요합니다</Text>
        <Text style={styles.description}>
          카메라 기능을 사용하기 위해 권한이 필요합니다.
        </Text>
        <Button title="권한 요청" onPress={requestPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isActive ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
        />
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.title}>카메라 테스트 페이지</Text>
          <Text style={styles.description}>
            아래 버튼을 눌러 카메라를 켤 수 있습니다.
          </Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isActive ? "카메라 끄기" : "카메라 켜기"} 
          onPress={toggleCamera} 
        />
      </View>
    </View>
  );
};

export default CameraTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
}); 
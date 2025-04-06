# 신분증 인식 모듈 사용 가이드

## 개요
이 모듈은 Android 디바이스에서 TensorFlow Lite를 사용하여 신분증을 인식하는 기능을 제공합니다. 
React Native Vision Camera 프레임워크를 기반으로 구현되었습니다.

## 설치 요구사항

다음 라이브러리들이 필요합니다:

```bash
npm install react-native-vision-camera
npm install react-native-reanimated
```

`package.json`에 다음 의존성이 추가되어야 합니다:

```json
"dependencies": {
  "react-native-vision-camera": "^3.6.12",
  "react-native-reanimated": "^3.17.2"
}
```

## 모델 파일 추가 방법

1. TensorFlow Lite 모델 파일 `b32.tflite`를 다음 경로에 배치해야 합니다:
   - Android: `android/app/src/main/assets/b32.tflite`

## 사용 방법

### 1. 카메라 권한 설정

`AndroidManifest.xml` 파일에 다음 권한을 추가합니다:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### 2. IDCardScreen 컴포넌트 사용

```tsx
import IDCardScreen from './src/screens/IDCardScreen';

// 네비게이션에서 사용
<Stack.Screen
  name="IDCardScreen"
  component={IDCardScreen}
  options={{
    title: '신분증 인식',
    headerShown: false,
  }}
/>
```

### 3. 인식 결과 처리

`IDCardScreen`에서 신분증 인식 후 홈 화면으로 돌아갈 때 인식 결과가 다음과 같이 전달됩니다:

```tsx
// IDCardScreen.tsx 내부
navigation.navigate('HomeScreen', { 
  idCardData: {
    image: capturedImage, // Base64 인코딩된 이미지
    confidence: detectionResult.boxes[0]?.confidence // 신뢰도
  }
});

// HomeScreen.tsx에서 결과 사용
const route = useRoute();
const idCardData = route.params?.idCardData;

// idCardData 사용하기
if (idCardData) {
  // 이미지 표시
  <Image 
    source={{ uri: `data:image/jpeg;base64,${idCardData.image}` }}
    style={styles.image}
  />
  
  // 신뢰도 표시
  <Text>신뢰도: {Math.round(idCardData.confidence * 100)}%</Text>
}
```

## 참고사항

1. 이 모듈은 Android에서만 테스트되었습니다.
2. TensorFlow Lite 모델은 신분증의 각도와 위치를 감지하여 올바른 방향으로 이미지를 회전합니다.
3. 좋은 인식 결과를 위해 적절한 조명 환경에서 사용하세요.
4. 필요한 경우 `CONFIDENCE_THRESHOLD` 값을 조정하여 인식 정확도를 조절할 수 있습니다.

## 문제 해결

- 카메라 접근 권한 문제: 앱 정보 > 권한에서 카메라 권한을 확인하세요.
- 신분증이 인식되지 않는 경우: 조명이 밝은 환경에서 신분증 전체가 카메라에 잘 보이도록 위치시키세요. 
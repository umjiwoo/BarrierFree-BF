# 신분증 인식 모듈 사용 가이드

## 개요
이 모듈은 Android 디바이스에서 TensorFlow Lite를 사용하여 신분증을 인식하는 기능을 제공합니다. 
React Native Vision Camera 프레임워크를 기반으로 구현되었습니다.

## 설치 요구사항

다음 라이브러리들이 필요합니다:

```bash
npm install react-native-vision-camera
npm react-native-worklets-core
```

`package.json`에 다음 의존성이 추가되어야 합니다:

```json
"dependencies": {
  "react-native-vision-camera": "^4.6.4",
  "react-native-worklets-core": "^1.5.0",
}
```

## 모델 파일 추가 방법

androidstudio를 이용해, 모델을 추가했습니다.

```Using Android Studio
In addition to the development libraries described above, Android Studio also provides support for integrating LiteRT models, as described below.

Android Studio ML Model Binding
The ML Model Binding feature of Android Studio 4.1 and later allows you to import .tflite model files into your existing Android app, and generate interface classes to make it easier to integrate your code with a model.

To import a LiteRT model:

Right-click on the module you would like to use the LiteRT model or click on File > New > Other > LiteRT Model.

Select the location of your LiteRT file. Note that the tooling configures the module's dependency with ML Model binding and automatically adds all required dependencies to your Android module's build.gradle file.

Note: Select the second checkbox for importing TensorFlow GPU if you want to use GPU acceleration.
Click Finish to begin the import process. When the import is finished, the tool displays a screen describing the model, including its input and output tensors.

To start using the model, select Kotlin or Java, copy and paste the code in the Sample Code section.

You can return to the model information screen by double clicking the TensorFlow Lite model under the ml directory in Android Studio. For more information on using the Modle Binding feature of Android Studio, see the Android Studio release notes. For an overview of using model binding in Android Studio, see the code example instructions.```


## 사용 방법

### 1. 카메라 권한 설정

`AndroidManifest.xml` 파일에 다음 권한을 추가합니다:

```xml
<uses-permission android:name="android.permission.CAMERA" />
선택적으로 마이크 옵션도 추가 가능합니다
<uses-permission android:name="android.permission.RECORD_AUDIO" />
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
3. 필요한 경우 `CONFIDENCE_THRESHOLD` 값을 조정하여 인식 정확도를 조절할 수 있습니다.

## 문제 해결

- 카메라 접근 권한 문제: 앱 정보 > 권한에서 카메라 권한을 확인하세요.
- 신분증이 인식되지 않는 경우: 조명이 밝은 환경에서 신분증 전체가 카메라에 잘 보이도록 위치시키세요. 
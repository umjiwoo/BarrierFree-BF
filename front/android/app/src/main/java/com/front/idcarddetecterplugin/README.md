# 신분증 인식 모듈 (ID Card Detector)

## 개요
이 모듈은 Android에서 TensorFlow Lite를 사용해 신분증을 실시간으로 감지하고 추출하는 기능을 제공합니다. VisionCamera 프레임워크와 통합되어 React Native 애플리케이션에서 사용할 수 있습니다.

## 프로젝트 구조
```
idcarddetecterplugin/
  ├── plugins/       # VisionCamera 플러그인 정의 및 등록
  ├── utils/         # 이미지 처리 및 유틸리티 함수
  └── models/        # 데이터 모델 클래스
```

### plugins/
VisionCamera 프레임워크와 연동되는 플러그인 클래스와 등록을 담당합니다.
- `IdcardDetecterPluginPlugin.kt`: 메인 플러그인 클래스로 프레임 처리 로직 구현
- `IdcardDetecterPluginPackage.kt`: VisionCamera 프레임워크에 플러그인 등록

### utils/
이미지 처리와 관련된 유틸리티 클래스들을 포함합니다.
- TFLite 모델 로딩/추론 관리	TfliteModelHandler.kt	Interpreter 로드, 버퍼 준비, 해제 관리
- YUV → RGB 변환	YuvRgbConverter.kt	Image 타입을 Bitmap으로 변환
- 전처리/후처리 유틸	ImageProcessor.kt	패딩, 크롭, 회전, OBB 코너 계산 등
- 탐지 후처리	DetectionProcessor.kt	NMS, OBB IoU 계산 등

### models/
데이터 모델 클래스들을 정의합니다.
- `DetectionBox.kt`: 객체 감지 박스 정보 (좌표, 크기, 각도, 신뢰도)
- `PaddingInfo.kt`: 이미지 패딩 정보 (비트맵, 패딩 값, 스케일)

## 주요 기능

### 1. 신분증 감지
- TensorFlow Lite 모델을 사용하여 프레임 내 신분증 위치 감지
- 회전된 신분증 처리 (각도 정보 포함)
- 신뢰도 기반 필터링 및 NMS(Non-Maximum Suppression) 적용

### 2. 이미지 처리
- YUV 이미지를 RGB 비트맵으로 고성능 변환
- 모델 입력을 위한 리사이징 및 패딩
- 감지된 신분증 영역 크롭 및 회전 보정

### 3. 결과 처리
- 감지된 신분증 정보 (좌표, 크기, 각도, 신뢰도)
- Base64로 인코딩된 신분증 이미지 데이터
- React Native 애플리케이션으로 전달 가능한 포맷

## 사용 방법

### 1. 모델 파일 준비
TensorFlow Lite 모델 파일(`b32.tflite`)을 다음 경로에 추가합니다:
```
android/app/src/main/assets/b32.tflite
```

### 2. MainApplication.kt 수정
MainApplication.kt 파일에 플러그인 초기화 코드를 추가합니다:
```kotlin
import com.front.idcarddetecterplugin.plugins.IdcardDetecterPluginPackage

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
    // ...
    
    // 신분증 인식 플러그인 초기화
    IdcardDetecterPluginPackage
  }
}
```

### 3. VisionCamera에서 사용 (React Native)
```javascript
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { VisionCameraProxy } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

// 플러그인 등록 
const idcardDetecterPlugin = VisionCameraProxy.initFrameProcessorPlugin('idcardDetecter');

// JS 스레드에서 실행될 함수 (메인 UI 스레드)
const handleDetectionResult = (result) => {
  console.log('신분증 감지 결과:', result);
  // 상태 업데이트 등 UI 관련 작업 수행
  setDetectionResult(result);
};

// Worklet에서 JS 스레드로 데이터를 전달하기 위한 함수 생성
const runOnJSHandleDetection = Worklets.createRunOnJS(handleDetectionResult);

// 프레임 처리 함수
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  
  if (idcardDetecterPlugin == null) return;
  
  // 네이티브 플러그인 호출
  const result = idcardDetecterPlugin.call(frame);
  
  if (result) {
    // 결과 처리 (worklet에서 JS 스레드로 전달)
    runOnJSHandleDetection(result);
  }
}, []);

// 카메라 컴포넌트
<Camera
  style={styles.camera}
  device={device}
  isActive={true}
  frameProcessor={frameProcessor}
  frameProcessorFps={5}
/>
```

## 인식 결과 형식
```javascript
{
  boxes: [
    {
      // 모델 출력 좌표 (디버깅용)
      modelCx: 320.5,
      modelCy: 240.2,
      modelWidth: 180.0,
      modelHeight: 120.0,
      
      // 변환된 최종 좌표
      cx: 1024.3,
      cy: 768.5,
      width: 576.0,
      height: 384.0,
      
      // 기타 정보
      confidence: 0.95,
      angle: 0.12, // 라디안
      angleDeg: 6.8, // 각도
      corners: [
        {x: 900.2, y: 700.5},
        {x: 1148.4, y: 700.5},
        {x: 1148.4, y: 836.5},
        {x: 900.2, y: 836.5}
      ]
    }
  ],
  processingTimeMs: 127,
  imageInfo: {
    originalWidth: 1920,
    originalHeight: 1080,
    paddingLeft: 0,
    paddingTop: 80,
    scale: 0.75
  },
  orientation: "portrait",
  imageData: "base64-encoded-image..."
}
```

## 성능 최적화
- YUV 변환 시 최적화된 알고리즘 사용 (빠른 변환 속도)
- TensorFlow Lite 인터프리터 멀티 스레드 설정
- 메모리 사용 최소화를 위한 비트맵 리소스 관리

## 참고 사항
- 권장 조명 환경: 적당한 밝기, 그림자가 없는 환경
- 신뢰도 임계값(`CONFIDENCE_THRESHOLD`)은 필요에 따라 조정 가능
- 인식 속도는 기기 성능에 따라 달라질 수 있음

## 의존성
- TensorFlow Lite: `org.tensorflow:tensorflow-lite:2.10.0`
- TensorFlow Lite Support: `org.tensorflow:tensorflow-lite-support:0.4.2`
- VisionCamera: `com.mrousavy:camera-android:1.5.0`

## 라이센스
이 모듈은 MIT 라이센스 하에 제공됩니다. 
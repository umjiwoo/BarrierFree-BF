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
- `TfliteModelHandler.kt`: TFLite 모델 로딩, 추론 관리, 메모리 해제
- `YuvRgbConverter.kt`: YUV 이미지를 RGB 비트맵으로 고성능 변환
- `ImageProcessor.kt`: 이미지 패딩, 크롭, 회전, OBB 코너 계산 등
- `DetectionProcessor.kt`: NMS, OBB IoU 계산 등

### models/
데이터 모델 클래스들을 정의합니다.
- `DetectionModels.kt`: 객체 감지 박스 정보 및 패딩 정보 클래스 정의

## 주요 기능

### 1. 신분증 감지
- TensorFlow Lite 모델(`sadtearcat.tflite`)을 사용하여 프레임 내 신분증 위치 감지
- 회전된 신분증 처리 (각도 정보 포함)
- 신뢰도 기반 필터링 및 NMS(Non-Maximum Suppression) 적용

### 2. 이미지 처리
- YUV 이미지를 RGB 비트맵으로 최적화된 변환
- 모델 입력을 위한 리사이징 및 패딩
- 감지된 신분증 영역 정확한 크롭 및 회전 보정
- 시계 방향으로 정렬된 코너 점 계산

### 3. 메모리 및 리소스 관리
- 이미지 버퍼 자동 해제로 메모리 누수 방지
- 비트맵 리소스의 체계적인 해제
- 예외 상황에서도 안전한 리소스 정리

### 4. 좌표계 처리 (개선됨)
- 이미지 좌표계에 맞는 시계 방향 코너 정렬
- 명확한 코너 매핑 (좌상, 우상, 우하, 좌하)
- 좌표계 변환 및 패딩 처리 지원

## 최근 개선 사항

### 1. 이미지 리소스 관리 강화
- `image.close()` 호출을 try-finally 블록으로 보호하여 누수 방지
- 이미지 사용 후 즉시 메모리 해제하여 버퍼 소진 문제 해결
- 비트맵 리소스의 체계적인 정리로 메모리 효율성 향상

### 2. 좌표계 및 코너 정렬 개선
- `calculateObbCorners` 함수 개선: 이미지 좌표계에 맞게 시계 방향으로 코너 생성
  ```kotlin
  // 코너 생성 순서: 우상 → 우하 → 좌하 → 좌상 (시계 방향)
  val offsets = listOf(
      Pair(w / 2, -h / 2),  // 우상 (오른쪽 위)
      Pair(w / 2, h / 2),   // 우하 (오른쪽 아래)
      Pair(-w / 2, h / 2),  // 좌하 (왼쪽 아래)
      Pair(-w / 2, -h / 2)  // 좌상 (왼쪽 위)
  )
  ```
- 코너 매핑 수정: 올바른 시계방향 코너 라벨링 구현
  ```kotlin
  // 코너 점 로깅
  Log.d(TAG, "코너 점: [" +
          "좌상=(${reordered[3]["x"]}, ${reordered[3]["y"]}), " +
          "우상=(${reordered[0]["x"]}, ${reordered[0]["y"]}), " +
          "우하=(${reordered[1]["x"]}, ${reordered[1]["y"]}), " +
          "좌하=(${reordered[2]["x"]}, ${reordered[2]["y"]})]")
  ```

### 3. 텐서 형태 처리 개선
- TFLite 모델 출력 형태 [1, 6, 8400]에 대한 올바른 처리
- 다차원 배열 변환 및 타입 안전성 보장

### 4. 타입 변환 안전성 강화
- JSI 변환을 위한 Double 타입으로의 안전한 변환
- 타입 캐스팅 오류 방지를 위한 보호 로직 추가
- 타입 불일치 문제 해결

### 5. 디버깅 및 로깅 개선
- 소스 파일별 로그 접두사 추가로 로그 식별 용이
- 모델 출력, 처리 단계, 코너 정렬 결과 등 상세 로그 제공
- 시계방향 코너 순서 시각화 로깅 추가

## 사용 방법

### 1. 모델 추가
androidstudio를 이용해, 모델을 추가했습니다.

### 2. MainApplication.kt 수정
MainApplication.kt 파일에 플러그인 초기화 코드를 추가합니다:
```kotlin
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import com.front.idcarddetecterplugin.plugins.IdcardDetecterPluginPlugin

class MainApplication : Application(), ReactApplication {
  companion object {
    init {
      FrameProcessorPluginRegistry.addFrameProcessorPlugin(
        "idcardDetecter"
      ) { proxy, args -> IdcardDetecterPluginPlugin(proxy, args) }
    }
  }
```

### 3. VisionCamera에서 사용 (React Native)
```javascript
import { Camera } from 'react-native-vision-camera';
import { VisionCameraProxy } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

// 플러그인 등록 
const idcardDetecterPlugin = VisionCameraProxy.initFrameProcessorPlugin('idcardDetecter');

// JS 스레드로 데이터를 전달하기 위한 함수 생성
const runOnJSHandleDetection = Worklets.createRunOnJS(handleDetectionResult);

// 프레임 처리 함수
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  
  // 이미 처리 중인 경우 스킵
  if (global._isProcessingFrame === true) return;
  global._isProcessingFrame = true;
  
  try {
    if (!frame?.isValid || !idcardDetecterPlugin) return;
    
    // 네이티브 플러그인 호출
    const result = idcardDetecterPlugin.call(frame);
    
    if (result) {
      runOnJSHandleDetection(result);
    }
  } finally {
    // 처리 상태 초기화 (중요: 다음 프레임 처리를 위해)
    global._isProcessingFrame = false;
  }
}, []);

// 카메라 컴포넌트 (리소스 최적화 설정)
<Camera
  style={StyleSheet.absoluteFill}
  device={device}
  isActive={true}
  frameProcessor={frameProcessor}
  fps={5} // 낮은 FPS로 리소스 사용 최적화
  pixelFormat="yuv" // 최적의 ML 처리를 위한 포맷
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
      
      // 시계방향으로 정렬된 코너 점
      corners: [
        {x: 900.2, y: 700.5}, // 우상
        {x: 1148.4, y: 700.5}, // 우하
        {x: 1148.4, y: 836.5}, // 좌하
        {x: 900.2, y: 836.5}  // 좌상
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

## 성능 최적화 및 문제 해결

### 이미지 버퍼 관리
- `maxImages (6) has already been acquired` 오류 방지를 위한 버퍼 즉시 해제
- 모든 이미지 리소스 사용 후 안전한 `close()` 호출

### 메모리 사용 최적화
- 비트맵 리소스 사용 후 즉시 `recycle()` 호출
- 다차원 배열 효율적 관리

### 타입 변환 문제
- `Cannot convert Java type "class java.lang.Float/Long" to jsi::Value` 오류 해결
- 모든 숫자 타입을 JSI 호환 Double로 안전하게 변환

### 로깅 및 디버깅
- 모든 로그에 클래스 식별자 추가
- 처리 단계별 상세 로깅으로 문제 원인 파악 용이

## 참고 사항
- 권장 조명 환경: 적당한 밝기, 그림자가 없는 환경
- 신뢰도 임계값(`CONFIDENCE_THRESHOLD`)은 필요에 따라 조정 가능 (현재 0.9)
- 카메라 FPS를 5로 제한하여 안정적인 처리 보장

## 의존성
- TensorFlow Lite: `org.tensorflow:tensorflow-lite:2.14.0`
- VisionCamera: `com.mrousavy:camera-android`
- React Native Worklets: `react-native-worklets-core`

## 라이센스
이 모듈은 MIT 라이센스 하에 제공됩니다. 
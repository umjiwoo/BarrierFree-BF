# 신분증 인식 시각화 구현 할 일 목록
## 1. 네이티브 모듈 처리 확인

### 1.1 orientation 처리 확인
- [ ] `IdcardDetecterPluginPlugin.kt`에서 frame.orientation 값 수신 및 처리 확인
- [ ] 네이티브 모듈에서 orientation에 따른 이미지 회전 처리 확인
- [ ] 바운딩 박스 좌표가 orientation에 맞게 보정되는지 확인
- [ ] 이미 모든 orientation 처리가 구현되어 있는지 확인

### 1.2 좌표계 및 크기 확인
- [ ] 반환되는 좌표가 어떤 기준인지 확인 (원본 이미지 좌표계? 화면 좌표계?)
- [ ] 반환되는 크기(imageInfo)가 원본 이미지 기준인지 확인
- [ ] 모든 변환 과정이 네이티브에서 처리되는지 확인
- [ ] 회전 보정된 바운딩 박스가 정확히 반환되는지 확인

## 2. Skia를 사용한 시각화 구현

### 2.1 Skia 설정 및 통합
- [x] `@shopify/react-native-skia` 패키지 설치
- [ ] `vision-camera-skia-plugin` 패키지 설치 (필요시)
- [x] IDCardScreen.tsx에 Skia 관련 import 추가

### 2.2 useSkiaFrameProcessor 구현
- [x] 기존 frameProcessor를 useSkiaFrameProcessor로 변경
- [x] frame.render()를 통한 카메라 프리뷰 렌더링 설정
- [x] Camera 컴포넌트의 preview={false} 설정

### 2.3 바운딩 박스 시각화
- [x] Skia.Path() 및 frame.drawPath()를 사용한 테두리 그리기
- [x] frame.drawCircle()을 사용한 코너 점 시각화
- [x] 색상 및 두께 설정을 위한 Paint 객체 구성

### 2.4 좌표 처리 및 스케일링
- [x] 필요시 좌표 스케일링 적용 (frame.width/height 기준)
- [ ] 전면 카메라 미러링 처리 (frame.isMirrored 확인)
- [ ] 다양한 화면 크기 대응을 위한 동적 스케일링

## 3. 사용자 인터페이스 개선

### 3.1 디버깅 모드 추가
- [x] 디버깅 정보 토글 버튼 추가
- [x] 좌표, 해상도, 방향 정보 표시
- [x] 디버그 모드 상태 관리

### 3.2 시각적 개선
- [x] 테두리 색상 및 두께 최적화
- [x] 코너 점 시각화 개선 (색상 구분)
- [x] 신뢰도, 각도 정보 표시 (옵션)

## 4. 테스트 및 최적화

### 4.1 다양한 환경 테스트
- [ ] 다양한 기기 해상도에서 테스트
- [ ] 다양한 빛 조건에서 테스트
- [ ] 다양한 신분증 종류로 테스트

### 4.2 성능 최적화
- [x] frameProcessor 성능 모니터링
- [x] 렌더링 효율성 최적화
- [x] 디버그 정보 토글로 성능 영향 최소화

## 5. 문서화 및 마무리

### 5.1 코드 문서화
- [x] 주요 함수 및 컴포넌트에 JSDoc 주석 추가
- [x] Skia 관련 코드 설명 추가
- [ ] 처리 과정에 대한 설명 추가

### 5.2 README 업데이트
- [ ] 시각화 기능 설명 추가
- [ ] Skia 사용법 및 설정 방법 설명
- [ ] 좌표계 및 방향 처리 관련 정보 추가

---

## 참고 사항

### Vision Camera orientation 값
- `portrait`: 0° (홈 버튼이 아래쪽)
- `landscape-left`: 90° (홈 버튼이 왼쪽)
- `portrait-upside-down`: 180° (홈 버튼이 위쪽)
- `landscape-right`: 270° (홈 버튼이 오른쪽)

### 이미지 처리 파이프라인 (네이티브 모듈 기준)

| 단계 | 작업 내용 | 처리 위치 | 이유 |
|------|----------|----------|------|
| 1 | orientation JS → Native 전달 | JS → Kotlin | 센서 방향 대응 위해 |
| 2 | 역회전 각도 계산 | Kotlin | TFLite 입력 정규화 |
| 3 | YUV → Bitmap + 회전 | Kotlin | 모델 입력용 |
| 4 | 결과 바운딩 박스 역회전 | Kotlin | 화면 기준으로 복원 |
| 5 | 회전 보정된 결과 전송 | Kotlin → JS | 정확한 시각화 |

#### 상세 설명:

1. **Frame.orientation 값을 JS → Native로 전달받기**
   - 💡 이유: Vision Camera의 JS 프레임 프로세서는 Frame.orientation을 제공합니다. Native에서는 카메라 센서 방향이나 디바이스 회전 값을 알기 어려우므로, JS에서 orientation 값을 직접 전달해주는 것이 가장 안전합니다.
   - 👉 해야 할 일: Frame.orientation을 Kotlin 플러그인에 인자로 함께 넘깁니다.
   - 예: `processFrame(frameData: ByteArray, width: Int, height: Int, orientation: String)` 등

2. **orientation에 따른 역회전 각도 계산**
   - 💡 이유: TFLite에 입력될 이미지가 항상 "올바른 방향"이 되도록 맞춰야 합니다. 예: 'landscape-left'이면 -90° 회전해야 "up-right"가 됩니다.
   - 👉 해야 할 일: Kotlin에서 orientation 값을 받아서 counter-rotation angle 계산
   ```kotlin
   val angle = when (orientation) {
     "portrait" -> 0
     "landscape-left" -> 270
     "portrait-upside-down" -> 180
     "landscape-right" -> 90
     else -> 0
   }
   ```

3. **YUV 또는 RGB ByteBuffer → Bitmap 변환 + 회전 적용**
   - 💡 이유: TensorFlow Lite는 Bitmap, ByteBuffer, TensorImage 등으로 추론합니다. YUV → Bitmap 변환 후 Matrix.postRotate(angle)로 회전해야 모델 입력이 정상화됩니다.
   - 👉 해야 할 일:
     - YuvToRgbConverter 등으로 YUV_420_888 → Bitmap 변환
     - Matrix().postRotate(angle) 적용 후 회전된 Bitmap 생성
     - 회전된 Bitmap을 모델에 입력

4. **바운딩 박스 결과값을 JS로 넘기기 전에 역회전 복원**
   - 💡 이유: 모델은 회전된 이미지에 대해 추론했기 때문에, 결과 바운딩 박스도 그 방향 기준입니다. 실제 화면의 방향 기준으로 역회전시켜야 스키아 등에서 제대로 보입니다.
   - 👉 해야 할 일: 바운딩 박스 좌표들에 -angle 회전 적용 (2D 회전 행렬 사용)
   ```kotlin
   fun rotatePoint(x: Float, y: Float, cx: Float, cy: Float, angleDeg: Float): Pair<Float, Float> {
       val rad = Math.toRadians(angleDeg.toDouble())
       val cos = cos(rad)
       val sin = sin(rad)
       val nx = (cos * (x - cx) - sin * (y - cy) + cx).toFloat()
       val ny = (sin * (x - cx) + cos * (y - cy) + cy).toFloat()
       return Pair(nx, ny)
   }
   ```

5. **JS로 회전 보정된 바운딩 박스 전송**
   - 💡 이유: JS에서는 스키아나 VisionCamera의 오버레이 뷰를 통해 바운딩 박스를 시각화하므로, 이미 회전이 보정된 상태의 결과를 전달해야 합니다.
   - 👉 해야 할 일: FrameProcessorPlugin 결과로 좌표를 JS에 넘깁니다. 이미지는 회전된 채 추론되었지만, 결과는 회전 보정된 상태입니다.

### Skia 시각화 구현 단계

1. **useSkiaFrameProcessor로 전환**
   ```tsx
   const frameProcessor = useSkiaFrameProcessor((frame) => {
     'worklet'
     frame.render()
     // 여기에서 drawRect 등 시각화 수행
   }, [])
   ```
   - 이유: Skia는 GPU 기반으로 작동하며 YUV도 효율적으로 처리 가능. 실시간으로 GPU에서 바로 렌더링할 수 있어 성능에 유리합니다.

2. **preview={false}로 설정**
   ```tsx
   <Camera
     preview={false}
     frameProcessor={frameProcessor}
   />
   ```
   - 이유: Skia에서 frame.render()로 preview를 직접 그리기 때문에, VisionCamera의 기본 preview 기능은 비활성화해야 충돌이 없습니다.

3. **Native(TFLite)에서 탐지한 객체 바운딩 박스 좌표를 JS로 넘기기**
   ```kotlin
   map.putArray("boxes", boundingBoxArray)
   ```
   - 이유: JS에서 바운딩 박스를 frame.drawRect()로 시각화하기 위해서는, TFLite로부터의 결과를 JS에서 받을 수 있어야 합니다.

4. **frame.drawPath()로 바운딩 박스 시각화**
   ```tsx
   const paint = Skia.Paint()
   paint.setColor(Skia.Color('red'))
   
   const path = Skia.Path()
   path.moveTo(corners[0].x, corners[0].y)
   path.lineTo(corners[1].x, corners[1].y)
   path.lineTo(corners[2].x, corners[2].y)
   path.lineTo(corners[3].x, corners[3].y)
   path.close()
   
   frame.drawPath(path, paint)
   ```
   - 이유: 실시간 시각화를 위해 Skia API를 직접 사용해 그립니다. 시계방향으로 정렬된 코너 점을 기반으로 패스를 생성하여 그립니다.

5. **좌표 스케일링 및 미러링 (필요시)**
   ```tsx
   // 스케일링
   const scaleX = frame.width / result.imageInfo.originalWidth;
   const scaleY = frame.height / result.imageInfo.originalHeight;
   const scaledX = corner.x * scaleX;
   const scaledY = corner.y * scaleY;
   
   // 미러링 (전면 카메라일 경우에 쓸 수 있지만, 우리는 후면 카메라를 사용하므로 필요없음)
   const finalX = frame.isMirrored ? frame.width - scaledX : scaledX;
   ```
   - 이유: 모델 추론이 원본 해상도를 기준으로 했을 경우, 현재 프레임의 크기에 맞춰 좌표를 조정해야 정확한 위치에 시각화가 됩니다.

### JavaScript에서 시각화 구현을 위한 접근 방법

1. **최소 접근법**
   - 네이티브에서 이미 모든 방향 보정이 완료된 좌표를 받아서 직접 시각화
   - 추가적인 좌표 변환 없이 단순 스케일링만 필요할 수 있음

2. **확장 접근법 (필요시)**
   - 프리뷰 크기와 원본 이미지 크기의 차이를 고려한 스케일링
   - 기기 해상도와 카메라 프리뷰 간의 종횡비 차이 처리

3. **디버깅 전략**
   - 원본 좌표와 변환 좌표를 동시에 표시하여 시각적 검증
   - 네이티브 모듈의 로그와 JS 로그 비교 분석

### 네이티브 모듈 처리 예시 (Kotlin)
```kotlin
// orientation에 따른 각도 계산
val angle = when (orientation) {
  "portrait" -> 0
  "landscape-left" -> 270
  "portrait-upside-down" -> 180
  "landscape-right" -> 90
  else -> 0
}

// 점 회전 함수
fun rotatePoint(x: Float, y: Float, cx: Float, cy: Float, angleDeg: Float): Pair<Float, Float> {
    val rad = Math.toRadians(angleDeg.toDouble())
    val cos = cos(rad)
    val sin = sin(rad)
    val nx = (cos * (x - cx) - sin * (y - cy) + cx).toFloat()
    val ny = (sin * (x - cx) + cos * (y - cy) + cy).toFloat()
    return Pair(nx, ny)
}
```

## 🔍 Skia 및 VisionCamera 통합 디버깅 일지

### 문제 상황
- **증상**: useSkiaFrameProcessor에서 "Failed to convert NativeBuffer to SkImage!" 오류가 발생
- **현상**: 바운딩 박스 시각화가 되지 않음
- **영향**: 신분증 감지는 되지만 사용자에게 표시되지 않음

### 원인 분석 과정

#### 1. JSI 함수 코드 분석
```java
JSI_HOST_FUNCTION(MakeImageFromNativeBuffer) {
  jsi::BigInt pointer = arguments[0].asBigInt(runtime);
  const uintptr_t nativeBufferPointer = pointer.asUint64(runtime);
  void *rawPointer = reinterpret_cast<void *>(nativeBufferPointer);
  auto image = getContext()->makeImageFromNativeBuffer(rawPointer);
  if (image == nullptr) {
    throw std::runtime_error("Failed to convert NativeBuffer to SkImage!");
  }
  return jsi::Object::createFromHostObject(
      runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
}
```

- `makeImageFromNativeBuffer`에서 null 반환 시 오류 발생
- 포인터는 제대로 전달되지만 이미지 생성 실패

#### 2. 프레임 포맷 문제 확인
- **VisionCamera**: YUV_420_888 포맷으로 프레임 제공
- **Skia**: RGBA_8888 or BGRA_8888 포맷 필요
- **문제**: 포맷 불일치로 변환 실패

#### 3. 인터페이스 구조 분석
- **ReadonlyFrameProcessor**: 단순 읽기 가능
  ```typescript
  interface ReadonlyFrameProcessor {
    frameProcessor: (frame: Frame) => void;
    type: "readonly";
  }
  ```

- **DrawableFrameProcessor**: 렌더링 가능 (추가 속성 필요)
  ```typescript
  interface DrawableFrameProcessor {
    frameProcessor: (frame: DrawableFrame) => void;
    type: "drawable-skia";
    offscreenTextures: ISharedValue<SkImage[]>;
    previewOrientation: ISharedValue<Orientation>;
  }
  ```

#### 4. 네이티브 모듈 분석
- **IdcardDetecterPluginPlugin.kt**:
  - YUV → RGB 변환 수행
  - 하지만 DrawableFrame의 NativeBuffer 설정 코드 누락

### 시도한 해결책 및 결과

#### 1. pixelFormat 변경 시도
```tsx
<Camera
  // 최초 시도: yuv → rgb 변경
  pixelFormat="rgb"
  preview={false}
  // ...
/>
```
- **결과**: 동일 오류 발생 (포맷만 변경한 것으로는 부족)

#### 2. 프레임 렌더링 순서 변경
```tsx
const skiaFrameProcessor = useSkiaFrameProcessor((frame: DrawableFrame) => {
  'worklet'
  
  try {
    // 항상, 무조건 가장 먼저 render 호출 (다른 처리 전에)
    frame.render();
    
    // 이후 다른 처리 진행
    if (isProcessingFrame) return;
    isProcessingFrame = true;
    // ...
  } catch (e) {
    // 오류 처리
  }
});
```
- **결과**: 동일 오류 발생 (render 호출 순서 변경으로는 부족)

#### 3. 추가 디버깅 로그 추가
```tsx
// JS 측
console.log(`📊 프레임 정보: 포맷=${frame.pixelFormat}, 크기=${frame.width}x${frame.height}`);
console.log(`🧩 프레임 속성: ${Object.keys(frame).join(', ')}`);

// 네이티브 측
Log.d(TAG, "${LOG_PREFIX}📊 프레임 타입: ${frame.pixelFormat}, 크기: ${frame.width}x${frame.height}")
Log.d(TAG, "${LOG_PREFIX}⚠️ Skia 렌더링을 위해서는 DrawableFrame의 NativeBuffer를 RGBA 버퍼로 설정해야 합니다!")
```
- **결과**: 문제의 원인 확인 (YUV 데이터가 Skia로 직접 전달됨)

### 핵심 문제 식별
1. **네이티브 모듈에서 YUV → RGBA 변환은 수행**되지만
2. **변환된 RGBA 버퍼가 DrawableFrame에 설정되지 않음**
3. **결과**: Skia가 YUV 버퍼를 직접 받아 변환 시도 시 실패

### 필요한 수정 사항
```kotlin
// 이상적인 해결책 (네이티브 코드에 추가 필요)
// YUV to RGBA 변환
ByteBuffer rgbaBuffer = convertYUV420ToRGBA(image);
// DrawableFrame 내부 버퍼 설정 
frame.setNativeBuffer(rgbaBuffer);
```

### 최종 결론
- **근본 원인**: VisionCamera와 Skia 사이의 버퍼 변환 인터페이스 구현 누락
- **해결 방향**: 
  1. 네이티브 모듈에서 DrawableFrame 인터페이스 확장
  2. 또는 대안으로 RGB 포맷 사용 + View 기반 오버레이 구현 
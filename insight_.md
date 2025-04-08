
## 개요

이 문서는 CameraX API를 사용한 카메라 프레임 처리 시 회전 처리에 관한 기술적 상세 내용을 제공합니다. 특히 ML 모델에 입력으로 제공되는 이미지 프레임의 회전과 모델 출력 결과의 역변환 처리에 초점을 맞추고 있습니다.

## 기본 개념

### 카메라 센서 방향

안드로이드 디바이스의 카메라 센서는 물리적으로 특정 방향으로 고정되어 있습니다:

- **후면 카메라**: 일반적으로 landscape 모드로 고정 (90° 회전)
- **전면 카메라**: 일반적으로 landscape + mirrored (270° 회전 + 미러링)

이는 디바이스가 세로(portrait) 모드로 들고 있더라도 카메라 센서는 자체적인 고유 방향을 유지함을 의미합니다.

### 좌표계 및 이미지 방향

카메라 센서, ML 모델 입력, UI 표시 간에는 서로 다른 좌표계가 사용됩니다:

1. **센서 좌표계**: 카메라 하드웨어의 물리적 방향
2. **모델 좌표계**: ML 모델이 예상하는 표준화된 입력 방향
3. **UI 좌표계**: 화면에 표시되는 좌표계

## AI 최적화 모델 입출력 설명

### 모델 아키텍처 및 목적

이 모델은 YOLOv8 기반 객체 감지 아키텍처의 변형으로, 기존 Axis-Aligned Bounding Box(AABB) 대신 회전된 Oriented Bounding Box(OBB)를 감지하도록 최적화되었습니다. 주요 목적은 다양한 각도로 놓인 ID 카드를 정확하게 감지하는 것입니다.

### 입력 텐서 상세 정보

- **텐서 형태**: `[1, 3, 640, 640]`
  - 차원 설명: [배치 크기, 채널 수, 높이, 너비]
  - 배치 크기 1: 한 번에 단일 이미지 처리
  - 채널 수 3: RGB 컬러 채널
  - 해상도 640x640: 모델의 고정 입력 크기

- **데이터 타입**: `Float32`
  - 각 픽셀 값은 0~1 사이로 정규화된 부동소수점

- **전처리 파이프라인**:
  1. 원본 이미지 가져오기 (임의 해상도)
  2. 종횡비 유지하며 패딩 추가 (letterbox 방식)
  3. 640x640 크기로 리사이징
  4. 픽셀 값 정규화 (0-255 → 0-1)
  5. BGR → RGB 변환 (필요시)
  6. NHWC → NCHW 메모리 레이아웃 변환

- **입력 사전조건**:
  - 모든 이미지는 정확히 640x640 크기로 리사이징되어야 함
  - 픽셀 값은 반드시 0~1 사이로 정규화되어야 함
  - 채널 순서는 RGB 형식이어야 함 (모델 훈련 방식에 따라 다를 수 있음)

### 출력 텐서 상세 정보

- **텐서 형태**: `[1, 6, 8400]`
  - 차원 설명: [배치 크기, 특성 채널, 감지 후보 수]
  - 배치 크기 1: 입력과 동일
  - 특성 채널 6: [centerX, centerY, width, height, confidence, angle]
  - 감지 후보 8400: YOLO 모델의 앵커 포인트 수 (특징 맵 크기에 따라 결정)

- **각 채널 의미**:
  - centerX, centerY: 감지된 객체의 중심점 (0~1 사이 정규화된 값)
  - width, height: 객체의 너비와 높이 (0~1 사이 정규화된 값)
  - confidence: 감지 신뢰도 (0~1 사이 확률값)
  - angle: 객체의 회전 각도 (라디안, -π/2 ~ π/2 범위)

- **후처리 파이프라인**:
  1. 신뢰도 필터링 (threshold=0.9)
  2. OBB(Oriented Bounding Box) 특화 NMS(Non-Maximum Suppression) 적용
  3. 정규화된 좌표를 원본 이미지 좌표로 역변환
  4. 회전된 바운딩 박스의 4개 코너 포인트 계산
  5. 이미지 회전 방향에 따른 좌표 역변환 적용

- **출력 해석**:
  - 높은 신뢰도 값(>0.9)은 ID 카드가 정확히 감지되었음을 의미
  - 각도 값은 ID 카드가 얼마나 회전되었는지 나타냄
  - 중심 좌표와 크기는 감지된 ID 카드의 위치와 크기를 정의

### 모델 입출력 구조를 JSON 형식으로 표현

```json
{
  "model_name": "IDCardDetector",
  "version": "1.0",
  "input": {
    "shape": [1, 3, 640, 640],
    "data_type": "float32",
    "preprocessing": {
      "resize_method": "letterbox",
      "normalization": "0-1",
      "channel_order": "RGB",
      "memory_layout": "NCHW"
    }
  },
  "output": {
    "shape": [1, 6, 8400],
    "data_type": "float32",
    "channels": ["centerX", "centerY", "width", "height", "confidence", "angle"],
    "postprocessing": {
      "confidence_threshold": 0.9,
      "nms_type": "OBB-NMS",
      "coordinate_transform": "normalized_to_absolute"
    }
  }
}
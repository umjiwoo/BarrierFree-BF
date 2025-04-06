// 코너 좌표 인터페이스
export interface Corner {
  x: number;
  y: number;
}

// 박스 타입 정의
export interface Box {
  cx: number;          // 중심 x 좌표
  cy: number;          // 중심 y 좌표
  width: number;       // 너비
  height: number;      // 높이
  confidence: number;  // 신뢰도 점수
  angle: number;       // 각도 (라디안)
  angleDeg: number;    // 각도 (도수)
  corners?: Corner[];  // 모서리 좌표 (옵셔널)
  modelCx?: number;    // 모델 출력 좌표 (640x640 기준) - 디버깅용
  modelCy?: number;    // 모델 출력 좌표 (640x640 기준) - 디버깅용
  modelWidth?: number; // 모델 출력 너비 - 디버깅용
  modelHeight?: number;// 모델 출력 높이 - 디버깅용
}

// 이미지 정보 인터페이스
export interface ImageInfo {
  width: number;   // 원본 이미지 너비
  height: number;  // 원본 이미지 높이
  format: string;  // 이미지 포맷
  rotation: number; // 회전 정보
  originalWidth?: number;  // 원본 이미지 너비
  originalHeight?: number; // 원본 이미지 높이
  paddingLeft?: number;    // 왼쪽 패딩 값
  paddingTop?: number;     // 위쪽 패딩 값
  scale?: number;          // 스케일 값
}

// 반환 타입 정의
export interface IdCardPluginResult {
  boxes: Box[];
  rawOutputs?: number[][];  // TensorFlow Lite 모델의 원시 출력값 (cx, cy, width, height, confidence, angle 등)
  processingTimeMs: number;
  imageInfo?: ImageInfo;
  orientation: string;      // 프레임 방향 ('landscape-right', 'landscape-left', 'portrait', 'portrait-upside-down')
  imageData?: string;       // 옵셔널: 디버깅용 이미지 데이터 (base64 인코딩)
} 
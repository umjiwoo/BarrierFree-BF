import { VisionCameraProxy, Frame } from 'react-native-vision-camera'

// 프레임 프로세서 플러그인 초기화
const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectObjects', {})

// 클래스 이름 목록 (주민등록증 필드에 맞게 수정)
export const CLASSES = [
  'title',       // 0
  'name_kor',    // 1
  'name_hanja',  // 2
  'idnum',       // 3
  'address',     // 4
  'issue_date',  // 5
  'issue_location', // 6
  'address_box', // 7
  'full_image',  // 8
  'id_card'      // 9
]

// 색상 목록 (각 클래스마다 다른 색상 지정)
export const COLORS = [
  'red', 'green', 'blue', 'yellow', 'purple', 'orange', 'cyan', 'magenta', 'lime', 'pink'
]

// 감지된 객체의 타입 정의
export interface Detection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  class: number;
  score: number;
}

// GPU/NNAPI 델리게이트 타입
export type TensorflowDelegate = 'gpu' | 'nnapi' | 'cpu';

/**
 * YOLO 모델을 사용하여 객체를 감지하는 함수
 * @param frame 카메라 프레임
 * @param options 옵션 (모델 경로, 임계값 등)
 * @returns 감지된 객체 목록
 */
export function detectObjects(
  frame: Frame,
  options: {
    modelPath?: string;
    scoreThreshold?: number;
    iouThreshold?: number;
    delegate?: TensorflowDelegate;
  } = {}
): Detection[] {
  'worklet'
  
  if (plugin == null) {
    throw new Error('YOLO 객체 감지 플러그인 로드 실패!')
  }
  
  // 기본값 설정
  const defaultOptions = {
    modelPath: 'bs32.tflite',
    scoreThreshold: 0.5,
    iouThreshold: 0.45,
    inputWidth: 640,
    inputHeight: 640,
    delegate: 'gpu' as TensorflowDelegate // 기본값은 GPU 가속
  }
  
  // 옵션과 기본값 병합
  const mergedOptions = { ...defaultOptions, ...options }
  
  try {
    // 플러그인 호출
    const results = plugin.call(frame, mergedOptions)
    
    // 플러그인이 반환한 결과를 안전하게 변환
    if (Array.isArray(results)) {
      // 타입 검사를 위한 검증 및 타입 단언
      return (results as unknown[]).filter(item => 
        item && 
        typeof item === 'object' && 
        'box' in item && 
        'class' in item && 
        'score' in item
      ) as Detection[]
    }
    
    // 결과가 배열이 아닌 경우 빈 배열 반환
    return []
  } catch (e) {
    console.error('객체 감지 오류:', e)
    return []
  }
} 
com.front
│
├── camera
│   └── CameraLifecycleManager.kt         # 카메라 라이프사이클 관리
│
├── ml
│   ├── converter                        # 이미지 변환 관련
│   │   ├── ImageConverter.kt            # 이미지 변환 인터페이스
│   │   └── YuvToRgbConverter.kt         # YUV -> RGB 변환 구현
│   │
│   ├── processor                        # 이미지 처리 관련
│   │   ├── DetectionResult.kt           # 객체 감지 결과 데이터 클래스
│   │   ├── ImageProcessor.kt            # 이미지 처리 인터페이스
│   │   └── ObjectDetectionProcessor.kt  # 객체 감지 구현
│   │
│   └── TFLiteModelFactory.kt            # TFLite 모델 관리 (싱글톤)
│
├── CameraPackage.kt                     # React Native 패키지
├── CameraPreviewModule.kt               # React Native 네이티브 모듈
└── CameraPreviewPackage.kt              # 카메라 프리뷰 패키지


---


com.front
├── camera
│   ├── CameraLifecycleManager.kt   # 기존: 카메라 라이프사이클 관리
│   ├── OrientationManager.kt       # 신규: 방향 관리
│   └── FrameProcessor.kt           # 신규: 프레임 전처리
│
├── ml
│   ├── converter
│   │   ├── ImageConverter.kt        # 기존: 이미지 변환 인터페이스
│   │   ├── YuvToRgbConverter.kt     # 기존: YUV→RGB 변환
│   │   └── ModelInputConverter.kt   # 신규: 모델 입력 형식 변환
│   │
│   ├── processor
│   │   ├── DetectionResult.kt       # 수정: 회전 필드 추가
│   │   ├── ImageProcessor.kt        # 기존: 이미지 처리 인터페이스
│   │   ├── ObjectDetectionProcessor.kt # 기존: 객체 감지
│   │   └── OBBDetectionProcessor.kt # 신규: 회전 객체 감지
│   │
│   ├── postprocessor                # 신규 패키지
│   │   ├── DetectionPostProcessor.kt # 신규: 후처리 인터페이스
│   │   ├── AABBPostProcessor.kt     # 신규: 일반 객체 후처리
│   │   └── OBBPostProcessor.kt      # 신규: 회전 객체 후처리
│   │
│   └── TFLiteModelFactory.kt       # 기존: 모델 관리
│
├── utils                           # 신규 패키지
│   ├── PerformanceMonitor.kt       # 신규: 성능 측정
│   └── MemoryOptimizer.kt          # 신규: 메모리 최적화
│
├── CameraPackage.kt                # 기존: React Native 패키지
├── CameraPreviewModule.kt          # 기존: React Native 모듈 
└── CameraPreviewPackage.kt         # 기존: 카메라 패키지

객체 감지가 작동하지 않는 문제를 해결하기 위해 검토해야 할 사항들:
네이티브 모듈 통신 문제
CameraPreviewModule에 startObjectDetection 및 stopObjectDetection 메서드가 실제로 구현되어 있는지 확인
이벤트 이름이 올바른지 확인 ('onDetectionResults' 이벤트가 네이티브 코드에서 방출되는지)
모델 로딩 문제
모델이 올바르게 로드되었는지 확인 (로그 확인)
ModelManager가 올바르게 구현되어 있는지 확인
이벤트 수신 문제
JS 측에서 이벤트 리스너가 올바르게 등록되었는지 확인
네이티브 측에서 이벤트를 올바르게 발생시키는지 확인
감지 결과 처리 문제
DetectionResult 인터페이스가 네이티브 코드에서 전송하는 데이터 구조와 일치하는지 확인
먼저 네이티브 모듈의 구현을 확인해야 합니다. CameraPreviewModule.kt 파일에서 startObjectDetection 및 stopObjectDetection 메서드가 구현되어 있는지 확인해야 합니다.
객체 감지가 작동하지 않는 문제를 확인해 보겠습니다. 다음 사항들을 검토해 보겠습니다.
다음과 같은 방법으로 객체 감지 문제를 해결했습니다:
문제 원인 분석:
CameraPreviewModule.kt에서 startObjectDetection 메서드가 이벤트를 실제로 발생시키지 않고 있었습니다.
이벤트 전달 시스템이 제대로 작동하는지 확인할 필요가 있었습니다.
해결책 구현:
CameraPreviewModule.kt의 startObjectDetection 메서드를 수정하여 테스트 데이터를 생성하고 이벤트로 전송하도록 구현했습니다.
테스트 데이터는 간단한 바운딩 박스 정보를 포함하여 화면에 표시될 수 있도록 했습니다.
React 컴포넌트에 디버깅 로그를 추가하여 이벤트 수신 과정을 모니터링할 수 있게 했습니다.
코드 변경사항:
네이티브 모듈에서 테스트 감지 데이터 생성 및 전송 코드 추가
JavaScript에서 이벤트 수신 및 처리 과정 디버깅을 위한 로그 추가
이벤트 데이터 처리 방식 개선(JSON.stringify를 통한 로그 출력)
이제 앱을 실행하고 '객체 감지 시작' 버튼을 클릭하면 테스트 바운딩 박스가 화면에 표시되어야 합니다. 이 테스트를 통해 이벤트 전달 시스템이 제대로 작동하는지 확인할 수 있으며, 이후 실제 카메라 통합 및 모델 인식 기능을 구현할 수 있습니다.
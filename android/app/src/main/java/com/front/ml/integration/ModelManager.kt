package com.front.ml.integration

import android.content.Context
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.front.ml.TFLiteModelFactory
import com.front.ml.camera.FrameProcessor
import com.front.ml.converter.YuvToRgbConverter
import com.front.ml.postprocessor.PostProcessorFactory
import com.front.ml.processor.DetectionResult
import com.front.ml.processor.ImageProcessor
import com.front.ml.processor.OBBDetectionProcessor
import com.front.ml.processor.ObjectDetectionProcessor
import com.front.ml.utils.OrientationManager
import com.front.ml.utils.PerformanceMonitor
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * 모델 관리 클래스
 * 모델 로딩, 카메라 연동, 이미지 처리 파이프라인 관리
 */
class ModelManager private constructor(private val context: Context) {
    companion object {
        private const val TAG = "ModelManager"
        
        @Volatile
        private var instance: ModelManager? = null
        
        fun getInstance(context: Context): ModelManager {
            return instance ?: synchronized(this) {
                instance ?: ModelManager(context.applicationContext).also { instance = it }
            }
        }
    }
    
    // 카메라 프로바이더
    private var cameraProvider: ProcessCameraProvider? = null
    
    // 모델 팩토리
    private val modelFactory = TFLiteModelFactory.getInstance(context)
    
    // 이미지 변환기
    private val imageConverter = YuvToRgbConverter(context)
    
    // 방향 관리자
    private val orientationManager = OrientationManager(context)
    
    // 성능 모니터
    private val performanceMonitor = PerformanceMonitor.getInstance()
    
    // 현재 설정
    private var currentModelName: String? = null
    private var currentLabelName: String? = null
    private var currentConfidence: Float = 0.5f
    private var currentNmsThreshold: Float = 0.5f
    
    // 카메라 및 처리기
    private var cameraExecutor: ExecutorService? = null
    private var imageProcessor: ImageProcessor? = null
    private var frameProcessor: FrameProcessor? = null
    
    /**
     * 초기화
     */
    fun initialize() {
        Log.d(TAG, "ModelManager 초기화")
        
        // 카메라 프로바이더 생성
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProvider = cameraProviderFuture.get()
        
        // 카메라 실행 스레드
        cameraExecutor = Executors.newSingleThreadExecutor()
        
        // 기기 방향 감지 시작
        orientationManager.startListening(object : OrientationManager.OrientationListener {
            override fun onOrientationChanged(screenOrientation: Int, deviceOrientation: Int) {
                Log.d(TAG, "방향 변경: 화면=$screenOrientation, 기기=$deviceOrientation")
            }
        })
    }
    
    /**
     * 리소스 해제
     */
    fun release() {
        Log.d(TAG, "ModelManager 리소스 해제")
        
        stopCamera()
        
        orientationManager.stopListening()
        
        cameraExecutor?.shutdown()
        cameraExecutor = null
        
        frameProcessor?.release()
        frameProcessor = null
        
        cameraProvider = null
    }
    
    /**
     * 모델 로드
     * @param modelName 모델 파일 이름
     * @param labelName 라벨 파일 이름
     * @return 로드 성공 여부
     */
    fun loadModel(modelName: String, labelName: String): Boolean {
        Log.d(TAG, "모델 로드: $modelName, 라벨: $labelName")
        
        // 이전 모델과 같으면 이미 로드된 것으로 간주
        if (modelName == currentModelName && labelName == currentLabelName && modelFactory.isModelLoaded(modelName)) {
            Log.d(TAG, "모델이 이미 로드되어 있음: $modelName")
            return true
        }
        
        try {
            // 동기식 로드 적용
            var success = false
            modelFactory.loadModel(modelName, labelName) { isSuccess, modelPath, labelPath ->
                success = isSuccess
                if (isSuccess) {
                    currentModelName = modelName
                    currentLabelName = labelName
                    Log.d(TAG, "모델 로드 성공: $modelName")
                } else {
                    Log.e(TAG, "모델 로드 실패: $modelName")
                }
            }
            
            return success
        } catch (e: Exception) {
            Log.e(TAG, "모델 로드 중 오류 발생", e)
            return false
        }
    }
    
    /**
     * 후처리 파라미터 설정
     * @param confidenceThreshold 신뢰도 임계값 (0~1)
     * @param nmsThreshold NMS 임계값 (0~1)
     */
    fun setDetectionParameters(confidenceThreshold: Float, nmsThreshold: Float) {
        currentConfidence = confidenceThreshold
        currentNmsThreshold = nmsThreshold
        Log.d(TAG, "탐지 파라미터 설정 - 신뢰도: $confidenceThreshold, NMS: $nmsThreshold")
    }
    
    /**
     * 카메라 시작 및 이미지 처리 설정
     * @param lifecycleOwner 라이프사이클 소유자
     * @param previewView 프리뷰 뷰
     * @param detectionCallback 탐지 결과 콜백
     */
    fun startCamera(
        lifecycleOwner: LifecycleOwner,
        previewView: Preview.SurfaceProvider,
        detectionCallback: DetectionCallback
    ) {
        Log.d(TAG, "카메라 시작")
        
        // 현재 모델이 로드되지 않았으면 중단
        val modelName = currentModelName
        val labelName = currentLabelName
        
        if (modelName == null || labelName == null || !modelFactory.isModelLoaded(modelName)) {
            Log.e(TAG, "모델이 로드되지 않음, 카메라 시작 불가")
            return
        }
        
        try {
            // 카메라 프로바이더 확인
            val provider = cameraProvider
            if (provider == null) {
                Log.e(TAG, "카메라 프로바이더가 초기화되지 않음")
                return
            }
            
            // 이미지 처리기 생성
            val isOBB = modelName.contains("obb", ignoreCase = true)
            
            imageProcessor = if (isOBB) {
                Log.d(TAG, "OBB 탐지 프로세서 생성")
                OBBDetectionProcessor(
                    modelFactory,
                    modelName,
                    labelName,
                    imageConverter,
                    currentConfidence
                )
            } else {
                Log.d(TAG, "일반 객체 탐지 프로세서 생성")
                ObjectDetectionProcessor(
                    modelFactory,
                    modelName,
                    labelName,
                    imageConverter
                )
            }
            
            // 프레임 처리기 생성 - 결과 콜백을 생성자에 전달
            frameProcessor = FrameProcessor(
                imageProcessor!!, 
                orientationManager
            ) { results ->
                detectionCallback.onDetectionResult(results)
            }
            
            // 카메라 사용 중지
            provider.unbindAll()
            
            // 프리뷰 설정
            val preview = Preview.Builder()
                .build()
                .also {
                    it.setSurfaceProvider(previewView)
                }
            
            // 이미지 분석 설정
            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor!!, frameProcessor!!)
                }
            
            // 카메라 바인딩
            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            provider.bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                preview,
                imageAnalysis
            )
            
            Log.d(TAG, "카메라 시작 완료")
            
        } catch (e: Exception) {
            Log.e(TAG, "카메라 시작 중 오류 발생", e)
        }
    }
    
    /**
     * 카메라 중지
     */
    fun stopCamera() {
        Log.d(TAG, "카메라 중지")
        
        try {
            cameraProvider?.unbindAll()
        } catch (e: Exception) {
            Log.e(TAG, "카메라 중지 중 오류 발생", e)
        }
    }
    
    /**
     * 모델 정보 가져오기
     * @param modelName 모델 이름
     * @return 모델 정보
     */
    fun getModelInfo(modelName: String): ModelInfo? {
        if (!modelFactory.isModelLoaded(modelName)) {
            return null
        }
        
        val interpreter = modelFactory.getInterpreter(modelName) ?: return null
        
        // 모델 입력/출력 형태 가져오기
        val inputShape = interpreter.getInputTensor(0).shape()
        val outputShape = interpreter.getOutputTensor(0).shape()
        
        // 성능 통계 가져오기
        val stats = performanceMonitor.getModelStats(modelName)
        
        return ModelInfo(
            name = modelName,
            inputShape = inputShape.joinToString("x"),
            outputShape = outputShape.joinToString("x"),
            labels = modelFactory.getLabels(currentLabelName ?: ""),
            avgInferenceTime = stats?.averageTime ?: 0.0,
            fps = stats?.fps ?: 0.0
        )
    }
    
    /**
     * 성능 보고서 가져오기
     */
    fun getPerformanceReport(): String {
        return performanceMonitor.getStatsReport()
    }
    
    /**
     * 모델 정보 데이터 클래스
     */
    data class ModelInfo(
        val name: String,
        val inputShape: String,
        val outputShape: String,
        val labels: List<String>,
        val avgInferenceTime: Double,
        val fps: Double
    )
    
    /**
     * 탐지 결과 콜백 인터페이스
     */
    interface DetectionCallback {
        fun onDetectionResult(results: List<DetectionResult>)
    }
} 
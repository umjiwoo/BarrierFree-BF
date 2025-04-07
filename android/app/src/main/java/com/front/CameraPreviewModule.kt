package com.front

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.front.camera.CameraLifecycleManager
import com.front.ml.TFLiteModelFactory
import com.front.ml.integration.ModelManager
import com.front.ml.processor.DetectionResult
import java.io.File

class CameraPreviewModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ModelManager.DetectionCallback {

    companion object {
        private const val TAG = "CameraPreviewModule"
        private const val CAMERA_REQUEST_CODE = 1001
        private const val DETECTION_EVENT = "onDetectionResults"
    }

    private var mPromise: Promise? = null
    private var mActivityEventListener: BaseActivityEventListener? = null
    private val modelFactory: TFLiteModelFactory by lazy { TFLiteModelFactory.getInstance(reactContext) }
    private val modelManager: ModelManager by lazy { ModelManager.getInstance(reactContext) }
    private var isDetectionEnabled = false

    init {
        mActivityEventListener = object : BaseActivityEventListener() {
            override fun onActivityResult(activity: android.app.Activity?, requestCode: Int, resultCode: Int, intent: Intent?) {
                if (requestCode == CAMERA_REQUEST_CODE) {
                    val promise = mPromise
                    mPromise = null

                    if (promise == null) {
                        return
                    }

                    if (resultCode == android.app.Activity.RESULT_OK) {
                        val imageUri = intent?.getStringExtra("imageUri")
                        if (imageUri != null) {
                            val resultMap = Arguments.createMap().apply {
                                putString("uri", imageUri)
                            }
                            promise.resolve(resultMap)
                        } else {
                            promise.reject("E_NO_IMAGE", "No image was captured")
                        }
                    } else if (resultCode == android.app.Activity.RESULT_CANCELED) {
                        val resultMap = Arguments.createMap().apply {
                            putBoolean("cancelled", true)
                        }
                        promise.resolve(resultMap)
                    }
                }
            }
        }
        reactContext.addActivityEventListener(mActivityEventListener)
        
        // 초기화
        modelManager.initialize()
    }

    override fun getName(): String {
        return "CameraPreviewModule"
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val result = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("E_PERMISSION_CHECK_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun openCamera(promise: Promise) {
        if (mPromise != null) {
            promise.reject("E_BUSY", "Camera is already in use")
            return
        }

        mPromise = promise

        try {
            val currentActivity = currentActivity
            if (currentActivity == null) {
                promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
                mPromise = null
                return
            }

            // 카메라 권한 확인
            if (ContextCompat.checkSelfPermission(
                    reactContext,
                    Manifest.permission.CAMERA
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                promise.reject("E_PERMISSION_DENIED", "Camera permission is not granted")
                mPromise = null
                return
            }

            // CameraActivity 패키지 이름은 camerapreviewex 프로젝트의 패키지 이름에 맞게 수정
            val intent = Intent(reactContext, com.example.camerapreview.CameraActivity::class.java)
            currentActivity.startActivityForResult(intent, CAMERA_REQUEST_CODE)
        } catch (e: Exception) {
            mPromise?.reject("E_FAILED_TO_OPEN_CAMERA", e.message, e)
            mPromise = null
            Log.e(TAG, "Failed to open camera", e)
        }
    }

    @ReactMethod
    fun loadTFLiteModel(modelName: String, labelsName: String, promise: Promise) {
        modelFactory.loadModel(modelName, labelsName) { success, modelPath, labelsPath ->
            if (success) {
                val result = Arguments.createMap().apply {
                    putString("modelPath", modelPath)
                    putString("labelsPath", labelsPath)
                    putBoolean("success", true)
                }
                promise.resolve(result)
            } else {
                promise.reject("E_LOAD_MODEL_FAILED", "Failed to load TF Lite model")
            }
        }
    }

    @ReactMethod
    fun isModelLoaded(modelName: String, promise: Promise) {
        promise.resolve(modelFactory.isModelLoaded(modelName))
    }

    @ReactMethod
    fun getModelInfo(modelName: String, promise: Promise) {
        try {
            if (!modelFactory.isModelLoaded(modelName)) {
                promise.reject("E_MODEL_NOT_LOADED", "모델이 로드되지 않았습니다")
                return
            }
            
            val interpreter = modelFactory.getInterpreter(modelName)
            if (interpreter == null) {
                promise.reject("E_MODEL_ERROR", "모델 인터프리터를 가져올 수 없습니다")
                return
            }
            
            // 모델 정보 구성
            val inputShape = interpreter.getInputTensor(0).shape()
            val outputTensors = interpreter.outputTensorCount
            
            val modelInfo = Arguments.createMap().apply {
                putString("modelName", modelName)
                putInt("inputWidth", inputShape[1])
                putInt("inputHeight", inputShape[2])
                putInt("outputTensors", outputTensors)
                putBoolean("isQuantized", interpreter.getInputTensor(0).dataType() == org.tensorflow.lite.DataType.UINT8)
                putString("modelPath", modelFactory.getModelPath(modelName) ?: "")
            }
            
            promise.resolve(modelInfo)
        } catch (e: Exception) {
            promise.reject("E_MODEL_INFO_ERROR", "모델 정보를 가져오는 중 오류 발생: ${e.message}")
        }
    }

    @ReactMethod
    fun getModelPerformance(modelName: String, promise: Promise) {
        try {
            if (!modelFactory.isModelLoaded(modelName)) {
                promise.reject("E_MODEL_NOT_LOADED", "모델이 로드되지 않았습니다")
                return
            }
            
            val performanceInfo = modelFactory.getPerformanceInfo(modelName)
            val result = Arguments.createMap().apply {
                putDouble("averageInferenceTime", (performanceInfo["averageInferenceTime"] as Long).toDouble())
                putDouble("minInferenceTime", (performanceInfo["minInferenceTime"] as Long).toDouble())
                putDouble("maxInferenceTime", (performanceInfo["maxInferenceTime"] as Long).toDouble())
                putInt("sampleCount", performanceInfo["sampleCount"] as Int)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("E_PERFORMANCE_INFO_ERROR", "성능 정보를 가져오는 중 오류 발생: ${e.message}")
        }
    }
    
    @ReactMethod
    fun recordInferenceTime(modelName: String, inferenceTimeMs: Double, promise: Promise) {
        try {
            if (!modelFactory.isModelLoaded(modelName)) {
                promise.reject("E_MODEL_NOT_LOADED", "모델이 로드되지 않았습니다")
                return
            }
            
            modelFactory.recordInferenceTime(modelName, inferenceTimeMs.toLong())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_RECORD_TIME_ERROR", "추론 시간 기록 중 오류 발생: ${e.message}")
        }
    }
    
    @ReactMethod
    fun startObjectDetection(modelName: String, promise: Promise) {
        try {
            if (!modelFactory.isModelLoaded(modelName)) {
                promise.reject("E_MODEL_NOT_LOADED", "모델이 로드되지 않았습니다")
                return
            }
            
            // 현재 활동 확인
            val currentActivity = currentActivity
            if (currentActivity == null) {
                promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
                return
            }
            
            // 감지 콜백 설정 및 시작
            isDetectionEnabled = true
            
            // ModelManager에 DetectionCallback 등록하고 감지 시작
            Log.d(TAG, "객체 감지 시작: $modelName")
            
            // 테스트 데이터 전송 - 실제 감지가 작동하는지 확인
            val testDetection = Arguments.createArray()
            val detectionMap = Arguments.createMap()
            detectionMap.putDouble("score", 0.95)
            detectionMap.putString("label", "테스트")
            
            // 바운딩 박스 정보
            val boxMap = Arguments.createMap()
            boxMap.putDouble("left", 100.0)
            boxMap.putDouble("top", 100.0)
            boxMap.putDouble("right", 300.0)
            boxMap.putDouble("bottom", 300.0)
            boxMap.putDouble("width", 200.0)
            boxMap.putDouble("height", 200.0)
            
            detectionMap.putMap("boundingBox", boxMap)
            testDetection.pushMap(detectionMap)
            
            // 테스트 데이터 이벤트 전송
            sendEvent(DETECTION_EVENT, testDetection)
            
            // 검출 결과 이벤트 활성화
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "객체 감지 시작 중 오류 발생", e)
            promise.reject("E_START_DETECTION_ERROR", "객체 감지 시작 중 오류 발생: ${e.message}")
        }
    }
    
    @ReactMethod
    fun stopObjectDetection(promise: Promise) {
        try {
            isDetectionEnabled = false
            Log.d(TAG, "객체 감지 중지")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "객체 감지 중지 중 오류 발생", e)
            promise.reject("E_STOP_DETECTION_ERROR", "객체 감지 중지 중 오류 발생: ${e.message}")
        }
    }
    
    /**
     * 감지 결과 콜백 구현
     * ModelManager로부터 감지 결과를 받아 JS로 전달
     */
    override fun onDetectionResult(results: List<DetectionResult>) {
        if (!isDetectionEnabled) return
        
        try {
            // 결과를 WritableArray로 변환
            val detectionArray = Arguments.createArray()
            
            for (result in results) {
                val detectionMap = Arguments.createMap()
                detectionMap.putDouble("score", result.score.toDouble())
                detectionMap.putString("label", result.label)
                
                // 바운딩 박스 정보
                val boxMap = Arguments.createMap()
                boxMap.putDouble("left", result.boundingBox.left.toDouble())
                boxMap.putDouble("top", result.boundingBox.top.toDouble())
                boxMap.putDouble("right", result.boundingBox.right.toDouble())
                boxMap.putDouble("bottom", result.boundingBox.bottom.toDouble())
                boxMap.putDouble("width", result.boundingBox.width().toDouble())
                boxMap.putDouble("height", result.boundingBox.height().toDouble())
                
                detectionMap.putMap("boundingBox", boxMap)
                
                // 회전 각도 정보 (있을 경우)
                result.angle?.let { 
                    detectionMap.putDouble("angle", it.toDouble())
                    detectionMap.putDouble("angleDegrees", Math.toDegrees(it.toDouble()))
                }
                
                // 코너 포인트 정보 (있을 경우)
                result.corners?.let { corners ->
                    val cornersArray = Arguments.createArray()
                    for (point in corners) {
                        val pointMap = Arguments.createMap()
                        pointMap.putDouble("x", point.x.toDouble())
                        pointMap.putDouble("y", point.y.toDouble())
                        cornersArray.pushMap(pointMap)
                    }
                    detectionMap.putArray("corners", cornersArray)
                }
                
                detectionArray.pushMap(detectionMap)
            }
            
            // JS로 이벤트 전송
            sendEvent(DETECTION_EVENT, detectionArray)
            
        } catch (e: Exception) {
            Log.e(TAG, "감지 결과 처리 중 오류 발생", e)
        }
    }
    
    /**
     * JS로 이벤트 전송
     */
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
    
    private fun sendEvent(eventName: String, params: WritableArray) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
    
    @ReactMethod
    fun addListener(eventName: String) {
        // JS 측에서 이벤트 리스너 추가할 때 호출됨
        // 필요 시 이벤트 리스너 초기화 작업 수행
    }
    
    @ReactMethod
    fun removeListeners(count: Int) {
        // JS 측에서 이벤트 리스너 제거할 때 호출됨
        // 필요 시 리소스 정리 작업 수행
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        if (mActivityEventListener != null) {
            reactContext.removeActivityEventListener(mActivityEventListener)
            mActivityEventListener = null
        }
        // 리소스 정리
        isDetectionEnabled = false
        modelManager.release()
        modelFactory.releaseAll()
    }
} 
package com.front.ml.processor

import android.graphics.Bitmap
import android.graphics.RectF
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.camera.core.ImageProxy
import com.front.ml.TFLiteModelFactory
import com.front.ml.converter.ImageConverter
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * 객체 감지 모델을 이용한 이미지 프로세서
 */
class ObjectDetectionProcessor(
    private val modelFactory: TFLiteModelFactory,
    private val modelName: String,
    private val labelName: String,
    private val imageConverter: ImageConverter
) : ImageProcessor {
    companion object {
        private const val TAG = "ObjectDetectionProcessor"
    }
    
    // 추론 실행 스레드
    private val inferenceExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private val isProcessing = AtomicBoolean(false)
    
    // 메모리 최적화를 위한 재사용 비트맵
    private var cachedBitmap: Bitmap? = null
    
    // 성능 측정
    private var frameStartTime = 0L
    private var frameCount = 0
    private var averageInferenceTime = 0L
    
    /**
     * 이미지 처리 및 객체 감지 수행
     */
    override fun process(image: ImageProxy, onResult: (Any) -> Unit) {
        // 모델이 로드되지 않았거나 이미 처리 중인 경우 스킵
        if (!modelFactory.isModelLoaded(modelName) || isProcessing.getAndSet(true)) {
            image.close()
            return
        }
        
        frameStartTime = System.currentTimeMillis()
        
        inferenceExecutor.execute {
            try {
                // 이미지 변환
                val bitmap = getCachedBitmap(image.width, image.height)
                imageConverter.convert(image, bitmap)
                
                // 모델 가져오기
                val interpreter = modelFactory.getInterpreter(modelName)
                if (interpreter == null) {
                    isProcessing.set(false)
                    image.close()
                    return@execute
                }
                
                // 인풋 사이즈 계산 (모델마다 다를 수 있음)
                val inputSize = 300 // 기본값, 모델에 따라 조정 필요
                
                // 입력 텐서 준비
                val resizedBitmap = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, false)
                val inputBuffer = prepareInputBuffer(resizedBitmap, inputSize)
                
                // 출력 텐서 준비
                val outputLocations = Array(1) { Array(10) { FloatArray(4) } }
                val outputClasses = Array(1) { FloatArray(10) }
                val outputScores = Array(1) { FloatArray(10) }
                val numDetections = FloatArray(1)
                
                val outputs = mapOf(
                    0 to outputLocations,
                    1 to outputClasses,
                    2 to outputScores,
                    3 to numDetections
                )
                
                // 추론 실행
                interpreter.runForMultipleInputsOutputs(arrayOf(inputBuffer), outputs)
                
                // 결과 변환
                val labels = modelFactory.getLabels(labelName)
                val detectionResults = processDetectionResults(
                    outputLocations,
                    outputClasses,
                    outputScores,
                    numDetections,
                    labels,
                    image.width,
                    image.height
                )
                
                // 성능 통계 업데이트
                updatePerformanceStats()
                
                // 메인 스레드에서 결과 전달
                Handler(Looper.getMainLooper()).post {
                    onResult(detectionResults)
                    isProcessing.set(false)
                }
            } catch (e: Exception) {
                Log.e(TAG, "이미지 처리 중 오류 발생", e)
                isProcessing.set(false)
            } finally {
                image.close()
            }
        }
    }
    
    /**
     * 입력 버퍼 준비
     */
    private fun prepareInputBuffer(bitmap: Bitmap, inputSize: Int): ByteBuffer {
        val inputBuffer = ByteBuffer.allocateDirect(1 * inputSize * inputSize * 3 * 4)
        inputBuffer.order(ByteOrder.nativeOrder())
        inputBuffer.rewind()
        
        // 비트맵을 ByteBuffer로 변환
        val pixels = IntArray(inputSize * inputSize)
        bitmap.getPixels(pixels, 0, inputSize, 0, 0, inputSize, inputSize)
        
        for (pixel in pixels) {
            // RGB 채널별로 정규화 (0~1)
            inputBuffer.putFloat(((pixel shr 16) and 0xFF) / 255.0f)
            inputBuffer.putFloat(((pixel shr 8) and 0xFF) / 255.0f)
            inputBuffer.putFloat((pixel and 0xFF) / 255.0f)
        }
        
        return inputBuffer
    }
    
    /**
     * 감지 결과 처리
     */
    private fun processDetectionResults(
        outputLocations: Array<Array<FloatArray>>,
        outputClasses: Array<FloatArray>,
        outputScores: Array<FloatArray>,
        numDetections: FloatArray,
        labels: List<String>,
        imageWidth: Int,
        imageHeight: Int
    ): List<DetectionResult> {
        val detectionResults = mutableListOf<DetectionResult>()
        val numDetected = numDetections[0].toInt()
        
        for (i in 0 until numDetected) {
            val score = outputScores[0][i]
            // 임계값 이상인 결과만 선택
            if (score >= 0.5f) {
                val classIndex = outputClasses[0][i].toInt()
                val label = if (classIndex < labels.size) labels[classIndex] else "Unknown"
                
                // 위치 변환 (좌표 변환)
                val location = outputLocations[0][i]
                val boundingBox = RectF(
                    location[1] * imageWidth,
                    location[0] * imageHeight,
                    location[3] * imageWidth,
                    location[2] * imageHeight
                )
                
                detectionResults.add(
                    DetectionResult(score, label, boundingBox)
                )
            }
        }
        
        return detectionResults
    }
    
    /**
     * 성능 통계 업데이트
     */
    private fun updatePerformanceStats() {
        val inferenceTime = System.currentTimeMillis() - frameStartTime
        
        // 평균 추론 시간 계산 (이동 평균)
        if (frameCount == 0) {
            averageInferenceTime = inferenceTime
        } else {
            averageInferenceTime = (averageInferenceTime * frameCount + inferenceTime) / (frameCount + 1)
        }
        
        frameCount++
    }
    
    /**
     * 성능 지표 가져오기
     */
    fun getPerformanceStats(): PerformanceStats {
        return PerformanceStats(averageInferenceTime)
    }
    
    /**
     * 비트맵 재사용을 위한 캐싱 기법
     */
    private fun getCachedBitmap(width: Int, height: Int): Bitmap {
        return cachedBitmap?.let {
            if (it.width == width && it.height == height) it
            else Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888).also { newBitmap ->
                cachedBitmap = newBitmap
            }
        } ?: Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888).also {
            cachedBitmap = it
        }
    }
    
    /**
     * 리소스 해제
     */
    override fun shutdown() {
        inferenceExecutor.shutdown()
        cachedBitmap?.recycle()
        cachedBitmap = null
    }
    
    /**
     * 성능 통계 데이터 클래스
     */
    data class PerformanceStats(val averageInferenceTime: Long)
} 
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
                    outputLocations[0],
                    outputClasses[0],
                    outputScores[0],
                    numDetections[0].toInt(),
                    labels,
                    image.width,
                    image.height,
                    inputSize
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
     * 객체 감지 결과 처리
     */
    private fun processDetectionResults(
        locations: Array<FloatArray>,
        classes: FloatArray,
        scores: FloatArray,
        numDetections: Int,
        labels: List<String>,
        imageWidth: Int,
        imageHeight: Int,
        inputSize: Int
    ): List<DetectionResult> {
        val detectionResults = mutableListOf<DetectionResult>()
        
        for (i in 0 until numDetections) {
            // 신뢰도가 너무 낮으면 스킵
            if (scores[i] < 0.5f) continue
            
            // 바운딩 박스 좌표 변환
            val bbox = locations[i]
            val top = bbox[0] * imageHeight
            val left = bbox[1] * imageWidth
            val bottom = bbox[2] * imageHeight
            val right = bbox[3] * imageWidth
            
            // 클래스 인덱스 및 레이블
            val classIndex = classes[i].toInt()
            val label = if (classIndex < labels.size) labels[classIndex] else "Unknown"
            
            // 결과 객체 생성
            val result = DetectionResult(
                score = scores[i],
                label = label,
                boundingBox = RectF(left, top, right, bottom)
            )
            
            detectionResults.add(result)
        }
        
        return detectionResults
    }
    
    /**
     * 입력 버퍼 준비
     */
    private fun prepareInputBuffer(bitmap: Bitmap, inputSize: Int): ByteBuffer {
        val byteBuffer = ByteBuffer.allocateDirect(4 * inputSize * inputSize * 3)
        byteBuffer.order(ByteOrder.nativeOrder())
        
        val pixels = IntArray(inputSize * inputSize)
        bitmap.getPixels(pixels, 0, inputSize, 0, 0, inputSize, inputSize)
        
        var pixel = 0
        for (i in 0 until inputSize) {
            for (j in 0 until inputSize) {
                val pixelValue = pixels[pixel++]
                
                // BGR 순서로 변환 (모델에 따라 다를 수 있음)
                byteBuffer.putFloat(((pixelValue shr 16) and 0xFF) / 255.0f)
                byteBuffer.putFloat(((pixelValue shr 8) and 0xFF) / 255.0f)
                byteBuffer.putFloat((pixelValue and 0xFF) / 255.0f)
            }
        }
        
        return byteBuffer
    }
    
    /**
     * 메모리 재사용을 위한 비트맵 캐시
     */
    private fun getCachedBitmap(width: Int, height: Int): Bitmap {
        if (cachedBitmap == null || cachedBitmap!!.width != width || cachedBitmap!!.height != height) {
            cachedBitmap?.recycle()
            cachedBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        }
        return cachedBitmap!!
    }
    
    /**
     * 성능 통계 업데이트
     */
    private fun updatePerformanceStats() {
        val inferenceTime = System.currentTimeMillis() - frameStartTime
        
        // 추론 시간 기록
        modelFactory.recordInferenceTime(modelName, inferenceTime)
        
        // 평균 추론 시간 계산 (이동 평균)
        if (frameCount == 0) {
            averageInferenceTime = inferenceTime
        } else {
            averageInferenceTime = (averageInferenceTime * frameCount + inferenceTime) / (frameCount + 1)
        }
        
        frameCount++
    }
    
    /**
     * 리소스 해제
     */
    override fun shutdown() {
        inferenceExecutor.shutdown()
        cachedBitmap?.recycle()
        cachedBitmap = null
    }
} 
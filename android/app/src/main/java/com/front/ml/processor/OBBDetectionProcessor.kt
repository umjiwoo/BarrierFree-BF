package com.front.ml.processor

import android.graphics.Bitmap
import android.graphics.PointF
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.camera.core.ImageProxy
import com.front.ml.TFLiteModelFactory
import com.front.ml.converter.ImageConverter
import com.front.ml.converter.ModelInputConverter
import java.nio.ByteBuffer
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.cos
import kotlin.math.sin

/**
 * 회전된 바운딩 박스 감지를 위한 이미지 프로세서
 * YOLOv8 OBB 모델을 사용하여 객체 감지 수행
 */
class OBBDetectionProcessor(
    private val modelFactory: TFLiteModelFactory,
    private val modelName: String,
    private val labelName: String,
    private val imageConverter: ImageConverter,
    private val confidenceThreshold: Float = 0.5f
) : ImageProcessor {
    companion object {
        private const val TAG = "OBBDetectionProcessor"
        
        // YOLO 모델 출력 인덱스 (insight_.md 명세 기준)
        private const val CENTER_X_INDEX = 0
        private const val CENTER_Y_INDEX = 1
        private const val WIDTH_INDEX = 2
        private const val HEIGHT_INDEX = 3
        private const val CONFIDENCE_INDEX = 4
        private const val ANGLE_INDEX = 5
        private const val OUTPUT_DIMENSIONS = 6  // 출력 차원 수 (x, y, w, h, conf, angle)
    }
    
    // 추론 실행 스레드
    private val inferenceExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private val isProcessing = AtomicBoolean(false)
    
    // 모델 입력 변환기
    private val modelInputConverter = ModelInputConverter()
    
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
                
                // 모델 입력 준비 (insight_.md 명세 기준)
                val inputBuffer = modelInputConverter.convertBitmapToBuffer(bitmap, false)
                
                // 출력 텐서 준비 - [1, 6, 8400] 크기 (insight_.md 명세 기준)
                val outputShape = interpreter.getOutputTensor(0).shape()
                val numDetections = outputShape[2]  // 8400개의 감지 후보
                
                val outputBuffer = Array(1) { Array(OUTPUT_DIMENSIONS) { FloatArray(numDetections) } }
                
                // 추론 실행
                interpreter.run(inputBuffer, outputBuffer)
                
                // 결과 변환
                val labels = modelFactory.getLabels(labelName)
                val detectionResults = processOBBDetectionResults(
                    outputBuffer[0],
                    labels,
                    image.width,
                    image.height,
                    confidenceThreshold
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
     * OBB 감지 결과 처리
     */
    private fun processOBBDetectionResults(
        outputData: Array<FloatArray>,
        labels: List<String>,
        imageWidth: Int,
        imageHeight: Int,
        confidenceThreshold: Float
    ): List<DetectionResult> {
        val detectionResults = mutableListOf<DetectionResult>()
        val numDetections = outputData[0].size  // 8400개의 감지 후보
        
        // 각 감지 결과 처리
        for (i in 0 until numDetections) {
            val confidence = outputData[CONFIDENCE_INDEX][i]
            
            // 임계값 이상인 결과만 선택
            if (confidence >= confidenceThreshold) {
                // 클래스 인덱스 결정 (여기선 모든 결과가 같은 클래스로 가정)
                // 실제 코드에서는 모델 출력에 따라 클래스 인덱스 결정 필요
                val classIndex = 0
                val label = if (classIndex < labels.size) labels[classIndex] else "Unknown"
                
                // 좌표 변환 (모델 출력 -> 픽셀 좌표)
                val centerX = outputData[CENTER_X_INDEX][i] * imageWidth
                val centerY = outputData[CENTER_Y_INDEX][i] * imageHeight
                val width = outputData[WIDTH_INDEX][i] * imageWidth
                val height = outputData[HEIGHT_INDEX][i] * imageHeight
                val angle = outputData[ANGLE_INDEX][i]  // 라디안 단위
                
                // 회전된 바운딩 박스 코너 포인트 계산
                val corners = calculateCornerPoints(centerX, centerY, width, height, angle)
                
                // 감지 결과 추가
                detectionResults.add(
                    DetectionResult.fromRotatedBox(
                        confidence,
                        label,
                        centerX,
                        centerY,
                        width,
                        height,
                        angle
                    )
                )
            }
        }
        
        // 비최대 억제(NMS) 적용
        return applyNonMaxSuppression(detectionResults, 0.5f)
    }
    
    /**
     * 회전된 사각형의 코너 포인트 계산
     */
    private fun calculateCornerPoints(
        centerX: Float,
        centerY: Float,
        width: Float,
        height: Float,
        angleRadians: Float
    ): List<PointF> {
        val cosTheta = cos(angleRadians)
        val sinTheta = sin(angleRadians)
        
        val halfWidth = width / 2
        val halfHeight = height / 2
        
        // 원점 중심의 코너 포인트 (시계방향: 좌상단, 우상단, 우하단, 좌하단)
        val corners = arrayOf(
            PointF(-halfWidth, -halfHeight),
            PointF(halfWidth, -halfHeight),
            PointF(halfWidth, halfHeight),
            PointF(-halfWidth, halfHeight)
        )
        
        // 회전 및 이동 적용
        val rotatedCorners = mutableListOf<PointF>()
        for (corner in corners) {
            val x = corner.x * cosTheta - corner.y * sinTheta + centerX
            val y = corner.x * sinTheta + corner.y * cosTheta + centerY
            rotatedCorners.add(PointF(x, y))
        }
        
        return rotatedCorners
    }
    
    /**
     * 비최대 억제(NMS) 적용
     */
    private fun applyNonMaxSuppression(
        detections: List<DetectionResult>,
        iouThreshold: Float
    ): List<DetectionResult> {
        // 신뢰도 기준 내림차순 정렬
        val sortedDetections = detections.sortedByDescending { it.score }
        val selected = mutableListOf<DetectionResult>()
        
        val used = BooleanArray(sortedDetections.size) { false }
        
        for (i in sortedDetections.indices) {
            if (used[i]) continue
            
            selected.add(sortedDetections[i])
            
            for (j in i + 1 until sortedDetections.size) {
                if (used[j]) continue
                
                // 회전된 박스 간 IoU 계산
                val iou = calculateOBBIoU(sortedDetections[i], sortedDetections[j])
                
                if (iou > iouThreshold) {
                    used[j] = true
                }
            }
        }
        
        return selected
    }
    
    /**
     * 회전된 바운딩 박스 간 IoU 계산
     * Polygon 교차 영역 계산을 통해 구현
     */
    private fun calculateOBBIoU(box1: DetectionResult, box2: DetectionResult): Float {
        // 각 박스의 코너 포인트 가져오기
        val corners1 = box1.corners ?: return 0f
        val corners2 = box2.corners ?: return 0f
        
        // 다각형 교차 영역 계산
        // 실제 구현은 다각형 클리핑 알고리즘이 필요하므로 간소화된 근사치 반환
        // TODO: 정확한 다각형 교차 알고리즘 구현
        
        // 근사치로 중심점 간 거리와 크기 비율 사용
        val center1 = box1.getCenter()
        val center2 = box2.getCenter()
        
        val centerDistance = Math.sqrt(
            Math.pow((center1.x - center2.x).toDouble(), 2.0) +
            Math.pow((center1.y - center2.y).toDouble(), 2.0)
        ).toFloat()
        
        val (width1, height1) = box1.getSize()
        val (width2, height2) = box2.getSize()
        
        val maxDim = Math.max(
            Math.max(width1, height1),
            Math.max(width2, height2)
        )
        
        // 중심점이 가까울수록, 크기가 비슷할수록 IoU가 높음
        return Math.max(0f, 1f - centerDistance / maxDim)
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
     * 리소스 해제
     */
    override fun shutdown() {
        inferenceExecutor.shutdown()
        cachedBitmap?.recycle()
        cachedBitmap = null
    }
} 
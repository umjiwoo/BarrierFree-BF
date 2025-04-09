package com.front.idcarddetecterplugin

import android.graphics.*
import android.media.Image
import android.util.Log
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import java.util.ArrayList
import kotlin.math.roundToInt
import kotlin.math.abs
import kotlin.math.pow
import kotlin.math.sqrt
import kotlin.math.min
import kotlin.math.max
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.io.FileInputStream
import java.io.IOException
import java.nio.channels.FileChannel
import android.content.Context
import android.os.SystemClock
import java.io.File
// CameraX 관련 임포트
// import androidx.camera.core.ImageProxy
// import java.lang.RuntimeException

// TensorFlow Lite 관련 import
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil

// ===== 데이터 모델 클래스 =====
/**
 * 객체 감지 박스 정보를 담는 데이터 클래스
 */
data class DetectionBox(
    val cx: Float,
    val cy: Float,
    val width: Float,
    val height: Float,
    val confidence: Float,
    val angle: Float
)

/**
 * 이미지 패딩 정보를 담는 데이터 클래스
 */
data class PaddingInfo(
    val bitmap: Bitmap,
    val paddingLeft: Float,
    val paddingTop: Float, 
    val scale: Float
)

// ===== YUV에서 RGB로 변환 처리 클래스 =====
/**
 * YUV_420_888 이미지를 RGB 비트맵으로 변환하는 클래스
 */
class YuvRgbConverter {
    companion object {
        private const val TAG = "YuvRgbConverter"
    }
    
    // YUV_420_888 -> RGB Bitmap 변환
    fun yuv420ToBitmap(image: Image): Bitmap {
        val width = image.width
        val height = image.height
        
        val yBuffer = image.planes[0].buffer
        val uBuffer = image.planes[1].buffer
        val vBuffer = image.planes[2].buffer
        
        val yRowStride = image.planes[0].rowStride
        val yPixelStride = image.planes[0].pixelStride
        val uRowStride = image.planes[1].rowStride
        val uPixelStride = image.planes[1].pixelStride
        val vRowStride = image.planes[2].rowStride
        val vPixelStride = image.planes[2].pixelStride
        
        // BT.601 표준에 따른 RGB 변환
        val output = IntArray(width * height)
        
        // 변환 시작
        val startTime = System.currentTimeMillis()
        
        // 중간 버퍼를 사용하여 반복 최소화
        val bufferSize = width * height * 3
        
        // YUV를 효율적으로 RGB로 변환
        for (y in 0 until height) {
            for (x in 0 until width) {
                val yIndex = y * yRowStride + x * yPixelStride
                
                // U/V 채널은 2x2 픽셀당 하나씩 저장 (서브샘플링)
                val uvx = x / 2
                val uvy = y / 2
                
                val uIndex = uvy * uRowStride + uvx * uPixelStride
                val vIndex = uvy * vRowStride + uvx * vPixelStride
                
                // Y, U, V 값 가져오기
                val yValue = yBuffer.get(yIndex).toInt() and 0xFF
                val uValue = (uBuffer.get(uIndex).toInt() and 0xFF) - 128
                val vValue = (vBuffer.get(vIndex).toInt() and 0xFF) - 128
                
                // BT.601 표준 변환 공식 사용
                val yScaled = 1.164f * (yValue - 16)
                var r = (yScaled + 1.596f * vValue).toInt()
                var g = (yScaled - 0.813f * vValue - 0.391f * uValue).toInt()
                var b = (yScaled + 2.018f * uValue).toInt()
                
                // 범위 조정
                r = r.coerceIn(0, 255)
                g = g.coerceIn(0, 255)
                b = b.coerceIn(0, 255)
                
                // ARGB 포맷으로 결합 (알파는 불투명)
                output[y * width + x] = 0xFF000000.toInt() or (r shl 16) or (g shl 8) or b
            }
        }
        
        val endTime = System.currentTimeMillis()
        Log.d(TAG, "YUV -> RGB 변환 시간: ${endTime - startTime}ms")
        
        return Bitmap.createBitmap(output, width, height, Bitmap.Config.ARGB_8888)
    }
}

// ===== 이미지 처리 클래스 =====
/**
 * 이미지 처리 기능을 제공하는 클래스
 */
class ImageProcessor {
    companion object {
        private const val TAG = "ImageProcessor"
    }
    
    // 비트맵을 정사각형으로 패딩하고 크기 조정
    fun padToSquare(bitmap: Bitmap, targetSize: Int): PaddingInfo {
        val width = bitmap.width
        val height = bitmap.height

        if (width == targetSize && height == targetSize) {
            return PaddingInfo(
                bitmap = bitmap,
                paddingLeft = 0f,
                paddingTop = 0f,
                scale = 1f
            )
        }

        val outputBitmap = Bitmap.createBitmap(targetSize, targetSize, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(outputBitmap)
        canvas.drawColor(Color.BLACK)

        val scale: Float
        val left: Float
        val top: Float

        if (width > height) {
            scale = targetSize.toFloat() / width
            left = 0f
            top = (targetSize - height * scale) / 2f
        } else {
            scale = targetSize.toFloat() / height
            top = 0f
            left = (targetSize - width * scale) / 2f
        }

        val scaledWidth = width * scale
        val scaledHeight = height * scale
        val srcRect = Rect(0, 0, width, height)
        val destRect = RectF(left, top, left + scaledWidth, top + scaledHeight)

        val paint = Paint().apply {
            isAntiAlias = true
            isFilterBitmap = true
            isDither = true
        }
        canvas.drawBitmap(bitmap, srcRect, destRect, paint)

        return PaddingInfo(
            bitmap = outputBitmap,
            paddingLeft = if (width > height) 0f else (targetSize - width * scale) / 2f,
            paddingTop = if (width > height) (targetSize - height * scale) / 2f else 0f,
            scale = scale
        )
    }
    
    // 회전된 박스의 코너 좌표 계산
    fun calculateObbCorners(cx: Double, cy: Double, w: Double, h: Double, theta: Double): List<Map<String, Double>> {
        val corners = mutableListOf<Map<String, Double>>()
        
        // 회전 전 중심점 기준 4개 코너 위치
        val offsets = listOf(
            Pair(w/2, h/2),   // 우상단
            Pair(-w/2, h/2),  // 좌상단
            Pair(-w/2, -h/2), // 좌하단
            Pair(w/2, -h/2)   // 우하단
        )
        
        // 각 코너에 회전 적용
        for ((dx, dy) in offsets) {
            // 회전 변환
            val rx = dx * Math.cos(theta) - dy * Math.sin(theta)
            val ry = dx * Math.sin(theta) + dy * Math.cos(theta)
            
            // 중심점으로 이동
            val x = cx + rx
            val y = cy + ry
            
            corners.add(mapOf("x" to x, "y" to y))
        }
        
        return corners
    }
}

// ===== TensorFlow Lite 모델 처리 클래스 =====
/**
 * TensorFlow Lite 모델을 로드하고 관리하는 클래스
 */
class TfliteModelHandler(private val context: Context) {
    companion object {
        private const val TAG = "TfliteModelHandler"
        private const val MODEL_FILENAME = "b32.tflite"
    }
    
    var interpreter: Interpreter? = null
    var isInitialized = false
    
    init {
        try {
            loadModel()
        } catch (e: Exception) {
            Log.e(TAG, "TFLite 초기화 실패", e)
        }
    }
    
    // 모델 로드
    private fun loadModel() {
        try {
            // 모델 파일 로드
            val modelFile = FileUtil.loadMappedFile(context, MODEL_FILENAME)
            
            // 인터프리터 옵션 설정
            val options = Interpreter.Options()
            options.setNumThreads(4) // CPU 스레드 수 설정
            
            // 인터프리터 생성
            interpreter = Interpreter(modelFile, options)
            isInitialized = true
            Log.d(TAG, "TFLite 모델 로드 성공: $MODEL_FILENAME")
        } catch (e: Exception) {
            Log.e(TAG, "TFLite 모델 로드 실패: ${e.message}", e)
            isInitialized = false
        }
    }
    
    // 입력 버퍼 준비
    fun prepareInputBuffer(bitmap: Bitmap, inputSize: Int): ByteBuffer {
        val inputBuffer = ByteBuffer.allocateDirect(1 * inputSize * inputSize * 3 * 4) // NCHW 형식, float32
        inputBuffer.order(ByteOrder.nativeOrder())
        
        val pixels = IntArray(inputSize * inputSize)
        bitmap.getPixels(pixels, 0, inputSize, 0, 0, inputSize, inputSize)
        
        // 정규화 및 RGB 값 추출
        for (i in 0 until inputSize * inputSize) {
            val pixel = pixels[i]
            // ARGB에서 RGB 추출 후 정규화 (0-1 범위)
            val r = ((pixel shr 16) and 0xFF) / 255.0f
            val g = ((pixel shr 8) and 0xFF) / 255.0f
            val b = (pixel and 0xFF) / 255.0f
            
            // RGB 채널 입력 (YOLOv8 모델의 입력 형식에 맞게)
            inputBuffer.putFloat(r)
            inputBuffer.putFloat(g)
            inputBuffer.putFloat(b)
        }
        
        inputBuffer.rewind() // 버퍼 위치 초기화
        return inputBuffer
    }
    
    // 리소스 해제
    fun close() {
        try {
            interpreter?.close()
            interpreter = null
            isInitialized = false
        } catch (e: Exception) {
            Log.e(TAG, "인터프리터 해제 중 오류", e)
        }
    }
}

// ===== 객체 감지 처리 클래스 =====
/**
 * 객체 감지 결과를 처리하는 클래스
 */
class DetectionProcessor {
    companion object {
        private const val TAG = "DetectionProcessor"
        const val NMS_IOU_THRESHOLD = 0.45f // NMS IoU 임계값 - public으로 변경
    }
    
    // NMS를 위한 IoU 계산
    fun calculateObbIoU(box1: DetectionBox, box2: DetectionBox): Float {
        // 두 박스가 충분히 가까운지 중심점 거리로 빠르게 확인
        val centerDist = sqrt(
            (box1.cx - box2.cx).pow(2) + (box1.cy - box2.cy).pow(2)
        )
        
        // 중심점이 너무 멀면 바로 0 반환 (최적화)
        val maxDist = max(box1.width, box1.height) + max(box2.width, box2.height)
        if (centerDist > maxDist) return 0f
        
        // 간소화된 방법: 중심점 거리와 크기 유사성 기반 IoU 근사치 계산
        val area1 = box1.width * box1.height
        val area2 = box2.width * box2.height
        val sizeSimilarity = min(area1, area2) / max(area1, area2)
        
        val angleDiff = abs(box1.angle - box2.angle)
        val angleSimilarity = 1f - min(angleDiff, Math.PI.toFloat() - angleDiff) / (Math.PI.toFloat() / 2f)
        
        // 거리, 크기, 각도를 고려한 종합 점수
        val distRatio = min(1f, max(0f, 1f - centerDist / maxDist))
        return distRatio * 0.6f + sizeSimilarity * 0.3f + angleSimilarity * 0.1f
    }
    
    // Non-Maximum Suppression 적용
    fun applyNMS(boxes: List<DetectionBox>): List<DetectionBox> {
        if (boxes.isEmpty()) return emptyList()
        
        // 신뢰도 내림차순으로 정렬
        val sortedBoxes = boxes.sortedByDescending { it.confidence }
        val isSelected = BooleanArray(sortedBoxes.size) { false }
        val selectedBoxes = mutableListOf<DetectionBox>()
        
        for (i in sortedBoxes.indices) {
            if (isSelected[i]) continue
            
            selectedBoxes.add(sortedBoxes[i])
            isSelected[i] = true
            
            for (j in i + 1 until sortedBoxes.size) {
                if (isSelected[j]) continue
                
                val iou = calculateObbIoU(sortedBoxes[i], sortedBoxes[j])
                if (iou > NMS_IOU_THRESHOLD) {
                    isSelected[j] = true // 중복 마킹
                }
            }
        }
        
        return selectedBoxes
    }
}

// ===== 메인 플러그인 클래스 =====
/**
 * Vision Camera 프레임 프로세서 플러그인의 메인 클래스
 */
class IdcardDetecterPluginPlugin(
    private val proxy: VisionCameraProxy,
    options: Map<String, Any>?
) : FrameProcessorPlugin() {

    companion object {
        private const val TAG = "IdcardDetecterPlugin"
        private const val INPUT_SIZE = 640 // 모델 입력 크기
        private const val NUM_CLASSES = 1 // 클래스 수
        private const val NUM_OUTPUTS = 6 // 출력 값 수 (cx, cy, w, h, conf, angle)
        private const val MAX_DETECTIONS = 8400 // 최대 감지 수
        private const val CONFIDENCE_THRESHOLD = 0.90f // 신뢰도 임계값
    }
    
    // 컴포넌트 초기화
    private val tfliteHandler = TfliteModelHandler(proxy.context)
    private val yuvConverter = YuvRgbConverter()
    private val imageProcessor = ImageProcessor()
    private val detectionProcessor = DetectionProcessor()
    
    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        try {
            // 인터프리터 초기화 확인
            if (!tfliteHandler.isInitialized || tfliteHandler.interpreter == null) {
                Log.e(TAG, "TFLite가 초기화되지 않음")
                return null
            }
            
            val image = frame.image ?: return null

            // 이미지 포맷 확인 (YUV_420_888만 지원)
            if (image.format != ImageFormat.YUV_420_888) {
                Log.e(TAG, "Unsupported image format: ${image.format}")
                return null
            }

            // YUV 이미지 정보 로깅
            val yPlane = image.planes[0]
            val uPlane = image.planes[1]
            val vPlane = image.planes[2]
            
            Log.d(TAG, "YUV 이미지 정보: 크기=${image.width}x${image.height}, 포맷=${image.format}")
            Log.d(TAG, "YUV 플레인 정보: Y(행간격=${yPlane.rowStride}, 픽셀간격=${yPlane.pixelStride}), " +
                      "U(행간격=${uPlane.rowStride}, 픽셀간격=${uPlane.pixelStride}), " +
                      "V(행간격=${vPlane.rowStride}, 픽셀간격=${vPlane.pixelStride})")
            
            // 프레임 방향 정보
            val orientationEnum = frame.orientation
            val orientation = orientationEnum?.toString() ?: "landscape-right"
            Log.d(TAG, "프레임 방향: $orientation")
            
            // 성능 측정 시작
            val startTime = System.currentTimeMillis()

            // 1. YUV -> RGB Bitmap
            val rgbBitmap = yuvConverter.yuv420ToBitmap(image)
            
            // 원본 이미지 크기 저장
            val originalWidth = image.width
            val originalHeight = image.height
            
            // 2. 패딩/리사이즈 640x640
            val paddingInfo = imageProcessor.padToSquare(rgbBitmap, INPUT_SIZE)
            val paddedBitmap = paddingInfo.bitmap
            rgbBitmap.recycle()
            
            // 3. 모델 입력 버퍼 준비
            val inputBuffer = tfliteHandler.prepareInputBuffer(paddedBitmap, INPUT_SIZE)
            
            // 모델 출력 텐서 shape 로깅
            val outputShape = tfliteHandler.interpreter?.getOutputTensor(0)?.shape()
            Log.d(TAG, "모델 출력 텐서 shape: ${outputShape?.contentToString()}")
            
            // 4. 출력 버퍼 준비 - 모델 출력 shape [1, 6, 8400]에 맞게 변경
            val outputBuffer = Array(1) { Array(6) { FloatArray(8400) } }
            
            // 5. 모델 실행
            val inferenceStartTime = SystemClock.elapsedRealtimeNanos()
            tfliteHandler.interpreter?.run(inputBuffer, outputBuffer)
            val inferenceEndTime = SystemClock.elapsedRealtimeNanos()
            val inferenceTime = (inferenceEndTime - inferenceStartTime) / 1_000_000 // ms 단위로 변환
            
            Log.d(TAG, "TFLite 추론 시간: ${inferenceTime}ms")
            
            // 패딩된 비트맵 리소스 해제
            paddedBitmap.recycle()

            // 6. 출력 처리 및 객체 감지 - 배열 구조가 변경되었으므로 접근 방식도 수정
            val rawOutputs = outputBuffer[0] // 원시 출력 [6][8400] 형태
            
            // 7. 신뢰도 기준으로 필터링하고 박스 정보 추출
            val detectionBoxes = mutableListOf<DetectionBox>()
            val filteredRawOutputs = mutableListOf<List<Double>>()
            
            for (i in 0 until MAX_DETECTIONS) {
                // 신뢰도는 5번째 값 (인덱스 4)
                val confidence = rawOutputs[4][i]
                
                if (confidence >= CONFIDENCE_THRESHOLD) {
                    // 정규화된 좌표 추출
                    val cx_norm = rawOutputs[0][i]
                    val cy_norm = rawOutputs[1][i]
                    val w_norm = rawOutputs[2][i]
                    val h_norm = rawOutputs[3][i]
                    
                    // 정규화된 좌표가 0~1 범위를 벗어나면 스킵
                    val x1_norm = cx_norm - (w_norm / 2F)
                    val y1_norm = cy_norm - (h_norm / 2F)
                    val x2_norm = cx_norm + (w_norm / 2F)
                    val y2_norm = cy_norm + (h_norm / 2F)
                    
                    if (x1_norm < 0F || x1_norm > 1F || y1_norm < 0F || y1_norm > 1F || 
                        x2_norm < 0F || x2_norm > 1F || y2_norm < 0F || y2_norm > 1F) {
                        Log.d(TAG, "유효하지 않은 좌표 스킵: [$x1_norm, $y1_norm, $x2_norm, $y2_norm]")
                        continue
                    }
                    
                    // 픽셀 좌표로 변환
                    val cx = cx_norm * INPUT_SIZE
                    val cy = cy_norm * INPUT_SIZE
                    val width = w_norm * INPUT_SIZE
                    val height = h_norm * INPUT_SIZE
                    
                    // 각도 처리 (개선된 방식)
                    var angle = rawOutputs[5][i]
                    val pi = Math.PI.toFloat()
                    
                    // 특정 각도 범위(0.5π ~ 0.75π)에서만 π를 빼는 조건부 처리
                    if (angle >= 0.5f * pi && angle <= 0.75f * pi) {
                        angle -= pi
                    }
                    
                    // 원시 출력값을 Double 리스트로 변환하여 저장
                    val outputValues = (0 until 6).map { rawOutputs[it][i].toDouble() }
                    filteredRawOutputs.add(outputValues)
                    
                    // 박스 추가
                    detectionBoxes.add(
                        DetectionBox(
                            cx = cx,
                            cy = cy,
                            width = width,
                            height = height,
                            confidence = confidence,
                            angle = angle
                        )
                    )
                }
            }
            
            // 감지된 박스 정보 로깅
            Log.d(TAG, "필터링 후 감지된 객체 수: ${detectionBoxes.size}, 필터 기준: $CONFIDENCE_THRESHOLD")
            
            // 8. NMS 적용
            val nmsBoxes = detectionProcessor.applyNMS(detectionBoxes)
            Log.d(TAG, "NMS 후 감지된 객체 수: ${nmsBoxes.size}, NMS 기준: ${DetectionProcessor.NMS_IOU_THRESHOLD}")
            
            // 9. 최종 결과를 Map으로 변환 (여기에 좌표 변환 로직 추가)
            val resultBoxes = nmsBoxes.map { box ->
                // 모델 출력 좌표 (640x640 기준)
                val modelCx = box.cx
                val modelCy = box.cy
                val modelWidth = box.width
                val modelHeight = box.height
                
                // 패딩 제거 및 스케일 역변환 (640x640 -> 원본 이미지 좌표)
                val unpaddedCx = (modelCx - paddingInfo.paddingLeft) / paddingInfo.scale
                val unpaddedCy = (modelCy - paddingInfo.paddingTop) / paddingInfo.scale
                val unpaddedWidth = modelWidth / paddingInfo.scale
                val unpaddedHeight = modelHeight / paddingInfo.scale
                
                // 방향 기반 좌표 조정 (제거: 프론트엔드에서 처리)
                // 원본 좌표를 그대로 전달하고 프론트엔드에서 방향에 따라 변환하도록 함
                val adjustedX = unpaddedCx
                val adjustedY = unpaddedCy
                
                // 회전된 코너 계산
                val modelCorners = imageProcessor.calculateObbCorners(
                    modelCx.toDouble(), 
                    modelCy.toDouble(), 
                    modelWidth.toDouble(), 
                    modelHeight.toDouble(), 
                    box.angle.toDouble()
                )
                
                // 코너 좌표도 동일하게 패딩 제거 및 스케일 역변환만 적용 (방향 변환은 제거)
                val adjustedCorners = modelCorners.map { corner ->
                    val unpaddedX = (corner["x"]!! - paddingInfo.paddingLeft) / paddingInfo.scale
                    val unpaddedY = (corner["y"]!! - paddingInfo.paddingTop) / paddingInfo.scale
                    
                    // 코너 좌표를 그대로 전달 (방향 변환 제거)
                    mapOf("x" to unpaddedX, "y" to unpaddedY)
                }
                
                // 변환 과정 로깅 (첫 번째 감지된 객체만)
                if (nmsBoxes.indexOf(box) == 0) {
                    Log.d(TAG, "좌표 변환: 모델(${modelCx}, ${modelCy}) -> 패딩제거(${unpaddedCx}, ${unpaddedCy}) -> 최종(${adjustedX}, ${adjustedY})")
                }
                
                mapOf(
                    // 원본 모델 출력 좌표 (디버깅용)
                    "modelCx" to modelCx.toDouble(),
                    "modelCy" to modelCy.toDouble(),
                    "modelWidth" to modelWidth.toDouble(),
                    "modelHeight" to modelHeight.toDouble(),
                    
                    // 변환된 최종 좌표 (client에서 바로 사용 가능)
                    "cx" to adjustedX.toDouble(),
                    "cy" to adjustedY.toDouble(),
                    "width" to unpaddedWidth.toDouble(),
                    "height" to unpaddedHeight.toDouble(),
                    
                    // 기타 정보
                    "confidence" to box.confidence.toDouble(),
                    "angle" to box.angle.toDouble(),
                    "angleDeg" to Math.toDegrees(box.angle.toDouble()),
                    "corners" to adjustedCorners
                )
            }
            
            // 객체 검출 결과 범위 확인
            if (resultBoxes.isNotEmpty()) {
                val minX = resultBoxes.minOfOrNull { (it["cx"] as Double) - (it["width"] as Double)/2 } ?: 0.0
                val maxX = resultBoxes.maxOfOrNull { (it["cx"] as Double) + (it["width"] as Double)/2 } ?: 0.0
                val minY = resultBoxes.minOfOrNull { (it["cy"] as Double) - (it["height"] as Double)/2 } ?: 0.0
                val maxY = resultBoxes.maxOfOrNull { (it["cy"] as Double) + (it["height"] as Double)/2 } ?: 0.0
                Log.d(TAG, "최종 객체 영역: x[$minX-$maxX], y[$minY-$maxY], 원본 이미지 크기: ${originalWidth}x${originalHeight}")
            }

            // 총 처리 시간 계산
            val totalTime = System.currentTimeMillis() - startTime
            Log.d(TAG, "총 처리 시간: ${totalTime}ms")
            
            // 10. 결과 반환
            return mapOf(
                "boxes" to resultBoxes,
                "rawOutputs" to filteredRawOutputs,
                "processingTimeMs" to totalTime.toInt(),
                "imageInfo" to mapOf(
                    "originalWidth" to originalWidth,
                    "originalHeight" to originalHeight,
                    "paddingLeft" to paddingInfo.paddingLeft.toDouble(),
                    "paddingTop" to paddingInfo.paddingTop.toDouble(),
                    "scale" to paddingInfo.scale.toDouble()
                ),
                "orientation" to orientation
            )

        } catch (e: Exception) {
            Log.e(TAG, "프레임 처리 오류", e)
            return null
        }
    }
    
    // 리소스 해제
    fun close() {
        tfliteHandler.close()
    }
}


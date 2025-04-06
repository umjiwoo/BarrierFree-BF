package com.front.idcarddetecterplugin.plugins

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ImageFormat
import android.os.SystemClock
import android.util.Log
import com.front.idcarddetecterplugin.models.DetectionBox
import com.front.idcarddetecterplugin.utils.ImageProcessor
import com.front.idcarddetecterplugin.utils.YuvRgbConverter
import com.front.idcarddetecterplugin.utils.TfliteModelHandler
import com.front.idcarddetecterplugin.utils.DetectionProcessor
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy

class IdcardDetecterPluginPlugin(
    private val proxy: VisionCameraProxy,
    options: Map<String, Any>?
) : FrameProcessorPlugin() {

    companion object {
        private const val TAG = "IdcardDetecterPlugin"
        private const val LOG_PREFIX = "[IdcardDetecterPluginPlugin] "
        private const val INPUT_SIZE = 640
        private const val MAX_DETECTIONS = 8400
        private const val CONFIDENCE_THRESHOLD = 0.90f

        fun create(proxy: VisionCameraProxy, options: Map<String, Any>?): IdcardDetecterPluginPlugin {
            return IdcardDetecterPluginPlugin(proxy, options)
        }
    }

    private val yuvConverter = YuvRgbConverter()
    private val imageProcessor = ImageProcessor()
    private val detectionProcessor = DetectionProcessor()

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        var imageInfo: Pair<Int, Int>? = null
        val image = frame.image
        
        try {
            val tfliteHandler = TfliteModelHandler.getInstance(proxy.context)
            tfliteHandler.loadModel()
            if (!tfliteHandler.isInitialized) return null

            if (image == null || image.format != ImageFormat.YUV_420_888) return null

            val orientation = frame.orientation?.toString() ?: "landscape-right"
            val startTime = System.currentTimeMillis()
            
            imageInfo = Pair(image.width, image.height)
            
            val rgbBitmap = yuvConverter.yuv420ToBitmap(image)
            
            try {
                image.close()
            } catch (e: Exception) {
                Log.w(TAG, "${LOG_PREFIX}이미지 닫기 무시됨: ${e.message}")
            }
            
            val config = rgbBitmap.config ?: Bitmap.Config.ARGB_8888
            val originalBitmap = Bitmap.createBitmap(rgbBitmap.width, rgbBitmap.height, config).apply {
                Canvas(this).drawBitmap(rgbBitmap, 0f, 0f, null)
            }
            
            val originalWidth = imageInfo.first
            val originalHeight = imageInfo.second

            val paddingInfo = imageProcessor.padToSquare(rgbBitmap, INPUT_SIZE)
            val paddedBitmap = paddingInfo.bitmap
            rgbBitmap.recycle()

            val inferenceStartTime = SystemClock.elapsedRealtimeNanos()
            val outputBuffer = tfliteHandler.runInference(paddedBitmap, INPUT_SIZE)
            val inferenceEndTime = SystemClock.elapsedRealtimeNanos()
            val inferenceTime = ((inferenceEndTime - inferenceStartTime) / 1_000_000).toDouble()
            paddedBitmap.recycle()

            if (outputBuffer == null) {
                Log.e(TAG, "${LOG_PREFIX}추론 결과가 null입니다.")
                return null
            }

            // 모델 출력 정보 로깅
            Log.d(TAG, "${LOG_PREFIX}모델 출력 배열 크기: [${outputBuffer.size}, ${outputBuffer[0].size}]")
            
            val rawOutputs = outputBuffer
            val detectionBoxes = mutableListOf<DetectionBox>()
            val filteredRawOutputs = mutableListOf<List<Double>>()

            for (i in 0 until MAX_DETECTIONS) {
                val confidence = rawOutputs[4][i]
                if (confidence >= CONFIDENCE_THRESHOLD) {
                    val cx = rawOutputs[0][i] * INPUT_SIZE
                    val cy = rawOutputs[1][i] * INPUT_SIZE
                    val w = rawOutputs[2][i] * INPUT_SIZE
                    val h = rawOutputs[3][i] * INPUT_SIZE
                    val angle = imageProcessor.normalizeAngle(rawOutputs[5][i])
                    filteredRawOutputs.add((0 until 6).map { rawOutputs[it][i].toDouble() })
                    detectionBoxes.add(DetectionBox(cx, cy, w, h, confidence, angle))
                    
                    // 높은 신뢰도의 첫 번째 감지 결과만 로깅
                    if (detectionBoxes.size == 1) {
                        Log.d(TAG, "${LOG_PREFIX}첫 번째 감지 결과: 좌표=(${cx.toInt()}, ${cy.toInt()}), " +
                                "크기=${w.toInt()}x${h.toInt()}, " +
                                "신뢰도=${String.format("%.2f", confidence)}, " +
                                "각도=${String.format("%.2f", Math.toDegrees(angle.toDouble()))}°")
                        
                        // 원시 출력값 확인 (정규화된 값)
                        Log.d(TAG, "${LOG_PREFIX}모델 원시 출력: " +
                                "cx=${rawOutputs[0][i]}, cy=${rawOutputs[1][i]}, " +
                                "w=${rawOutputs[2][i]}, h=${rawOutputs[3][i]}, " +
                                "conf=${rawOutputs[4][i]}, angle=${rawOutputs[5][i]}")
                    }
                }
            }
            
            // 감지된 객체 수 로깅
            Log.d(TAG, "${LOG_PREFIX}감지된 객체 수: ${detectionBoxes.size} (임계값: $CONFIDENCE_THRESHOLD)")
            
            val nmsBoxes = detectionProcessor.applyNMS(detectionBoxes)
            
            // NMS 이후 남은 객체 수 로깅
            Log.d(TAG, "${LOG_PREFIX}NMS 이후 남은 객체 수: ${nmsBoxes.size}")

            val resultBoxes = nmsBoxes.map { box ->
                val unpadCx = ((box.cx - paddingInfo.paddingLeft) / paddingInfo.scale).toDouble()
                val unpadCy = ((box.cy - paddingInfo.paddingTop) / paddingInfo.scale).toDouble()
                val unpadW = (box.width / paddingInfo.scale).toDouble()
                val unpadH = (box.height / paddingInfo.scale).toDouble()
                val modelCorners = imageProcessor.calculateObbCorners(
                    box.cx.toDouble(), box.cy.toDouble(),
                    box.width.toDouble(), box.height.toDouble(), box.angle.toDouble()
                )
                val unpaddedCorners = modelCorners.map {
                    mapOf(
                        "x" to ((it["x"]!! - paddingInfo.paddingLeft) / paddingInfo.scale).toDouble(),
                        "y" to ((it["y"]!! - paddingInfo.paddingTop) / paddingInfo.scale).toDouble()
                    )
                }
                val reordered = imageProcessor.reorderClockwiseTopLeftFirst(unpaddedCorners)
                
                // 결과 맵 생성
                val resultMap = mapOf(
                    "modelCx" to box.cx.toDouble(),
                    "modelCy" to box.cy.toDouble(),
                    "modelWidth" to box.width.toDouble(),
                    "modelHeight" to box.height.toDouble(),
                    "cx" to unpadCx,
                    "cy" to unpadCy,
                    "width" to unpadW,
                    "height" to unpadH,
                    "confidence" to box.confidence.toDouble(),
                    "angle" to box.angle.toDouble(),
                    "angleDeg" to Math.toDegrees(box.angle.toDouble()),
                    "corners" to reordered
                )
                
                // 원본 이미지에서 실제 위치 로깅
                Log.d(TAG, "${LOG_PREFIX}탐지 결과 (원본 이미지 좌표): " +
                        "중심=(${unpadCx.toInt()}, ${unpadCy.toInt()}), " +
                        "크기=${unpadW.toInt()}x${unpadH.toInt()}, " +
                        "신뢰도=${String.format("%.2f", box.confidence)}, " +
                        "각도=${String.format("%.2f", Math.toDegrees(box.angle.toDouble()))}°")
                
                // 코너 점 로깅
                Log.d(TAG, "${LOG_PREFIX}코너 점: [" +
                        "좌상=(${reordered[3]["x"]?.toInt()}, ${reordered[3]["y"]?.toInt()}), " +
                        "우상=(${reordered[0]["x"]?.toInt()}, ${reordered[0]["y"]?.toInt()}), " +
                        "우하=(${reordered[1]["x"]?.toInt()}, ${reordered[1]["y"]?.toInt()}), " +
                        "좌하=(${reordered[2]["x"]?.toInt()}, ${reordered[2]["y"]?.toInt()})]")
                
                // 정렬된 코너 순서가 시계방향임을 명시적으로 로깅
                Log.d(TAG, "${LOG_PREFIX}시계방향 코너 점(원시): [" +
                        "${reordered[0]["x"]?.toInt()},${reordered[0]["y"]?.toInt()} → " +
                        "${reordered[1]["x"]?.toInt()},${reordered[1]["y"]?.toInt()} → " +
                        "${reordered[2]["x"]?.toInt()},${reordered[2]["y"]?.toInt()} → " +
                        "${reordered[3]["x"]?.toInt()},${reordered[3]["y"]?.toInt()}]")
                
                resultMap
            }

            val croppedImageBase64 = resultBoxes.firstOrNull()?.let {
                try {
                    val boxForCrop = mapOf(
                        "cx" to (it["cx"] as? Double ?: (it["cx"] as? Float) ?: 0f).toFloat(),
                        "cy" to (it["cy"] as? Double ?: (it["cy"] as? Float) ?: 0f).toFloat(),
                        "width" to (it["width"] as? Double ?: (it["width"] as? Float) ?: 0f).toFloat(),
                        "height" to (it["height"] as? Double ?: (it["height"] as? Float) ?: 0f).toFloat(),
                        "angle" to (it["angle"] as? Double ?: (it["angle"] as? Float) ?: 0f).toFloat()
                    )
                    imageProcessor.cropImageToBox(originalBitmap, boxForCrop, 0.1f)?.let { cropped ->
                        val base64 = imageProcessor.bitmapToBase64(cropped)
                        cropped.recycle()
                        base64
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "${LOG_PREFIX}이미지 크롭 처리 중 오류 발생: ${e.message}", e)
                    null
                }
            }
            originalBitmap.recycle()

            val totalTime = System.currentTimeMillis() - startTime
            return mapOf(
                "boxes" to resultBoxes,
                "rawOutputs" to filteredRawOutputs,
                "processingTimeMs" to totalTime.toDouble(),
                "imageInfo" to mapOf(
                    "originalWidth" to originalWidth.toDouble(),
                    "originalHeight" to originalHeight.toDouble(),
                    "paddingLeft" to paddingInfo.paddingLeft.toDouble(),
                    "paddingTop" to paddingInfo.paddingTop.toDouble(),
                    "scale" to paddingInfo.scale.toDouble()
                ),
                "orientation" to orientation,
                "imageData" to croppedImageBase64
            )
        } catch (e: Exception) {
            Log.e(TAG, "${LOG_PREFIX}프레임 처리 오류", e)
            return null
        } finally {
            try {
                if (image?.planes != null) {
                    image.close()
                }
            } catch (e: Exception) {
                Log.w(TAG, "${LOG_PREFIX}이미지 리소스 해제 중 오류 무시: ${e.message}")
            }
        }
    }
}

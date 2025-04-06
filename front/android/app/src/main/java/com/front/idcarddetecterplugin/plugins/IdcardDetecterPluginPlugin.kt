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
        try {
            val tfliteHandler = TfliteModelHandler.getInstance(proxy.context)
            tfliteHandler.loadModel()
            if (!tfliteHandler.isInitialized) return null

            val image = frame.image ?: return null
            if (image.format != ImageFormat.YUV_420_888) return null

            val orientation = frame.orientation?.toString() ?: "landscape-right"
            val startTime = System.currentTimeMillis()

            val rgbBitmap = yuvConverter.yuv420ToBitmap(image)
            val config = rgbBitmap.config ?: Bitmap.Config.ARGB_8888
            val originalBitmap = Bitmap.createBitmap(rgbBitmap.width, rgbBitmap.height, config).apply {
                Canvas(this).drawBitmap(rgbBitmap, 0f, 0f, null)
            }
            val originalWidth = image.width
            val originalHeight = image.height

            val paddingInfo = imageProcessor.padToSquare(rgbBitmap, INPUT_SIZE)
            val paddedBitmap = paddingInfo.bitmap
            rgbBitmap.recycle()

            val inputBuffer = tfliteHandler.prepareInputBuffer(paddedBitmap, INPUT_SIZE)
            inputBuffer.rewind()

            val outputShape = tfliteHandler.interpreter.getOutputTensor(0).shape()
            val outputBuffer = Array(1) {
                Array(outputShape[1]) { FloatArray(outputShape[2]) }
            }

            val inferenceStartTime = SystemClock.elapsedRealtimeNanos()
            tfliteHandler.interpreter.run(inputBuffer, outputBuffer)
            val inferenceEndTime = SystemClock.elapsedRealtimeNanos()
            val inferenceTime = (inferenceEndTime - inferenceStartTime) / 1_000_000
            paddedBitmap.recycle()

            val rawOutputs = outputBuffer[0]
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
                }
            }

            val nmsBoxes = detectionProcessor.applyNMS(detectionBoxes)
            val resultBoxes = nmsBoxes.map { box ->
                val unpadCx = (box.cx - paddingInfo.paddingLeft) / paddingInfo.scale
                val unpadCy = (box.cy - paddingInfo.paddingTop) / paddingInfo.scale
                val unpadW = box.width / paddingInfo.scale
                val unpadH = box.height / paddingInfo.scale
                val modelCorners = imageProcessor.calculateObbCorners(
                    box.cx.toDouble(), box.cy.toDouble(),
                    box.width.toDouble(), box.height.toDouble(), box.angle.toDouble()
                )
                val unpaddedCorners = modelCorners.map {
                    mapOf(
                        "x" to ((it["x"]!! - paddingInfo.paddingLeft) / paddingInfo.scale),
                        "y" to ((it["y"]!! - paddingInfo.paddingTop) / paddingInfo.scale)
                    )
                }
                val reordered = imageProcessor.reorderClockwiseTopLeftFirst(unpaddedCorners)
                mapOf(
                    "modelCx" to box.cx,
                    "modelCy" to box.cy,
                    "modelWidth" to box.width,
                    "modelHeight" to box.height,
                    "cx" to unpadCx,
                    "cy" to unpadCy,
                    "width" to unpadW,
                    "height" to unpadH,
                    "confidence" to box.confidence.toDouble(),
                    "angle" to box.angle.toDouble(),
                    "angleDeg" to Math.toDegrees(box.angle.toDouble()),
                    "corners" to reordered
                )
            }

            val croppedImageBase64 = resultBoxes.firstOrNull()?.let {
                imageProcessor.cropImageToBox(originalBitmap, it, 0.1f)?.let { cropped ->
                    val base64 = imageProcessor.bitmapToBase64(cropped)
                    cropped.recycle()
                    base64
                }
            }
            originalBitmap.recycle()

            val totalTime = System.currentTimeMillis() - startTime
            return mapOf(
                "boxes" to resultBoxes,
                "rawOutputs" to filteredRawOutputs,
                "processingTimeMs" to totalTime,
                "imageInfo" to mapOf(
                    "originalWidth" to originalWidth,
                    "originalHeight" to originalHeight,
                    "paddingLeft" to paddingInfo.paddingLeft.toDouble(),
                    "paddingTop" to paddingInfo.paddingTop.toDouble(),
                    "scale" to paddingInfo.scale.toDouble()
                ),
                "orientation" to orientation,
                "imageData" to croppedImageBase64
            )
        } catch (e: Exception) {
            Log.e(TAG, "프레임 처리 오류", e)
            return null
        }
    }
}

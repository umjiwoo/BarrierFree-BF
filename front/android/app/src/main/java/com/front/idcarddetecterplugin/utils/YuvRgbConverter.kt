package com.front.idcarddetecterplugin.utils

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.ImageFormat
import android.media.Image
import android.util.Log

class YuvRgbConverter {
    companion object {
        private const val TAG = "YuvRgbConverter"
        private const val LOG_PREFIX = "[YuvRgbConverter] "
    }

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

        val output = IntArray(width * height)
        val startTime = System.currentTimeMillis()

        for (y in 0 until height) {
            for (x in 0 until width) {
                val yIndex = y * yRowStride + x * yPixelStride
                val uvx = x / 2
                val uvy = y / 2
                val uIndex = uvy * uRowStride + uvx * uPixelStride
                val vIndex = uvy * vRowStride + uvx * vPixelStride

                val yValue = yBuffer.get(yIndex).toInt() and 0xFF
                val uValue = (uBuffer.get(uIndex).toInt() and 0xFF) - 128
                val vValue = (vBuffer.get(vIndex).toInt() and 0xFF) - 128

                val yScaled = 1.164f * (yValue - 16)
                var r = (yScaled + 1.596f * vValue).toInt()
                var g = (yScaled - 0.813f * vValue - 0.391f * uValue).toInt()
                var b = (yScaled + 2.018f * uValue).toInt()

                r = r.coerceIn(0, 255)
                g = g.coerceIn(0, 255)
                b = b.coerceIn(0, 255)

                output[y * width + x] = 0xFF000000.toInt() or (r shl 16) or (g shl 8) or b
            }
        }
        val endTime = System.currentTimeMillis()
        Log.d(TAG, "${LOG_PREFIX}YUV -> RGB 변환 시간: ${endTime - startTime}ms")
        return Bitmap.createBitmap(output, width, height, Bitmap.Config.ARGB_8888)
    }
}
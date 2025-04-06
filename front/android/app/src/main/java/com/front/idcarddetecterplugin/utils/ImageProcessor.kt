package com.front.idcarddetecterplugin.utils

import android.graphics.*
import android.util.Base64
import android.util.Log
import com.front.idcarddetecterplugin.models.PaddingInfo
import java.io.ByteArrayOutputStream
import kotlin.math.*

class ImageProcessor {
    companion object {
        private const val TAG = "ImageProcessor"
    }

    fun padToSquare(bitmap: Bitmap, targetSize: Int): PaddingInfo {
        val width = bitmap.width.toDouble()
        val height = bitmap.height.toDouble()
        if (width == targetSize.toDouble() && height == targetSize.toDouble()) {
            return PaddingInfo(bitmap, 0f, 0f, 1f)
        }
        val outputBitmap = Bitmap.createBitmap(targetSize, targetSize, bitmap.config ?: Bitmap.Config.ARGB_8888)
        val canvas = Canvas(outputBitmap)
        canvas.drawColor(Color.BLACK)

        val (scale, left, top) = if (width > height) {
            Triple(targetSize / width, 0.0, (targetSize - height * (targetSize / width)) / 2.0)
        } else {
            Triple(targetSize / height, (targetSize - width * (targetSize / height)) / 2.0, 0.0)
        }
        val scaledWidth = width * scale
        val scaledHeight = height * scale
        val srcRect = Rect(0, 0, width.toInt(), height.toInt())
        val destRect = RectF(left.toFloat(), top.toFloat(), (left + scaledWidth).toFloat(), (top + scaledHeight).toFloat())
        val paint = Paint().apply {
            isAntiAlias = true
            isFilterBitmap = true
            isDither = true
        }
        canvas.drawBitmap(bitmap, srcRect, destRect, paint)
        val paddingLeft = if (width > height) 0f else ((targetSize - width * scale) / 2.0).toFloat()
        val paddingTop = if (width > height) ((targetSize - height * scale) / 2.0).toFloat() else 0f
        return PaddingInfo(outputBitmap, paddingLeft, paddingTop, scale.toFloat())
    }

    fun calculateObbCorners(cx: Double, cy: Double, w: Double, h: Double, theta: Double): List<Map<String, Double>> {
        val offsets = listOf(Pair(w / 2, h / 2), Pair(-w / 2, h / 2), Pair(-w / 2, -h / 2), Pair(w / 2, -h / 2))
        return offsets.map { (dx, dy) ->
            val rx = dx * cos(theta) - dy * sin(theta)
            val ry = dx * sin(theta) + dy * cos(theta)
            mapOf("x" to (cx + rx), "y" to (cy + ry))
        }
    }

    fun reorderClockwiseTopLeftFirst(points: List<Map<String, Double>>): List<Map<String, Double>> {
        if (points.size != 4) {
            Log.e(TAG, "코너 개수가 4개가 아닙니다: ${points.size}개")
            return points
        }
        return try {
            val sorted = points.sortedBy { it["y"]!! * 10000 + it["x"]!! }
            val topLeft = sorted.first()
            val cx = points.map { it["x"]!! }.average()
            val cy = points.map { it["y"]!! }.average()
            val clockwise = points.sortedBy {
                (Math.atan2(it["y"]!! - cy, it["x"]!! - cx) + 2 * Math.PI) % (2 * Math.PI)
            }
            val idx = clockwise.indexOfFirst { it == topLeft }
            val result = clockwise.drop(idx) + clockwise.take(idx)
            Log.d(TAG, "코너 정렬: 원본=$points -> 결과=$result")
            result
        } catch (e: Exception) {
            Log.e(TAG, "코너 정렬 중 오류 발생", e)
            points
        }
    }

    fun normalizeAngle(angle: Float): Float {
        val pi = Math.PI.toFloat()
        var result = angle
        while (result > pi) result -= 2 * pi
        while (result <= -pi) result += 2 * pi
        return result
    }

    private fun calculatePadding(width: Float, height: Float, paddingPercent: Float): Float {
        return min(width, height) * paddingPercent
    }

    fun cropImageToBox(bitmap: Bitmap, box: Map<String, Float>, paddingPercent: Float = 0.1f): Bitmap? {
        return try {
            val cx = box["cx"]!!
            val cy = box["cy"]!!
            val width = box["width"]!!
            val height = box["height"]!!
            val angle = box["angle"]!!
            if (abs(angle) < 0.01f) {
                cropRectangle(bitmap, cx, cy, width, height, paddingPercent)
            } else {
                cropRotatedRectangle(bitmap, cx, cy, width, height, angle, paddingPercent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "이미지 크롭 중 오류 발생", e)
            null
        }
    }

    private fun cropRectangle(bitmap: Bitmap, cx: Float, cy: Float, width: Float, height: Float, paddingPercent: Float): Bitmap? {
        return try {
            val padding = calculatePadding(width, height, paddingPercent)
            val left = max(0f, cx - width / 2 - padding).toInt()
            val top = max(0f, cy - height / 2 - padding).toInt()
            val right = min(bitmap.width.toFloat(), cx + width / 2 + padding).toInt()
            val bottom = min(bitmap.height.toFloat(), cy + height / 2 + padding).toInt()
            if (right <= left || bottom <= top) {
                Log.e(TAG, "유효하지 않은 크롭 영역: [$left, $top, $right, $bottom]")
                null
            } else {
                Bitmap.createBitmap(bitmap, left, top, right - left, bottom - top)
            }
        } catch (e: Exception) {
            Log.e(TAG, "직사각형 크롭 오류", e)
            null
        }
    }

    private fun cropRotatedRectangle(bitmap: Bitmap, cx: Float, cy: Float, width: Float, height: Float, angle: Float, paddingPercent: Float): Bitmap? {
        return try {
            val rotatedWidth = abs(width * cos(angle)) + abs(height * sin(angle))
            val rotatedHeight = abs(width * sin(angle)) + abs(height * cos(angle))
            val padding = calculatePadding(width, height, paddingPercent)
            val left = max(0f, cx - rotatedWidth / 2 - padding).toInt()
            val top = max(0f, cy - rotatedHeight / 2 - padding).toInt()
            val right = min(bitmap.width.toFloat(), cx + rotatedWidth / 2 + padding).toInt()
            val bottom = min(bitmap.height.toFloat(), cy + rotatedHeight / 2 + padding).toInt()
            if (right <= left || bottom <= top) {
                Log.e(TAG, "유효하지 않은 회전 크롭 영역: [$left, $top, $right, $bottom]")
                null
            } else {
                val croppedBitmap = Bitmap.createBitmap(bitmap, left, top, right - left, bottom - top)
                val matrix = Matrix()
                val angleDegrees = -angle * 180f / Math.PI.toFloat()
                matrix.postRotate(angleDegrees, (right - left) / 2f, (bottom - top) / 2f)
                Bitmap.createBitmap(croppedBitmap, 0, 0, croppedBitmap.width, croppedBitmap.height, matrix, true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "회전 사각형 크롭 오류", e)
            null
        }
    }

    fun bitmapToBase64(bitmap: Bitmap, compressFormat: Bitmap.CompressFormat = Bitmap.CompressFormat.JPEG, quality: Int = 90): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(compressFormat, quality, outputStream)
        return Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
    }
}
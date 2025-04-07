package com.front.ml.converter

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * 이미지를 YOLOv8 OBB 모델 입력 형식으로 변환하는 클래스
 * - 640x640 리사이징
 * - letterbox 패딩
 * - 0~1 정규화
 * - NHWC → NCHW 변환
 */
class ModelInputConverter {
    companion object {
        // 모델 입력 크기 (insight_.md 명세 기준)
        const val INPUT_SIZE = 640
        // 채널 수 (RGB)
        const val CHANNELS = 3
        // 배치 크기
        const val BATCH_SIZE = 1
    }

    /**
     * 비트맵을 모델 입력용 ByteBuffer로 변환
     * @param bitmap 원본 비트맵
     * @param isQuantized 양자화 여부 (false면 float32, true면 uint8)
     * @return 모델 입력용 ByteBuffer
     */
    fun convertBitmapToBuffer(bitmap: Bitmap, isQuantized: Boolean = false): ByteBuffer {
        // 1. letterbox 패딩으로 리사이징
        val resizedBitmap = resizeWithLetterbox(bitmap, INPUT_SIZE, INPUT_SIZE)
        
        // 2. 버퍼 할당 (NCHW 포맷)
        val bufferSize = if (isQuantized) {
            BATCH_SIZE * CHANNELS * INPUT_SIZE * INPUT_SIZE
        } else {
            BATCH_SIZE * CHANNELS * INPUT_SIZE * INPUT_SIZE * 4 // float32는 4바이트
        }
        val buffer = ByteBuffer.allocateDirect(bufferSize)
        buffer.order(ByteOrder.nativeOrder())
        
        // 임시 픽셀 배열
        val pixels = IntArray(INPUT_SIZE * INPUT_SIZE)
        resizedBitmap.getPixels(pixels, 0, INPUT_SIZE, 0, 0, INPUT_SIZE, INPUT_SIZE)
        
        // 3. NCHW 포맷으로 변환 (채널 우선)
        if (isQuantized) {
            // uint8 양자화 모델용
            for (c in 0 until CHANNELS) {
                for (y in 0 until INPUT_SIZE) {
                    for (x in 0 until INPUT_SIZE) {
                        val pixelValue = pixels[y * INPUT_SIZE + x]
                        when (c) {
                            0 -> buffer.put(((pixelValue shr 16) and 0xFF).toByte()) // R
                            1 -> buffer.put(((pixelValue shr 8) and 0xFF).toByte())  // G
                            2 -> buffer.put((pixelValue and 0xFF).toByte())          // B
                        }
                    }
                }
            }
        } else {
            // float32 모델용 (0~1 범위 정규화)
            for (c in 0 until CHANNELS) {
                for (y in 0 until INPUT_SIZE) {
                    for (x in 0 until INPUT_SIZE) {
                        val pixelValue = pixels[y * INPUT_SIZE + x]
                        when (c) {
                            0 -> buffer.putFloat(((pixelValue shr 16) and 0xFF) / 255.0f) // R
                            1 -> buffer.putFloat(((pixelValue shr 8) and 0xFF) / 255.0f)  // G
                            2 -> buffer.putFloat((pixelValue and 0xFF) / 255.0f)          // B
                        }
                    }
                }
            }
        }
        
        buffer.rewind()
        return buffer
    }
    
    /**
     * letterbox 방식으로 이미지 리사이징 (종횡비 유지하며 패딩 추가)
     * @param bitmap 원본 비트맵
     * @param targetWidth 대상 너비
     * @param targetHeight 대상 높이
     * @return 패딩이 추가된 리사이즈된 비트맵
     */
    private fun resizeWithLetterbox(bitmap: Bitmap, targetWidth: Int, targetHeight: Int): Bitmap {
        val sourceWidth = bitmap.width
        val sourceHeight = bitmap.height
        
        // 소스 종횡비와 타겟 종횡비 계산
        val sourceRatio = sourceWidth.toFloat() / sourceHeight.toFloat()
        val targetRatio = targetWidth.toFloat() / targetHeight.toFloat()
        
        // 스케일 계산 (종횡비 유지)
        val (scale, dx, dy) = if (sourceRatio > targetRatio) {
            // 너비에 맞춤, 위아래 패딩
            val scale = targetWidth.toFloat() / sourceWidth.toFloat()
            val scaledHeight = sourceHeight * scale
            val dy = (targetHeight - scaledHeight) / 2f
            Triple(scale, 0f, dy)
        } else {
            // 높이에 맞춤, 좌우 패딩
            val scale = targetHeight.toFloat() / sourceHeight.toFloat()
            val scaledWidth = sourceWidth * scale
            val dx = (targetWidth - scaledWidth) / 2f
            Triple(scale, dx, 0f)
        }
        
        // 변환 매트릭스 설정
        val matrix = Matrix()
        matrix.setScale(scale, scale)
        matrix.postTranslate(dx, dy)
        
        // 새 비트맵 생성 및 패딩 추가
        val result = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)
        
        // 배경색 설정 (검은색)
        canvas.drawColor(Color.BLACK)
        
        // 변환된 이미지 그리기
        canvas.drawBitmap(bitmap, matrix, null)
        
        return result
    }
    
    /**
     * 모델 출력 좌표를 원본 이미지 좌표로 역변환
     * @param boxX 모델 출력 X 좌표 (0~1)
     * @param boxY 모델 출력 Y 좌표 (0~1)
     * @param boxWidth 모델 출력 너비 (0~1)
     * @param boxHeight 모델 출력 높이 (0~1)
     * @param originalWidth 원본 이미지 너비
     * @param originalHeight 원본 이미지 높이
     * @return 원본 이미지에 맞게 역변환된 [x, y, width, height] 배열
     */
    fun dePadBoundingBox(
        boxX: Float, boxY: Float, boxWidth: Float, boxHeight: Float,
        originalWidth: Int, originalHeight: Int
    ): FloatArray {
        // 원본 종횡비와 타겟 종횡비 계산
        val originalRatio = originalWidth.toFloat() / originalHeight.toFloat()
        val targetRatio = INPUT_SIZE.toFloat() / INPUT_SIZE.toFloat()
        
        // 스케일 및 오프셋 계산
        val (scale, offsetX, offsetY) = if (originalRatio > targetRatio) {
            // 너비에 맞춤, 위아래 패딩
            val scale = INPUT_SIZE.toFloat() / originalWidth.toFloat()
            val scaledHeight = originalHeight * scale
            val offsetY = (INPUT_SIZE - scaledHeight) / 2f / INPUT_SIZE.toFloat()
            Triple(1f / scale, 0f, offsetY)
        } else {
            // 높이에 맞춤, 좌우 패딩
            val scale = INPUT_SIZE.toFloat() / originalHeight.toFloat()
            val scaledWidth = originalWidth * scale
            val offsetX = (INPUT_SIZE - scaledWidth) / 2f / INPUT_SIZE.toFloat()
            Triple(1f / scale, offsetX, 0f)
        }
        
        // 패딩 제거 및 원본 이미지 좌표로 역변환
        val depadX = if (offsetX > 0) {
            (boxX - offsetX) / (1f - 2f * offsetX) * originalWidth
        } else {
            boxX * originalWidth
        }
        
        val depadY = if (offsetY > 0) {
            (boxY - offsetY) / (1f - 2f * offsetY) * originalHeight
        } else {
            boxY * originalHeight
        }
        
        val depadWidth = if (offsetX > 0) {
            boxWidth / (1f - 2f * offsetX) * originalWidth
        } else {
            boxWidth * originalWidth
        }
        
        val depadHeight = if (offsetY > 0) {
            boxHeight / (1f - 2f * offsetY) * originalHeight
        } else {
            boxHeight * originalHeight
        }
        
        return floatArrayOf(depadX, depadY, depadWidth, depadHeight)
    }
} 
package com.front.ml.converter

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.Build
import android.renderscript.Allocation
import android.renderscript.Element
import android.renderscript.RenderScript
import android.renderscript.ScriptIntrinsicYuvToRGB
import android.util.Log
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer

/**
 * YUV_420_888 포맷의 카메라 이미지를 RGB 비트맵으로 변환하는 컨버터
 * Android API 레벨에 따라 적절한 변환 방법 사용
 */
class YuvToRgbConverter(private val context: Context) : ImageConverter {
    companion object {
        private const val TAG = "YuvToRgbConverter"
    }
    
    private val pixelLock = Any()
    
    // 렌더스크립트 리소스
    private var rs: RenderScript? = null
    private var scriptYuvToRgb: ScriptIntrinsicYuvToRGB? = null
    private var yuvBuffer: ByteArray? = null
    
    /**
     * YUV 이미지를 RGB 비트맵으로 변환
     */
    @SuppressLint("UnsafeOptInUsageError")
    override fun convert(image: ImageProxy, output: Bitmap) {
        synchronized(pixelLock) {
            try {
                val planes = image.planes
                
                // 버퍼 공간 확보
                fillBuffer(planes, image.width, image.height)
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    // Android 12+ 새 API 사용
                    try {
                        // Android 12+ 호환 (YuvToRgbConverter 클래스 사용)
                        val yuvToRgbConverter = Class.forName("androidx.camera.core.impl.utils.YuvToRgbConverter")
                        val constructor = yuvToRgbConverter.getConstructor(Context::class.java)
                        val converter = constructor.newInstance(context)
                        
                        val method = yuvToRgbConverter.getMethod(
                            "yuvToRgb", 
                            ImageProxy::class.java, 
                            Bitmap::class.java
                        )
                        method.invoke(converter, image, output)
                    } catch (e: Exception) {
                        Log.e(TAG, "Android 12+ YuvToRgbConverter 사용 실패", e)
                        fallbackConversion(planes, output, image.width, image.height)
                    }
                } else {
                    // 이전 버전 RenderScript 사용
                    ensureRenderScriptInitialized()
                    
                    val yuvAllocation = Allocation.createSized(
                        rs, Element.U8(rs), yuvBuffer!!.size
                    )
                    yuvAllocation.copyFrom(yuvBuffer)
                    
                    val rgbAllocation = Allocation.createFromBitmap(rs, output)
                    scriptYuvToRgb?.setInput(yuvAllocation)
                    scriptYuvToRgb?.forEach(rgbAllocation)
                    rgbAllocation.copyTo(output)
                    
                    // 할당 해제
                    yuvAllocation.destroy()
                    rgbAllocation.destroy()
                }
                
                // 이미지 회전 처리 (필요시)
                if (image.imageInfo.rotationDegrees != 0) {
                    // 회전된 비트맵 생성
                    val rotatedBitmap = Bitmap.createBitmap(
                        output, 0, 0, output.width, output.height,
                        getTransformationMatrix(image), true
                    )
                    
                    // 회전된 비트맵의 픽셀을 원본 비트맵에 복사
                    val canvas = android.graphics.Canvas(output)
                    canvas.drawBitmap(rotatedBitmap, 0f, 0f, null)
                    
                    // 임시 비트맵 해제
                    rotatedBitmap.recycle()
                }
            } catch (e: Exception) {
                Log.e(TAG, "이미지 변환 실패", e)
            }
        }
    }
    
    /**
     * YUV 버퍼 채우기
     */
    private fun fillBuffer(planes: Array<ImageProxy.PlaneProxy>, width: Int, height: Int) {
        // 버퍼 크기 계산
        val ySize = width * height
        val uvSize = width * height / 4
        
        // 필요시 버퍼 생성
        if (yuvBuffer == null || yuvBuffer!!.size != ySize + uvSize * 2) {
            yuvBuffer = ByteArray(ySize + uvSize * 2)
        }
        
        // Y 플레인 복사
        val yBuffer = planes[0].buffer
        val yRowStride = planes[0].rowStride
        val yPixelStride = planes[0].pixelStride
        copyPlaneToBuffer(yBuffer, yuvBuffer!!, 0, width, height, yRowStride, yPixelStride)
        
        // U와 V 플레인 복사
        val uvWidth = width / 2
        val uvHeight = height / 2
        
        val uBuffer = planes[1].buffer
        val uRowStride = planes[1].rowStride
        val uPixelStride = planes[1].pixelStride
        copyPlaneToBuffer(uBuffer, yuvBuffer!!, ySize, uvWidth, uvHeight, uRowStride, uPixelStride)
        
        val vBuffer = planes[2].buffer
        val vRowStride = planes[2].rowStride
        val vPixelStride = planes[2].pixelStride
        copyPlaneToBuffer(vBuffer, yuvBuffer!!, ySize + uvSize, uvWidth, uvHeight, vRowStride, vPixelStride)
    }
    
    /**
     * 특정 플레인 데이터를 버퍼로 복사
     */
    private fun copyPlaneToBuffer(
        srcBuffer: ByteBuffer,
        dstBuffer: ByteArray,
        dstOffset: Int,
        width: Int,
        height: Int,
        rowStride: Int,
        pixelStride: Int
    ) {
        val srcArray = ByteArray(srcBuffer.remaining())
        srcBuffer.get(srcArray)
        srcBuffer.rewind()
        
        var dstPos = dstOffset
        for (row in 0 until height) {
            for (col in 0 until width) {
                dstBuffer[dstPos++] = srcArray[row * rowStride + col * pixelStride]
            }
        }
    }
    
    /**
     * 폴백 변환 방식 (픽셀 직접 변환)
     */
    private fun fallbackConversion(
        planes: Array<ImageProxy.PlaneProxy>,
        output: Bitmap,
        width: Int,
        height: Int
    ) {
        // 간단한 YUV -> RGB 변환 로직
        val yuvPixels = IntArray(width * height)
        val yBuffer = planes[0].buffer
        val uBuffer = planes[1].buffer
        val vBuffer = planes[2].buffer
        
        val yRowStride = planes[0].rowStride
        val yPixelStride = planes[0].pixelStride
        
        val uvRowStride = planes[1].rowStride
        val uvPixelStride = planes[1].pixelStride
        
        for (y in 0 until height) {
            for (x in 0 until width) {
                val yIndex = y * yRowStride + x * yPixelStride
                val uvIndex = (y / 2) * uvRowStride + (x / 2) * uvPixelStride
                
                val yValue = yBuffer[yIndex].toInt() and 0xFF
                val uValue = uBuffer[uvIndex].toInt() and 0xFF - 128
                val vValue = vBuffer[uvIndex].toInt() and 0xFF - 128
                
                // YUV -> RGB 변환 공식
                var r = (yValue + (1.370705 * vValue)).toInt()
                var g = (yValue - (0.698001 * vValue) - (0.337633 * uValue)).toInt()
                var b = (yValue + (1.732446 * uValue)).toInt()
                
                r = r.coerceIn(0, 255)
                g = g.coerceIn(0, 255)
                b = b.coerceIn(0, 255)
                
                yuvPixels[y * width + x] = 0xFF000000.toInt() or (r shl 16) or (g shl 8) or b
            }
        }
        
        output.setPixels(yuvPixels, 0, width, 0, 0, width, height)
    }
    
    /**
     * RenderScript 초기화
     */
    private fun ensureRenderScriptInitialized() {
        if (rs == null) {
            rs = RenderScript.create(context)
            scriptYuvToRgb = ScriptIntrinsicYuvToRGB.create(rs, Element.U8_4(rs))
        }
    }
    
    /**
     * 회전 매트릭스 계산
     */
    private fun getTransformationMatrix(image: ImageProxy): Matrix {
        val matrix = Matrix()
        matrix.postRotate(image.imageInfo.rotationDegrees.toFloat())
        return matrix
    }
    
    /**
     * 리소스 해제
     */
    override fun close() {
        synchronized(pixelLock) {
            scriptYuvToRgb?.destroy()
            rs?.destroy()
            rs = null
            scriptYuvToRgb = null
            yuvBuffer = null
        }
    }
} 
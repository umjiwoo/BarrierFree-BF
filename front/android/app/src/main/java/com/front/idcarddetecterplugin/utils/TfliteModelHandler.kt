package com.front.idcarddetecterplugin.utils

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil
import java.nio.ByteBuffer
import java.nio.ByteOrder

class TfliteModelHandler private constructor(private val context: Context) {

    companion object {
        private const val TAG = "TfliteModelHandler"
        private const val MODEL_FILENAME = "b32.tflite"

        @Volatile
        private var instance: TfliteModelHandler? = null

        fun getInstance(context: Context): TfliteModelHandler {
            return instance ?: synchronized(this) {
                instance ?: TfliteModelHandler(context.applicationContext).also { instance = it }
            }
        }
    }

    private var _interpreter: Interpreter? = null
    val interpreter: Interpreter
        get() = _interpreter ?: throw IllegalStateException("Interpreter is not initialized")

    var isInitialized = false
        private set

    fun loadModel() {
        if (isInitialized) return
        try {
            val modelFile = FileUtil.loadMappedFile(context, MODEL_FILENAME)
            val options = Interpreter.Options().apply { setNumThreads(4) }
            _interpreter = Interpreter(modelFile, options)
            isInitialized = true
            Log.d(TAG, "TFLite 모델 로드 성공: $MODEL_FILENAME")
        } catch (e: Exception) {
            Log.e(TAG, "TFLite 모델 로드 실패: ${e.message}", e)
            isInitialized = false
        }
    }

    fun prepareInputBuffer(bitmap: Bitmap, inputSize: Int): ByteBuffer {
        val inputBuffer = ByteBuffer.allocateDirect(1 * inputSize * inputSize * 3 * 4)
        inputBuffer.order(ByteOrder.nativeOrder())
        val pixels = IntArray(inputSize * inputSize)
        bitmap.getPixels(pixels, 0, inputSize, 0, 0, inputSize, inputSize)
        for (pixel in pixels) {
            val r = ((pixel shr 16) and 0xFF) / 255.0f
            val g = ((pixel shr 8) and 0xFF) / 255.0f
            val b = (pixel and 0xFF) / 255.0f
            inputBuffer.putFloat(r)
            inputBuffer.putFloat(g)
            inputBuffer.putFloat(b)
        }
        inputBuffer.rewind()
        return inputBuffer
    }

    fun close() {
        try {
            _interpreter?.close()
            _interpreter = null
            isInitialized = false
            Log.d(TAG, "TFLite 인터프리터 정상 해제")
        } catch (e: Exception) {
            Log.e(TAG, "인터프리터 해제 중 오류", e)
        }
    }
}

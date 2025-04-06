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
        private const val MODEL_FILENAME = "sadtearcat.tflite"

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

    fun runInference(bitmap: Bitmap, inputSize: Int): Array<FloatArray>? {
        if (!isInitialized || _interpreter == null) {
            Log.e(TAG, "모델이 초기화되지 않았습니다.")
            return null
        }

        try {
            // 입력 버퍼 준비
            val inputBuffer = prepareInputBuffer(bitmap, inputSize)
            
            // 출력 버퍼 준비 - 모델 출력 형태 [1, 6, 8400]에 맞게 생성
            val outputShape = _interpreter!!.getOutputTensor(0).shape()
            Log.d(TAG, "모델 출력 형태: [${outputShape[0]}, ${outputShape[1]}, ${outputShape[2]}]")
            
            // 3차원 출력 버퍼 생성
            val outputBuffer = Array(outputShape[0]) { 
                Array(outputShape[1]) { 
                    FloatArray(outputShape[2]) 
                } 
            }
            
            // 추론 실행
            _interpreter!!.run(inputBuffer, outputBuffer)
            
            // 2차원 배열로 변환하여 반환 (첫 번째 배치만 사용)
            return outputBuffer[0]
        } catch (e: Exception) {
            Log.e(TAG, "추론 실행 중 오류 발생: ${e.message}", e)
            return null
        }
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

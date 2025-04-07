package com.front.ml

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.tensorflow.lite.Interpreter
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

/**
 * TFLite 모델 생성 및 관리를 담당하는 팩토리 클래스
 */
class TFLiteModelFactory private constructor(private val context: Context) {
    companion object {
        private const val TAG = "TFLiteModelFactory"
        @Volatile private var INSTANCE: TFLiteModelFactory? = null
        
        fun getInstance(context: Context): TFLiteModelFactory {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: TFLiteModelFactory(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
    
    // 모델 캐시 관리
    private val modelCache = ConcurrentHashMap<String, Interpreter>()
    private val labelCache = ConcurrentHashMap<String, List<String>>()
    private val modelFilePathCache = ConcurrentHashMap<String, String>()
    private val labelFilePathCache = ConcurrentHashMap<String, String>()
    
    // 백그라운드 작업 실행기
    private val executor = Executors.newCachedThreadPool()
    
    /**
     * 모델 로드 (비동기)
     */
    fun loadModel(
        modelName: String,
        labelName: String,
        callback: (Boolean, String?, String?) -> Unit
    ) {
        // 이미 로드된 모델인 경우
        if (modelCache.containsKey(modelName)) {
            callback(
                true, 
                modelFilePathCache[modelName],
                labelFilePathCache[labelName]
            )
            return
        }
        
        executor.execute {
            try {
                // 자산 파일을 내부 저장소로 복사
                val modelFile = copyAssetToFile(modelName)
                val labelFile = copyAssetToFile(labelName)
                
                if (modelFile == null || labelFile == null) {
                    Handler(Looper.getMainLooper()).post {
                        callback(false, null, null)
                    }
                    return@execute
                }
                
                // 모델 인터프리터 생성
                val interpreter = Interpreter(modelFile)
                modelCache[modelName] = interpreter
                
                // 라벨 로드
                val labels = context.assets.open(labelName)
                    .bufferedReader()
                    .readLines()
                    .map { it.trim() }
                labelCache[labelName] = labels
                
                // 경로 캐싱
                modelFilePathCache[modelName] = modelFile.absolutePath
                labelFilePathCache[labelName] = labelFile.absolutePath
                
                Handler(Looper.getMainLooper()).post {
                    callback(true, modelFile.absolutePath, labelFile.absolutePath)
                }
            } catch (e: Exception) {
                Log.e(TAG, "모델 로드 실패: $modelName", e)
                Handler(Looper.getMainLooper()).post {
                    callback(false, null, null)
                }
            }
        }
    }
    
    /**
     * 모델 로드 여부 확인
     */
    fun isModelLoaded(modelName: String): Boolean {
        return modelCache.containsKey(modelName)
    }
    
    /**
     * 모델 인터프리터 가져오기
     */
    fun getInterpreter(modelName: String): Interpreter? = modelCache[modelName]
    
    /**
     * 라벨 리스트 가져오기
     */
    fun getLabels(labelName: String): List<String> = labelCache[labelName] ?: emptyList()
    
    /**
     * 특정 모델 해제
     */
    fun releaseModel(modelName: String) {
        modelCache[modelName]?.close()
        modelCache.remove(modelName)
        modelFilePathCache.remove(modelName)
    }
    
    /**
     * 모든 리소스 해제
     */
    fun releaseAll() {
        modelCache.forEach { (_, interpreter) -> interpreter.close() }
        modelCache.clear()
        labelCache.clear()
        modelFilePathCache.clear()
        labelFilePathCache.clear()
        executor.shutdown()
    }
    
    /**
     * 자산 파일을 앱 내부 저장소로 복사
     */
    private fun copyAssetToFile(assetName: String): File? {
        try {
            val assetManager = context.assets
            val inputStream = assetManager.open(assetName)
            val outFile = File(context.filesDir, assetName)
            
            FileOutputStream(outFile).use { outputStream ->
                val buffer = ByteArray(1024)
                var read: Int
                while (inputStream.read(buffer).also { read = it } != -1) {
                    outputStream.write(buffer, 0, read)
                }
                outputStream.flush()
            }
            
            inputStream.close()
            return outFile
        } catch (e: IOException) {
            Log.e(TAG, "자산 파일 복사 실패: $assetName", e)
            return null
        }
    }
} 
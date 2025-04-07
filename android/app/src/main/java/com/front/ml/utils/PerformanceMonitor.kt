package com.front.ml.utils

import android.os.SystemClock
import android.util.Log
import java.util.concurrent.ConcurrentHashMap

/**
 * 성능 모니터링 클래스
 * 모델 추론 및 처리 시간 측정, 통계 제공
 */
class PerformanceMonitor {
    companion object {
        private const val TAG = "PerformanceMonitor"
        
        // 싱글톤 인스턴스
        private val instance = PerformanceMonitor()
        
        fun getInstance(): PerformanceMonitor {
            return instance
        }
    }
    
    // 모델별 추론 시간 통계 (단위: ms)
    private val inferenceStats = ConcurrentHashMap<String, ModelStats>()
    
    // 이미지 처리별 시간 통계 (단위: ms)
    private val preprocessingStats = ConcurrentHashMap<String, ProcessingStats>()
    private val postprocessingStats = ConcurrentHashMap<String, ProcessingStats>()
    
    // 진행 중인 작업 타임스탬프
    private val activeTimestamps = ConcurrentHashMap<String, Long>()
    
    /**
     * 작업 시작 시간 기록
     * @param taskId 작업 식별자
     */
    fun startTask(taskId: String) {
        activeTimestamps[taskId] = SystemClock.elapsedRealtime()
    }
    
    /**
     * 작업 종료 및 시간 측정
     * @param taskId 작업 식별자
     * @return 작업 소요 시간 (ms)
     */
    fun endTask(taskId: String): Long {
        val startTime = activeTimestamps.remove(taskId) ?: return 0
        return SystemClock.elapsedRealtime() - startTime
    }
    
    /**
     * 모델 추론 시간 기록
     * @param modelName 모델 이름
     * @param inferenceTime 추론 시간 (ms)
     */
    fun recordInferenceTime(modelName: String, inferenceTime: Long) {
        val stats = inferenceStats.getOrPut(modelName) { ModelStats() }
        stats.addSample(inferenceTime)
        
        if (stats.sampleCount % 100 == 0) {
            Log.d(TAG, "모델 $modelName 평균 추론 시간: ${stats.averageTime}ms (${stats.sampleCount}개 샘플)")
        }
    }
    
    /**
     * 전처리 시간 기록
     * @param processorId 프로세서 식별자
     * @param processingTime 처리 시간 (ms)
     */
    fun recordPreprocessingTime(processorId: String, processingTime: Long) {
        val stats = preprocessingStats.getOrPut(processorId) { ProcessingStats() }
        stats.addSample(processingTime)
    }
    
    /**
     * 후처리 시간 기록
     * @param processorId 프로세서 식별자
     * @param processingTime 처리 시간 (ms)
     */
    fun recordPostprocessingTime(processorId: String, processingTime: Long) {
        val stats = postprocessingStats.getOrPut(processorId) { ProcessingStats() }
        stats.addSample(processingTime)
    }
    
    /**
     * 모델 추론 통계 가져오기
     * @param modelName 모델 이름
     * @return 추론 통계 정보
     */
    fun getModelStats(modelName: String): ModelStatsInfo? {
        val stats = inferenceStats[modelName] ?: return null
        return ModelStatsInfo(
            averageTime = stats.averageTime,
            minTime = stats.minTime,
            maxTime = stats.maxTime,
            sampleCount = stats.sampleCount,
            fps = if (stats.averageTime > 0) 1000.0 / stats.averageTime else 0.0
        )
    }
    
    /**
     * 전체 모델 통계 가져오기
     * @return 모든 모델의 통계 정보
     */
    fun getAllModelStats(): Map<String, ModelStatsInfo> {
        return inferenceStats.mapValues { (_, stats) ->
            ModelStatsInfo(
                averageTime = stats.averageTime,
                minTime = stats.minTime,
                maxTime = stats.maxTime,
                sampleCount = stats.sampleCount,
                fps = if (stats.averageTime > 0) 1000.0 / stats.averageTime else 0.0
            )
        }
    }
    
    /**
     * 모든 성능 통계 초기화
     */
    fun reset() {
        inferenceStats.clear()
        preprocessingStats.clear()
        postprocessingStats.clear()
        activeTimestamps.clear()
    }
    
    /**
     * 통계 정보 문자열로 출력
     */
    fun getStatsReport(): String {
        val sb = StringBuilder()
        sb.appendLine("=== 성능 모니터링 보고서 ===")
        
        sb.appendLine("--- 모델 추론 시간 ---")
        inferenceStats.forEach { (modelName, stats) ->
            sb.appendLine("모델: $modelName")
            sb.appendLine("  평균: ${stats.averageTime}ms")
            sb.appendLine("  최소: ${stats.minTime}ms")
            sb.appendLine("  최대: ${stats.maxTime}ms")
            sb.appendLine("  샘플: ${stats.sampleCount}개")
            val fps = if (stats.averageTime > 0) 1000.0 / stats.averageTime else 0.0
            sb.appendLine("  FPS: ${"%.1f".format(fps)}")
        }
        
        sb.appendLine("--- 전처리 시간 ---")
        preprocessingStats.forEach { (processorId, stats) ->
            sb.appendLine("프로세서: $processorId")
            sb.appendLine("  평균: ${stats.averageTime}ms")
            sb.appendLine("  최소: ${stats.minTime}ms")
            sb.appendLine("  최대: ${stats.maxTime}ms")
        }
        
        sb.appendLine("--- 후처리 시간 ---")
        postprocessingStats.forEach { (processorId, stats) ->
            sb.appendLine("프로세서: $processorId")
            sb.appendLine("  평균: ${stats.averageTime}ms")
            sb.appendLine("  최소: ${stats.minTime}ms")
            sb.appendLine("  최대: ${stats.maxTime}ms")
        }
        
        return sb.toString()
    }
    
    /**
     * 모델 추론 통계 정보
     */
    data class ModelStatsInfo(
        val averageTime: Double, // 평균 추론 시간 (ms)
        val minTime: Long,       // 최소 추론 시간 (ms)
        val maxTime: Long,       // 최대 추론 시간 (ms)
        val sampleCount: Int,    // 샘플 수
        val fps: Double          // 초당 프레임 수 (1000/avgTime)
    )
    
    /**
     * 모델 통계 내부 클래스
     */
    private class ModelStats {
        var totalTime: Long = 0
        var sampleCount: Int = 0
        var minTime: Long = Long.MAX_VALUE
        var maxTime: Long = 0
        val averageTime: Double
            get() = if (sampleCount > 0) totalTime.toDouble() / sampleCount else 0.0
        
        fun addSample(time: Long) {
            totalTime += time
            sampleCount++
            minTime = minTime.coerceAtMost(time)
            maxTime = maxTime.coerceAtLeast(time)
        }
    }
    
    /**
     * 처리 통계 내부 클래스
     */
    private class ProcessingStats {
        var totalTime: Long = 0
        var sampleCount: Int = 0
        var minTime: Long = Long.MAX_VALUE
        var maxTime: Long = 0
        val averageTime: Double
            get() = if (sampleCount > 0) totalTime.toDouble() / sampleCount else 0.0
        
        fun addSample(time: Long) {
            totalTime += time
            sampleCount++
            minTime = minTime.coerceAtMost(time)
            maxTime = maxTime.coerceAtLeast(time)
        }
    }
} 
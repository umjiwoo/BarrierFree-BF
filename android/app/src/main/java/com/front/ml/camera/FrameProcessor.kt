package com.front.ml.camera

import android.util.Log
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.front.ml.processor.DetectionResult
import com.front.ml.processor.ImageProcessor
import com.front.ml.utils.OrientationManager
import com.front.ml.utils.PerformanceMonitor
import java.util.concurrent.atomic.AtomicBoolean

/**
 * 카메라 프레임 처리기
 * 카메라 프레임 분석 및 이미지 처리 담당
 */
class FrameProcessor(
    private val imageProcessor: ImageProcessor,
    private val orientationManager: OrientationManager? = null,
    private val resultCallback: ((List<DetectionResult>) -> Unit)? = null
) : ImageAnalysis.Analyzer {
    companion object {
        private const val TAG = "FrameProcessor"
        
        // 프레임 처리 통계를 위한 상수
        private const val STATS_INTERVAL_FRAMES = 30
    }
    
    // 성능 모니터
    private val performanceMonitor = PerformanceMonitor.getInstance()
    
    // 이미지 처리 중 여부
    private val processing = AtomicBoolean(false)
    
    // 프레임 통계
    private var frameCount = 0
    private var droppedFrames = 0
    private var lastStatsTime = System.currentTimeMillis()
    
    /**
     * 이미지 분석 콜백
     * @param image 카메라에서 전달된 이미지
     */
    override fun analyze(image: ImageProxy) {
        val taskId = "frame_${System.currentTimeMillis()}"
        performanceMonitor.startTask(taskId)
        
        // 처리 중이라면 프레임 스킵
        if (processing.get()) {
            droppedFrames++
            image.close()
            return
        }
        
        processing.set(true)
        
        try {
            // 이미지 회전 정보 확인
            val rotationDegrees = image.imageInfo.rotationDegrees
            
            // 프레임 처리 시작
            Log.v(TAG, "프레임 처리 시작 - 회전: $rotationDegrees, 크기: ${image.width}x${image.height}")
            
            // 방향 보정 적용 (필요 시)
            val correctedImage = if (orientationManager != null) {
                correctImageOrientation(image)
            } else {
                image
            }
            
            // 이미지 처리기로 전달 - 결과 콜백 추가
            imageProcessor.process(correctedImage) { result ->
                try {
                    // 결과를 DetectionResult 리스트로 캐스팅
                    @Suppress("UNCHECKED_CAST")
                    val detectionResults = result as? List<DetectionResult>
                    
                    // 결과 콜백 호출
                    detectionResults?.let { results ->
                        resultCallback?.invoke(results)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "결과 처리 중 오류 발생", e)
                } finally {
                    processing.set(false)
                }
            }
            
            // 프레임 통계 업데이트
            updateFrameStats()
            
            // 작업 종료 및 시간 측정
            val processingTime = performanceMonitor.endTask(taskId)
            Log.v(TAG, "프레임 처리 완료: ${processingTime}ms")
            
        } catch (e: Exception) {
            Log.e(TAG, "프레임 처리 중 오류 발생", e)
            image.close()
            processing.set(false)
        }
    }
    
    /**
     * 이미지 방향 보정
     * @param image 원본 이미지
     * @return 보정된 이미지 (보정이 필요 없으면 원본 반환)
     */
    private fun correctImageOrientation(image: ImageProxy): ImageProxy {
        // 방향 관리자가 없으면 원본 반환
        if (orientationManager == null) {
            return image
        }
        
        // 현재 방향과 이미지 회전 각도 비교
        val imageRotation = image.imageInfo.rotationDegrees
        val deviceOrientation = orientationManager.getDeviceOrientation()
        
        // 방향이 일치하면 원본 반환
        if (imageRotation == deviceOrientation) {
            return image
        }
        
        // TODO: 필요 시 이미지 회전 로직 구현
        // 현재는 이미지 회전 없이 메타데이터만 전달
        Log.d(TAG, "이미지 방향 보정: $imageRotation -> $deviceOrientation")
        
        return image
    }
    
    /**
     * 프레임 통계 업데이트
     */
    private fun updateFrameStats() {
        frameCount++
        
        // 일정 주기로 통계 출력
        if (frameCount % STATS_INTERVAL_FRAMES == 0) {
            val currentTime = System.currentTimeMillis()
            val intervalMs = currentTime - lastStatsTime
            
            if (intervalMs > 0) {
                val fps = STATS_INTERVAL_FRAMES * 1000.0 / intervalMs
                val dropRate = droppedFrames * 100.0 / (frameCount + droppedFrames)
                
                Log.d(TAG, "프레임 통계: FPS=${String.format("%.1f", fps)}, " +
                        "드롭=${String.format("%.1f", dropRate)}%, " +
                        "처리=$frameCount, 스킵=$droppedFrames")
                
                lastStatsTime = currentTime
                droppedFrames = 0
            }
        }
    }
    
    /**
     * 리소스 해제
     */
    fun release() {
        // 필요 시 리소스 해제 로직 구현
    }
} 
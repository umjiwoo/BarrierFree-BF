package com.front.ml.postprocessor

import android.graphics.RectF
import android.util.Log
import com.front.ml.processor.DetectionResult
import kotlin.math.max
import kotlin.math.min

/**
 * 일반 바운딩 박스(AABB) 후처리 구현
 * 표준 객체 감지 모델 출력을 처리하기 위한 클래스
 */
class AABBPostProcessor(
    private var confidenceThreshold: Float = 0.5f,
    private var nmsThreshold: Float = 0.5f
) : DetectionPostProcessor {
    companion object {
        private const val TAG = "AABBPostProcessor"
    }
    
    /**
     * 모델 출력 데이터 후처리
     * @param modelOutput 모델 출력 데이터 ([numDetections][85] 배열 형식)
     * @param imageWidth 원본 이미지 너비
     * @param imageHeight 원본 이미지 높이
     * @return 후처리된 감지 결과 목록
     */
    override fun process(modelOutput: Any, imageWidth: Int, imageHeight: Int): List<DetectionResult> {
        // 모델 출력 형식 확인
        if (modelOutput !is Array<*>) {
            Log.e(TAG, "Invalid model output format")
            return emptyList()
        }
        
        val detections = mutableListOf<DetectionResult>()
        
        try {
            @Suppress("UNCHECKED_CAST")
            val output = modelOutput as Array<FloatArray>
            
            // YOLO 스타일 출력 처리
            for (detection in output) {
                // 출력 구조 확인
                if (detection.size < 6) {
                    continue
                }
                
                // 신뢰도 확인
                val confidence = detection[4]
                if (confidence < confidenceThreshold) {
                    continue
                }
                
                // 클래스 확률 및 인덱스 확인
                var maxClass = -1
                var maxScore = 0f
                
                // 클래스 확률 처리 (5번 인덱스부터 클래스 확률)
                for (c in 5 until detection.size) {
                    val score = detection[c]
                    if (score > maxScore) {
                        maxScore = score
                        maxClass = c - 5
                    }
                }
                
                // 최종 신뢰도 계산
                val score = confidence * maxScore
                if (score < confidenceThreshold) {
                    continue
                }
                
                // 바운딩 박스 좌표 (중심점, 너비, 높이)
                val centerX = detection[0] * imageWidth
                val centerY = detection[1] * imageHeight
                val width = detection[2] * imageWidth
                val height = detection[3] * imageHeight
                
                // 좌표 변환 (중심점 -> 좌상단, 우하단)
                val left = centerX - width / 2
                val top = centerY - height / 2
                val right = centerX + width / 2
                val bottom = centerY + height / 2
                
                // RectF 생성
                val rect = RectF(left, top, right, bottom)
                
                // 클래스 레이블 (여기서는 인덱스만 사용, 실제로는 별도의 레이블 목록 필요)
                val label = "Class $maxClass"
                
                // 감지 결과 추가
                detections.add(
                    DetectionResult(
                        score = score,
                        label = label,
                        boundingBox = rect
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing detection results", e)
            return emptyList()
        }
        
        // NMS 적용
        return applyNonMaxSuppression(detections, nmsThreshold)
    }
    
    /**
     * 비 최대 억제(NMS) 적용
     * @param detections 감지 결과 목록
     * @param iouThreshold IoU 임계값
     * @return NMS 적용 후 감지 결과 목록
     */
    private fun applyNonMaxSuppression(
        detections: List<DetectionResult>,
        iouThreshold: Float
    ): List<DetectionResult> {
        // 신뢰도 기준 내림차순 정렬
        val sortedDetections = detections.sortedByDescending { it.score }
        val selected = mutableListOf<DetectionResult>()
        
        val used = BooleanArray(sortedDetections.size) { false }
        
        for (i in sortedDetections.indices) {
            if (used[i]) continue
            
            selected.add(sortedDetections[i])
            
            for (j in i + 1 until sortedDetections.size) {
                if (used[j]) continue
                
                // 같은 클래스에 대해서만 NMS 적용
                if (sortedDetections[i].label != sortedDetections[j].label) {
                    continue
                }
                
                // IoU 계산
                val iou = calculateIoU(
                    sortedDetections[i].boundingBox,
                    sortedDetections[j].boundingBox
                )
                
                if (iou > iouThreshold) {
                    used[j] = true
                }
            }
        }
        
        return selected
    }
    
    /**
     * IoU(Intersection over Union) 계산
     * @param rect1 첫 번째 바운딩 박스
     * @param rect2 두 번째 바운딩 박스
     * @return IoU 값 (0~1)
     */
    private fun calculateIoU(rect1: RectF, rect2: RectF): Float {
        // 교차 영역 계산
        val left = max(rect1.left, rect2.left)
        val top = max(rect1.top, rect2.top)
        val right = min(rect1.right, rect2.right)
        val bottom = min(rect1.bottom, rect2.bottom)
        
        // 교차 영역이 없는 경우
        if (right < left || bottom < top) {
            return 0f
        }
        
        val intersection = (right - left) * (bottom - top)
        
        // 합집합 영역 계산
        val area1 = rect1.width() * rect1.height()
        val area2 = rect2.width() * rect2.height()
        val union = area1 + area2 - intersection
        
        return if (union > 0) intersection / union else 0f
    }
    
    /**
     * 신뢰도 임계값 설정
     */
    override fun setConfidenceThreshold(threshold: Float) {
        confidenceThreshold = threshold.coerceIn(0f, 1f)
    }
    
    /**
     * NMS 임계값 설정
     */
    override fun setNMSThreshold(threshold: Float) {
        nmsThreshold = threshold.coerceIn(0f, 1f)
    }
    
    /**
     * 현재 신뢰도 임계값 가져오기
     */
    override fun getConfidenceThreshold(): Float = confidenceThreshold
    
    /**
     * 현재 NMS 임계값 가져오기
     */
    override fun getNMSThreshold(): Float = nmsThreshold
} 
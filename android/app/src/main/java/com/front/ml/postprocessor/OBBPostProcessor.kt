package com.front.ml.postprocessor

import android.graphics.PointF
import android.graphics.RectF
import android.util.Log
import com.front.ml.processor.DetectionResult
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * 회전된 바운딩 박스(OBB) 후처리 구현
 * YOLO v8 OBB 등의 회전된 바운딩 박스를 지원하는 모델 출력을 처리하기 위한 클래스
 */
class OBBPostProcessor(
    private var confidenceThreshold: Float = 0.5f,
    private var nmsThreshold: Float = 0.5f
) : DetectionPostProcessor {
    companion object {
        private const val TAG = "OBBPostProcessor"
    }
    
    /**
     * 모델 출력 데이터 후처리
     * @param modelOutput 모델 출력 데이터 ([numDetections][n] 배열 형식)
     * OBB YOLO v8 모델의 경우 일반적으로 출력 형식은 [x, y, w, h, theta, conf, class1, class2, ...]
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
            
            // OBB YOLO 스타일 출력 처리
            for (detection in output) {
                // 출력 구조 확인
                if (detection.size < 7) {
                    continue
                }
                
                // 신뢰도 확인
                val confidence = detection[5]
                if (confidence < confidenceThreshold) {
                    continue
                }
                
                // 클래스 확률 및 인덱스 확인
                var maxClass = -1
                var maxScore = 0f
                
                // 클래스 확률 처리 (6번 인덱스부터 클래스 확률)
                for (c in 6 until detection.size) {
                    val score = detection[c]
                    if (score > maxScore) {
                        maxScore = score
                        maxClass = c - 6
                    }
                }
                
                // 최종 신뢰도 계산
                val score = confidence * maxScore
                if (score < confidenceThreshold) {
                    continue
                }
                
                // 바운딩 박스 좌표 (중심점, 너비, 높이, 회전 각도)
                val centerX = detection[0] * imageWidth
                val centerY = detection[1] * imageHeight
                val width = detection[2] * imageWidth
                val height = detection[3] * imageHeight
                val theta = detection[4] // 라디안 단위의 회전 각도
                
                // 회전된 바운딩 박스의 네 꼭지점 계산
                val corners = calculateRotatedBoxCorners(
                    centerX, centerY, width, height, theta
                )
                
                // 꼭지점으로부터 AABB (경계 바운딩 박스) 계산
                val boundingRect = calculateAABBFromCorners(corners)
                
                // 클래스 레이블 (여기서는 인덱스만 사용, 실제로는 별도의 레이블 목록 필요)
                val label = "Class $maxClass"
                
                // 감지 결과 추가
                detections.add(
                    DetectionResult(
                        score = score,
                        label = label,
                        boundingBox = boundingRect,
                        angle = theta,
                        corners = corners.toList()
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing OBB detection results", e)
            return emptyList()
        }
        
        // NMS 적용
        return applyNonMaxSuppression(detections, nmsThreshold)
    }
    
    /**
     * 회전된 바운딩 박스의 꼭지점 좌표 계산
     * @param centerX 중심점 X 좌표
     * @param centerY 중심점 Y 좌표
     * @param width 너비
     * @param height 높이
     * @param theta 회전 각도 (라디안)
     * @return 네 꼭지점 좌표 배열 [좌상, 우상, 우하, 좌하]
     */
    private fun calculateRotatedBoxCorners(
        centerX: Float,
        centerY: Float,
        width: Float,
        height: Float,
        theta: Float
    ): Array<PointF> {
        val cosTheta = cos(theta)
        val sinTheta = sin(theta)
        
        val halfWidth = width / 2
        val halfHeight = height / 2
        
        // 회전 전 꼭지점 상대 좌표
        val points = arrayOf(
            PointF(-halfWidth, -halfHeight), // 좌상
            PointF(halfWidth, -halfHeight),  // 우상
            PointF(halfWidth, halfHeight),   // 우하
            PointF(-halfWidth, halfHeight)   // 좌하
        )
        
        // 회전 및 이동 적용
        return Array(4) { i ->
            val x = points[i].x * cosTheta - points[i].y * sinTheta + centerX
            val y = points[i].x * sinTheta + points[i].y * cosTheta + centerY
            PointF(x, y)
        }
    }
    
    /**
     * 꼭지점 좌표로부터 AABB (경계 바운딩 박스) 계산
     * @param corners 네 꼭지점 좌표 배열
     * @return AABB 바운딩 박스
     */
    private fun calculateAABBFromCorners(corners: Array<PointF>): RectF {
        var minX = Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxX = Float.MIN_VALUE
        var maxY = Float.MIN_VALUE
        
        for (point in corners) {
            minX = min(minX, point.x)
            minY = min(minY, point.y)
            maxX = max(maxX, point.x)
            maxY = max(maxY, point.y)
        }
        
        return RectF(minX, minY, maxX, maxY)
    }
    
    /**
     * 비 최대 억제(NMS) 적용
     * OBB에서는 IoU 대신 DIoU(Distance IoU)를 사용하여 더 정확한 박스 중복 검출
     * @param detections 감지 결과 목록
     * @param threshold DIoU 임계값
     * @return NMS 적용 후 감지 결과 목록
     */
    private fun applyNonMaxSuppression(
        detections: List<DetectionResult>,
        threshold: Float
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
                
                // 회전된 바운딩 박스용 IoU 계산
                val diou = calculateDIoU(
                    sortedDetections[i],
                    sortedDetections[j]
                )
                
                if (diou > threshold) {
                    used[j] = true
                }
            }
        }
        
        return selected
    }
    
    /**
     * DIoU(Distance IoU) 계산
     * 회전된 바운딩 박스에 대해 더 정확한 중복 검출을 위해 사용
     * @param result1 첫 번째 감지 결과
     * @param result2 두 번째 감지 결과
     * @return DIoU 값 (0~1)
     */
    private fun calculateDIoU(result1: DetectionResult, result2: DetectionResult): Float {
        // 기본 IoU 계산 (AABB 바운딩 박스 기준)
        val baseIoU = calculateIoU(result1.boundingBox, result2.boundingBox)
        
        // 중심점 간의 거리 계산
        val center1 = PointF(
            result1.boundingBox.centerX(),
            result1.boundingBox.centerY()
        )
        val center2 = PointF(
            result2.boundingBox.centerX(),
            result2.boundingBox.centerY()
        )
        
        val centerDistance = distance(center1, center2)
        
        // 대각선 거리 계산 (두 바운딩 박스를 포함하는 가장 작은 박스의 대각선 길이)
        val enclosingBox = RectF().apply {
            left = min(result1.boundingBox.left, result2.boundingBox.left)
            top = min(result1.boundingBox.top, result2.boundingBox.top)
            right = max(result1.boundingBox.right, result2.boundingBox.right)
            bottom = max(result1.boundingBox.bottom, result2.boundingBox.bottom)
        }
        
        val diagonalDistance = sqrt(
            (enclosingBox.width() * enclosingBox.width()) +
            (enclosingBox.height() * enclosingBox.height())
        )
        
        // DIoU = IoU - (center_distance/diagonal_distance)^2
        val diou = baseIoU - (centerDistance * centerDistance) / (diagonalDistance * diagonalDistance)
        
        // 정규화된 값 반환 (0~1 사이)
        return max(0f, diou)
    }
    
    /**
     * 두 점 사이의 거리 계산
     * @param p1 첫 번째 점
     * @param p2 두 번째 점
     * @return 두 점 사이의 유클리드 거리
     */
    private fun distance(p1: PointF, p2: PointF): Float {
        val dx = p2.x - p1.x
        val dy = p2.y - p1.y
        return sqrt(dx * dx + dy * dy)
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
     * 폴리곤 교차 영역 계산 (회전된 바운딩 박스용)
     * Sutherland-Hodgman 알고리즘 구현
     * 복잡도 이슈로 인해 현재 버전에서는 사용하지 않음
     */
    private fun calculatePolygonIntersection(corners1: Array<PointF>, corners2: Array<PointF>): Float {
        // 폴리곤 교차 영역 계산은 복잡한 작업으로, 실제 구현 시 고급 기하학 라이브러리 사용 권장
        // (예: JTS Topology Suite)
        
        // 현재 버전에서는 단순화를 위해 구현 생략 (DIoU 방식 사용)
        return 0f
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
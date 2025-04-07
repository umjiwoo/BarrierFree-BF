package com.front.ml.processor

import android.graphics.PointF
import android.graphics.RectF

/**
 * 객체 감지 결과를 담는 데이터 클래스
 * @param score 감지 신뢰도 (0~1)
 * @param label 객체 라벨
 * @param boundingBox 객체 영역 (좌표)
 * @param angle 회전 각도 (라디안, 객체가 회전된 각도)
 * @param corners 회전된 바운딩 박스의 4개 코너 포인트 (좌상단부터 시계방향)
 */
data class DetectionResult(
    val score: Float,
    val label: String,
    val boundingBox: RectF,
    val angle: Float? = null,
    val corners: List<PointF>? = null
) {
    /**
     * 일반 바운딩 박스인지 확인 (회전 안 됨)
     */
    fun isAxisAligned(): Boolean = angle == null || angle == 0f
    
    /**
     * 회전된 바운딩 박스인지 확인
     */
    fun isRotated(): Boolean = !isAxisAligned()
    
    /**
     * 바운딩 박스의 중심점 계산
     */
    fun getCenter(): PointF {
        return PointF(
            boundingBox.centerX(),
            boundingBox.centerY()
        )
    }
    
    /**
     * 바운딩 박스의 너비와 높이 반환
     */
    fun getSize(): Pair<Float, Float> {
        return Pair(
            boundingBox.width(),
            boundingBox.height()
        )
    }
    
    /**
     * 회전 각도를 도(degree) 단위로 변환
     */
    fun getAngleDegrees(): Float? {
        return angle?.let { Math.toDegrees(it.toDouble()).toFloat() }
    }
    
    companion object {
        /**
         * 일반 바운딩 박스로부터 DetectionResult 생성
         */
        fun fromBoundingBox(score: Float, label: String, boundingBox: RectF): DetectionResult {
            return DetectionResult(score, label, boundingBox)
        }
        
        /**
         * 회전된 바운딩 박스로부터 DetectionResult 생성
         */
        fun fromRotatedBox(
            score: Float, 
            label: String, 
            centerX: Float, 
            centerY: Float, 
            width: Float, 
            height: Float, 
            angle: Float
        ): DetectionResult {
            // 바운딩 박스 생성
            val boundingBox = RectF(
                centerX - width / 2,
                centerY - height / 2,
                centerX + width / 2,
                centerY + height / 2
            )
            
            // 코너 포인트 계산
            val corners = calculateCornerPoints(centerX, centerY, width, height, angle)
            
            return DetectionResult(score, label, boundingBox, angle, corners)
        }
        
        /**
         * 회전된 사각형의 코너 포인트 계산
         */
        private fun calculateCornerPoints(
            centerX: Float,
            centerY: Float,
            width: Float,
            height: Float,
            angleRadians: Float
        ): List<PointF> {
            val cos = Math.cos(angleRadians.toDouble()).toFloat()
            val sin = Math.sin(angleRadians.toDouble()).toFloat()
            
            val halfWidth = width / 2
            val halfHeight = height / 2
            
            // 원점 중심의 코너 포인트 (시계방향: 좌상단, 우상단, 우하단, 좌하단)
            val cornersX = floatArrayOf(-halfWidth, halfWidth, halfWidth, -halfWidth)
            val cornersY = floatArrayOf(-halfHeight, -halfHeight, halfHeight, halfHeight)
            
            val result = mutableListOf<PointF>()
            
            // 회전 및 이동 적용
            for (i in 0 until 4) {
                val rotatedX = cornersX[i] * cos - cornersY[i] * sin + centerX
                val rotatedY = cornersX[i] * sin + cornersY[i] * cos + centerY
                result.add(PointF(rotatedX, rotatedY))
            }
            
            return result
        }
    }
} 
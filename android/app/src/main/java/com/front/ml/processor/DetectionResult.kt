package com.front.ml.processor

import android.graphics.RectF

/**
 * 객체 감지 결과를 담는 데이터 클래스
 * @param score 감지 신뢰도 (0~1)
 * @param label 객체 라벨
 * @param boundingBox 객체 영역 (좌표)
 */
data class DetectionResult(
    val score: Float,
    val label: String,
    val boundingBox: RectF
) 
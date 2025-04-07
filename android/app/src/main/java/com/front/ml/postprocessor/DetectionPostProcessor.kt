package com.front.ml.postprocessor

import com.front.ml.processor.DetectionResult

/**
 * 객체 감지 결과 후처리를 위한 인터페이스
 * 모델 출력에서 최종 감지 결과를 생성하는 후처리 로직 정의
 */
interface DetectionPostProcessor {
    /**
     * 모델 출력 데이터를 후처리하여 감지 결과 생성
     * @param modelOutput 모델 출력 데이터
     * @param imageWidth 원본 이미지 너비
     * @param imageHeight 원본 이미지 높이
     * @return 후처리된 감지 결과 목록
     */
    fun process(modelOutput: Any, imageWidth: Int, imageHeight: Int): List<DetectionResult>
    
    /**
     * 신뢰도 임계값 설정
     * @param threshold 신뢰도 임계값 (0~1)
     */
    fun setConfidenceThreshold(threshold: Float)
    
    /**
     * NMS(Non-Maximum Suppression) 임계값 설정
     * @param threshold IoU 임계값 (0~1)
     */
    fun setNMSThreshold(threshold: Float)
    
    /**
     * 현재 신뢰도 임계값 가져오기
     * @return 현재 신뢰도 임계값
     */
    fun getConfidenceThreshold(): Float
    
    /**
     * 현재 NMS 임계값 가져오기
     * @return 현재 NMS 임계값
     */
    fun getNMSThreshold(): Float
} 
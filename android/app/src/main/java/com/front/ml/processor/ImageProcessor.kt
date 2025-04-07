package com.front.ml.processor

import androidx.camera.core.ImageProxy

/**
 * 이미지 처리 인터페이스
 * 다양한 ML 모델 프로세서의 공통 인터페이스
 */
interface ImageProcessor {
    /**
     * 이미지 처리 수행
     * @param image 처리할 이미지
     * @param onResult 처리 결과 콜백
     */
    fun process(image: ImageProxy, onResult: (Any) -> Unit)
    
    /**
     * 리소스 해제
     */
    fun shutdown()
} 
package com.front.ml.converter

import android.graphics.Bitmap
import androidx.camera.core.ImageProxy

/**
 * 이미지 변환 인터페이스
 * 카메라 이미지 포맷을 비트맵으로 변환하는 기능 제공
 */
interface ImageConverter {
    /**
     * 이미지 변환 수행
     * @param image 원본 이미지
     * @param output 출력할 비트맵
     */
    fun convert(image: ImageProxy, output: Bitmap)
    
    /**
     * 리소스 해제
     */
    fun close()
} 
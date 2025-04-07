package com.front.ml.postprocessor

import android.util.Log

/**
 * 객체 감지 후처리기를 생성하는 팩토리 클래스
 * 모델 타입에 따라 적절한 후처리기 인스턴스를 생성
 */
class PostProcessorFactory {
    companion object {
        private const val TAG = "PostProcessorFactory"
        
        // 후처리기 타입 정의
        const val TYPE_AABB = "aabb"  // 축 정렬 바운딩 박스 (표준)
        const val TYPE_OBB = "obb"    // 회전된 바운딩 박스
        
        /**
         * 모델 타입에 따른 후처리기 생성
         * @param type 후처리기 타입 (aabb 또는 obb)
         * @param confidenceThreshold 신뢰도 임계값 (0~1)
         * @param nmsThreshold NMS 임계값 (0~1)
         * @return 적절한 후처리기 구현체
         */
        fun create(
            type: String, 
            confidenceThreshold: Float = 0.5f,
            nmsThreshold: Float = 0.5f
        ): DetectionPostProcessor {
            return when (type.lowercase()) {
                TYPE_AABB -> {
                    Log.d(TAG, "축 정렬 바운딩 박스(AABB) 후처리기 생성")
                    AABBPostProcessor(confidenceThreshold, nmsThreshold)
                }
                TYPE_OBB -> {
                    Log.d(TAG, "회전된 바운딩 박스(OBB) 후처리기 생성")
                    OBBPostProcessor(confidenceThreshold, nmsThreshold)
                }
                else -> {
                    Log.w(TAG, "알 수 없는 후처리기 타입: $type, 기본 AABB 후처리기로 대체")
                    AABBPostProcessor(confidenceThreshold, nmsThreshold)
                }
            }
        }
        
        /**
         * 모델 이름에 따른 적절한 후처리기 타입 추론
         * @param modelName 모델 이름
         * @return 적합한 후처리기 타입
         */
        fun inferTypeFromModelName(modelName: String): String {
            return when {
                modelName.contains("obb", ignoreCase = true) -> TYPE_OBB
                modelName.contains("rotate", ignoreCase = true) -> TYPE_OBB
                modelName.contains("oriented", ignoreCase = true) -> TYPE_OBB
                else -> TYPE_AABB
            }
        }
    }
} 
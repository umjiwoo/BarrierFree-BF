package com.front.idcarddetecterplugin.utils

import android.util.Log
import com.front.idcarddetecterplugin.models.DetectionBox
import kotlin.math.*

class DetectionProcessor {
    companion object {
        private const val TAG = "DetectionProcessor"
        private const val LOG_PREFIX = "[DetectionProcessor] "
        const val NMS_IOU_THRESHOLD = 0.45f
        private const val IOU_THRESHOLD = 0.5f // NMS에 사용되는 IoU 임계값
    }

    fun calculateObbIoU(box1: DetectionBox, box2: DetectionBox): Float {
        val centerDist = sqrt((box1.cx - box2.cx).pow(2) + (box1.cy - box2.cy).pow(2))
        val maxDist = max(box1.width, box1.height) + max(box2.width, box2.height)
        if (centerDist > maxDist) return 0f

        val area1 = box1.width * box1.height
        val area2 = box2.width * box2.height
        val sizeSimilarity = min(area1, area2) / max(area1, area2)

        val angleDiff = abs(box1.angle - box2.angle)
        val angleSimilarity = 1f - min(angleDiff, Math.PI.toFloat() - angleDiff) / (Math.PI.toFloat() / 2f)

        val distRatio = min(1f, max(0f, 1f - centerDist / maxDist))

        return distRatio * 0.6f + sizeSimilarity * 0.3f + angleSimilarity * 0.1f
    }

    fun applyNMS(boxes: List<DetectionBox>): List<DetectionBox> {
        if (boxes.isEmpty()) return emptyList()

        val sortedBoxes = boxes.sortedByDescending { it.confidence }
        val isSelected = BooleanArray(sortedBoxes.size) { false }
        val selectedBoxes = mutableListOf<DetectionBox>()

        for (i in sortedBoxes.indices) {
            if (isSelected[i]) continue

            selectedBoxes.add(sortedBoxes[i])
            isSelected[i] = true

            for (j in i + 1 until sortedBoxes.size) {
                if (isSelected[j]) continue

                val iou = calculateObbIoU(sortedBoxes[i], sortedBoxes[j])
                if (iou > NMS_IOU_THRESHOLD) {
                    isSelected[j] = true
                }
            }
        }

        return selectedBoxes
    }
}
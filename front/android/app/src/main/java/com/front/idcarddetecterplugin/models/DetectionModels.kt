package com.front.idcarddetecterplugin.models

import android.graphics.Bitmap

data class DetectionBox(
    val cx: Float,
    val cy: Float,
    val width: Float,
    val height: Float,
    val confidence: Float,
    val angle: Float
)

data class PaddingInfo(
    val bitmap: Bitmap,
    val paddingLeft: Float,
    val paddingTop: Float,
    val scale: Float
)

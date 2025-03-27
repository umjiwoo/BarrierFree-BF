package com.front

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CustomVibrationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CustomVibration"

    @ReactMethod
    fun vibrateWithAmplitude(duration: Int, amplitude: Int) {
        val vibrator = reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(duration.toLong(), amplitude)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(duration.toLong()) // amplitude 조절 불가
        }
    }
}

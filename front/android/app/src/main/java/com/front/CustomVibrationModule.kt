package com.front

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray


class CustomVibrationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CustomVibration"

    @ReactMethod
    fun vibratePatternWithAmplitude(pattern: ReadableArray, amplitudes: ReadableArray, repeat: Boolean) {
        val vibrator = reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        // 배열 변환
        val patternArray = LongArray(pattern.size()) { i ->
            pattern.getInt(i).toLong()
        }

        val amplitudeArray = IntArray(amplitudes.size()) { i ->
            amplitudes.getInt(i)
        }

        val repeatIndex = if (repeat) 0 else -1

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createWaveform(patternArray, amplitudeArray, repeatIndex)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(patternArray, repeatIndex) // amplitude 조절 불가
        }
    }


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
    
    @ReactMethod
    fun vibrateWithPattern(pattern: ReadableArray, repeat: Boolean) {
        val vibrator = reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        // ReadableArray → LongArray 변환
        val patternList = LongArray(pattern.size()) { i ->
            pattern.getInt(i).toLong()
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val repeatIndex = if (repeat) 0 else -1
            val effect = VibrationEffect.createWaveform(patternList, repeatIndex)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(patternList, if (repeat) 0 else -1)
        }
    }

}

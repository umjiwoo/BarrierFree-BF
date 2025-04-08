package com.front

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray


class CustomVibrationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val vibrator: Vibrator by lazy {
        reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    
    private var isHeartbeatActive = false

    override fun getName(): String = "CustomVibration"

    // 기본 메서드들
    @ReactMethod
    fun vibratePatternWithAmplitude(pattern: ReadableArray, amplitudes: ReadableArray, repeat: Boolean) {
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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(duration.toLong(), amplitude)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(duration.toLong()) // amplitude 조절 불가
        }
    }
    
    @ReactMethod
    fun vibrateWithPattern(pattern: ReadableArray, repeat: Boolean) {
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

    // 통합된 진동 패턴 메서드
    @ReactMethod
    fun vibrateCustomSequence(name: String) {
        // 심장박동 상태 체크 및 업데이트
        if (name == "heartbeat_start") {
            isHeartbeatActive = true
        } else if (name == "heartbeat_stop" || name == "cancel") {
            isHeartbeatActive = false
        }
        
        // 이전 진동 취소
        vibrator.cancel()

        when (name.lowercase()) {
            // 알림 유형
            "notification" -> vibrateNotification()
            "success" -> vibrateSuccess()
            "error" -> vibrateError()
            "warning" -> vibrateWarning()
            "cheerful_success" -> vibrateCheerfulSuccess()
            
            // 상호작용 유형
            "tick" -> vibrateTick()
            "double_tick" -> vibrateDoubleTick()
            "long_press" -> vibrateLongPress()
            
            // 특수 시퀀스
            "sos" -> vibrateSOS()
            "doorbell" -> vibrateDoorbell()
            "typing" -> vibrateTyping()
            "camera" -> vibrateCamera()
            "countdown" -> vibrateCountdown()
            
            // 심장박동 패턴 제어
            "heartbeat_start" -> startHeartbeat()
            "heartbeat_stop" -> stopHeartbeat()
            
            // 기본값
            else -> vibrateNotification()
        }

        // 진동 패턴별 적절한 지연 시간 설정
        val delayTime = when (name.lowercase()) {
            "tick" -> 100L // 짧은 틱은 빨리 재개
            "double_tick" -> 200L
            "notification" -> 500L
            "success" -> 300L
            "error" -> 600L
            "warning" -> 1000L
            "cheerful_success" -> 700L
            else -> 500L // 기본 지연 시간
        }

        // 만약 다른 패턴 실행 후 심장박동이 활성화되었었다면 재개
        val handler = Handler(Looper.getMainLooper())
        handler.postDelayed({
            if (isHeartbeatActive) {
                vibrateHeartbeat()
            }
        }, delayTime)
    }
    
    // 심장박동 제어 메서드
    @ReactMethod
    fun startHeartbeat() {
        vibrator.cancel()
        isHeartbeatActive = true
        vibrateHeartbeat()
    }
    
    @ReactMethod
    fun stopHeartbeat() {
        isHeartbeatActive = false
        vibrator.cancel()
    }
    
    // 심장박동 중에 다른 진동 실행
    @ReactMethod
    fun vibrateWithHeartbeatResume(patternName: String) {
        val wasHeartbeatActive = isHeartbeatActive
        vibrator.cancel()
        
        // 요청된 진동 실행
        vibrateCustomSequence(patternName)
        
        // 진동 후 심장박동 재개
        if (wasHeartbeatActive) {
            val handler = Handler(Looper.getMainLooper())
            handler.postDelayed({
                if (isHeartbeatActive) {
                    vibrateHeartbeat()
                }
            }, 1000) // 1초 후 재개
        }
    }

    @ReactMethod
    fun cancelVibration() {
        vibrator.cancel()
        isHeartbeatActive = false
    }
    
    // 진동 패턴 구현
    private fun vibrateNotification() {
        // 알림용 진동 패턴: 짧게-긴 진동
        val pattern = longArrayOf(0, 100, 100, 300)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 100, 0, 255)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateSuccess() {
        // 성공 알림용 진동 패턴: 짧게-짧게-길게
        val pattern = longArrayOf(0, 50, 50, 150)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 100, 0, 255)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateError() {
        // 에러 알림용 진동 패턴: 길게-짧게-길게
        val pattern = longArrayOf(0, 100, 100, 100, 100, 300)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 170, 0, 170, 0, 255)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateWarning() {
        // 경고 알림용 진동 패턴: 짧게 3번
        val pattern = longArrayOf(0, 300, 100, 300, 100, 500)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 255, 0, 255, 0, 255)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateLongPress() {
        // 길게 누르기용 진동 패턴: 중간 강도로 한번 길게
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(300, 150)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(300)
        }
    }

    private fun vibrateTick() {
        // 짧은 틱 진동 (버튼 터치 등): 매우 짧고 약한 진동
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(20, 80)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(20)
        }
    }
    
    private fun vibrateDoubleTick() {
        // 두 번 연속 짧은 틱 진동
        val pattern = longArrayOf(0, 20, 150, 20)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 80, 0, 80)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateHeartbeat() {
        // 심장 박동 효과: 짧게-간격-짧게-긴 간격 반복
        val pattern = longArrayOf(0, 50, 180, 50, 500)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 60, 0, 60, 0)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, 0) // 반복
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, 0) // 반복
        }
    }
    
    private fun vibrateCheerfulSuccess() {
        // 경쾌한 성공 진동 패턴: 짧게-짧게-길게 올라가는 강도
        val pattern = longArrayOf(0, 10, 40, 10, 40, 10, 40, 10, 40, 10, 40, 10, 40, 10, 60, 200)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 100, 0, 120, 0, 140, 0, 160, 0, 180, 0, 200, 0, 220, 0, 230)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateSOS() {
        // 모스 부호 SOS: ... --- ...
        val pattern = longArrayOf(
            0, 100, 100, 100, 100, 100, 200,  // S (...)
            300, 200, 100, 300, 200, 100, 300, 200,  // O (---)
            100, 100, 100, 100, 100, 100, 100  // S (...)
        )
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = IntArray(pattern.size) { i -> if (i % 2 == 1) 255 else 0 }
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateDoorbell() {
        // 초인종 스타일 진동
        val pattern = longArrayOf(0, 100, 100, 100)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 200, 0, 255)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, 3) // 3번 반복
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, 0) // 반복
            // 참고: API 26 미만에서는 정확한 반복 횟수 지정 불가
        }
    }

    private fun vibrateTyping() {
        // 로딩중 효과 - 여러 번의 짧은 진동
        val pattern = longArrayOf(0, 10, 40, 10, 40, 10, 40, 10, 40, 10)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 70, 0, 70, 0, 70, 0, 70, 0, 70)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun vibrateCamera() {
        // 카메라 셔터 효과
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(50, 255)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(50)
        }
    }

    private fun vibrateCountdown() {
        // 카운트다운 효과 (3-2-1)
        val pattern = longArrayOf(0, 100, 1000, 100, 1000, 100)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val amplitudes = intArrayOf(0, 100, 0, 150, 0, 255)
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }
}
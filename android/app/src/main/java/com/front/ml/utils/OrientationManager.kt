package com.front.ml.utils

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log
import android.view.Surface
import android.view.WindowManager
import kotlin.math.abs
import kotlin.math.round

/**
 * 기기 방향 관리 클래스
 * 카메라와 화면 방향 감지 및 관리
 */
class OrientationManager(context: Context) : SensorEventListener {
    companion object {
        private const val TAG = "OrientationManager"
        
        // 방향 상수
        const val ORIENTATION_PORTRAIT = 0            // 세로
        const val ORIENTATION_LANDSCAPE_RIGHT = 90    // 가로 (오른쪽)
        const val ORIENTATION_PORTRAIT_UPSIDE_DOWN = 180 // 세로 (뒤집힘)
        const val ORIENTATION_LANDSCAPE_LEFT = 270    // 가로 (왼쪽)
        
        // 센서 업데이트 최소 간격 (ms)
        private const val SENSOR_UPDATE_THRESHOLD = 100
    }
    
    // 센서 관리자
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    
    // 윈도우 관리자
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    
    // 방향 리스너
    private var orientationListener: OrientationListener? = null
    
    // 현재 화면 방향 (각도)
    private var currentScreenOrientation = ORIENTATION_PORTRAIT
    
    // 현재 기기 회전 각도 (0, 90, 180, 270)
    private var deviceOrientation = ORIENTATION_PORTRAIT
    
    // 마지막 센서 업데이트 시간
    private var lastSensorUpdateTime = 0L
    
    /**
     * 방향 감지 시작
     */
    fun startListening(listener: OrientationListener) {
        orientationListener = listener
        
        // 가속도 센서 등록
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        if (accelerometer != null) {
            sensorManager.registerListener(
                this,
                accelerometer,
                SensorManager.SENSOR_DELAY_NORMAL
            )
            Log.d(TAG, "가속도 센서 리스너 등록 완료")
        } else {
            Log.w(TAG, "가속도 센서를 찾을 수 없음, 방향 감지가 제한됩니다.")
        }
        
        // 초기 화면 방향 설정
        currentScreenOrientation = getCurrentScreenRotation()
        listener.onOrientationChanged(currentScreenOrientation, deviceOrientation)
    }
    
    /**
     * 방향 감지 중지
     */
    fun stopListening() {
        sensorManager.unregisterListener(this)
        orientationListener = null
        Log.d(TAG, "방향 센서 리스너 등록 해제")
    }
    
    /**
     * 현재 화면 회전 상태 가져오기
     */
    fun getCurrentScreenRotation(): Int {
        return when (windowManager.defaultDisplay.rotation) {
            Surface.ROTATION_0 -> ORIENTATION_PORTRAIT
            Surface.ROTATION_90 -> ORIENTATION_LANDSCAPE_RIGHT
            Surface.ROTATION_180 -> ORIENTATION_PORTRAIT_UPSIDE_DOWN
            Surface.ROTATION_270 -> ORIENTATION_LANDSCAPE_LEFT
            else -> ORIENTATION_PORTRAIT
        }
    }
    
    /**
     * 현재 기기 회전 상태 가져오기
     */
    fun getDeviceOrientation(): Int {
        return deviceOrientation
    }
    
    /**
     * 카메라와 화면 방향 보정값 계산
     * @param cameraRotation 카메라 센서 기본 회전 각도
     * @return 보정값 (카메라 출력을 화면에 올바르게 표시하기 위한 각도)
     */
    fun getCameraToScreenRotation(cameraRotation: Int): Int {
        val screenRotation = getCurrentScreenRotation()
        return (cameraRotation - screenRotation + 360) % 360
    }
    
    /**
     * 센서 이벤트 처리
     */
    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type != Sensor.TYPE_ACCELEROMETER) {
            return
        }
        
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastSensorUpdateTime < SENSOR_UPDATE_THRESHOLD) {
            return
        }
        lastSensorUpdateTime = currentTime
        
        // 가속도 센서 값
        val x = event.values[0]
        val y = event.values[1]
        
        // 기기 방향 계산
        val angle = calculateAngle(x, y)
        val orientation = roundOrientation(angle)
        
        if (orientation != deviceOrientation) {
            deviceOrientation = orientation
            orientationListener?.onOrientationChanged(currentScreenOrientation, deviceOrientation)
            Log.d(TAG, "기기 방향 변경: $deviceOrientation")
        }
    }
    
    /**
     * 센서 정확도 변경 이벤트
     */
    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
        // 정확도 변경은 처리하지 않음
    }
    
    /**
     * 가속도 센서로부터 각도 계산
     */
    private fun calculateAngle(x: Float, y: Float): Int {
        // x, y 값으로부터 각도 계산 (0-359)
        val angle = (Math.toDegrees(Math.atan2(y.toDouble(), x.toDouble())) + 90).toInt()
        return (angle + 360) % 360
    }
    
    /**
     * 각도를 90도 단위로 변환
     */
    private fun roundOrientation(angle: Int): Int {
        return when {
            angle >= 315 || angle < 45 -> ORIENTATION_PORTRAIT
            angle >= 45 && angle < 135 -> ORIENTATION_LANDSCAPE_RIGHT
            angle >= 135 && angle < 225 -> ORIENTATION_PORTRAIT_UPSIDE_DOWN
            else -> ORIENTATION_LANDSCAPE_LEFT
        }
    }
    
    /**
     * 방향 변경 리스너 인터페이스
     */
    interface OrientationListener {
        /**
         * 방향이 변경되었을 때 호출
         * @param screenOrientation 화면 방향 (0, 90, 180, 270)
         * @param deviceOrientation 기기 방향 (0, 90, 180, 270)
         */
        fun onOrientationChanged(screenOrientation: Int, deviceOrientation: Int)
    }
} 
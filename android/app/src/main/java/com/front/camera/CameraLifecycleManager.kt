package com.front.camera

import android.content.Context
import android.util.Log
import android.util.Size
import android.view.Surface
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import java.util.concurrent.Executor
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * 카메라 라이프사이클 관리와 설정을 담당하는 클래스
 */
class CameraLifecycleManager(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    private val previewView: PreviewView? = null
) {
    companion object {
        private const val TAG = "CameraLifecycleManager"
    }
    
    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private var imageAnalyzer: ImageAnalysis? = null
    
    /**
     * 카메라 초기화 및 시작
     */
    fun startCamera(
        cameraSelector: CameraSelector = CameraSelector.DEFAULT_BACK_CAMERA,
        imageAnalyzer: ImageAnalysis.Analyzer? = null,
        targetResolution: Size? = null,
        rotationDegrees: Int = Surface.ROTATION_0
    ) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                bindCameraUseCases(
                    cameraSelector,
                    imageAnalyzer,
                    targetResolution,
                    rotationDegrees
                )
            } catch (e: Exception) {
                Log.e(TAG, "카메라 바인딩 실패", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }
    
    /**
     * 카메라 사용 케이스 바인딩
     */
    private fun bindCameraUseCases(
        cameraSelector: CameraSelector,
        imageAnalyzer: ImageAnalysis.Analyzer?,
        targetResolution: Size?,
        rotationDegrees: Int
    ) {
        val cameraProvider = cameraProvider ?: return
        
        // 이전 바인딩 해제
        cameraProvider.unbindAll()
        
        // 프리뷰 설정
        val preview = previewView?.let {
            Preview.Builder().apply {
                targetResolution?.let { size -> setTargetResolution(size) }
                setTargetRotation(rotationDegrees)
            }.build().also { preview ->
                preview.setSurfaceProvider(it.surfaceProvider)
            }
        }
        
        // 이미지 분석기 설정
        this.imageAnalyzer = imageAnalyzer?.let {
            ImageAnalysis.Builder().apply {
                targetResolution?.let { size -> setTargetResolution(size) }
                setTargetRotation(rotationDegrees)
                setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            }.build().also { analysis ->
                analysis.setAnalyzer(cameraExecutor, it)
            }
        }
        
        // 사용 케이스 바인딩
        try {
            // 사용 가능한 사용 케이스만 바인딩
            val useCases = mutableListOf<UseCase>()
            preview?.let { useCases.add(it) }
            this.imageAnalyzer?.let { useCases.add(it) }
            
            if (useCases.isNotEmpty()) {
                camera = cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    *useCases.toTypedArray()
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "사용 케이스 바인딩 실패", e)
        }
    }
    
    /**
     * 현재 카메라 토글 (전면/후면)
     */
    fun toggleCamera(
        imageAnalyzer: ImageAnalysis.Analyzer? = null, 
        targetResolution: Size? = null,
        rotationDegrees: Int = Surface.ROTATION_0
    ) {
        val currentCamera = camera ?: return
        val currentCameraSelector = currentCamera.cameraInfo.lensFacing
        
        val newCameraSelector = if (currentCameraSelector == CameraSelector.LENS_FACING_BACK) {
            CameraSelector.DEFAULT_FRONT_CAMERA
        } else {
            CameraSelector.DEFAULT_BACK_CAMERA
        }
        
        startCamera(
            newCameraSelector, 
            imageAnalyzer,
            targetResolution,
            rotationDegrees
        )
    }
    
    /**
     * 이미지 분석기 설정
     */
    fun setImageAnalyzer(
        analyzer: ImageAnalysis.Analyzer,
        executor: Executor = cameraExecutor
    ) {
        imageAnalyzer?.clearAnalyzer()
        imageAnalyzer?.setAnalyzer(executor, analyzer)
    }
    
    /**
     * 플래시 상태 토글
     */
    fun toggleFlash(): Boolean {
        val camera = camera ?: return false
        
        return if (camera.cameraInfo.hasFlashUnit()) {
            if (camera.cameraInfo.torchState.value == TorchState.ON) {
                camera.cameraControl.enableTorch(false)
                false
            } else {
                camera.cameraControl.enableTorch(true)
                true
            }
        } else {
            false
        }
    }
    
    /**
     * 리소스 해제
     */
    fun shutdown() {
        imageAnalyzer?.clearAnalyzer()
        cameraProvider?.unbindAll()
        cameraExecutor.shutdown()
    }
} 
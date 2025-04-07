package com.front

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.front.camera.CameraLifecycleManager
import com.front.ml.TFLiteModelFactory
import java.io.File

class CameraPreviewModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "CameraPreviewModule"
        private const val CAMERA_REQUEST_CODE = 1001
    }

    private var mPromise: Promise? = null
    private var mActivityEventListener: BaseActivityEventListener? = null
    private val modelFactory: TFLiteModelFactory by lazy { TFLiteModelFactory.getInstance(reactContext) }

    init {
        mActivityEventListener = object : BaseActivityEventListener() {
            override fun onActivityResult(activity: android.app.Activity?, requestCode: Int, resultCode: Int, intent: Intent?) {
                if (requestCode == CAMERA_REQUEST_CODE) {
                    val promise = mPromise
                    mPromise = null

                    if (promise == null) {
                        return
                    }

                    if (resultCode == android.app.Activity.RESULT_OK) {
                        val imageUri = intent?.getStringExtra("imageUri")
                        if (imageUri != null) {
                            val resultMap = Arguments.createMap().apply {
                                putString("uri", imageUri)
                            }
                            promise.resolve(resultMap)
                        } else {
                            promise.reject("E_NO_IMAGE", "No image was captured")
                        }
                    } else if (resultCode == android.app.Activity.RESULT_CANCELED) {
                        val resultMap = Arguments.createMap().apply {
                            putBoolean("cancelled", true)
                        }
                        promise.resolve(resultMap)
                    }
                }
            }
        }
        reactContext.addActivityEventListener(mActivityEventListener)
    }

    override fun getName(): String {
        return "CameraPreviewModule"
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val result = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("E_PERMISSION_CHECK_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun openCamera(promise: Promise) {
        if (mPromise != null) {
            promise.reject("E_BUSY", "Camera is already in use")
            return
        }

        mPromise = promise

        try {
            val currentActivity = currentActivity
            if (currentActivity == null) {
                promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
                mPromise = null
                return
            }

            // 카메라 권한 확인
            if (ContextCompat.checkSelfPermission(
                    reactContext,
                    Manifest.permission.CAMERA
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                promise.reject("E_PERMISSION_DENIED", "Camera permission is not granted")
                mPromise = null
                return
            }

            // CameraActivity 패키지 이름은 camerapreviewex 프로젝트의 패키지 이름에 맞게 수정
            val intent = Intent(reactContext, com.example.camerapreview.CameraActivity::class.java)
            currentActivity.startActivityForResult(intent, CAMERA_REQUEST_CODE)
        } catch (e: Exception) {
            mPromise?.reject("E_FAILED_TO_OPEN_CAMERA", e.message, e)
            mPromise = null
            Log.e(TAG, "Failed to open camera", e)
        }
    }

    @ReactMethod
    fun loadTFLiteModel(modelName: String, labelsName: String, promise: Promise) {
        modelFactory.loadModel(modelName, labelsName) { success, modelPath, labelsPath ->
            if (success) {
                val result = Arguments.createMap().apply {
                    putString("modelPath", modelPath)
                    putString("labelsPath", labelsPath)
                    putBoolean("success", true)
                }
                promise.resolve(result)
            } else {
                promise.reject("E_LOAD_MODEL_FAILED", "Failed to load TF Lite model")
            }
        }
    }

    @ReactMethod
    fun isModelLoaded(modelName: String, promise: Promise) {
        promise.resolve(modelFactory.isModelLoaded(modelName))
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        if (mActivityEventListener != null) {
            reactContext.removeActivityEventListener(mActivityEventListener)
            mActivityEventListener = null
        }
        // 리소스 정리
        modelFactory.releaseAll()
    }
} 
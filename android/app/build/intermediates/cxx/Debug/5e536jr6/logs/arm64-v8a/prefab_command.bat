@echo off
"C:\\Program Files\\Java\\jdk-17\\bin\\java" ^
  --class-path ^
  "C:\\Users\\SSAFY\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  arm64-v8a ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  27 ^
  --output ^
  "C:\\Users\\SSAFY\\AppData\\Local\\Temp\\agp-prefab-staging2866094483466444530\\staged-cli-output" ^
  "C:\\Users\\SSAFY\\.gradle\\caches\\8.12\\transforms\\9f8e25feabbe8b0b7a3e83fbd347083e\\transformed\\react-android-0.78.0-debug\\prefab" ^
  "C:\\Users\\SSAFY\\Desktop\\secondpjt\\drawing\\android\\app\\build\\intermediates\\cxx\\refs\\shopify_react-native-skia\\4n5f2024" ^
  "C:\\Users\\SSAFY\\.gradle\\caches\\8.12\\transforms\\4c116c53cba92459b32019e002c1a576\\transformed\\hermes-android-0.78.0-debug\\prefab" ^
  "C:\\Users\\SSAFY\\.gradle\\caches\\8.12\\transforms\\bbbd7faada6db350ac59925f93ab342e\\transformed\\fbjni-0.7.0\\prefab"

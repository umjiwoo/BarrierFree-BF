if(NOT TARGET shopify_react-native-skia::rnskia)
add_library(shopify_react-native-skia::rnskia SHARED IMPORTED)
set_target_properties(shopify_react-native-skia::rnskia PROPERTIES
    IMPORTED_LOCATION "C:/Users/SSAFY/Desktop/secondpjt/drawing/node_modules/@shopify/react-native-skia/android/build/intermediates/cxx/Debug/4h3s5p28/obj/arm64-v8a/librnskia.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/SSAFY/Desktop/secondpjt/drawing/node_modules/@shopify/react-native-skia/android/build/headers/rnskia"
    INTERFACE_LINK_LIBRARIES ""
)
endif()


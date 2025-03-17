import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface NavigationButtonProps {
  // 이동할 화면 이름 (필수)
  screenName: string;
  // 화면 이동 시 전달할 파라미터 (선택적)
  params?: object;
  // 버튼에 표시할 텍스트
  title: string;
  // 버튼 컨테이너 스타일 (선택적)
  style?: ViewStyle;
  // 버튼 텍스트 스타일 (선택적)
  textStyle?: TextStyle;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ 
  screenName, 
  params, 
  title,
  style,
  textStyle
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (screenName) {
      navigation.navigate(screenName, params);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]} // 기본 스타일과 사용자 정의 스타일 병합
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!screenName}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2980b9',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NavigationButton;


// // 크기가 더 큰 버튼
// <NavigationButton 
//   screenName="Home" 
//   title="홈으로 이동" 
//   style={{ 
//     width: 200,
//     height: 60,
//     backgroundColor: 'green'
//   }}
//   textStyle={{
//     fontSize: 18,
//     color: 'yellow'
//   }}
// />

// // 작은 버튼
// <NavigationButton 
//   screenName="Profile" 
//   title="프로필" 
//   style={{ 
//     width: 100,
//     height: 40,
//     borderRadius: 20
//   }}
// />

// // 두꺼운 테두리의 버튼
// <NavigationButton 
//   screenName="Home" 
//   title="홈으로 이동" 
//   style={{ 
//     borderWidth: 2,
//     borderColor: '#1a5276',
//     borderRadius: 10
//   }}
// />

// // 점선 테두리의 버튼
// <NavigationButton 
//   screenName="Settings" 
//   title="설정" 
//   style={{ 
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: '#3498db',
//     borderStyle: 'dashed'
//   }}
//   textStyle={{
//     color: '#3498db'
//   }}
// />
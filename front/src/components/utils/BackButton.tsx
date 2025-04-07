import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface BackButtonProps {
  style?: ViewStyle; // 버튼 컨테이너 스타일
  textStyle?: TextStyle; // 텍스트 스타일
  text?: string; // 버튼 텍스트 (기본값: '뒤로')
  type: 'back' | 'input'; // 버튼 타입 (기본값: 'back') / back -> 빨간 버튼 / input -> 파란 버튼
  onPress?: () => void;
}

/**
 * 간단한 뒤로가기 버튼 컴포넌트
 */
const BackButton: React.FC<BackButtonProps> = ({
  style,
  textStyle,
  text = '뒤로',
  type,
  onPress,
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={
        type === 'back'
          ? [styles.backButton, styles.container, style]
          : [styles.inputButton, styles.container, style]
      }
      onPress={onPress ? onPress : () => navigation.goBack()}
      activeOpacity={0.7}>
      <Text
        style={
          type === 'back'
            ? [styles.backButtonText, styles.text, textStyle]
            : [styles.inputButtonText, styles.text, textStyle]
        }>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1, // 테두리 두께
    borderColor: '#ffffff', // 테두리 색상
    borderRadius: 5, // 테두리 모서리 둥글기
    // backgroundColor: 'transparent', // 배경색 투명
  },
  text: {
    fontSize: 20,
  },
  backButton: {
    backgroundColor: '#B6010E',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
  inputButton: {
    backgroundColor: '#373DCC',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  inputButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
});

export default BackButton;

// // 기본 사용법
// <BackButton />

// // 크기가 큰 뒤로가기 버튼
// <BackButton
//   style={{
//     padding: 15,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 25
//   }}
//   iconStyle={{
//     width: 30,
//     height: 30
//   }}
//   color="#333"
// />

// // 작은 뒤로가기 버튼
// <BackButton
//   style={{
//     padding: 5,
//     marginLeft: 10
//   }}
//   iconStyle={{
//     width: 18,
//     height: 18
//   }}
//   color="blue"
// />

// // 두꺼운 빨간색 테두리
// <BackButton
//   style={{
//     borderWidth: 2,
//     borderColor: 'red',
//     borderRadius: 10
//   }}
// />

// // 테두리 없애기
// <BackButton
//   style={{ borderWidth: 0 }}
// />

// // 다양한 테두리 스타일
// <BackButton
//   style={{
//     borderWidth: 1,
//     borderColor: '#333',
//     borderStyle: 'dashed',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 8
//   }}
// />

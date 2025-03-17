import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton';

// 라우트 파라미터 타입 정의
type SendInputPageParams = {
  SendInputPage: {
    type: 'direct' | 'send' | 'transfer';
  };
};

// 라우트 타입 정의
type SendInputPageRouteProp = RouteProp<SendInputPageParams, 'SendInputPage'>;

const SendInputPage = () => {
  // 네비게이션 객체 가져오기
  const navigation = useNavigation();

  // 라우트 파라미터에서 type 가져오기
  const route = useRoute<SendInputPageRouteProp>();
  const { type } = route.params || { type: 'direct' }; // 기본값 설정

  // 타입에 따라 헤더 타이틀 설정
  useEffect(() => {
    let title = '입력 화면';

    if (type === 'direct') {
      title = '직접 입력';
    } else if (type === 'send') {
      title = '송금하기';
    } else if (type === 'transfer') {
      title = '이체하기';
    }

    navigation.setOptions({ title });
  }, [navigation, type]);

  // 조건에 따라 다른 내용 렌더링
  const renderContent = () => {
    if (type === 'direct') {
      // 1. 직접입력을 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>직접 입력 화면입니다.</Text>
          <View style={styles.buttonContainer}>
            <BackButton 
              text="뒤로 가기" 
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
        </View>
      );
    } else if (type === 'send') {
      // 2. 송금하기를 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>송금하기 화면입니다.</Text>
          <View style={styles.buttonContainer}>
            <BackButton 
              text="뒤로 가기" 
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
        </View>
      );
    } else if (type === 'transfer') {
      // 3. 이체하기를 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>이체하기 화면입니다.</Text>
          <View style={styles.buttonContainer}>
            <BackButton 
              text="뒤로 가기" 
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: '80%',
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 12,
  },
  backButtonText: {
    color: 'white',  // 텍스트 색상을 흰색으로 지정
    fontWeight: 'bold',
  },
});

export default SendInputPage;
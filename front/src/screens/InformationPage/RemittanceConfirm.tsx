import React from 'react';
import {View, StyleSheet} from 'react-native';
// import Title from '../../components/information/Title';
import Title from '../../components/Title';
import DetailBox from '../../components/information/DetailBoxConfirm';
import BackButton from '../../components/BackButton';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import useTab from '../../components/vibration/useTab';

const ReceivingConfirmScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const useTap = useTab();

  const handleSend = () => {
    console.log('송금하기 버튼 클릭');
    useTap.handlePress(() => navigation.navigate('SendSuccess'));
  };

  const handleBack = () => {
    console.log('이전으로 버튼 클릭');
    useTap.handlePress(() => navigation.goBack());
  };

  return (
    <View style={styles.container}>
      <Title title="이체 재확인." />
      <DetailBox name="엄지우" amount={50000} />

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton
          text="송금하기"
          type="input"
          onPress={handleSend}
          style={styles.sendButton}
          textStyle={styles.buttonText}
        />
        <BackButton
          text="이전으로"
          type="back"
          onPress={handleBack}
          style={styles.backButton}
          textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 50,
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  sendButton: {
    backgroundColor: '#373DCC',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: '#B6010E',
    width: '100%',
    height: 70,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
});

export default ReceivingConfirmScreen;

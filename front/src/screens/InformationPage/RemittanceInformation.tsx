import React from 'react';
import {View, StyleSheet} from 'react-native';
// import Title from '../../components/information/Title';
import Title from '../../components/Title';
import DetailBox from '../../components/information/DetailBoxInformation';
import BackButton from '../../components/BackButton';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import useTab from '../../components/vibration/useTab';

const ReceivingInformationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const useTap = useTab();

  const handleSend = () => {
    useTap.handlePress(() =>
      navigation.navigate('SendInputPage', {type: 'password'}),
    );
    console.log('송금하기 버튼 클릭');
  };

  const handleBack = () => {
    useTap.handlePress(() => navigation.goBack());
    console.log('이전으로 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <Title title="송금 정보를 확인하세요." />
      <DetailBox
        recipient="엄지우"
        bank="신한"
        account="123-456-789000"
        remitter="박수연"
        amount={5000}
      />

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

export default ReceivingInformationScreen;

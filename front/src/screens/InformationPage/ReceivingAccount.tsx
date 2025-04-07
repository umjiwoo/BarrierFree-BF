import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import DetailBox from '../../components/information/DetailBoxAccount';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/DefaultPage';
const ReceivingAccountScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'ReceivingAccountScreen'>>();
  const accountInfo = route.params?.selectedAccount;

  const handleSend = () => {
    console.log('송금하기 버튼 클릭');
    navigation.navigate('SendInputPage', {
      type: 'money',
      selectedAccount: accountInfo,
    }); // 금액 입력 페이지로 이동
    // alert('송금하기 버튼 클릭됨!');
  };

  const handleBack = () => {
    console.log('이전으로 버튼 클릭');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText="이전으로"
        UpperRightText="홈"
        LowerLeftText="취소하기"
        LowerRightText="송금하기"
        MainText={
          <View>
            <Text>받는 사람 정보를 확인하세요.</Text>
            <DetailBox
              name={accountInfo.name}
              bank={accountInfo.accountBank}
              account={accountInfo.accountNumber}
            />
          </View>
        }
        onUpperLeftTextPress={handleBack}
        onUpperRightTextPress={() => navigation.navigate('Main')}
        onLowerLeftTextPress={handleBack}
        onLowerRightTextPress={handleSend}
      />
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

export default ReceivingAccountScreen;

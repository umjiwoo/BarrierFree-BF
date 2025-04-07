import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import DetailBox from '../../components/information/DetailBoxInformation';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import DefaultPage from '../../components/DefaultPage';
import {RootStackParamList} from '../../navigation/types';
const ReceivingInformationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'RemittanceInformation'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;

  const handleSend = () => {
    navigation.navigate('SendInputPage', {
      type: 'password',
      selectedAccount: selectedAccount,
      money: money,
    });
    console.log('송금하기 버튼 클릭');
  };

  const handleBack = () => {
    navigation.goBack();
    console.log('이전으로 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText="이전으로"
        UpperRightText="홈"
        LowerLeftText="취소"
        LowerRightText="송금하기"
        MainText={
          <View>
            <Text>송금 정보를 확인하세요.</Text>
            <DetailBox
              recipient={selectedAccount.name}
              bank={selectedAccount.accountBank}
              account={selectedAccount.accountNumber}
              remitter="박수연"
              amount={money}
            />
          </View>
        }
        onUpperLeftTextPress={handleBack}
        onUpperRightTextPress={() => navigation.navigate('Main')}
        onLowerLeftTextPress={handleSend}
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

export default ReceivingInformationScreen;

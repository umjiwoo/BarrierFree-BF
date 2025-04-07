import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/DefaultPage';
import DetailBox from '../../components/information/DetailBoxInformation';

const ReceivingConfirmScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RemittanceConfirm'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;

  const handleSend = () => {
    console.log('송금하기 버튼 클릭');
    navigation.navigate('SendSuccess');
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
        LowerLeftText="취소"
        LowerRightText="송금하기"
        MainText={
          <View>
            <DetailBox
              recipient={selectedAccount.name}
              bank={selectedAccount.accountBank}
              account={selectedAccount.accountNumber}
              remitter="박수연"
              amount={money}
            />
            <Text style={{fontSize: 20, fontWeight: 'bold', margin: 20}}>
              송금하시겠습니까?
            </Text>
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

export default ReceivingConfirmScreen;

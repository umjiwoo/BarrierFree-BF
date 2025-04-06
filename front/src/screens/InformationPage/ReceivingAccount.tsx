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
import {useHandlePress} from '../../navigation/handlePress';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';

const ReceivingAccountScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
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

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소하기"
        LowerRightText="송금하기"
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>받는 사람 정보를 확인하세요.</Text>
            <DetailBox
              name={accountInfo.name}
              bank={accountInfo.accountBank}
              account={accountInfo.accountNumber}
            />
          </View>
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
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
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    // marginTop: 50,
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
  mainText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#7F35D4',
  },
  mainTextContainer: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    // justifyContent: 'center',
  },
});

export default ReceivingAccountScreen;

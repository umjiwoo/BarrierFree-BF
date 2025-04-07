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
import DefaultPage from '../../components/utils/DefaultPage';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import {useUserStore} from '../../stores/userStore';

const ReceivingInformationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const route =
    useRoute<RouteProp<RootStackParamList, 'RemittanceInformation'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;
  const {user} = useUserStore();

  const handleSend = () => {
    navigation.navigate('SendInputPage', {
      type: 'password',
      selectedAccount: selectedAccount,
      money: money,
    });
    console.log('송금하기 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소"
        LowerRightText="송금하기"
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>송금 정보를 확인하세요.</Text>
            <DetailBox
              recipient={selectedAccount.receiverName}
              receiverAccount={selectedAccount.receiverAccount}
              remitter={user.username}
              amount={money}
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
  mainText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#7F35D4',
  },
  mainTextContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    // justifyContent: 'center',
  },
});

export default ReceivingInformationScreen;

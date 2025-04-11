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
import DefaultPage from '../../components/utils/DefaultPage2';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useUserStore} from '../../stores/userStore';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {useTapNavigationHandler} from '../../components/utils/useTapNavigationHandler ';

const ReceivingInformationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const route =
    useRoute<RouteProp<RootStackParamList, 'RemittanceInformation'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;
  const receiverAccountId = route.params?.receiverAccountId;
  const {user} = useUserStore();

  useTTSOnFocus(`
    ${selectedAccount.receiverName}님에게 ${money}원을 송금하시겠습니까?
    취소하시려면 왼쪽 아래를, 송금하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const handleSend = () => {
    navigation.navigate('SendInputPage', {
      type: 'password',
      selectedAccount: selectedAccount,
      money: money,
      receiverAccountId: receiverAccountId,
    });
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
            <ArrowLeftIcon width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        UpperRightText={
          <View style={styles.textContainer}>
            <HomeIcon width={100} height={100} />
            <Text style={styles.text}>메인</Text>
          </View>
        }
        LowerLeftText={
          <View style={styles.textContainer}>
            <CancelIcon width={100} height={100} />
            <Text style={styles.text}>취소</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <CheckIcon width={100} height={100} />
            <Text style={styles.text}>확인</Text>
          </View>
        }
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
        onUpperLeftTextPress={() =>
          handleDefaultPress('이전', undefined, handlePressBack)
        }
        onUpperRightTextPress={() =>
          handleDefaultPress('홈', undefined, handlePressHome)
        }
        onLowerLeftTextPress={() =>
          handleDefaultPress('이전', undefined, handlePressBack)
        }
        onLowerRightTextPress={() =>
          handleDefaultPress('송금하기', undefined, handleSend)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  mainText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainTextContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default ReceivingInformationScreen;

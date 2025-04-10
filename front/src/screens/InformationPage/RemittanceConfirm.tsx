import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import DetailBox from '../../components/information/DetailBoxInformation';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useUserStore} from '../../stores/userStore';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';


const ReceivingConfirmScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const {user} = useUserStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RemittanceConfirm'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;

  useTTSOnFocus(`
    ${selectedAccount.receiverName}님에게 ${money}원을 송금하시겠습니까?
    취소하시려면 왼쪽 아래를, 송금하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `)

  const handleSend = () => {
    console.log('송금하기 버튼 클릭');
    navigation.navigate('SendSuccess');
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
            <DetailBox
              recipient={selectedAccount.receiverName}
              receiverAccount={selectedAccount.receiverAccount}
              remitter={user.username}
              amount={money}
            />
            <Text style={styles.confirmText}>송금하시겠습니까?</Text>
          </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onLowerRightTextPress={() => handleDefaultPress('송금하기', undefined, handleSend)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    // marginTop: 50,
  },
  confirmText: {
    fontSize: 40,
    fontWeight: 'bold',
    // marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#7F35D4',
  },
  mainTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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

export default ReceivingConfirmScreen;

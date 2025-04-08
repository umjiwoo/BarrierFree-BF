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
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import {useUserStore} from '../../stores/userStore';

const ReceivingConfirmScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const {user} = useUserStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RemittanceConfirm'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;

  const handleSend = () => {
    console.log('송금하기 버튼 클릭');
    navigation.navigate('SendSuccess');
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
            <DetailBox
              recipient={selectedAccount.receiverName}
              receiverAccount={selectedAccount.receiverAccount}
              remitter={user.username}
              amount={money}
            />
            <Text style={styles.confirmText}>송금하시겠습니까?</Text>
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
});

export default ReceivingConfirmScreen;

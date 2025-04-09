import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import BackButton from '../components/utils/BackButton';
import {
  TestAccountItemProps,
  GoodsItemProps,
} from '../components/types/CheckAccount';
import {useHandlePress} from '../components/utils/handlePress';

// 숫자 입력
import InputAccount from '../components/drawing/InputAccount';
import InputAmount from '../components/drawing/InputAmount';
import InputPassword from '../components/drawing/InputPassword';

// 라우트 파라미터 타입 정의
type SendInputPageParams = {
  SendInputPage: {
    type: 'directMyAccount' | 'directOtherAccount' | 'money' | 'password';
    selectedAccount?: TestAccountItemProps;
    money?: number;
    goods?: GoodsItemProps;
  };
};

// 라우트 타입 정의
type SendInputPageRouteProp = RouteProp<SendInputPageParams, 'SendInputPage'>;

const SendInputPage = () => {
  // 네비게이션 객체 가져오기
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {handlePressBack} = useHandlePress();

  // 상태 관리 임시 추가
  const [accountNumber, _setAccountNumber] = React.useState('');
  // const [bankName, setBankName] = React.useState('');

  // 라우트 파라미터에서 type 가져오기
  const route = useRoute<SendInputPageRouteProp>();
  const {type, selectedAccount} = route.params || {
    type: 'directMyAccount',
    selectedAccount: null,
  }; // 기본값 설정
  const money = route.params?.money;
  const goods = route.params?.goods;

  // 타입에 따라 헤더 타이틀 설정
  useEffect(() => {
    let title = '입력 화면';

    if (type === 'directMyAccount') {
      title = '내 계좌 직접 입력';
    } else if (type === 'directOtherAccount') {
      title = '상대방 계좌 직접 입력';
    } else if (type === 'money') {
      title = '금액 입력';
    } else if (type === 'password') {
      title = '비밀번호 입력';
    }

    navigation.setOptions({title});
  }, [navigation, type]);

  // 조건에 따라 다른 내용 렌더링
  const renderContent = () => {
    if (type === 'directMyAccount') {
      // 1. 직접 계좌 입력을 받는 경우
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.text}>계좌 직접 입력 화면입니다.</Text>
          <View>
            {/* <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="계좌번호를 입력해주세요."
              keyboardType="numeric"
            /> */}
          </View>
          <View style={styles.buttonContainer}>
            <BackButton
              text="확인"
              type="input"
              onPress={() => {
                navigation.navigate('SendToWho', {
                  accountNumber: accountNumber,
                });
              }}
            />
            <BackButton
              text="뒤로 가기"
              type="back"
              onPress={handlePressBack}
            />
          </View>
        </View>
      );
    } else if (type === 'directOtherAccount') {
      // 2. 상대방 계좌 직접 입력을 받는 경우
      return (
        <InputAccount type={type}/>
        // <View style={styles.contentContainer}>
        //   <Text style={styles.text}>상대방 계좌 직접 입력 화면입니다.</Text>
        //   <View style={styles.buttonContainer}>
        //     <BackButton
        //       text="확인"
        //       type="input"
        //       onPress={() => {
        //         navigation.navigate('SendInputPage', {type: 'money'});
        //       }}
        //     />
        //     <BackButton
        //       text="뒤로 가기"
        //       type="back"
        //       onPress={handlePressBack}
        //     />
        //   </View>
        // </View>
      );
    } else if (type === 'money') {
      // 3. 금액 입력을 받는 경우
      return (
        <InputAmount type={type}/>
        // <View style={styles.contentContainer}>
        //   <Text style={styles.text}>금액 입력 화면입니다.</Text>
        //   <View style={styles.buttonContainer}>
        //     <BackButton
        //       text="확인"
        //       type="input"
        //       onPress={() => {
        //         navigation.navigate('RemittanceInformation', {
        //           money: 0,
        //           selectedAccount: selectedAccount,
        //         });
        //       }}
        //     />
        //     <BackButton
        //       text="뒤로 가기"
        //       type="back"
        //       onPress={handlePressBack}
        //     />
        //   </View>
        // </View>
      );
    } else if (type === 'password') {
      // 4. 비밀번호 입력을 받는 경우
      return (
        <InputPassword type={type}/>
        // <View style={styles.contentContainer}>
        //   <Text style={styles.text}>비밀번호 입력 화면입니다.</Text>
        //   <View style={styles.buttonContainer}>
        //     <BackButton
        //       text="확인"
        //       type="input"
        //       onPress={() => {
        //         if (selectedAccount) {
        //           navigation.navigate('RemittanceConfirm', {
        //             selectedAccount: selectedAccount,
        //             money: money,
        //           });
        //         } else {
        //           navigation.navigate('CreateAccountSuccess', {
        //             goods: goods,
        //           });
        //         }
        //       }}
        //     />
        //     <BackButton
        //       text="뒤로 가기"
        //       type="back"
        //       onPress={handlePressBack}
        //     />
        //   </View>
        // </View>
      );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    // marginBottom: 20,
    width: '100%',
    bottom: 0,
  },
});

export default SendInputPage;

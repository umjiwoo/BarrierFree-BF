import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';

const CreateAccountCheck = () => {

  useTTSOnFocus(`
    본인 인증 페이지입니다.
    본인 인증을 진행합니다. 신분증을 준비해주세요.
    왼쪽 아래에는 돌아가기 버튼, 오른쪽 아래에는 선택 버튼이 있습니다.
    왼쪽 위에는 이전 버튼, 오른쪽 위에는 홈 버튼이 있습니다.
  `)

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateAccountCheck'>>();
  const goods = route.params?.goods;

  const handleLowerRightTextPress = () => {
    navigation.navigate('SendInputPage', {
      type: 'password',
      goods: goods,
    });
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="돌아가기"
        LowerRightText={<CheckIcon width={100} height={100} />}
        MainText={
          <View style={styles.goodsContainer}>
            <Text style={styles.goodsName}>본인 인증</Text>
            <View style={styles.goodsDescriptionContainer}>
              <Text style={styles.goodsDescription}>
                본인 인증을 진행합니다.
              </Text>
              <Text style={styles.goodsDescription}>
                신분증을 준비해주세요.
              </Text>
            </View>
          </View>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', ['back'])}
        onUpperRightTextPress={() => handleDefaultPress('홈', ['Main'])}
        onLowerLeftTextPress={() => handleDefaultPress('이전', ['back'])}
        onLowerRightTextPress={() => handleDefaultPress('다음 상품', undefined, handleLowerRightTextPress)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  goodsContainer: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goodsName: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  goodsDescription: {
    fontSize: 30,
  },
  goodsDescriptionContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default CreateAccountCheck;

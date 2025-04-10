import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage2';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {useHandlePress} from '../../components/utils/handlePress';
import {RootStackParamList} from '../../navigation/types';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useAccountStore} from '../../stores/accountStore';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import CancelIcon from '../../assets/icons/Cancel.svg';

const CreateAccountSuccess = () => {

  const {handlePressBack, handlePressHome} = useHandlePress();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CreateAccountSuccess'>>();
  const goods = route.params?.goods;

  const {accounts} = useAccountStore();

  useTTSOnFocus(`
    통장 개설이 완료되었습니다.
    ${goods.name}, 계좌 번호는 ${accounts.accountNo}입니다.
  `)

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
          <View style={styles.goodsContainer}>
            <Text style={styles.title}>통장 개설 완료</Text>
            <View style={styles.goodsDescriptionContainer}>
              <Text style={[styles.goodsDescription, styles.goodsName]}>
                {goods.name}
              </Text>
              {/* accounts.accountNo 변경 */}
              <Text style={styles.goodsDescription}>{accounts.accountNo}</Text>
              <Text style={[styles.goodsDescription, styles.goodSuccess]}>
                개설이 완료되었습니다.
              </Text>
            </View>
          </View>
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
        onLowerRightTextPress={handlePressHome}
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
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  goodsDescriptionContainer: {
    flexDirection: 'column',
    // justifyContent: 'space-between',
    gap: 10,
    marginTop: 30,
  },
  goodsName: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
  },
  goodsDescription: {
    // paddingTop: 50,
    fontSize: 30,
    color: 'white',
  },
  goodSuccess: {
    // color: 'green',
    fontSize: 35,
    marginTop: 10,
    color: 'white',
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

export default CreateAccountSuccess;

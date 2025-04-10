import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {useHandlePress} from '../../components/utils/handlePress';
import {RootStackParamList} from '../../navigation/types';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useAccountStore} from '../../stores/accountStore';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';

const CreateAccountSuccess = () => {

  const {handlePressBack, handlePressHome} = useHandlePress();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CreateAccountSuccess'>>();
  const goods = route.params?.goods;

  const {accounts} = useAccountStore();

  useTTSOnFocus(`
    통장 개설이 완료되었습니다.
    ${goods.name}, 계좌 번호는 ${accounts[0].accountNo}입니다.
  `)

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="돌아가기"
        LowerRightText={<CheckIcon width={100} height={100} />}
        MainText={
          <View style={styles.goodsContainer}>
            <Text style={styles.title}>통장 개설 완료</Text>
            <View style={styles.goodsDescriptionContainer}>
              <Text style={[styles.goodsDescription, styles.goodsName]}>
                {goods.name}
              </Text>
              {/* accounts.accountNo 변경 */}
              <Text style={styles.goodsDescription}>{accounts[0].accountNo}</Text>
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
    color: '#7F35D4',
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
  },
  goodsDescription: {
    // paddingTop: 50,
    fontSize: 30,
  },
  goodSuccess: {
    // color: 'green',
    fontSize: 35,
    marginTop: 10,
  },
});

export default CreateAccountSuccess;

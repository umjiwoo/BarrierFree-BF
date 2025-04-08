import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import ArrowRightIcon from '../../assets/ArrowRight.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const CreateAccountCheck = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
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
        LowerRightText={<ArrowRightIcon width={80} height={80} />}
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
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
        onLowerRightTextPress={handleLowerRightTextPress}
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

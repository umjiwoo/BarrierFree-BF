import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import ArrowRightIcon from '../../assets/ArrowRight.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';

const CreateAccountGoodsDetail = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CreateAccountGoodsDetail'>>();
  const goods = route.params?.goods;

  const handleLowerRightTextPress = () => {
    navigation.navigate('CreateAccountCheck', {goods: goods});
  };

  console.log('goods', goods);

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="돌아가기"
        LowerRightText={<ArrowRightIcon width={80} height={80} />}
        MainText={
          <View style={styles.goodsContainer}>
            <Text style={styles.goodsName}>{goods.name}</Text>
            <Text style={styles.goodsDescription}>
              {goods.description.약관}
            </Text>
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
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  goodsName: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  goodsDescription: {
    paddingTop: 50,
    fontSize: 30,
  },
});

export default CreateAccountGoodsDetail;

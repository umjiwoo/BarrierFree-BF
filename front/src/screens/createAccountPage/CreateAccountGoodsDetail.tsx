import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import CheckIcon from '../../assets/icons/Check.svg';

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
        LowerRightText={<CheckIcon width={100} height={100} />}
        MainText={
          <ScrollView>
            {/* <Text style={styles.goodsName}>{goods.name}</Text>
            <Text style={styles.goodsDescription}>
              {goods.description.약관}
            </Text> */}
            <Text style={styles.goodsName}>{goods.name}</Text>
            <Text style={styles.goodsDescription}>
              {
                require('../../assets/details/terms_summary_full.json')
                  .content[0].content
              }
            </Text>
            {require('../../assets/details/terms_summary_full.json').content[0].subContent.map(
              (item: any, index: number) => (
                <View key={index} style={styles.subContentContainer}>
                  <Text style={styles.subContentTitle}>{item.description}</Text>
                  <Text style={styles.subContentText}>
                    {Array.isArray(item.content)
                      ? item.content.join('\n')
                      : item.content}
                  </Text>
                </View>
              ),
            )}
          </ScrollView>
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
    paddingTop: 20,
    fontSize: 30,
  },
  subContentContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  subContentTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subContentText: {
    fontSize: 20,
    lineHeight: 30,
  },
});

export default CreateAccountGoodsDetail;

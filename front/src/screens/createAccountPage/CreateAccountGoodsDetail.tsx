import React from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import CheckIcon from '../../assets/icons/Check.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';

const CreateAccountGoodsDetail = () => {

  useTTSOnFocus(`
    계좌 개설 상세 안내 페이지입니다.
    약관 내용을 들으시려면 화면 가운데를 한 번 눌러주세요.
    왼쪽 아래에는 돌아가기 버튼, 오른쪽 아래에는 선택 버튼이 있습니다.
    왼쪽 위에는 이전 버튼, 오른쪽 위에는 홈 버튼이 있습니다.
  `)

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
  const route =
    useRoute<RouteProp<RootStackParamList, 'CreateAccountGoodsDetail'>>();
  const goods = route.params?.goods;

  const handleLowerRightTextPress = () => {
    navigation.navigate('CreateAccountCheck', {goods: goods});
  };

  console.log('goods', goods);

  const termsData = require('../../assets/details/terms_summary_full.json');

  const fullMessage = [
    goods.name,
    termsData.content[0].content,
    ...termsData.content[0].subContent.map((item: any) => {
      const text = Array.isArray(item.content)
        ? item.content.join('\n')
        : item.content;
      return `${item.description}\n${text}`;
    }),
  ].join('\n\n');

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="돌아가기"
        LowerRightText={<CheckIcon width={100} height={100} />}
        MainText={
          <ScrollView
            >
          <Pressable onPress={() => handleDefaultPress(fullMessage, undefined)}>
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
          </Pressable>
          </ScrollView>
        }
        onUpperLeftTextPress={() => handleDefaultPress('이전', ['back'])}
        onUpperRightTextPress={() => handleDefaultPress('홈', ['Main'])}
        onLowerLeftTextPress={() => handleDefaultPress('이전', ['back'])}
        onLowerRightTextPress={() => handleDefaultPress('계좌 개설', undefined, handleLowerRightTextPress)}
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

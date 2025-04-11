import React from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {useTapNavigationHandler} from '../../components/utils/useTapNavigationHandler ';
import VolumeIcon from '../../assets/icons/Volume.svg';

const CreateAccountGoodsDetail = () => {
  useTTSOnFocus(`
    계좌 개설 상세 안내 페이지입니다.
    약관 내용을 들으시려면 화면 가운데를 한 번 눌러주세요.
    왼쪽 아래에는 돌아가기 버튼, 오른쪽 아래에는 선택 버튼이 있습니다.
    왼쪽 위에는 이전 버튼, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

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
          <ScrollView>
            <Pressable
              onPress={() => handleDefaultPress(fullMessage, undefined)}>
              <View style={styles.voiceButton}>
                <VolumeIcon width={30} height={30} />
                <Text style={styles.voiceButtonText}>계좌 개설</Text>
              </View>
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
                    <Text style={styles.subContentTitle}>
                      {item.description}
                    </Text>
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
        onLowerRightTextPress={() =>
          handleDefaultPress('계좌 개설', undefined, handleLowerRightTextPress)
        }
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
    color: '#fff',
  },
  goodsDescription: {
    paddingTop: 20,
    fontSize: 30,
    color: '#fff',
  },
  subContentContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  subContentTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  subContentText: {
    fontSize: 20,
    lineHeight: 30,
    color: '#fff',
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
  voiceButton: {
    // marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'center',
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center',
  },
});

export default CreateAccountGoodsDetail;

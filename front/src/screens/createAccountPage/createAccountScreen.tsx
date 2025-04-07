import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import {useHandlePress} from '../../navigation/handlePress';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CreateAccountGoods from './CreateAccountGoods';

interface GoodsItemProps {
  id: number;
  name: string;
  description: {
    상품개요: string;
    가입대상: string;
    상품특징: string;
    예금과목: string;
    저축방법: string;
    거래한도: string;
    약관: string;
  };
  interestRate: number;
}

const CreateAccountScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {handlePressBack, handlePressHome} = useHandlePress();

  const accountGoods = [
    {
      id: 1,
      name: '주거래 우대통장',
      description: {
        상품개요:
          '급여이체나 생활거래 시 각종 수수료 면제 서비스를 제공하는 통장입니다.',
        가입대상: '만 15세 이상의 개인 (1인 1계좌)',
        상품특징: '각종 수수료 면제',
        예금과목: '저축예금',
        저축방법: '입출금 자유',
        거래한도: '일 100만원',
        약관: '약관 참조',
      },
      interestRate: 0.5,
    },
    {
      id: 2,
      name: '입출금통장',
      description: {
        상품개요:
          '조건 없이 모바일이체, atm 인출, 타행 자동이체 수수료 면제가 되는 통장입니다.',
        가입대상: '만 15세 이상의 개인 (1인 1계좌)',
        상품특징: '모바일이체, atm 인출, 타행 자동이체 수수료 면제',
        예금과목: '저축예금',
        저축방법: '입출금 자유',
        거래한도: '일 100만원',
        약관: '약관 참조',
      },
      interestRate: 0.1,
    },
    {
      id: 3,
      name: '주니어통장',
      description: {
        상품개요:
          '만 18세 이하 고객에게 조건을 충족할 경우 수수료를 우대해주는 미성년자 고객 전용 입출금 통장입니다.',
        가입대상: '만 18세 이하의 개인 (1인 1계좌)',
        상품특징:
          '모바일뱅킹, 인터넷뱅킹, 폰뱅킹(ARS에 한함)을 통한 다른 은행 이체수수료 면제',
        예금과목: '저축예금',
        저축방법: '입출금 자유',
        거래한도: '일 30만원',
        약관: '약관 참조',
      },
      interestRate: 0.1,
    },
    {
      id: 4,
      name: '모임통장',
      description: {
        상품개요:
          '회비납부 및 관리를 하거나, 모임원과 거래내역을 고유할 수 있는 모임 전용 입출금 통장입니다.',
        가입대상: '만 17세 이상의 개인 및 개인사업자 (1인 5계좌)',
        상품특징: '하나의 모임에는 한 개의 계좌만 연결 가능합니다.',
        예금과목: '저축예금',
        저축방법: '입출금 자유',
        거래한도: '일 100만원',
        약관: '약관 참조',
      },
      interestRate: 0.1,
    },
  ];

  const carouselRef = useRef<any>(null);

  const handleSelectGoods = (item: GoodsItemProps) => {
    // 상품 선택 시 처리할 로직
    navigation.navigate('CreateAccountGoodsDetail', {goods: item});
    console.log('item', item);
  };

  const handleLowerLeftTextPress = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  const handleLowerRightTextPress = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소"
        LowerRightText="완료"
        MainText={
          <CreateAccountGoods
            data={accountGoods}
            carouselRef={carouselRef}
            onSelect={handleSelectGoods}
          />
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handleLowerLeftTextPress}
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
});

export default CreateAccountScreen;

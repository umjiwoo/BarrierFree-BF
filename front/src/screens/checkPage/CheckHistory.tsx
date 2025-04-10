import {View, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import CheckAccountBox from './CheckAccountBox';
import {getHistories} from '../../api/axiosAccount';
import {HistoryItemProps} from '../../components/types/CheckAccount';
import DefaultPage from '../../components/utils/DefaultPage';
import {useAccountStore} from '../../stores/accountStore';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import NextIcon from '../../assets/icons/Next.svg';
import PreviousIcon from '../../assets/icons/Prev.svg';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
// const histories: HistoryItemProps[] = [
//   {
//     id: 1,
//     transactionStatus: true,
//     transactionBankId: 1,
//     transactionBalance: 100000,
//     transactionAccount: '110-262-000720',
//     transactionAmount: 100000,
//     transactionType: 'withdraw',
//     transactionDate: '2024-01-01',
//     transactionName: '박수연',
//   },
//   {
//     id: 2,
//     transactionStatus: true,
//     transactionBankId: 1,
//     transactionBalance: 100000,
//     transactionAccount: '110-262-000720',
//     transactionAmount: 100000,
//     transactionDate: '2024-01-01',
//     transactionType: 'deposit',
//     transactionName: '박수연',
//   },
//   {
//     id: 3,
//     transactionStatus: true,
//     transactionBankId: 1,
//     transactionBalance: 100000,
//     transactionAccount: '110-262-000720',
//     transactionDate: '2024-01-01',
//     transactionType: 'withdraw',
//     transactionAmount: 100000,
//     transactionName: '박수연',
//   },
// ];

const CheckHistory = () => {
  useTTSOnFocus(`
    계좌 내역 화면입니다.
    화면 가운데를 좌우로 움직여 계좌 내역을 조회할 수 있습니다.
    왼쪽 아래와 오른쪽 아래 버튼을 눌러도 계좌 내역을 넘길 수 있습니다.
    내역을 선택하시면 상세 정보를 확인하실 수 있습니다.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {accounts} = useAccountStore();
  const {handlePressBack, handlePressHome} = useHandlePress();

  const [histories, setHistories] = useState<HistoryItemProps[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        if (!accounts?.id) {
          setIsLoading(false);
          return;
        }
        const data = await getHistories(accounts.id);
        setHistories(data);
      } catch (error) {
        console.error('거래 내역 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, [accounts?.id]);

  const carouselRef = useRef<any>(null);

  const handleSelectHistory = (item: HistoryItemProps) => {
    // 계좌 선택 시 처리할 로직
    navigation.navigate('CheckHistoryDetail', {
      history: item as HistoryItemProps,
    });
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

  if (!accounts) {
    return (
      <View style={styles.container}>
        <DefaultPage
          UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
          UpperRightText={<HomeIcon width={80} height={80} />}
          MainText={
            <View>
              <Text>등록된 계좌가 없습니다. 계좌를 먼저 생성해주세요.</Text>
            </View>
          }
          onUpperLeftTextPress={handlePressBack}
          onUpperRightTextPress={handlePressHome}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        // UpperLeftText={<GoBackIcon width={100} height={100} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText={<PreviousIcon width={100} height={100} />}
        LowerRightText={<NextIcon width={100} height={100} />}
        MainText={
          histories.length === 0 ? (
            <Text>거래 내역이 없습니다.</Text>
          ) : (
            <CheckAccountBox
              data={histories}
              onSelect={handleSelectHistory}
              carouselRef={carouselRef}
            />
          )
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handleLowerLeftTextPress}
        onLowerRightTextPress={handleLowerRightTextPress}
      />
    </View>
  );
};

export default CheckHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

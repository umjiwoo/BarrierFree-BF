import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';
interface CarouselProps {
  data: AccountItemProps[] | HistoryItemProps[];
  type: 'account' | 'history';
  onSelect?: (item: AccountItemProps | HistoryItemProps) => void;
}

const {width: screenWidth} = Dimensions.get('window');
// const ITEM_SPACING = 5; // 아이템 간 간격
const CONTAINER_PADDING = 15; // 컨테이너 패딩 (SendAccountBox의 padding과 동일)
// const VISIBLE_ITEMS = 1.0; // 한 화면에 보여질 아이템 개수 (정확히 한 개만 보이게)

// 아이템 너비 계산 수정 - 화면에 딱 맞도록 계산
const ITEM_WIDTH = (screenWidth - CONTAINER_PADDING * 2) * 0.97;

const CheckAccountCarousel: React.FC<CarouselProps> = ({
  data,
  type,
  onSelect,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({
    item,
    index,
  }: {
    item: AccountItemProps | HistoryItemProps;
    index: number;
  }) => {
    if (type === 'account') {
      const accountItem = item as AccountItemProps;
      return (
        <TouchableOpacity
          style={[styles.item]}
          onPress={() => onSelect && onSelect(item)}
          activeOpacity={0.9}>
          <View style={styles.account}>
            {/* <Text style={styles.accountBank}>{accountItem.accountBank}</Text> */}
            <Text style={styles.accountNumber}>{accountItem.accountNo}</Text>
            {accountItem.accountBalance && (
              <Text style={styles.accountBalance}>
                잔액 : {accountItem.accountBalance} 원
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    } else {
      const historyItem = item as HistoryItemProps;
      return (
        <TouchableOpacity
          style={[styles.item]}
          onPress={() => onSelect && onSelect(item)}
          activeOpacity={0.9}>
          <View style={styles.history}>
            <Text style={styles.historyDate}>
              {historyItem.transactionDate}
            </Text>
            {/* <Text style={styles.historyTime}>{historyItem.historyTime}</Text> */}
            {/* <Text style={styles.historyType}>
              {historyItem.transactionType}
            </Text> */}
            <Text style={styles.historyWhere}>
              {historyItem.transactionName}
            </Text>
            {historyItem.transactionAccount && (
              <Text style={styles.historyAccount}>
                {historyItem.transactionAccount}
              </Text>
            )}
            {historyItem.transactionType === 'deposit' ? (
              <Text style={[styles.historyAmount, styles.plusAmount]}>
                입금 {historyItem.transactionAmount} 원
              </Text>
            ) : (
              <Text style={[styles.historyAmount, styles.minusAmount]}>
                출금 {historyItem.transactionAmount} 원
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  // 스와이프가 끝났을 때 호출되는 함수
  const handleMomentumScrollEnd = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / ITEM_WIDTH);

    if (index >= 0 && index < data.length) {
      // 가장 가까운 페이지로 스냅
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
          });
        }
      }, 10);

      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast" // 스냅 효과 강화
        snapToAlignment="center"
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        pagingEnabled={false} // pagingEnabled를 false로 설정
        disableIntervalMomentum={true}
        directionalLockEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    // paddingHorizontal: CONTAINER_PADDING, // 컨테이너에 패딩 추가
  },
  item: {
    width: ITEM_WIDTH, // 아이템 너비 적용
    height: '100%',
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  accountName: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  accountDate: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#24282B',
  },
  account: {
    display: 'flex',
    flexDirection: 'column',
    gap: 60,
  },
  accountBankContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  accountBank: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  accountNumber: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountBalanceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  accountBalanceTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountBalance: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
  },
  history: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  historyDateContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  historyDateTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyDateContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },
  historyDate: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyTime: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyTypeContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  historyTypeTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
    alignSelf: 'flex-end',
  },
  historyType: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhereContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  historyWhereTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhereContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },
  historyWhere: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAccount: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmountContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 5,
  },
  historyAmountTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
  },
  plusAmount: {
    color: '#B6010E',
  },
  minusAmount: {
    color: '#373DCC',
  },
});

export default CheckAccountCarousel;

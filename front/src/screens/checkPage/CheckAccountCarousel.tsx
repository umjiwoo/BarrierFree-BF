import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';

interface AccountItemProps {
  accountBank: string;
  accountNumber: string;
  balance: number;
}

interface HistoryItemProps {
  historyDate: string;
  historyTime: string;
  historyType: string;
  historyWhere: string;
  historyAccount?: string;
  historyAmount: number;
}

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
            <Text style={styles.accountBank}>{accountItem.accountBank}</Text>
            <Text style={styles.accountNumber}>
              {accountItem.accountNumber}
            </Text>
            {accountItem.balance && (
              <Text style={styles.accountBalance}>
                잔액 : {accountItem.balance} 원
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
            <Text style={styles.historyDate}>{historyItem.historyDate}</Text>
            <Text style={styles.historyTime}>{historyItem.historyTime}</Text>
            <Text style={styles.historyType}>{historyItem.historyType}</Text>
            <Text style={styles.historyWhere}>{historyItem.historyWhere}</Text>
            {historyItem.historyAccount && (
              <Text style={styles.historyAccount}>
                {historyItem.historyAccount}
              </Text>
            )}
            <Text style={styles.historyAmount}>
              {historyItem.historyAmount}
            </Text>
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

  // 현재 스크롤 위치를 확인하며 강제로 스냅 적용
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    // 스크롤 방향과 현재 위치 확인으로 스와이프 방향 파악 가능
    // 하지만 여기선 스냅 기능에 의존하므로 구현하지 않음
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
        contentContainerStyle={styles.flatListContent}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
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
  flatListContent: {
    // paddingHorizontal: 0,
  },
  item: {
    width: ITEM_WIDTH, // 아이템 너비 적용
    height: '100%',
    // marginRight: ITEM_SPACING, // 마진 제거
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    // borderWidth: 1,
    // borderColor: '#24282B',
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
    gap: 5,
  },
  accountBank: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  accountNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  history: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  historyDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhere: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAccount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
});

export default CheckAccountCarousel;

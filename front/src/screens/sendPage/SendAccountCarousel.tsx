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
  name?: string;
  date?: string;
  accountBank: string;
  accountNumber: string;
  balance?: string;
}

interface CarouselProps {
  accountData: AccountItemProps[];
  onSelectAccount?: (account: AccountItemProps) => void;
}

const {width: screenWidth} = Dimensions.get('window');
// const ITEM_SPACING = 5; // 아이템 간 간격
const CONTAINER_PADDING = 15; // 컨테이너 패딩 (SendAccountBox의 padding과 동일)
// const VISIBLE_ITEMS = 1.0; // 한 화면에 보여질 아이템 개수 (정확히 한 개만 보이게)

// 아이템 너비 계산 수정 - 화면에 딱 맞도록 계산
const ITEM_WIDTH = (screenWidth - CONTAINER_PADDING * 2) * 0.97;

const SendAccountCarousel: React.FC<CarouselProps> = ({
  accountData,
  onSelectAccount,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({
    item,
    index,
  }: {
    item: AccountItemProps;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={[styles.item]}
        onPress={() => onSelectAccount && onSelectAccount(item)}
        activeOpacity={0.9}>
        <Text style={styles.accountName}>{item.name}</Text>
        <Text style={styles.accountDate}>{item.date}</Text>
        <View style={styles.account}>
          <Text style={styles.accountBank}>{item.accountBank}</Text>
          <Text style={styles.accountNumber}>{item.accountNumber}</Text>
          <Text style={styles.accountBalance}>잔액 {item.balance} 원</Text>
        </View>
      </TouchableOpacity>
    );
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

    if (index >= 0 && index < accountData.length) {
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

  // 특정 인덱스로 스크롤하는 함수
  // const scrollToIndex = (index: number) => {
  //   if (flatListRef.current && index >= 0 && index < accountData.length) {
  //     flatListRef.current.scrollToIndex({
  //       index,
  //       animated: true,
  //     });
  //     setActiveIndex(index);
  //   }
  // };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={accountData}
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
});

export default SendAccountCarousel;

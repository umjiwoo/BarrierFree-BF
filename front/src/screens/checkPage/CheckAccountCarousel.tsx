import {Dimensions, StyleSheet, View, Text} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';
import {
  AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';
import {CarouselSwipeVibrationPress} from '../../components/vibration/buttonVibrationPress';
import {useState, useRef} from 'react';

interface CarouselProps {
  data: AccountItemProps[] | HistoryItemProps[];
  type: 'account' | 'history';
  onSelect?: (item: AccountItemProps | HistoryItemProps) => void;
}

const {width: screenWidth} = Dimensions.get('window');
const CONTAINER_PADDING = 30;
const ITEM_WIDTH = screenWidth - CONTAINER_PADDING * 1.5;
// const ITEM_WIDTH = screenWidth - CONTAINER_PADDING * 2;

const CheckAccountCarousel: React.FC<CarouselProps> = ({
  data,
  type,
  onSelect,
}) => {
  console.log('data', data);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<any>(null);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);

  // 두 손가락 제스처 처리
  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const {numberOfPointers, translationX} = event.nativeEvent;
    // 이미 스와이프 중이면 무시
    if (isSwipeInProgress) {
      return;
    }
    if (numberOfPointers === 2 && Math.abs(translationX) > 50) {
      setIsSwipeInProgress(true);
      if (translationX > 0 && activeIndex > 0) {
        // // 오른쪽 스와이프 (이전 아이템)
        // carouselRef.current?.scrollTo({index: activeIndex - 1});
        // setActiveIndex(activeIndex - 1);
        const newIndex = activeIndex - 1;
        carouselRef.current?.scrollTo({index: newIndex});
        setActiveIndex(newIndex);
        CarouselSwipeVibrationPress();
      } else if (translationX < 0 && activeIndex < data.length - 1) {
        // // 왼쪽 스와이프 (다음 아이템)
        // carouselRef.current?.scrollTo({index: activeIndex + 1});
        // setActiveIndex(activeIndex + 1);
        const newIndex = activeIndex + 1;
        carouselRef.current?.scrollTo({index: newIndex});
        setActiveIndex(newIndex);
        CarouselSwipeVibrationPress();
      }
      // 일정 시간 후 스와이프 상태 초기화
      setTimeout(() => {
        setIsSwipeInProgress(false);
      }, 500); // 애니메이션 시간과 동일하게 설정
    }
  };

  const renderItem = ({
    item,
  }: // index,
  {
    item: AccountItemProps | HistoryItemProps;
    index: number;
  }) => {
    if (type === 'account') {
      const accountItem = item as AccountItemProps;
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => onSelect && onSelect(item)}
          activeOpacity={0.9}>
          <View style={styles.account}>
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
          style={styles.item}
          onPress={() => onSelect && onSelect(item)}
          activeOpacity={0.9}>
          <View style={styles.history}>
            <Text style={styles.historyDate}>
              {historyItem.transactionDate}
            </Text>
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

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        activeOffsetX={[-10, 10]}>
        <View style={styles.container}>
          <Carousel
            ref={carouselRef}
            loop={false}
            width={ITEM_WIDTH}
            data={data}
            scrollAnimationDuration={500}
            onSnapToItem={index => setActiveIndex(index)}
            renderItem={renderItem}
            enabled={false} // 일반 스와이프 비활성화
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.95,
              parallaxScrollingOffset: 20,
            }}
            defaultIndex={0}
            autoFillData={false}
            snapEnabled={true}
            windowSize={1}
            vertical={false}
            style={styles.carousel}
          />
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  carousel: {
    width: '100%',
    height: '100%',
  },
  item: {
    width: '100%',
    height: '100%',
    padding: 30,
    borderRadius: 12,
    // backgroundColor: '#f8f8f8',
    // borderColor: 'red',
    // borderWidth: 1,
  },
  account: {
    flexDirection: 'column',
    gap: 60,
  },
  accountNumber: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountBalance: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#24282B',
  },
  history: {
    flexDirection: 'column',
    gap: 30,
  },
  historyDate: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24282B',
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

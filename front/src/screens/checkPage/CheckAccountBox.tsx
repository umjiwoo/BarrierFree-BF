import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Carousel from './CheckAccountCarousel';
import {HistoryItemProps} from '../../components/types/CheckAccount';

interface CheckAccountBoxProps {
  data?: HistoryItemProps[];
  type: 'history' | 'createAccount';
  onSelect?: (item: HistoryItemProps) => void;
}

const CheckAccountBox: React.FC<CheckAccountBoxProps> = ({
  data,
  type,
  onSelect,
}) => {
  const [_containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: any) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  return (
    <View style={styles.accountBoxContainer}>
      <View style={styles.accountBox} onLayout={handleLayout}>
        <Carousel data={data} onSelect={onSelect} type={type} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountBoxContainer: {
    width: '100%',
    marginVertical: 10,
    flex: 1,
  },
  accountBox: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 0,
    borderWidth: 2,
    borderColor: '#373DCC',
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
  },
  account: {
    display: 'flex',
    flexDirection: 'column',
    gap: 60,
  },
  accountBankContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountBank: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24282B',
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
  container: {
    width: '100%',
    height: '100%',
    // paddingHorizontal: CONTAINER_PADDING, // 컨테이너에 패딩 추가
  },
  item: {
    // width: ITEM_WIDTH, // 아이템 너비 적용
    width: '100%',
    height: '100%',
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  accountCreatedAtContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountCreatedAt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountLockContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountLock: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountTransferContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  accountDailyTransferLimitContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  accountOneTimeTransferLimitContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  accountDailyTransfer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  accountOneTimeTransfer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
});

export default CheckAccountBox;

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Carousel from './CheckAccountCarousel';
import {
  AccountItemProps,
  HistoryItemProps,
} from '../../components/types/CheckAccount';

interface CheckAccountBoxProps {
  data: AccountItemProps[] | HistoryItemProps[];
  type: 'account' | 'history';
  onSelect?: (item: AccountItemProps | HistoryItemProps) => void;
}

const CheckAccountBox: React.FC<CheckAccountBoxProps> = ({
  data,
  type,
  onSelect,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: any) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };
  const renderContent = () => {
    if (type === 'account') {
      return (
        <View style={styles.accountBox} onLayout={handleLayout}>
          <Carousel data={data} onSelect={onSelect} type={type} />
        </View>
      );
    } else {
      return (
        <View style={styles.accountBox} onLayout={handleLayout}>
          <Carousel data={data} onSelect={onSelect} type={type} />
        </View>
      );
    }
  };

  return <View style={styles.accountBoxContainer}>{renderContent()}</View>;
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
});

export default CheckAccountBox;

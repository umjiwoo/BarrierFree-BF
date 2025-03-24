import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Carousel from './CheckAccountCarousel';

interface AccountItemProps {
  accountBank: string;
  accountNumber: string;
  balance: string;
}

interface CheckAccountBoxProps {
  accountData: AccountItemProps[];
  onSelectAccount?: (account: AccountItemProps) => void;
}

const CheckAccountBox: React.FC<CheckAccountBoxProps> = ({
  accountData,
  onSelectAccount,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: any) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  return (
    <View style={styles.accountBoxContainer}>
      <View style={styles.accountBox} onLayout={handleLayout}>
        <Carousel accountData={accountData} onSelectAccount={onSelectAccount} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountBoxContainer: {
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

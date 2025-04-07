import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {GoodsItemProps} from '../../components/types/CheckAccount';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';
import HomeIcon from '../../assets/Home.svg';
import ArrowRightIcon from '../../assets/ArrowRight.svg';

interface CreateAccountGoodsDetailProps {
  goods: GoodsItemProps;
}

const CreateAccountGoodsDetail = ({goods}: CreateAccountGoodsDetailProps) => {
  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText={<ArrowLeftIcon width={80} height={80} />}
        LowerRightText={<ArrowRightIcon width={80} height={80} />}
        MainText={<Text>{goods.name}</Text>}
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handleLowerLeftTextPress}
        onLowerRightTextPress={handleLowerRightTextPress}
      />
    </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default CreateAccountGoodsDetail;

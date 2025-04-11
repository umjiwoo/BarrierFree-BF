import React from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {GoodsItemProps} from '../../components/types/CheckAccount';
import VolumeIcon from '../../assets/icons/Volume.svg';

interface CreateAccountGoodsProps {
  data: GoodsItemProps[];
  carouselRef: any;
  onSelect: (item: GoodsItemProps) => void;
  onSnapToItem?: (index: number) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CreateAccountGoods = ({
  data,
  carouselRef,
  onSelect,
  onSnapToItem,
}: CreateAccountGoodsProps) => {
  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SCREEN_WIDTH}
        // height={'100%'}
        data={data}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={styles.accountItem}>
              <View style={{width: '100%'}}>
                <View style={styles.voiceButton}>
                  <VolumeIcon width={30} height={30} />
                  <Text style={styles.voiceButtonText}>계좌 개설</Text>
                </View>
                <Text style={styles.title}>{item.name}</Text>
                <View style={styles.descriptionContainer}>
                  <View style={styles.descriptionItemContainer}>
                    <Text style={styles.descriptionTitle}>상품개요</Text>
                    <Text style={styles.descriptionContent}>
                      {item.description.상품개요}
                    </Text>
                  </View>

                  <View style={styles.descriptionItemContainer}>
                    <Text style={styles.descriptionTitle}>상품특징</Text>
                    <Text style={styles.descriptionContent}>
                      {item.description.상품특징}
                    </Text>
                  </View>
                  <View style={styles.descriptionItemContainer}>
                    <Text style={styles.descriptionTitle}>예금과목</Text>
                    <Text style={styles.descriptionContent}>
                      {item.description.예금과목}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        onSnapToItem={onSnapToItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  accountItem: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingVertical: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  descriptionContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  descriptionItemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
  },
  descriptionTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    width: '30%',
  },
  descriptionContent: {
    fontSize: 22,
    color: '#fff',
    flex: 1,
    flexWrap: 'wrap',
    paddingRight: 20,
  },
  time: {
    fontSize: 30,
    color: '#24282B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bank: {
    fontSize: 35,
    color: '#24282B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 35,
    color: '#24282B',
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
  },
  withdrawal: {
    color: '#373DCC',
  },
  deposit: {
    color: '#B6010E',
  },
  voiceButton: {
    marginBottom: 20,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'center',
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center',
  },
});

export default CreateAccountGoods;

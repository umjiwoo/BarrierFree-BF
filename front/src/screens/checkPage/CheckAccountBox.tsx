import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {HistoryItemProps} from '../../components/types/CheckAccount';
import formatDateManually from '../../components/utils/makeDate';
import {center} from '@shopify/react-native-skia';
import VolumeIcon from '../../assets/icons/Volume.svg';

interface CheckAccountBoxProps {
  data: HistoryItemProps[];
  carouselRef: any;
  onSelect: (item: HistoryItemProps) => void;
  onSnapToItem?: (index: number) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CheckAccountBox = ({
  data,
  carouselRef,
  onSelect,
  onSnapToItem,
}: CheckAccountBoxProps) => {
  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SCREEN_WIDTH}
        data={data}
        renderItem={({item}) => {
          const {date, time} = formatDateManually(item.transactionDate);
          const isWithdrawal = item.transactionType === 'WITHDRAWAL';
          const typeLabel = isWithdrawal ? '출금' : '입금';

          return (
            <TouchableOpacity onPress={() => onSelect(item)}>
              <View style={styles.accountItem}>
                <View style={styles.voiceButton}>
                  <VolumeIcon width={30} height={30} />
                  <Text style={styles.voiceButtonText}>계좌 조회</Text>
                </View>
                {/* 날짜 */}
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>{date}</Text>
                  <Text style={styles.time}>{time}</Text>
                </View>

                {/* 거래 이름 */}
                <Text style={styles.name}>{item.transactionName}</Text>

                {/* 거래 금액 */}
                <View style={styles.bankContainer}>
                  <Text
                    style={[
                      styles.bankType,
                      isWithdrawal ? styles.withdrawalBg : styles.depositBg,
                    ]}>
                    {typeLabel}
                  </Text>
                  <Text
                    style={[
                      styles.amount,
                      isWithdrawal ? styles.withdrawal : styles.deposit,
                    ]}>
                    {item.transactionAmount.toLocaleString()} 원
                  </Text>
                </View>
              </View>
              {/* <View style={styles.voiceButton}>
              <VolumeIcon width={30} height={30} />
              <Text style={styles.voiceButtonText}>음성 안내 듣기</Text>
          </View> */}
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
    backgroundColor: '#000', // 전체 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountItem: {
    width: '100%',
    // marginVertical: 10,
    // paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    // gap: 28,
  },
  dateContainer: {
    gap: 8,
  },
  date: {
    fontSize: 30,
    color: '#ccc',
    fontWeight: '600',
  },
  time: {
    fontSize: 30,
    color: '#ccc',
    fontWeight: '500',
  },
  name: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginTop: 8,
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
  },
  bankType: {
    fontSize: 35,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#DC3545', // 기본은 출금 색상
    color: '#fff',
    textAlignVertical: 'center',
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    color: '#fff',
    textAlignVertical: 'center',
    // fontSize: 40,
    // fontWeight: 'bold',
    // color: '#fff',
  },
  withdrawalBg: {
    backgroundColor: '#DC3545',
    color: '#fff',
  },
  depositBg: {
    backgroundColor: '#34C759',
    color: '#fff',
  },
  withdrawal: {
    color: '#DC3545',
  },
  deposit: {
    color: '#34C759',
  },
  voiceButton: {
    // marginTop: 20,
    marginBottom: 32,
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

export default CheckAccountBox;

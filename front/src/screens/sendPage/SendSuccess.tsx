import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DefaultPage from '../../components/utils/DefaultPage';
import {useHandlePress} from '../../components/utils/handlePress';
import CheckCircle from '../../assets/icons/CheckCircle.svg';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CheckIcon from '../../assets/icons/Check.svg';
const SendSuccess = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {handlePressBack, handlePressHome} = useHandlePress();

  const handleCheckHistory = () => {
    navigation.navigate('CheckHistory');
    console.log('내역 조회 버튼 클릭');
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="내역 조회"
        LowerRightText={<CheckIcon width={80} height={80} />}
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>이체가 완료되었습니다.</Text>
            <CheckCircle style={styles.checkCircle} />
          </View>
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handleCheckHistory}
        onLowerRightTextPress={handlePressHome}
      />
    </View>
  );
};

export default SendSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 20,
    // paddingBottom: 20,
    // marginTop: 50,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    // gap: 50,
    // borderWidth: 1,
  },
  titleTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    gap: 10,
  },
  titleText: {
    fontSize: 40,
    fontWeight: '800',
  },
  checkCircle: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    color: '#7F35D4',
  },
  mainText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#7F35D4',
  },
  mainTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
  },
});

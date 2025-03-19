import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import BackButton from '../../components/BackButton';
// import CheckCircle from '../../assets/CheckCircle.svg';
import checkCircle from '../../assets/checkCircle.png';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Image} from 'react-native';

const SendSuccess = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.titleText}>이체가</Text>
          <Text style={styles.titleText}>완료되었습니다.</Text>
        </View>
        <Image source={checkCircle} style={styles.checkCircle} />
      </View>
      {/* {CheckCircle ? (
        <CheckCircle width={100} height={100} fill="#000000" />
      ) : (
        <Text>체크 아이콘</Text>
      )} */}
      <BackButton
        textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
        style={{
          backgroundColor: '#B6010E',
          width: '100%',
          height: 70,
          marginTop: 10,
          marginBottom: 5,
          bottom: 0,
        }}
        text="메인으로"
        onPress={() => navigation.navigate('Main')}
      />
    </View>
  );
};

export default SendSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 50,
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
  },
});

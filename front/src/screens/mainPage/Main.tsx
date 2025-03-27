import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Vibration,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import CustomVibration from '../../components/CustomVibration';

const Main = () => {
  const navigationProps =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCheckAccountPress = () => {
    navigationProps.navigate('CheckAccount');
  };

  const handleSendFromWherePress = () => {
    navigationProps.navigate('SendFromWhere');
  };

  const handleButtonPress = () => {
    // Vibration.vibrate([0, 100, 30, 100], false);
    CustomVibration.vibrateWithAmplitude(500, 50);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleCheckAccountPress();
            handleButtonPress();
          }}>
          <Text style={styles.text}>조회</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendFromWherePress}>
          <Text style={styles.text}>송금</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.text}>결제</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.text}>마이 페이지</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  grid: {
    // flex: 1,
    width: '100%',
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%', // 2x2 그리드 배치
    height: '50%',
    // backgroundColor: 'blue',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#7F35D4',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    fontSize: 40,
    color: '#7F35D4',
    fontWeight: 'bold',
  },
});

export default Main;

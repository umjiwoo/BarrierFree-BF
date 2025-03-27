import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import BackButton from '../../components/BackButton';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Image} from 'react-native';
import useTab from '../../components/vibration/useTab';
const SendSuccess = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const useTap = useTab();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.titleText}>이체가</Text>
          <Text style={styles.titleText}>완료되었습니다.</Text>
        </View>
        <Image
          source={require('../../assets/checkCircle.png')}
          style={styles.checkCircle}
        />
      </View>
      <BackButton
        type="back"
        text="메인으로"
        onPress={() => useTap.handlePress(() => navigation.navigate('Main'))}
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

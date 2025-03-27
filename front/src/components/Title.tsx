import {Text, StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import useTab from './vibration/useTab';

const Title = ({title}: {title: string}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const useTap = useTab();
  const handleMainPress = () => {
    navigation.navigate('Main');
  };

  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => useTap.handlePress(handleMainPress)}>
        <Image
          source={require('../assets/home.png')}
          style={styles.image}
          accessible={true}
          accessibilityLabel="메뉴로 돌아가기"
          accessibilityRole="button"
        />
      </TouchableOpacity>
    </View>
  );
};

export default Title;

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    flex: 1,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  image: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flexWrap: 'wrap',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeButton: {
    marginVertical: 10,
    alignSelf: 'flex-end',
    marginLeft: 10,
    marginBottom: 5,
    paddingHorizontal: 35,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#24282B',
  },
});

import {Text, StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const Title = ({title}: {title: string}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Main')}>
        <Image source={require('../assets/home.png')} style={styles.image} />
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

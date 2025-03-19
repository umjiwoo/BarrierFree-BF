import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

const HomeScreen = ({navigation}: {navigation: any}) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          // navigation.navigate('~~') : ~~ 안에 test 버튼 누르면 이동하고 싶은 스크린 이름 적기
          onPress={() => navigation.navigate('SendSuccess')}>
          <Text style={styles.text}>test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%',
    height: '45%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

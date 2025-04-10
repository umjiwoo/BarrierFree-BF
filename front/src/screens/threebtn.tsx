import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';

const ThreeButtonScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // @ts-ignore - 동적 화면 이름 사용으로 인한 타입 오류 무시
            navigation.navigate('SendInputPage', { type: 'direct' });
          }}
        >
          <Text style={styles.buttonText}>직접 입력</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // @ts-ignore - 동적 화면 이름 사용으로 인한 타입 오류 무시
            navigation.navigate('SendInputPage', { type: 'send' });
          }}
        >
          <Text style={styles.buttonText}>송금하기</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // @ts-ignore - 동적 화면 이름 사용으로 인한 타입 오류 무시
            navigation.navigate('SendInputPage', { type: 'transfer' });
          }}
        >
          <Text style={styles.buttonText}>이체하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    width: '80%',
    backgroundColor: '#3498db',
    borderWidth: 1,
    borderColor: '#2980b9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ThreeButtonScreen;
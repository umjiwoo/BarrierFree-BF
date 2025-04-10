import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {ReactNode} from 'react';

interface DefaultPageProps {
  UpperLeftText?: string; // 버튼 텍스트 (기본값: '뒤로')
  UpperRightText?: string; // 버튼 텍스트 (기본값: '뒤로')
  LowerLeftText?: string; // 버튼 텍스트 (기본값: '뒤로')
  LowerRightText?: string; // 버튼 텍스트 (기본갸: '뒤로')
  MainText?: ReactNode;
  onPress?: () => void;
  onUpperLeftTextPress?: () => void;
  onUpperRightTextPress?: () => void;
  onLowerLeftTextPress?: () => void;
  onLowerRightTextPress?: () => void;
}

export default function DefaultPage({
  UpperLeftText,
  UpperRightText,
  LowerLeftText,
  LowerRightText,
  MainText,
  onPress,
  onUpperLeftTextPress,
  onUpperRightTextPress,
  onLowerLeftTextPress,
  onLowerRightTextPress,
}: DefaultPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onUpperLeftTextPress}>
          <Text style={styles.buttonText}>{UpperLeftText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onUpperRightTextPress}>
          <Text style={styles.buttonText}>{UpperRightText}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.mainButton} onPress={onPress}>
        {typeof MainText === 'string' ? (
          <Text style={styles.mainText}>{MainText}</Text>
        ) : (
          MainText
        )}
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onLowerLeftTextPress}>
          <Text style={styles.buttonText}>{LowerLeftText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onLowerRightTextPress}>
          <Text style={styles.buttonText}>{LowerRightText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    // height: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    // backgroundColor: 'blue',
    // borderRadius: 10,
    // borderWidth: 1,
    // borderColor: 'black',
    // padding: 10,
    margin: 10,
  },
  button: {
    flex: 1,
    // backgroundColor: 'blue',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 10,
  },
  mainButton: {
    flex: 2,
    // backgroundColor: 'red',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  mainText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

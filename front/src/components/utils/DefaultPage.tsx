import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {ReactNode} from 'react';

interface DefaultPageProps {
  UpperLeftText?: ReactNode; // 버튼 텍스트 (기본값: '뒤로')
  UpperRightText?: ReactNode; // 버튼 텍스트 (기본값: '뒤로')
  LowerLeftText?: ReactNode; // 버튼 텍스트 (기본값: '뒤로')
  LowerRightText?: ReactNode; // 버튼 텍스트 (기본갸: '뒤로')
  MainText?: ReactNode;
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
  onUpperLeftTextPress,
  onUpperRightTextPress,
  onLowerLeftTextPress,
  onLowerRightTextPress,
}: DefaultPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onUpperLeftTextPress}>
          {/* <Text style={styles.buttonText}>{UpperLeftText}</Text> */}
          {typeof UpperLeftText === 'string' ? (
            <Text style={styles.buttonText}>{UpperLeftText}</Text>
          ) : (
            UpperLeftText
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onUpperRightTextPress}>
          {/* <Text style={styles.buttonText}>{UpperRightText}</Text> */}
          {typeof UpperRightText === 'string' ? (
            <Text style={styles.buttonText}>{UpperRightText}</Text>
          ) : (
            UpperRightText
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.mainButton}>
        {/* <View style={styles.mainButton} onPress={onPress}> */}
        {typeof MainText === 'string' ? (
          <Text style={styles.mainText}>{MainText}</Text>
        ) : (
          MainText
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onLowerLeftTextPress}>
          {/* <Text style={styles.buttonText}>{LowerLeftText}</Text> */}
          {typeof LowerLeftText === 'string' ? (
            <Text style={styles.buttonText}>{LowerLeftText}</Text>
          ) : (
            LowerLeftText
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onLowerRightTextPress}>
          {/* <Text style={styles.buttonText}>{LowerRightText}</Text> */}
          {typeof LowerRightText === 'string' ? (
            <Text style={styles.buttonText}>{LowerRightText}</Text>
          ) : (
            LowerRightText
          )}
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
    borderColor: '#7F35D4',
    backgroundColor: '#7F35D4',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 10,
  },
  mainButton: {
    flex: 1.5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7F35D4',
    padding: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
  },
  mainText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#7F35D4',
  },
});

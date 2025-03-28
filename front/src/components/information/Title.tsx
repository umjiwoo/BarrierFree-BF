import React from 'react';
import {Text, StyleSheet} from 'react-native';

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({text}) => {
  return <Text style={styles.title}>{text}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Title;

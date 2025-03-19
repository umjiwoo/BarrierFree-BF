import {Text, StyleSheet} from 'react-native';
import React from 'react';

const Title = ({title}: {title: string}) => {
  return <Text style={styles.title}>{title}</Text>;
};

export default Title;

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
});

import {View, StyleSheet, Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import Title from '../../components/Title';
import BackButton from '../../components/BackButton';
import {RootStackParamList} from '../../navigation/types';

const CheckHistoryDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const route = useRoute<RouteProp<RootStackParamList, 'CheckHistoryDetail'>>();

  const history = route.params?.history;

  return (
    <View style={styles.container}>
      <Title title="상세 내역" />
      <View style={styles.historyContainer}>
        <Text style={styles.historyDate}>{history.historyDate}</Text>
        <Text style={styles.historyTime}>{history.historyTime}</Text>
        <Text style={styles.historyType}>{history.historyType}</Text>
        <Text style={styles.historyWhere}>{history.historyWhere}</Text>
        {history.historyAccount && (
          <Text style={styles.historyAccount}>{history.historyAccount}</Text>
        )}
        <Text style={styles.historyAmount}>{history.historyAmount}</Text>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BackButton
          text="이전으로"
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: '#B6010E',
            width: '100%',
            height: 70,
            marginTop: 10,
            marginBottom: 5,
          }}
          textStyle={{color: '#ffffff', fontWeight: '800', fontSize: 20}}
        />
      </View>
    </View>
  );
};

export default CheckHistoryDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 50,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    bottom: 0,
  },
  historyContainer: {
    width: '100%',
    // height: '100%',
    margin: 20,
  },
  historyDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyWhere: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAccount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
  historyAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24282B',
  },
});

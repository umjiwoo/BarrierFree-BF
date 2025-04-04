import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {checkId, signUpUser} from '../api/axiosUser';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const SignupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    birthDate: '',
    password: '',
    joinedDate: '',
  });

  const handleSignup = async () => {
    try {
      // 아이디 중복 검사
      const checkIdResponse = await checkId(formData.phoneNumber);
      console.log('아이디 중복 검사 결과:', checkIdResponse);

      // 아이디 중복 검사 성공 시
      if (checkIdResponse.result.code === 200) {
        // 회원가입 날짜 설정
        const date = new Date();
        const formattedDate = date.toISOString();
        formData.joinedDate = formattedDate;

        // 회원가입 요청
        const response = await signUpUser(formData);
        console.log('회원가입 결과:', response);

        // 회원가입 성공 시
        if (response.result.code === 200) {
          console.log('회원가입 성공:', response.body);
          navigation.navigate('Main');
        } else {
          // 회원가입 실패 시
          console.log('회원가입 실패:', response.result.message);
        }
      } else {
        // 아이디 중복 검사 실패 시
        console.log('아이디 중복 검사 실패:', checkIdResponse.result.message);
      }
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={formData.userName}
            onChangeText={text => setFormData({...formData, userName: text})}
            placeholder="이름을 입력하세요"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={text => setFormData({...formData, phoneNumber: text})}
            placeholder="전화번호를 입력하세요"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>생년월일</Text>
          <TextInput
            style={styles.input}
            value={formData.birthDate}
            onChangeText={text => setFormData({...formData, birthDate: text})}
            placeholder="생년월일을 입력하세요"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={text => setFormData({...formData, password: text})}
            placeholder="비밀번호를 입력하세요"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;

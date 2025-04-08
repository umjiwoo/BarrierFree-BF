import axios from 'axios';

export interface ApiResponse {
  result: {
    code: number;
    message?: string;
  };
  body?: any;
}

export interface SignUpUserProps {
  userName: string;
  password: string;
  phoneNumber: string;
  birthDate: string;
  joinedDate: string;
}

// axios 인스턴스 생성
export const axiosInstance = axios.create({
  // baseURL: 'http://j12a208.p.ssafy.io:8080',
  baseURL: 'http://10.0.2.2:8080', // Android 에뮬레이터에서 localhost 접근
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 호출 함수 타입 정의
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiConfig {
  method: ApiMethod;
  url: string;
  data?: any;
}

// 재사용 가능한 API 호출 함수
export const callApi = async <T,>({
  method,
  url,
  data,
  ...config
}: ApiConfig): Promise<T> => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

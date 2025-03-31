import axios from 'axios';
import {HistoryItemProps} from '../components/types/CheckAccount';

// axios 인스턴스 생성
export const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:8080', // Android 에뮬레이터에서 localhost 접근
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 계좌 내역 조회 함수
export const getHistory = async (id: number): Promise<HistoryItemProps[]> => {
  try {
    const response = await axiosInstance.get(`/api/accounts/${id}`);
    return response.data.body;
  } catch (error) {
    console.error('계좌 내역 조회 실패:', error);
    return [];
  }
};

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

// export const createTransaction = (data: any) => callApi({
//   method: 'POST',
//   url: '/transactions',
//   data,
// });

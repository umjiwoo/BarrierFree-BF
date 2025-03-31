import {
  AccountItemProps,
  HistoryItemProps,
} from '../components/types/CheckAccount';
import {AxiosResponse} from 'axios';
import {axiosInstance} from './axios';

// 계좌 조회 함수
const getAccounts = async (): Promise<AccountItemProps[]> => {
  try {
    const response: AxiosResponse = await axiosInstance.get('/api/accounts');
    console.log('결과 상태 조회 : ', response.data.result.code);
    if (response.data.result.code === 200) {
      console.log('계좌 조회 성공');
      return response.data.body;
    } else {
      console.log('계좌 조회 실패');
      return response.data.body;
    }
  } catch (error) {
    console.error('계좌 조회 실패:', error);
    return []; // 에러 발생 시 빈 배열 반환
  }
};

// 계좌 내역 조회 함수
const getHistories = async (id: number): Promise<HistoryItemProps[]> => {
  try {
    const response = await axiosInstance.get(`/api/accounts/${id}`);

    if (response.data.result.code === 200) {
      console.log('계좌 상세 내역 조회 성공');
    } else {
      console.log('계좌 상세 내역 조회 실패');
    }
    return response.data.body;
  } catch (error) {
    console.error('계좌 내역 조회 실패:', error);
    return [];
  }
};

export {getAccounts, getHistories};

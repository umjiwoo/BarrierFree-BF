import {HistoryItemProps} from '../components/types/CheckAccount';
import {AxiosResponse} from 'axios';
import {axiosInstance} from './axios';

interface AccountCreateParams {
  username: string;
  dailyTransferLimit: number;
  oneTimeTransferLimit: number;
  accountPassword: string;
}

// 계좌 생성 함수
const makeAccounts = async (accountData: AccountCreateParams): Promise<any> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(
      '/api/accounts/create',
      accountData,
    );

    if (response.data.result.code === 200) {
      console.log('계좌 생성 성공: ', response.data.body);
    } else if (response.data.result.code === 2001) {
      console.log(response.data.result.message);
    } else if (response.data.result.code === 2002) {
      console.log(response.data.result.message);
    }
    return response.data.body;
  } catch (error) {
    console.error('계좌 생성 실패:', error);
    return null;
  }
};

// 계좌 조회 함수
const getAccounts = async (): Promise<any> => {
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
    return null; // 에러 발생 시 빈 배열 반환
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

// 계좌 잠김 상태 조회 함수
const getAccountLockStatus = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/api/accounts/${id}/account_state`,
    );

    if (response.data.result.code === 200) {
      console.log('조회 성공');
      if (response.data.body === 'ACTIVE') {
        return true;
      }
    } else {
      console.log('조회 실패');
    }
    return false;
  } catch (error) {
    console.error('계좌 내역 조회 실패:', error);
    return false;
  }
};

// 계좌 비밀번호 조회 함수
const postAccountPassword = async (
  id: number,
  password: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/api/accounts/${id}/check-pwd`, {
      account_id: id,
      accountPassword: password,
    });
    if (response.data.result.code === 200) {
      if (response.data.body.isLocked) {
        return {isLocked: true};
      } else {
        if (response.data.body.isCorrect === true) {
          return {isCorrect: true};
        } else {
          return {isCorrect: false};
        }
      }
    } else {
      return {
        error: '비밀번호 조회 실패, 비밀번호를 확인해주세요.',
      };
    }
  } catch (error) {
    console.error('계좌 비밀번호 조회 실패:', error);
    return {error: '비밀번호 조회 실패', message: error};
  }
};

// 계좌 잠김 해제
const postAccountUnlock = async (
  id: number,
  phoneNumber: string,
  verificationCode: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/api/accounts/${id}/unlock`, {
      phoneNumber: phoneNumber,
      verificationCode: verificationCode,
    });

    if (response.data.result.code === 200) {
      return {success: true};
    } else if (response.data.result.code === 1002) {
      return {error: '인증 코드가 일치하지 않습니다.'};
    } else if (response.data.result.code === 1003) {
      return {error: '인증 코드가 만료되었습니다.'};
    }
    return {
      error: '계좌 잠김 해제 실패',
      message: response.data.result.message,
    };
  } catch (error) {
    console.error('계좌 잠김 해제 실패:', error);
    return {error: '계좌 잠김 해제 실패', message: error};
  }
};

export {
  makeAccounts,
  getAccounts,
  getHistories,
  getAccountLockStatus,
  postAccountPassword,
  postAccountUnlock,
};

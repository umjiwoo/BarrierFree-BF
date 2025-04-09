import {axiosInstance} from './axios';

// 최근 보낸 계좌 조회
const getTransactionsHistory = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/api/transactions/history');
    if (response.data.result.code === 200) {
      console.log('최근 보낸 계좌 조회 성공: ', response.data.body);
    } else {
      console.log('최근 보낸 계좌 조회 실패');
    }
    return response.data.body;
  } catch (error) {
    console.error('최근 보낸 계좌 조회 실패:', error);
    return [];
  }
};

// 송금할 계좌 조회
const getCheckAccount = async ({
  transactionAccountNumber,
  transactionAccountBankCode,
}: {
  transactionAccountNumber: string;
  transactionAccountBankCode: string;
}): Promise<any> => {
  try {
    console.log('transactionAccountNumber: ', transactionAccountNumber);
    console.log('transactionAccountBankCode: ', transactionAccountBankCode);
    const response = await axiosInstance.post(
      '/api/transactions/check-account',
      {
        params: {
          transactionAccountNumber: transactionAccountNumber,
          transactionAccountBankCode: transactionAccountBankCode,
        },
      },
    );
    console.log('response: ', response);
    if (response.data.result.code === 200) {
      console.log('송금할 계좌 조회 성공: ', response.data.body);
    } else {
      console.log('송금할 계좌 조회 실패');
    }
    return response.data.body;
  } catch (error: any) {
    console.log('송금할 계좌 조회 실패:', error);
    console.log('error.response: ', error.response.data);
    return [];
  }
};

export {getTransactionsHistory, getCheckAccount};

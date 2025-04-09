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
const postCheckAccount = async (): Promise<any> => {
  try {
    // console.log('transactionAccountNumber: ', transactionAccountNumber);
    // console.log('transactionAccountBankCode: ', transactionAccountBankCode);

    const response = await axiosInstance.post(
      '/api/transactions/check-account',
      {
        transactionAccountNumber: '1190101022222222',
        transactionAccountBankCode: '911',
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

// 계좌 비밀번호 확인
const postCheckAccountPassword = async (
  account_id: number,
  account_password: number,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `/api/accounts/${account_id}/check-pwd`,
      {accountPassword: account_password},
    );
    console.log('password response: ', response);

    if (response.data.result.code === 200) {
      console.log('계좌 비밀번호 확인 성공: ', response.data.body);
      if (response.data.body.isCorrect) {
        return true;
      } else {
        if (response.data.body.isLocked) {
          return 'locked';
        } else {
          return 'wrong';
        }
      }
    } else {
      console.log('계좌 비밀번호 확인 실패');
    }
  } catch (error: any) {
    console.log('계좌 비밀번호 확인 실패:', error);
    console.log('error.response: ', error.response.data);
    return [];
  }
};

// 송금하기
const postSendMoney = async (
  senderId: string,
  receiverAccountId: string,
  transactionAmount: string,
  transactionName: string,
  transactionWebSocketId: string,
  accountPassword: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/api/transactions/send-money', {
      senderId: senderId,
      receiverAccountId: receiverAccountId,
      transactionAmount: transactionAmount,
      transactionName: transactionName,
      transactionWebSocketId: transactionWebSocketId,
      accountPassword: accountPassword,
    });

    if (response.data.result.code === 200) {
      console.log('송금하기 성공: ', response.data.body);
    } else {
      console.log('송금하기 실패');
    }
  } catch (error) {}
};

export {
  getTransactionsHistory,
  postCheckAccount,
  postCheckAccountPassword,
  postSendMoney,
};

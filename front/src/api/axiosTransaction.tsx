import {axiosInstance} from './axios';

// 최근 보낸 계좌 조회
const getTransactionsHistory = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/api/transactions/history');
    if (response.data.result.code === 200) {
    } else {
    }
    return response.data.body;
  } catch (error) {
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

    if (response.data.result.code === 200) {
    } else {
    }
    return response.data.body;
  } catch (error: any) {
    return [];
  }
};

// 계좌 비밀번호 확인
const postCheckAccountPassword = async (
  account_id: number,
  account_password: number,
): Promise<any> => {
  try {
    // const response = await axiosInstance.post(
    //   `/api/accounts/${account_id}/check-pwd?accountPassword=${account_password}`,
    // );
    const response = await axiosInstance.post(
      `/api/accounts/${account_id}/check-pwd`,
      {accountPassword: account_password},
    );

    if (response.data.result.code === 200) {
      if (response.data.body.correct) {
        return true;
      } else {
        if (response.data.body.locked) {
          return 'locked';
        } else {
          return 'wrong';
        }
      }
    } else {
    }
  } catch (error: any) {
    return [];
  }
};

// 송금하기
const postSendMoney = async (
  senderAccountId: number,
  receiverAccountId: number,
  transactionAmount: number,
  transactionName: string,
  transactionWebSocketId: string,
  accountPassword: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/api/transactions/send-money', {
      senderAccountId: senderAccountId,
      receiverAccountId: receiverAccountId,
      transactionAmount: transactionAmount,
      transactionName: transactionName,
      transactionWebSocketId: transactionWebSocketId,
      accountPassword: accountPassword,
    });

    if (response.data.result.code === 200) {
      return response.data;
    } else {
    }
  } catch (error) {
    return [];
  }
};

export {
  getTransactionsHistory,
  postCheckAccount,
  postCheckAccountPassword,
  postSendMoney,
};

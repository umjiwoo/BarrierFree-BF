export interface TestAccountItemProps {
  receiverAccountId: number;
  receiverName: string;
  receiverAccount: string;
  transactionDate: string;
}

export interface GoodsItemProps {
  id: number;
  name: string;
  description: {
    상품개요: string;
    가입대상: string;
    상품특징: string;
    예금과목: string;
    저축방법: string;
    거래한도: string;
    약관: string;
  };
  interestRate: number;
}

export interface AccountItemProps {
  accountBalance: number;
  accountNo: string;
  accountState: string;
  bankId: number;
  createdAt: string;
  dailyTransferLimit: number;
  failedAttempts: number;
  id: number;
  oneTimeTransferLimit: number;
  updatedAt: string;
}

export interface HistoryItemProps {
  id: number;
  transactionStatus: boolean;
  transactionBankId: number;
  transactionBalance: number;
  transactionAccount: string;
  transactionAmount: number;
  transactionType: string;
  transactionDate: string;
  transactionName: string;
  // historyDate: string;
  // historyTime: string;
  // historyType: string;
  // historyWhere: string;
  // historyAccount?: string;
  // historyAmount: number;
}

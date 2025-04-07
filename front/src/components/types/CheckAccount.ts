export interface TestAccountItemProps {
  receiverName: string;
  receiverAccount: string;
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

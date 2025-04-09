export interface AccountItemProps {
  accountBank: string;
  accountNumber: string;
  balance: number;
}

export interface HistoryItemProps {
  historyDate: string;
  historyTime: string;
  historyType: string;
  historyWhere: string;
  historyAccount?: string;
  historyAmount: number;
}

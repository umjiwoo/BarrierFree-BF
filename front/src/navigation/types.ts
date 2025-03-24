export type RootStackParamList = {
  HomeScreen: undefined;
  Main: undefined;
  CheckAccount: {
    selectedAccount: {
      accountBank: string;
      accountNumber: string;
      balance: string;
    };
  };
  CheckHistory: {
    selectedAccount: {
      accountBank: string;
      accountNumber: string;
      balance: string;
    };
    history: {
      historyDate: string;
      historyTime: string;
      historyAmount: string;
      historyType: string;
      historyStatus: string;
      historyAccount?: string;
    };
  };
  CheckHistoryDetail: {
    selectedAccount: {
      accountBank: string;
      accountNumber: string;
      balance: string;
    };
    history: {
      historyDate: string;
      historyTime: string;
      historyAmount: string;
      historyType: string;
      historyStatus: string;
      historyAccount?: string;
    };
  };
  SendFromWhere: {accountNumber: string};
  SendToWho: undefined;
  SendSuccess: undefined;
  ReceivingAccountScreen: undefined;
  RemittanceConfirm: undefined;
  RemittanceInformation: undefined;
  SendInputPage: undefined;
  ThreeBtn: undefined;
};

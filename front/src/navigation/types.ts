import {
  HistoryItemProps,
  TestAccountItemProps,
  GoodsItemProps,
} from '../components/types/CheckAccount';

export type RootStackParamList = {
  HomeScreen: undefined;
  CreateAccountScreen: undefined;
  CreateAccountGoodsDetail: {
    goods: GoodsItemProps;
  };
  CreateAccountCheck: {
    goods: GoodsItemProps;
  };
  CreateAccountSuccess: {
    goods: GoodsItemProps;
  };
  Main: undefined;
  DefaultButton: undefined;
  CheckHistory: undefined;
  CheckHistoryDetail: {
    history: HistoryItemProps;
  };
  SendMain: undefined;
  SendRecentAccount: undefined;
  SendSuccess: undefined;
  ReceivingAccountScreen: {
    selectedAccount: TestAccountItemProps;
  };
  RemittanceConfirm: {
    money: number;
    selectedAccount: TestAccountItemProps;
    password: string;
    accountId: number;
    receiverAccountId?: number;
  };
  RemittanceInformation: {
    money: number;
    selectedAccount: any;
    receiverAccountId?: number;
  };
  SendInputPage: {
    type: 'directMyAccount' | 'directOtherAccount' | 'money' | 'password';
    selectedAccount?: TestAccountItemProps;
    receiverAccountId?: number;
    money?: number;
    goods?: GoodsItemProps;
  };
  PayMain: undefined;
  SettingsMain: undefined;
  Payment: undefined;
  PaymentConfirm: {
    accountNumber: string;
    amount: number;
    sessionId: string;
  };
  AcceptPaymentScreen: {
    messageData: JSON;
  };
  PaySuccess: undefined;
};

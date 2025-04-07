import {create} from 'zustand';
import {AccountItemProps} from '../components/types/CheckAccount';

interface AccountState {
  accounts: AccountItemProps;
  selectedAccount: AccountItemProps | null;
  setAccounts: (accounts: AccountItemProps) => void;
  setSelectedAccount: (account: AccountItemProps) => void;
}

export const useAccountStore = create<AccountState>(set => ({
  accounts: {} as AccountItemProps,
  selectedAccount: null,
  setAccounts: accounts => set({accounts}),
  setSelectedAccount: account => set({selectedAccount: account}),
}));

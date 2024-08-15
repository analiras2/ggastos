import {TDetailsHeader} from '~components/headers/types/header';
import {IPurchase} from '~models/types/purchase';

export enum PaymentMethod {
  CREDIT = 'C. Crédito',
  PIX = 'Pix',
  DEBIT = 'C. Débito',
  CASH = 'Dinheiro',
}

export type TCategoryDetailsProps = {
  headerData: TDetailsHeader;
  items: IPurchase[];
  color: string;
  extraData: boolean;
  onCheck: (item: IPurchase) => void;
  onEdit: (item: IPurchase) => void;
};

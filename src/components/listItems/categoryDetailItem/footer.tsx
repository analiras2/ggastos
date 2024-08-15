import React from 'react';
import LabeledValue from '~components/labeledValue';
import Text from '~components/text';
import {Strings} from '~constants/index';
import {IPurchase} from '~models/types/purchase';
import * as St from './styles';

type FooterProps = {
  item: IPurchase;
};

const Footer = ({item}: FooterProps) => {
  return (
    <St.Row spaceBetween>
      <LabeledValue
        label={Strings.payment}
        value={item.paymentMethod}
        align="left"
      />
      {item.installments > 1 && (
        <LabeledValue
          flex={2}
          label={Strings.installment}
          value={`${item.currentInstallment}/${item.installments}`}
        />
      )}
      <Text type="HEADER" money>
        {item.installmentValue}
      </Text>
    </St.Row>
  );
};

export default Footer;

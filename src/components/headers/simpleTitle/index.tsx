import React from 'react';
import {Text} from '@components/index';
import {Colors, Layout, Strings} from '@constants/index';
import * as St from './styles';

type Props = {
  title: string;
};

const SimpleTitleHeader = ({title}: Props) => {
  return (
    <St.Container>
      <Text
        type={Text.styles.HEADER}
        color={Colors.title}
        textAlign="center"
        mb={Layout.margin.MEDIUM}>
        {Strings.appName}
      </Text>
      <Text type={Text.styles.TITLE_BOLD} color={Colors.title}>
        {title}
      </Text>
    </St.Container>
  );
};

export default SimpleTitleHeader;

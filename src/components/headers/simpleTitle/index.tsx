import React from 'react';
import {Text} from '~components/index';
import {Colors, Strings} from '~constants/index';
import * as St from './styles';

type Props = {
  title: string;
};

const SimpleTitleHeader = ({title}: Props) => {
  return (
    <St.Container>
      <Text type="HEADER" color={Colors.title} textAlign="center" mb={16}>
        {Strings.appName}
      </Text>
      <Text type="TITLE" color={Colors.title} bold>
        {title}
      </Text>
    </St.Container>
  );
};

export default SimpleTitleHeader;

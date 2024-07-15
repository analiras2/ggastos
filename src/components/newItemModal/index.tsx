import React from 'react';
import Text from '~components/text';
import * as St from './styles';
import {Modal} from 'react-native';
import {Colors, Strings} from '~constants/index';
import RoundedView from '~components/roundedView';
import Button from '~components/button';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const NewItemModal = ({isVisible, onClose}: Props) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}>
      <St.Container>
        <RoundedView
          type={RoundedView.layoutType.TITLE}
          title={Strings.newItem}
        />
        <St.Form>
          <St.Row>
            <Icon name="pricetag-outline" size={16} color={Colors.iconDark} />
            <Text>{Strings.selectCategory}</Text>
          </St.Row>
          <St.Row>
            <Icon name="pencil" size={16} color={Colors.iconDark} />
            <Text>{Strings.title}</Text>
          </St.Row>
          <St.Row>
            <Icon name="wallet-outline" size={16} color={Colors.iconDark} />
            <Text>{Strings.value}</Text>
          </St.Row>
          <St.Row>
            <Icon name="clipboard-outline" size={16} color={Colors.iconDark} />
            <Text>{Strings.paymentType}</Text>
          </St.Row>
          <St.Row>
            <Icon name="clipboard-outline" size={16} color={Colors.iconDark} />
            <Text>{Strings.description}</Text>
          </St.Row>
          <St.Footer>
            <Button type="LINK" text={Strings.cancel} onPress={onClose} />
            <Button type="DEFAULT" text={Strings.save} onPress={onClose} />
          </St.Footer>
        </St.Form>
      </St.Container>
    </Modal>
  );
};

export default NewItemModal;

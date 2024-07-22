import React from 'react';
import {ListRenderItem, Modal} from 'react-native';
import {ListItem, RoundedView} from '~components/index';
import {Strings} from '~constants/index';
import * as St from './styles';
import {GroupItemModel} from '~models/groupItem';
import {Button} from 'react-native-paper';

type Props = {
  toShow: boolean;
  options: GroupItemModel[];
  onSelectListener: (item: GroupItemModel) => void;
  onHide: () => void;
  title: string;
  showColor?: boolean;
};

const DividerComponent = () => <St.Divider />;

export function Selector({
  toShow,
  title,
  options,
  onSelectListener,
  onHide,
  showColor = false,
}: Props) {
  const handleSelect = (item: GroupItemModel) => {
    onHide();
    onSelectListener(item);
  };

  const renderItem: ListRenderItem<GroupItemModel> = ({item}) => (
    <ListItem item={item} showColor={showColor} onSelect={handleSelect} />
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={toShow}
      onRequestClose={onHide}>
      <St.Container>
        <St.View>
          <RoundedView type="TITLE" title={title} />
          <St.Body>
            <St.List
              data={options}
              keyExtractor={(item: GroupItemModel) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={DividerComponent}
            />
            <Button onPress={onHide}>{Strings.cancel}</Button>
          </St.Body>
        </St.View>
      </St.Container>
    </Modal>
  );
}

export default Selector;

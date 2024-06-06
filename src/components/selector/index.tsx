import React from 'react';
import {ListRenderItem, Modal} from 'react-native';
import {Button, ListItem, RoundedView} from '@components/index';
import {Strings} from '@constants/index';
import * as St from './styles';
import {GroupItem} from '@models/groupItem';

type Props = {
  toShow: boolean;
  options: GroupItem[];
  onSelectListener: (item: GroupItem) => void;
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
  const handleSelect = (item: GroupItem) => {
    onHide();
    onSelectListener(item);
  };

  const renderItem: ListRenderItem<GroupItem> = ({item}) => (
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
          <RoundedView type={RoundedView.layoutType.TITLE} title={title} />
          <St.Body>
            <St.List
              data={options}
              keyExtractor={(item: GroupItem) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={DividerComponent}
            />
            <Button
              type={Button.types.LINK}
              onPress={onHide}
              text={Strings.cancel}
            />
          </St.Body>
        </St.View>
      </St.Container>
    </Modal>
  );
}

export default Selector;

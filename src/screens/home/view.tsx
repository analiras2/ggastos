import React from 'react';
import {FlatList} from 'react-native';
import {
  BaseScreen,
  CategoryListItem,
  Button,
  NewItemModal,
} from '~components/index';
import {IHomeStackProps} from '~types/navigation';
import * as St from './styles';

const MOCK_BALANCE = {expected: 10, current: 50};

const HomeScreen = ({
  monthModel,
  goToCategoryDetails,
  isNewItemModalVisible,
  onShowNewItemModal,
  onHideNewItemModal,
}: IHomeStackProps) => {
  return (
    <BaseScreen
      header={{type: 'MONTH', balance: MOCK_BALANCE}}
      noScroll
      noPadding>
      <St.Container>
        <FlatList
          data={monthModel.categories}
          keyExtractor={({name}) => name}
          renderItem={({item, index}) => (
            <CategoryListItem
              index={index}
              data={item}
              onPress={goToCategoryDetails}
            />
          )}
        />
        <Button type="FLOATING" onPress={onShowNewItemModal} />
      </St.Container>
      {isNewItemModalVisible && (
        <NewItemModal
          isVisible={isNewItemModalVisible}
          onClose={onHideNewItemModal}
        />
      )}
    </BaseScreen>
  );
};

export default HomeScreen;

import React from 'react';
import {FlatList} from 'react-native';
import {
  BaseScreen,
  CategoryListItem,
  NewItemModal,
  FadeAnimation,
} from '~components/index';
import {IHomeStackProps} from '~types/navigation';
import * as St from './styles';

const HomeScreen = ({
  monthModel,
  onSaveNewItem,
  goToCategoryDetails,
  isNewItemModalVisible,
  onShowNewItemModal,
  onHideNewItemModal,
}: IHomeStackProps) => (
  <BaseScreen
    header={{
      type: 'MONTH',
      balance: {
        expected: monthModel.totalExpected,
        current: monthModel.currentBalance,
      },
    }}
    noScroll
    noPadding>
    <FadeAnimation>
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
        <St.FAB icon="plus" onPress={onShowNewItemModal} />
      </St.Container>
      {isNewItemModalVisible && (
        <NewItemModal
          isVisible={isNewItemModalVisible}
          onClose={onHideNewItemModal}
          onSave={onSaveNewItem}
        />
      )}
    </FadeAnimation>
  </BaseScreen>
);

export default HomeScreen;

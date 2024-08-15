import React from 'react';
import {FlatList} from 'react-native';
import {
  BaseScreen,
  CategoryListItem,
  NewItemModal,
  FadeAnimation,
} from '~components/index';
import * as St from './styles';
import {THomeProps} from './types';

const HomeView = ({
  headerData,
  categories,
  onSaveNewItem,
  goToCategoryDetails,
  isNewItemModalVisible,
  onShowNewItemModal,
  onHideNewItemModal,
}: THomeProps) => (
  <BaseScreen header={headerData} noScroll noPadding>
    <FadeAnimation>
      <St.Container>
        <FlatList
          data={categories}
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

export default HomeView;

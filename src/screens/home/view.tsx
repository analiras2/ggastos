import React from 'react';
import {FlatList} from 'react-native';
import {BaseScreen, CategoryListItem} from '@components/index';
import CATEGORY_MOCK from '../../mocks/categories.json';

const HomeScreen = () => {
  return (
    <BaseScreen headerType={BaseScreen.headerType.MONTH} noScroll>
      <FlatList
        data={CATEGORY_MOCK}
        keyExtractor={({name}) => name}
        renderItem={({item, index}) => (
          <CategoryListItem
            index={index}
            data={item}
            onCallback={() => console.log(item)}
          />
        )}
      />
    </BaseScreen>
  );
};

export default HomeScreen;

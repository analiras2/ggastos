import React from 'react';
import {FlatList} from 'react-native';
import {BaseScreen, CategoryDetailListItem} from '~components/index';
import {TCategoryDetailsProps} from './types';

const CategoryDetailsView = ({
  headerData,
  extraData,
  items,
  color,
  onCheck,
}: TCategoryDetailsProps) => {
  return (
    <BaseScreen header={headerData} noScroll noPadding>
      <FlatList
        data={items}
        extraData={extraData}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <CategoryDetailListItem
            item={item}
            color={color}
            onPress={() => onCheck(item)}
          />
        )}
      />
    </BaseScreen>
  );
};

export default CategoryDetailsView;

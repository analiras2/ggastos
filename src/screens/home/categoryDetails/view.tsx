import React from 'react';
import {FlatList} from 'react-native';
import {BaseScreen, CategoryDetailListItem} from '~components/index';
import {CategoryModel} from '~models/index';
import {ICategoryDetailsStackProps} from '~types/navigation';

const HomeScreen = ({
  navigation,
  route,
  onCheck,
}: ICategoryDetailsStackProps) => {
  const {name, totalExpected, totalSpent, items, color} =
    route.params as CategoryModel;

  return (
    <BaseScreen
      header={{
        type: 'DETAILS',
        title: name,
        balance: {expected: totalExpected, current: totalSpent},
        categoryColor: color,
        onBack: () => navigation.goBack(),
      }}
      noScroll
      noPadding>
      <FlatList
        data={items}
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

export default HomeScreen;

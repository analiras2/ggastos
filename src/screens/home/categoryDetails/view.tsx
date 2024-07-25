import React from 'react';
import {FlatList} from 'react-native';
import {BaseScreen, Text} from '~components/index';
import {RootStackScreenProps} from '~types/navigation';
import {CategoryModel} from '~models/index';

const HomeScreen = ({navigation, route}: RootStackScreenProps) => {
  const {name, totalExpected, totalSpent, items, color} =
    route.params as CategoryModel;

  console.log('Aq', route);
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
        renderItem={({item}) => <Text>{item.title}</Text>}
      />
    </BaseScreen>
  );
};

export default HomeScreen;

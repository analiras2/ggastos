import React from 'react';
import {FlatList} from 'react-native';
import {BaseScreen, CategoryListItem, Button} from '~components/index';
import {IHomeStackProps} from '~types/navigation';
import * as St from './styles';

const HomeScreen = ({monthModel, goToCategoryDetails}: IHomeStackProps) => {
  return (
    <BaseScreen
      header={{type: 'MONTH', balance: {expected: 10, current: 50}}}
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
        <Button type="FLOATING" onPress={() => console.log('add')} />
      </St.Container>
    </BaseScreen>
  );
};

export default HomeScreen;

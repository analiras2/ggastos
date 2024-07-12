import React from 'react';
import {FlatList} from 'react-native';
import {BaseScreen, CategoryListItem, Button} from '@components/index';
import {HomeStackProps} from '@types/navigation';
import * as St from './styles';

const HomeScreen = ({monthModel, goToCategoryDetails}: HomeStackProps) => {
  return (
    <BaseScreen headerType={BaseScreen.headerType.MONTH} noScroll noPadding>
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

import {Colors, MONTHS} from '@constants/index';
import React, {useState, useRef, Fragment, useEffect} from 'react';
import {FlatList, TouchableOpacity} from 'react-native';
import * as St from './styles';
import {RoundedView, Text} from '@components/index';

type MonthItem = {
  id: number;
  month: string;
  monthSort: string;
};

type Props = {
  currentBalance: number;
  expectedBalance: number;
};

const MonthHeader = ({currentBalance, expectedBalance}: Props) => {
  const listRef = useRef<FlatList<MonthItem>>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    listRef.current &&
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: currentMonth === 0 ? currentMonth : currentMonth - 1,
        });
      }, 500);
  });

  const onMonthPress = (index: number) => {
    setCurrentMonth(index);
    listRef.current?.scrollToIndex({
      index: index === 0 ? index : index - 1,
    });
  };

  return (
    <Fragment>
      <St.Container>
        <FlatList
          ref={listRef}
          data={MONTHS}
          keyExtractor={item => item.id + item.month}
          horizontal
          scrollEnabled={false}
          renderItem={({item, index}) => {
            if (currentMonth === index) {
              return (
                <St.CurrentMonth
                  onPress={() => console.log('setYearSelectorVisible')}>
                  <Text type={Text.styles.HEADER} color={Colors.title}>
                    {item.month}
                  </Text>
                  <Text color={Colors.title}>{currentYear}</Text>
                </St.CurrentMonth>
              );
            }
            return (
              <TouchableOpacity onPress={() => onMonthPress(index)}>
                <St.OtherMonth color={Colors.title}>
                  {item.monthSort}
                </St.OtherMonth>
              </TouchableOpacity>
            );
          }}
        />
      </St.Container>
      <RoundedView
        type={RoundedView.layoutType.BALANCE}
        data={{expected: expectedBalance, current: currentBalance}}
      />
    </Fragment>
  );
};

export default MonthHeader;

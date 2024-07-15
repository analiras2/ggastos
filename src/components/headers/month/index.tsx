import {Colors, Layout, MONTHS, Strings, getYears} from '~constants/index';
import React, {useState, useRef, Fragment, useEffect} from 'react';
import {FlatList, TouchableOpacity} from 'react-native';
import * as St from './styles';
import {RoundedView, Selector, Text} from '~components/index';
import {GroupItem} from '~models/groupItem';
import {useDateContext} from '~contexts/dateContext';

type MonthItem = {
  id: number;
  month: string;
  monthSort: string;
};

type Props = {
  currentBalance: number;
  expectedBalance: number;
};

const ITEM_HEIGHT = 54;

const options = getYears(2020).map(item => new GroupItem(item.toString()));

const MonthHeader = ({currentBalance, expectedBalance}: Props) => {
  const listRef = useRef<FlatList<MonthItem>>(null);
  const {currentMonth, setCurrentMonth, currentYear, setCurrentYear} =
    useDateContext();

  const [showYearSelector, setShowYearSelector] = useState(false);

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
                <St.CurrentMonth onPress={() => setShowYearSelector(true)}>
                  <Text type="HEADER" color={Colors.title}>
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
          {...(Layout.IS_ANDROID && {
            getItemLayout: (data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            }),
          })}
        />
      </St.Container>
      <RoundedView
        type={RoundedView.layoutType.BALANCE}
        data={{expected: expectedBalance, current: currentBalance}}
      />
      <Selector
        options={options}
        onHide={() => setShowYearSelector(false)}
        toShow={showYearSelector}
        title={Strings.selectTheYear}
        onSelectListener={item => setCurrentYear(Number(item.id))}
      />
    </Fragment>
  );
};

export default MonthHeader;

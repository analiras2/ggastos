import React, {useState, useEffect} from 'react';
import TextInput from '~components/textInput';
import * as St from './styles';
import {Colors, Strings} from '~constants/index';
import RoundedView from '~components/roundedView';
import {CategoryModel} from '~models/category';
import {Button} from 'react-native-paper';
import {Modal} from 'react-native';
import {IPurchaseSaveItem} from '~types/item';
import DatePicker from 'react-native-date-picker';
import {formatDate} from '~utils/index';
import {PaymentMethod} from '~types/paymentMethod';
import {GroupItemModel} from '~models/groupItem';

type Props = {
  isVisible: boolean;
  onSave: (formData: IPurchaseSaveItem) => void;
  onClose: () => void;
};

const paymentOptions = Object.entries(PaymentMethod).map(
  ([key, value]) => new GroupItemModel(key, value),
);

const NewItemModal = ({isVisible, onSave, onClose}: Props) => {
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<IPurchaseSaveItem>({
    title: '',
    date: new Date(),
    category: '',
    price: '',
    paymentMethod: '',
    installments: '1',
    note: '',
  });

  useEffect(() => {
    const isFormValid =
      formData.title.trim() !== '' &&
      formData.category.trim() !== '' &&
      formData.price.trim() !== '' &&
      formData.paymentMethod.trim() !== '';

    setIsValid(isFormValid);
  }, [formData]);

  const handleChange = (key: keyof typeof formData, value: string | Date) => {
    setFormData(prevState => ({...prevState, [key]: value}));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}>
      <St.Container>
        <RoundedView type="TITLE" title={Strings.newItem} />
        <St.Form>
          <St.Row>
            <St.Icon name="tag" size={16} color={Colors.iconDark} />
            <St.Dropdown
              data={CategoryModel.getCategories}
              labelField="name"
              valueField="id"
              placeholder={Strings.selectCategory}
              value={formData.category}
              onChange={item => {
                handleChange('category', item.id);
              }}
            />
          </St.Row>
          <TextInput
            label={Strings.title}
            iconData={{name: 'pencil'}}
            onChangeText={txt => handleChange('title', txt)}
          />

          <TextInput
            label={Strings.date}
            iconData={{name: 'calendar'}}
            value={formatDate(formData.date)}
            onPress={() => setOpen(true)}
            editable={false}
          />

          <DatePicker
            modal
            mode="date"
            open={openDatePicker}
            date={formData.date}
            onConfirm={date => {
              setOpenDatePicker(false);
              handleChange('date', date);
            }}
            onCancel={() => {
              setOpenDatePicker(false);
            }}
          />

          <St.Row>
            <St.Icon name="wallet" size={16} color={Colors.iconDark} />
            <St.Dropdown
              data={paymentOptions}
              labelField="title"
              valueField="title"
              placeholder={Strings.paymentType}
              value={formData.paymentMethod}
              onChange={item => {
                handleChange('paymentMethod', item.title);
              }}
            />
          </St.Row>

          <St.Row>
            <St.MoneyInput
              label={Strings.value}
              isMoney
              iconData={{name: 'wallet'}}
              onChangeText={txt => handleChange('price', txt)}
            />
            {formData.paymentMethod === PaymentMethod.CREDIT && (
              <St.InstallmentsInput
                label={Strings.installments}
                keyboardType="numeric"
                iconData={{name: 'credit-card'}}
                value={formData.installments}
                onChangeText={txt => {
                  const value = txt === '0' ? '1' : txt;
                  handleChange('installments', value);
                }}
                onBlur={() => {
                  if (!formData.installments) {
                    handleChange('installments', '1');
                  }
                }}
              />
            )}
          </St.Row>

          <TextInput
            label={Strings.description}
            iconData={{name: 'note'}}
            onChangeText={txt => handleChange('note', txt)}
          />

          <St.Footer>
            <Button onPress={onClose}>{Strings.cancel}</Button>
            <Button mode="contained" onPress={handleSave} disabled={!isValid}>
              {Strings.save}
            </Button>
          </St.Footer>
        </St.Form>
      </St.Container>
    </Modal>
  );
};

export default NewItemModal;

import React, {useState, useEffect} from 'react';
import TextInput from '~components/textInput';
import * as St from './styles';
import {Colors, Strings} from '~constants/index';
import RoundedView from '~components/roundedView';
import {CategoryModel} from '~models/category';
import {Button} from 'react-native-paper';
import {Modal} from 'react-native';
import {IPurchaseItem} from '~types/item';
import DatePicker from 'react-native-date-picker';
import {formatDate} from '~utils/index';

type Props = {
  isVisible: boolean;
  onSave: (formData: IPurchaseItem) => void;
  onClose: () => void;
};

const options = CategoryModel.getCategories.map(category => ({
  label: category.name,
  value: category.name,
}));

const NewItemModal = ({isVisible, onSave, onClose}: Props) => {
  const [open, setOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<IPurchaseItem>({
    title: '',
    date: new Date(),
    category: '',
    price: 0,
    paymentMethod: '',
    installments: 1,
    note: '',
  });

  useEffect(() => {
    const isFormValid =
      formData.title.trim() !== '' &&
      formData.category.trim() !== '' &&
      formData.price !== 0 &&
      formData.paymentMethod.trim() !== '';

    setIsValid(isFormValid);
  }, [formData]);

  const handleChange = (key: keyof typeof formData, value: string | Date) => {
    setFormData(prevState => ({
      ...prevState,
      [key]: value,
    }));
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
              data={options}
              labelField="label"
              valueField="value"
              placeholder={Strings.selectCategory}
              value={selectedCategory}
              onChange={item => {
                setSelectedCategory(item.value);
                handleChange('category', item.value);
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
            open={open}
            date={formData.date}
            onConfirm={date => {
              setOpen(false);
              handleChange('date', date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />

          <TextInput
            label={Strings.value}
            isMoney
            iconData={{name: 'wallet'}}
            onChangeText={txt => handleChange('price', txt)}
          />

          <TextInput
            label={Strings.paymentType}
            iconData={{name: 'note'}}
            onChangeText={txt => handleChange('paymentMethod', txt)}
          />

          <TextInput
            label={Strings.description}
            iconData={{name: 'note'}}
            onChangeText={txt => handleChange('note', txt)}
          />

          <St.Footer>
            <Button onPress={onClose}>{Strings.cancel}</Button>
            <Button
              mode="contained"
              onPress={() => onSave(formData)}
              disabled={!isValid}>
              {Strings.save}
            </Button>
          </St.Footer>
        </St.Form>
      </St.Container>
    </Modal>
  );
};

export default NewItemModal;

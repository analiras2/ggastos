import AsyncStorage from '@react-native-async-storage/async-storage';
import {Strings} from '~constants/index';

class AsyncStorageManager {
  constructor(private storageKey: string) {}

  async getItems() {
    try {
      const jsonValue = await AsyncStorage.getItem(this.storageKey);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error(Strings.storage.getItemsError, error);
      return [];
    }
  }

  async setItems(items: any[]) {
    try {
      const jsonValue = JSON.stringify(items);
      await AsyncStorage.setItem(this.storageKey, jsonValue);
    } catch (error) {
      console.error(Strings.storage.saveError, error);
    }
  }

  async clearStorage() {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage limpo com sucesso!');
    } catch (error) {
      console.error(Strings.storage.clearError, error);
    }
  }

  async removeItem(key: number) {
    try {
      const items = await this.getItems();
      const updatedItems = items.filter(
        (item: {id: number}) => item.id !== key,
      );
      await this.setItems(updatedItems);
    } catch (error) {
      console.error(Strings.storage.deleteError, error);
    }
  }
}

export default AsyncStorageManager;

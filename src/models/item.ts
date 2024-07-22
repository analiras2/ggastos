import AsyncStorage from '@react-native-async-storage/async-storage';
import {IItem, IPurchaseItem} from '~types/item';

export class ItemModel {
  private static storageKey = '@items_storage';

  static async getItems(): Promise<IItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.storageKey);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error fetching items:', e);
      return [];
    }
  }

  static async addItem(item: IPurchaseItem): Promise<void> {
    const items = await this.getItems();
    const id =
      items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const newItem: IItem = {
      ...item,
      id,
      paid: false,
      currentInstallment: 1,
    };
    const updatedItems = [...items, newItem];
    console.log('Aqui', updatedItems);
    // await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedItems));
  }

  static async updateItem(updatedItem: IItem): Promise<void> {
    const items = await this.getItems();
    const itemIndex = items.findIndex(item => item.id === updatedItem.id);

    if (itemIndex !== -1) {
      items[itemIndex] = updatedItem;
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }

  static async removeItem(itemId: number): Promise<void> {
    const items = await this.getItems();
    const updatedItems = items.filter(item => item.id !== itemId);
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedItems));
  }
}

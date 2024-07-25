import AsyncStorageManager from '../service/asyncStorageManager';
import {IItem, IPurchaseItem} from '~types/item';

export class ItemModel {
  static storageKey = '@items_storage';

  private storageManager: AsyncStorageManager;

  constructor() {
    this.storageManager = new AsyncStorageManager(ItemModel.storageKey);
  }

  async getItems(): Promise<IItem[]> {
    return await this.storageManager.getItems();
  }

  async addItem(item: IPurchaseItem): Promise<void> {
    const items = await this.getItems();
    const baseDate = new Date(item.date);
    const updatedItems: IItem[] = [];

    for (let i = 0; i < item.installments; i++) {
      const id =
        items.length > 0
          ? Math.max(...items.map(existingItem => existingItem.id)) + i + 1
          : i + 1;

      const newDate = new Date(baseDate);
      newDate.setMonth(baseDate.getMonth() + i);

      const newItem: IItem = {
        ...item,
        id,
        date: newDate.toISOString(),
        paid: false,
        currentInstallment: i + 1,
        installmentValue: item.price / item.installments,
      };

      updatedItems.push(newItem);
    }

    const allItems = [...items, ...updatedItems];

    await this.storageManager.setItems(allItems);
  }

  async updateItem(updatedItem: IItem): Promise<void> {
    const items = await this.getItems();
    const itemIndex = items.findIndex(item => item.id === updatedItem.id);

    if (itemIndex !== -1) {
      items[itemIndex] = updatedItem;
      await this.storageManager.setItems(items);
    }
  }

  async removeItem(itemId: number): Promise<void> {
    const items = await this.getItems();
    const updatedItems = items.filter(item => item.id !== itemId);
    await this.storageManager.setItems(updatedItems);
  }
}

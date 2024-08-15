import AsyncStorageManager from './asyncStorageManager';
import {IPurchase} from '~models/types/purchase';

export class PurchaseStorageService {
  static storageKey = '@items_storage';
  static storageManager = new AsyncStorageManager(
    PurchaseStorageService.storageKey,
  );

  static async getItems(): Promise<IPurchase[]> {
    return await PurchaseStorageService.storageManager.getItems();
  }

  static async setItems(items: IPurchase[]): Promise<void> {
    await PurchaseStorageService.storageManager.setItems(items);
  }
}

import {PurchaseStorageService} from '~service/purchaseStorage';
import {IPurchase, IPurchaseItem} from '~models/types/purchase';

export class PurchaseModel {
  static async getPurchases(): Promise<IPurchase[]> {
    return await PurchaseStorageService.getItems();
  }

  static async addPurchase(item: IPurchaseItem): Promise<void> {
    const items = await this.getPurchases();
    const baseDate = new Date(item.date);
    const updatedPurchases: IPurchase[] = [];

    for (let i = 0; i < item.installments; i++) {
      const id =
        items.length > 0
          ? Math.max(...items.map(existingPurchase => existingPurchase.id)) +
            i +
            1
          : i + 1;

      const newDate = new Date(baseDate);
      newDate.setMonth(baseDate.getMonth() + i);

      const newPurchase: IPurchase = {
        ...item,
        id,
        date: newDate.toISOString(),
        paid: false,
        currentInstallment: i + 1,
        installmentValue: item.price / item.installments,
      };

      updatedPurchases.push(newPurchase);
    }

    const allPurchases = [...items, ...updatedPurchases];

    await PurchaseStorageService.setItems(allPurchases);
  }

  static async payPurchase(purchase: IPurchase): Promise<void> {
    const newPurchase: IPurchase = {...purchase, paid: !purchase.paid};
    await this.updatePurchase(newPurchase);
  }

  static async updatePurchase(updatedPurchase: IPurchase): Promise<void> {
    const items = await this.getPurchases();
    const itemIndex = items.findIndex(item => item.id === updatedPurchase.id);

    if (itemIndex !== -1) {
      items[itemIndex] = updatedPurchase;
      await PurchaseStorageService.setItems(items);
    }
  }

  async removePurchase(itemId: number): Promise<void> {
    const items = await PurchaseModel.getPurchases();
    const updatedPurchases = items.filter(item => item.id !== itemId);
    await PurchaseStorageService.setItems(updatedPurchases);
  }
}

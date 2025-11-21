// File: backend/src/models/SaleModel.js
import { v4 as uuidv4 } from 'uuid';

class SaleModel {
  constructor(db) {
    this.db = db;
    this.collection = 'sales';
  }

  create(saleData) {
    const sale = {
      id: uuidv4(),
      propertyId: saleData.propertyId,
      tokenId: saleData.tokenId,
      buyerAccountId: saleData.buyerAccountId,
      quantity: saleData.quantity,
      pricePerToken: saleData.pricePerToken,
      totalPrice: saleData.totalPrice,
      currency: saleData.currency || 'USD',
      status: saleData.status || 'PENDING',
      hederaTxId: saleData.hederaTxId || null,
      hcsMessageId: saleData.hcsMessageId || null,
      paymentSimulated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.db.get(this.collection).push(sale).write();
    return sale;
  }

  updateStatus(saleId, status, hederaTxId = null, hcsMessageId = null) {
    const updated = this.db
      .get(this.collection)
      .find({ id: saleId })
      .assign({
        status,
        hederaTxId,
        hcsMessageId,
        updatedAt: new Date().toISOString()
      })
      .write();

    return updated; // returns cloned updated object or null if not found
  }

  findById(saleId) {
    return this.db.get(this.collection).find({ id: saleId }).value();
  }

  findByProperty(propertyId) {
    const all = this.db.get(this.collection).value();
    return all.filter(sale => sale.propertyId === propertyId);
  }

  findByBuyer(buyerAccountId) {
    const all = this.db.get(this.collection).value();
    return all.filter(sale => sale.buyerAccountId === buyerAccountId);
  }
}

export default SaleModel;
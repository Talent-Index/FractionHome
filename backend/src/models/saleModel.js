const { v4: uuidv4 } = require('uuid');

class SaleModel {
  constructor(db) {
    this.db = db;
    this.collection = 'sales';
  }

  async create(saleData) {
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

    await this.db.get(this.collection).push(sale).write();
    return sale;
  }

  async updateStatus(saleId, status, hederaTxId = null, hcsMessageId = null) {
    const sale = await this.db.get(this.collection)
      .find({ id: saleId })
      .assign({
        status,
        hederaTxId,
        hcsMessageId,
        updatedAt: new Date().toISOString()
      })
      .write();
    
    return sale;
  }

  async findById(saleId) {
    return this.db.get(this.collection).find({ id: saleId }).value();
  }

  async findByProperty(propertyId) {
    return this.db.get(this.collection).filter({ propertyId }).value();
  }

  async findByBuyer(buyerAccountId) {
    return this.db.get(this.collection).filter({ buyerAccountId }).value();
  }
}

module.exports = SaleModel;
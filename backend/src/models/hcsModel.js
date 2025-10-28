import { v4 as uuidv4 } from 'uuid';

class HCSModel {
  constructor(db) {
    this.db = db;
    this.collection = 'hcs_records';
  }

  async create(hcsData) {
    const record = {
      id: uuidv4(),
      topicId: hcsData.topicId,
      propertyId: hcsData.propertyId || null,
      tokenId: hcsData.tokenId || null,
      messageId: hcsData.messageId,
      sequenceNumber: hcsData.sequenceNumber || null,
      messageType: hcsData.messageType,
      createdAt: new Date().toISOString()
    };

    await this.db.get(this.collection).push(record).write();
    return record;
  }

  async findByPropertyId(propertyId) {
    return this.db.get(this.collection)
      .find({ propertyId })
      .value();
  }

  async findByTokenId(tokenId) {
    return this.db.get(this.collection)
      .find({ tokenId })
      .value();
  }

  async findByTopicId(topicId) {
    return this.db.get(this.collection)
      .filter({ topicId })
      .value();
  }

  async findByMessageId(messageId) {
    return this.db.get(this.collection)
      .find({ messageId })
      .value();
  }
}

export default HCSModel;
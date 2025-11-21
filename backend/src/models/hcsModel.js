// File: backend/src/models/HCSModel.js
import { v4 as uuidv4 } from 'uuid';

class HCSModel {
  constructor(db) {
    this.db = db;
    this.collection = 'hcs_records';
  }

  create(hcsData) {
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

    // Synchronous write
    this.db.get(this.collection).push(record).write();
    return record;
  }

  findByPropertyId(propertyId) {
    return this.db.get(this.collection).find({ propertyId }).value();
  }

  findByTokenId(tokenId) {
    return this.db.get(this.collection).find({ tokenId }).value();
  }

  findByTopicId(topicId) {
    // Since your db doesn't support .filter(), get all and filter in JS
    const all = this.db.get(this.collection).value();
    return all.filter(record => record.topicId === topicId);
  }

  findByMessageId(messageId) {
    return this.db.get(this.collection).find({ messageId }).value();
  }
}

export default HCSModel;
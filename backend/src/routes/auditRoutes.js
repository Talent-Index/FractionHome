import express from 'express';
import {
  uploadProperty,
  getProperty,
  verifyProperty,
  listAll,
} from '../controllers/propertyController.js';

export default class auditRoutes {
  constructor(handlers = { uploadProperty, getProperty, verifyProperty, listAll }) {
    this.handlers = handlers;
    this.router = express.Router();
    this.registerRoutes();
  }

  registerRoutes() {
    // POST /api/audit/property/upload
    this.router.post('/property/upload', this.handlers.uploadProperty);

    // GET /api/audit/property/:id/verify
    this.router.get('/property/:id/verify', this.handlers.verifyProperty);

    // GET /api/audit/property/:id
    this.router.get('/property/:id', this.handlers.getProperty);

    // GET /api/audit/property
    this.router.get('/property', this.handlers.listAll);
  }

  getRouter() {
    return this.router;
  }
}

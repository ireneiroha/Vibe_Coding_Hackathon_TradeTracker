import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertSettingsSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Transactions routes
  app.get('/api/transactions', async (req, res) => {
    try {
      const { type, category, search } = req.query;
      const filters = {
        type: type as string,
        category: category as string,
        search: search as string,
      };
      
      const transactions = await storage.getTransactions(filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/transactions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transaction' });
    }
  });

  app.post('/api/transactions', upload.single('photo'), async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      
      // If photo was uploaded, add the file path
      if (req.file) {
        data.photoUrl = `/uploads/${req.file.filename}`;
      }
      
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  });

  app.put('/api/transactions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertTransactionSchema.partial().parse(req.body);
      
      const transaction = await storage.updateTransaction(id, updates);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update transaction' });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransaction(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete transaction' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', async (req, res) => {
    try {
      const updates = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(updates);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid settings data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // Export routes
  app.get('/api/export/transactions', async (req, res) => {
    try {
      const { type, category, search } = req.query;
      const filters = {
        type: type as string,
        category: category as string,
        search: search as string,
      };
      
      const transactions = await storage.getTransactions(filters);
      
      // Generate CSV
      const csvHeader = 'Date,Description,Category,Type,Amount\n';
      const csvRows = transactions.map(t => 
        `${t.date},"${t.description}","${t.category}","${t.type}","${t.amount}"`
      ).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export transactions' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}

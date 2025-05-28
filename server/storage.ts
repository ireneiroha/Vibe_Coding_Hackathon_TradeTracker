import { transactions, settings, type Transaction, type InsertTransaction, type Settings, type InsertSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Transactions
  getTransactions(filters?: { type?: string; category?: string; search?: string }): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
  
  // Analytics
  getDashboardStats(): Promise<{
    todayRevenue: number;
    todayExpenses: number;
    netProfit: number;
    transactionCount: number;
    recentTransactions: Transaction[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getTransactions(filters?: { type?: string; category?: string; search?: string }): Promise<Transaction[]> {
    const allTransactions = await db.select().from(transactions);
    
    let result = allTransactions;
    
    if (filters?.type) {
      result = result.filter(t => t.type === filters.type);
    }
    
    if (filters?.category) {
      result = result.filter(t => t.category === filters.category);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }
    
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        photoUrl: insertTransaction.photoUrl || null
      })
      .returning();
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSettings(): Promise<Settings> {
    const [settingsRow] = await db.select().from(settings).limit(1);
    
    if (!settingsRow) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(settings)
        .values({
          businessName: "My Business",
          ownerName: "Business Owner",
          email: "owner@business.com",
          currency: "USD",
          voiceInputEnabled: true,
          autoSavePhotos: false,
          darkModeEnabled: false,
          notificationsEnabled: true,
          autoBackupEnabled: true,
        })
        .returning();
      return newSettings;
    }
    
    return settingsRow;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    // Get existing settings or create default
    const currentSettings = await this.getSettings();
    
    const [updatedSettings] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, currentSettings.id))
      .returning();
    
    return updatedSettings;
  }

  async getDashboardStats(): Promise<{
    todayRevenue: number;
    todayExpenses: number;
    netProfit: number;
    transactionCount: number;
    recentTransactions: Transaction[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all transactions for today
    const todayTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.date, today));
    
    const todayRevenue = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const todayExpenses = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .orderBy(transactions.createdAt)
      .limit(4);
    
    return {
      todayRevenue,
      todayExpenses,
      netProfit: todayRevenue - todayExpenses,
      transactionCount: todayTransactions.length,
      recentTransactions: recentTransactions.reverse(),
    };
  }
}

export const storage = new DatabaseStorage();

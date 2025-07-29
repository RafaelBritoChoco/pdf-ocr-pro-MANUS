import { type User, type InsertUser, type Document, type InsertDocument, type ProcessingLog, type InsertProcessingLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  
  createProcessingLog(log: InsertProcessingLog): Promise<ProcessingLog>;
  getProcessingLogs(documentId: string): Promise<ProcessingLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<string, Document>;
  private processingLogs: Map<string, ProcessingLog[]>;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.processingLogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = { 
      id, 
      filename: insertDocument.filename,
      status: insertDocument.status || 'pending',
      createdAt: now,
      updatedAt: now,
      summary: insertDocument.summary || null,
      metadata: insertDocument.metadata || null,
      originalText: insertDocument.originalText || null,
      processedText: insertDocument.processedText || null,
      processingTime: insertDocument.processingTime || null,
      wordCount: insertDocument.wordCount || null,
      pageCount: insertDocument.pageCount || null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { 
      ...document, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async createProcessingLog(insertLog: InsertProcessingLog): Promise<ProcessingLog> {
    const id = randomUUID();
    const log: ProcessingLog = { 
      ...insertLog, 
      id, 
      timestamp: new Date(),
      duration: insertLog.duration || null,
      documentId: insertLog.documentId || null,
      message: insertLog.message || null
    };
    
    const logs = this.processingLogs.get(insertLog.documentId!) || [];
    logs.push(log);
    this.processingLogs.set(insertLog.documentId!, logs);
    
    return log;
  }

  async getProcessingLogs(documentId: string): Promise<ProcessingLog[]> {
    return this.processingLogs.get(documentId) || [];
  }
}

export const storage = new MemStorage();

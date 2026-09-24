export class IndexedDBService {
  private static readonly dbName: string = "forked-networks";
  private static readonly objectStoreName: string = "networks";

  static async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.objectStoreName, { keyPath: "id" });
      };
    });
  }

  static async performDatabaseOperation<T>(
    operation: (store: IDBObjectStore) => IDBRequest | IDBRequest<T>
  ): Promise<T | undefined> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.objectStoreName], "readwrite");
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = operation(objectStore);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  static async insert(data: any): Promise<IDBValidKey | undefined> {
    // Check if 'id' exists, if not generate a UUID
    if (data.id === undefined || data.id === null) {
      data = { id: crypto.randomUUID(), ...data }; // Generating a UUID
    }
    // Add or update the 'indexDBCreatedAt' field
    if (data.indexDBCreatedAt === undefined || data.indexDBCreatedAt === null) {
      data = { ...data, indexDBCreatedAt: new Date().toISOString() }; // Current ISO date-time string
    }
    return this.performDatabaseOperation((store) => store.add(data));
  }

  static async update(data: any): Promise<IDBValidKey | undefined> {
    return this.performDatabaseOperation((store) => store.put(data));
  }

  static async get(id: string): Promise<any | undefined> {
    return this.performDatabaseOperation((store) => store.get(id));
  }
  static async getAll(): Promise<any | undefined> {
    return this.performDatabaseOperation((store) => store.getAll());
  }
  static async delete(id: string): Promise<void> {
    return this.performDatabaseOperation((store) => store.delete(id));
  }
  static async clear(): Promise<void> {
    return this.performDatabaseOperation((store) => store.clear());
  }
}

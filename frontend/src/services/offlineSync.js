// ==============================================================================
// Omnidesk BD Offline State Queue & IndexedDB Synchronization Service (v1.2.4)
// Guaranteed Data Integrity for Tasks, Timer Sessions, & Topic Progressions
// ==============================================================================

import axios from 'axios';

const DB_NAME = 'OmnideskBD_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'sync_queue';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return resolve(null);
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export const offlineSyncService = {
  /**
   * Enqueue a state mutation into IndexedDB when offline or on network failure.
   */
  async queueMutation(entity, action, data) {
    try {
      const db = await getDB();
      if (!db) return;

      const record = {
        entity,
        action,
        data,
        client_timestamp: new Date().toISOString()
      };

      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.add(record);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      this.notifyStatusChange();
    } catch (err) {
      console.error('Failed to queue offline mutation in IndexedDB:', err);
    }
  },

  /**
   * Retrieve all pending queued mutations.
   */
  async getPendingMutations() {
    try {
      const db = await getDB();
      if (!db) return [];

      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  },

  /**
   * Delete synced mutations from IndexedDB by IDs.
   */
  async deleteMutations(ids) {
    try {
      const db = await getDB();
      if (!db || !ids.length) return;

      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        ids.forEach((id) => store.delete(id));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      this.notifyStatusChange();
    } catch (err) {
      console.error('Failed to prune synced mutations:', err);
    }
  },

  /**
   * Push all queued mutations to the backend in a single atomic transaction.
   */
  async syncPending() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { synced: 0, pending: await this.getPendingCount() };
    }

    const mutations = await this.getPendingMutations();
    if (!mutations.length) {
      this.notifyStatusChange(0, false);
      return { synced: 0, pending: 0 };
    }

    this.notifyStatusChange(mutations.length, true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.origin.includes('localhost:5173') ? 'http://127.0.0.1:8000/api' : '/api');
      const token = localStorage.getItem('studyos_token') || localStorage.getItem('access_token');
      
      const payload = {
        mutations: mutations.map((m) => ({
          entity: m.entity,
          action: m.action,
          data: m.data,
          client_timestamp: m.client_timestamp
        }))
      };

      const response = await axios.post(`${API_URL}/sync/batch`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data?.success) {
        const ids = mutations.map((m) => m.id);
        await this.deleteMutations(ids);
        this.notifyStatusChange(0, false);
        return { synced: ids.length, pending: 0 };
      }
    } catch (err) {
      console.warn('Batch sync attempt failed, will retry on next reconnect:', err);
    }

    const remaining = await this.getPendingCount();
    this.notifyStatusChange(remaining, false);
    return { synced: 0, pending: remaining };
  },

  async getPendingCount() {
    const list = await this.getPendingMutations();
    return list.length;
  },

  notifyStatusChange(count = null, isSyncing = false) {
    if (typeof window === 'undefined') return;

    if (count !== null) {
      window.dispatchEvent(
        new CustomEvent('studyos-sync-status', {
          detail: { count, isSyncing, online: navigator.onLine }
        })
      );
      return;
    }

    this.getPendingCount().then((cnt) => {
      window.dispatchEvent(
        new CustomEvent('studyos-sync-status', {
          detail: { count: cnt, isSyncing, online: navigator.onLine }
        })
      );
    });
  },

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.info('Network connection restored. Triggering offline sync...');
      this.syncPending();
    });

    window.addEventListener('offline', () => {
      this.notifyStatusChange();
    });

    // Initial sync check on page load
    setTimeout(() => {
      if (navigator.onLine) {
        this.syncPending();
      } else {
        this.notifyStatusChange();
      }
    }, 1500);
  }
};

// Initialize listeners on module load
offlineSyncService.init();

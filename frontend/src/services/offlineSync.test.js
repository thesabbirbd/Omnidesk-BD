import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import axios from 'axios';
import { offlineSyncService } from './offlineSync';

vi.mock('axios');

describe('offlineSyncService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    // Fake indexeddb might not properly delete active connections via deleteDatabase when there is an open connection.
    // Instead of deleting the db which hangs sometimes due to the open connection held by offlineSyncService,
    // let's just clear the table.
    const mutations = await offlineSyncService.getPendingMutations();
    if (mutations.length > 0) {
      await offlineSyncService.deleteMutations(mutations.map(m => m.id));
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with empty pending mutations', async () => {
    const mutations = await offlineSyncService.getPendingMutations();
    expect(mutations).toEqual([]);
  });

  it('should queue a mutation and be able to retrieve it', async () => {
    // We spy on notifyStatusChange since it's called
    const notifySpy = vi.spyOn(offlineSyncService, 'notifyStatusChange').mockImplementation(() => {});

    await offlineSyncService.queueMutation('task', 'create', { id: 1, name: 'Test Task' });

    const mutations = await offlineSyncService.getPendingMutations();
    expect(mutations.length).toBe(1);
    expect(mutations[0].entity).toBe('task');
    expect(mutations[0].action).toBe('create');
    expect(mutations[0].data).toEqual({ id: 1, name: 'Test Task' });
    expect(mutations[0].client_timestamp).toBeDefined();

    expect(notifySpy).toHaveBeenCalled();
  });

  it('should return pending count correctly', async () => {
    await offlineSyncService.queueMutation('task', 'update', { id: 1 });
    await offlineSyncService.queueMutation('task', 'update', { id: 2 });
    const count = await offlineSyncService.getPendingCount();
    expect(count).toBe(2);
  });

  it('should delete specified mutations', async () => {
    await offlineSyncService.queueMutation('task', 'update', { id: 1 });
    await offlineSyncService.queueMutation('task', 'update', { id: 2 });
    const mutations = await offlineSyncService.getPendingMutations();

    // delete the first mutation
    await offlineSyncService.deleteMutations([mutations[0].id]);
    const afterDelete = await offlineSyncService.getPendingMutations();
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].id).toBe(mutations[1].id);
  });

  it('syncPending should return early if no mutations', async () => {
    const notifySpy = vi.spyOn(offlineSyncService, 'notifyStatusChange').mockImplementation(() => {});
    const result = await offlineSyncService.syncPending();
    expect(result).toEqual({ synced: 0, pending: 0 });
    expect(notifySpy).toHaveBeenCalledWith(0, false);
  });

  it('syncPending should post mutations and delete them on success', async () => {
    await offlineSyncService.queueMutation('topic', 'complete', { topicId: 10 });

    // mock axios.post to succeed
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const notifySpy = vi.spyOn(offlineSyncService, 'notifyStatusChange').mockImplementation(() => {});

    const result = await offlineSyncService.syncPending();

    // axios post should be called
    expect(axios.post).toHaveBeenCalled();
    const [url, payload] = axios.post.mock.calls[0];
    expect(payload.mutations).toHaveLength(1);
    expect(payload.mutations[0].entity).toBe('topic');

    expect(result).toEqual({ synced: 1, pending: 0 });

    // Queue should be empty after successful sync
    const mutations = await offlineSyncService.getPendingMutations();
    expect(mutations.length).toBe(0);

    // notifyStatusChange called for start and completion
    expect(notifySpy).toHaveBeenCalledWith(1, true); // starting sync
    expect(notifySpy).toHaveBeenCalledWith(0, false); // completed sync
  });

  it('syncPending should retain mutations and retry if api fails', async () => {
    await offlineSyncService.queueMutation('topic', 'complete', { topicId: 10 });

    // mock axios.post to fail
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    const notifySpy = vi.spyOn(offlineSyncService, 'notifyStatusChange').mockImplementation(() => {});

    const result = await offlineSyncService.syncPending();

    expect(axios.post).toHaveBeenCalled();

    // Should still have 1 pending
    expect(result).toEqual({ synced: 0, pending: 1 });

    // Queue should still contain the item
    const mutations = await offlineSyncService.getPendingMutations();
    expect(mutations.length).toBe(1);

    expect(notifySpy).toHaveBeenCalledWith(1, false); // failed sync, 1 left
  });

  it('syncPending should check navigator.onLine if available', async () => {
    // we can mock navigator.onLine for jsdom
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    await offlineSyncService.queueMutation('task', 'create', { id: 2 });

    const result = await offlineSyncService.syncPending();
    expect(result).toEqual({ synced: 0, pending: 1 });

    // axios should not be called since we're offline
    expect(axios.post).not.toHaveBeenCalled();

    // restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });
});

/**
 * Asks the browser not to evict this app's storage (the signed-in session and the offline
 * Firestore cache) when the device runs low on space. Browsers decide silently; installed
 * PWAs are usually granted it.
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
};

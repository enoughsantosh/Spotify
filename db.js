const DB_NAME = "spookify-db";
const STORE_NAME = "metadata";

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "preview_url" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Save metadata
async function saveMetadata(preview_url, data) {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put({ preview_url, ...data });
}

// Get all metadata
async function getAllMetadata() {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}

// Remove metadata
async function removeMetadata(preview_url) {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(preview_url);
}

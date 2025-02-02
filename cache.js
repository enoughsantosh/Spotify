const cacheList = document.getElementById("cacheList");
const clearAllButton = document.getElementById("clearAll");
const totalSizeDisplay = document.getElementById("totalSize");

// Convert bytes to human-readable format (KB, MB)
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Function to load cached songs
async function loadCachedData() {
    cacheList.innerHTML = "";
    totalSizeDisplay.textContent = "Total Cache Size: Calculating...";

    const cache = await caches.open("spookify-audio-v1");
    const cachedRequests = await cache.keys();
    const metadataList = await getAllMetadata();

    let totalSize = 0;

    if (cachedRequests.length === 0) {
        cacheList.innerHTML = "<p>No cached songs.</p>";
        totalSizeDisplay.textContent = "Total Cache Size: 0 B";
        return;
    }

    for (const request of cachedRequests) {
        const preview_url = request.url;
        const metadata = metadataList.find(item => item.preview_url === preview_url);

        const response = await cache.match(request);
        const blob = await response.blob();
        const size = blob.size;
        totalSize += size;

        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${metadata?.cover}" width="50" height="50" style="border-radius: 5px; margin-right: 10px;">
            <span>${metadata?.title || "Unknown Song"} - ${formatSize(size)}</span>
            <button onclick="removeCachedSong('${preview_url}')">Remove</button>
        `;

        cacheList.appendChild(listItem);
    }

    totalSizeDisplay.textContent = `Total Cache Size: ${formatSize(totalSize)}`;
}

// Function to remove a cached song
async function removeCachedSong(preview_url) {
    const cache = await caches.open("spookify-audio-v1");
    await cache.delete(preview_url);
    await removeMetadata(preview_url);
    loadCachedData();
}

// Function to clear all cached data
async function clearAllCachedData() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    await openDB();
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).clear();
    loadCachedData();
}

// Load cached data on page load
loadCachedData();

// Attach event listener to "Clear All" button
clearAllButton.addEventListener("click", clearAllCachedData);

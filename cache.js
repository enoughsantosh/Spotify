const cacheList = document.getElementById("cacheList");
const clearAllButton = document.getElementById("clearAll");
const totalSizeDisplay = document.getElementById("totalSize");

// Convert bytes to human-readable format (KB, MB)
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Function to list all cached items and calculate sizes
async function loadCachedData() {
    cacheList.innerHTML = ""; // Clear previous list
    totalSizeDisplay.textContent = "Total Cache Size: Calculating...";

    const cacheNames = await caches.keys(); // Get all cache storage names
    let totalSize = 0;

    if (cacheNames.length === 0) {
        cacheList.innerHTML = "<p>No cached data available.</p>";
        totalSizeDisplay.textContent = "Total Cache Size: 0 B";
        return;
    }

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const cachedRequests = await cache.keys();

        if (cachedRequests.length === 0) continue; // Skip empty caches

        // Show cache name as a heading
        const cacheTitle = document.createElement("h3");
        cacheTitle.textContent = `Cache: ${cacheName}`;
        cacheList.appendChild(cacheTitle);

        for (const request of cachedRequests) {
            const listItem = document.createElement("li");
            let fileName = request.url.split("/").pop().split("?")[0] || request.url;

            // Fetch the response size
            const response = await cache.match(request);
            const blob = await response.blob();
            const size = blob.size; // Get file size in bytes
            totalSize += size; // Add to total size

            listItem.textContent = `${decodeURIComponent(fileName)} - ${formatSize(size)}`;

            // Create "Remove" button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Remove";
            deleteButton.onclick = async () => {
                await cache.delete(request);
                loadCachedData(); // Refresh list
            };

            listItem.appendChild(deleteButton);
            cacheList.appendChild(listItem);
        }
    }

    totalSizeDisplay.textContent = `Total Cache Size: ${formatSize(totalSize)}`;
}

// Function to clear all cached data
async function clearAllCachedData() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    loadCachedData(); // Refresh list
}

// Load cached data on page load
loadCachedData();

// Attach event listener to "Clear All" button
clearAllButton.addEventListener("click", clearAllCachedData);

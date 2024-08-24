document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('lastError', function (data) {
        updateLastErrorDisplay(data.lastError);
    });
});

document.getElementById('appendUrl').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "appendUrl" });
});

document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

document.getElementById('dismissError').addEventListener('click', () => {
    chrome.storage.local.remove('lastError', function () {
        updateLastErrorDisplay(null);
    });
});

function updateLastErrorDisplay(error) {
    const errorContainer = document.getElementById('errorContainer');
    const lastErrorElement = document.getElementById('lastError');
    if (error) {
        lastErrorElement.textContent = "Error: " + error;
        errorContainer.style.display = 'block';
    } else {
        errorContainer.style.display = 'none';
    }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lastError) {
        updateLastErrorDisplay(changes.lastError.newValue);
    }
});
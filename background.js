// Default settings
const defaultSettings = {
    docId: "",
    debug: false,
    dateFormat: "YYYY-MM-DD HH:mm:ss"
};

// Load settings
function loadSettings(callback) {
    chrome.storage.sync.get(defaultSettings, (settings) => {
        callback(settings);
    });
}

// Save settings
function saveSettings(settings) {
    chrome.storage.sync.set(settings);
}

function storeLastError(error) {
    chrome.storage.local.set({ lastError: error });
}

function updateBadge(text, color) {
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: color });
}

function setBadgeStatus(isSuccess) {
    updateBadge(isSuccess ? "✓" : "!", isSuccess ? "#4CAF50" : "#F44336");

    // Clear the badge after 6 seconds
    setTimeout(() => {
        updateBadge("", "");
    }, 6000);

    if(isSuccess) {
        storeLastError("");
    }
}

// Show notification
function showErrorNotification(title, message) {
    storeLastError(message);
    chrome.notifications.create(
        {
            type: 'basic',
            iconUrl: 'icon128.png',
            title: title,
            message: message,
            priority: 2
        });
    setBadgeStatus(false);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "appendUrl") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            appendToDoc(activeTab.title, activeTab.url);
        });
    } else if (request.action === "updateSettings") {
        saveSettings(request.settings);
    }
});

function appendToDoc(title, url) {
    loadSettings((settings) => {
        const { docId, debug, dateFormat } = settings;

        if (!docId) {
            showErrorNotification('URL to Google Doc Appender', 'Please set a Google Doc ID in the extension options.');
            return;
        }

        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                if (debug) console.error(chrome.runtime.lastError);
                showErrorNotification('URL to Google Doc Appender', 'Error: Unable to authenticate. Please check your settings.');
                return;
            }

            const currentDate = formatDate(new Date(), dateFormat);
            const contentToAppend = `\n${currentDate}\n${title}\n${url}\n`;

            const endpoint = `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`;
            const requestBody = {
                requests: [{
                    insertText: {
                        endOfSegmentLocation: { segmentId: "" },
                        text: contentToAppend
                    }
                }]
            };

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    if (debug) {
                        console.log('Response status:', response.status);
                        console.log('Response headers:', response.headers);
                    }
                    return response.json();
                })
                .then(data => {
                    if (debug) {
                        console.log('Response data:', data);
                        console.log('URL appended successfully');
                    }
                    setBadgeStatus(true);
                })
                .catch(error => {
                    if (debug) console.error('Error:', error);
                    showErrorNotification('URL to Google Doc Appender', 'Error appending URL. Please check your settings and try again.');
                });
        });
    });
}

function formatDate(date, format) {
    const pad = (num) => (num < 10 ? '0' + num : num);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === "append_url") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            appendToDoc(activeTab.title, activeTab.url);
        });
    }
});

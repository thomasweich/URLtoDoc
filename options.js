document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['docId', 'debugMode'], function (data) {
        document.getElementById('docId').value = data.docId || '';
        document.getElementById('debugMode').checked = data.debugMode || false;
    });

    chrome.storage.local.get('lastError', function (data) {
        updateLastErrorDisplay(data.lastError);
    });

    chrome.commands.getAll((commands) => {
        const appendCommand = commands.find(command => command.name === "append-url");
        if (appendCommand && appendCommand.shortcut) {
            document.getElementById('currentShortcut').textContent = appendCommand.shortcut;
        } else {
            document.getElementById('currentShortcut').textContent = "Not set";
        }
    });
});

document.getElementById('saveSettings').addEventListener('click', () => {
    const docId = document.getElementById('docId').value;
    const debugMode = document.getElementById('debugMode').checked;
    chrome.storage.sync.set({ docId: docId, debugMode: debugMode }, () => {
        alert('Settings saved successfully!');
    });
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
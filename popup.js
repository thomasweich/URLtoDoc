document.getElementById('saveSettings').addEventListener('click', () => {
    const docId = document.getElementById('docId').value;
    chrome.storage.sync.set({ docId: docId }, () => {
        console.log('Settings saved');
    });
});

document.getElementById('appendUrl').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        chrome.runtime.sendMessage({ action: "appendUrl", url: url });
    });
});
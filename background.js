chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "appendUrl") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            appendToDoc(activeTab.title, activeTab.url);
        });
    }
});

function appendToDoc(title, url) {
    chrome.storage.sync.get('docId', (data) => {
        //const docId = data.docId;
        const docId = "12adx4CTCSg4Hv5EhxyaP9HeVWmaXt-hJl9yCC10lSak";
        if (!docId) {
            console.error('No Google Doc ID set');
            return;
        }

        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const contentToAppend = `${currentDate}\n${title}\n${url}\n\n`;

            const endpoint = `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`;
            const requestBody = {
                requests: [{
                    insertText: {
                        location: { index: 1 },
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
                    console.log('Response status:', response.status);
                    console.log('Response headers:', response.headers);
                    return response.json();
                })
                .then(data => {
                    console.log('Response data:', data);
                    console.log('URL appended successfully');
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    });
}

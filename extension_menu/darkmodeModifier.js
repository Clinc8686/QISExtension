const checkbox = document.getElementById('darkmodeEnabler');
let darkModeEnabled;

function changeStatus() {
    const darkmodeText = document.getElementById('checkboxText');
    if (checkbox.checked) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // If Chrome-API available
            chrome.storage.local.set({ darkModeEnabled: true }, () => {
                if (chrome.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:1.1');
            });
        } else if (typeof browser !== 'undefined' && browser.storage) {
            // If Firefox-API available
            browser.storage.local.set({ darkModeEnabled: true }).then(() => {
                if (browser.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:1.2');
            });
        } else {
            // If no API is available
            localStorage.setItem('darkModeEnabled', true);
        }

        if (darkmodeText.innerText.includes('disabled')) {
            darkmodeText.innerText = darkmodeText.innerText.replace('disabled', 'enabled');
        }
        checkbox.checked = true;
    } else {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // If Chrome-API available
            chrome.storage.local.set({ darkModeEnabled: false }, () => {
                if (chrome.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:2');
            });
        } else if (typeof browser !== 'undefined' && browser.storage) {
            // If Firefox-API available
            browser.storage.local.set({ darkModeEnabled: false }).then(() => {
                if (browser.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:1');
            });
        } else {
            // If no API is available
            localStorage.setItem('darkModeEnabled', false);
        }

        if (darkmodeText.innerText.includes('enabled')) {
            darkmodeText.innerText = darkmodeText.innerText.replace('enabled', 'disabled');
        }
        checkbox.checked = false;
    }
}

window.addEventListener('load', (event) => {
    getStorageValue();
    const checkbox = document.getElementById('darkmodeEnabler');
    checkbox.addEventListener('change', changeStatus);
});

function getStorageValue() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        // If Chrome-API available
        chrome.storage.local.get(["darkModeEnabled"]).then((result) => {
            if (result.darkModeEnabled === undefined) {
                window.darkModeEnabled = true;
            } else {
                window.darkModeEnabled = result.darkModeEnabled;
            }
            setStatus();
        });
    } else if (typeof browser !== 'undefined' && browser.storage) {
        // If Firefox-API available
        browser.storage.local.get(["darkModeEnabled"]).then((result) => {
            if (result.darkModeEnabled === undefined) {
                window.darkModeEnabled = true;
            } else {
                window.darkModeEnabled = result.darkModeEnabled;
            }
            setStatus();
        });
    } else {
        // If no API is available
        if (localStorage.getItem('darkModeEnabled') === null) {
            window.darkModeEnabled = true;
        } else {
            window.darkModeEnabled = JSON.parse(localStorage.getItem('darkModeEnabled'));
        }
        setStatus();
    }
}

function setStatus() {
    const QISModifierText = document.getElementById('QISModifierText');
    if (window.darkModeEnabled) {
        if (QISModifierText.innerText.includes('disabled')) {
            QISModifierText.innerText = QISModifierText.innerText.replace('disabled', 'enabled');
        }
        checkbox.checked = true;
    } else {
        if (QISModifierText.innerText.includes('enabled')) {
            QISModifierText.innerText = QISModifierText.innerText.replace('enabled', 'disabled');
        }
        checkbox.checked = false;
    }
}
const checkbox = document.getElementById('checkboxEnabler');
let isenabled;

function changeStatus() {
    const checkboxText = document.getElementById('checkboxText');
    if (checkbox.checked) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // If Chrome-API available
            chrome.storage.local.set({ isenabled: true }, () => {
                if (chrome.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:1.1');
            });
        } else if (typeof browser !== 'undefined' && browser.storage) {
            // If Firefox-API available
            browser.storage.local.set({ isenabled: true }).then(() => {
                if (browser.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:1.2');
            });
        } else {
            // If no API is available
            localStorage.setItem('isenabled', true);
        }

        if (checkboxText.innerText.includes('disabled')) {
            checkboxText.innerText = checkboxText.innerText.replace('disabled', 'enabled');
        }
        checkbox.checked = true;
    } else {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // If Chrome-API available
            chrome.storage.local.set({ isenabled: false }, () => {
                if (chrome.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:2');
            });
        } else if (typeof browser !== 'undefined' && browser.storage) {
            // If Firefox-API available
            browser.storage.local.set({ isenabled: false }).then(() => {
                if (browser.runtime.lastError)
                    console.log('Error QIS Helper - isenable storage menu:1');
            });
        } else {
            // If no API is available
            localStorage.setItem('isenabled', false);
        }

        if (checkboxText.innerText.includes('enabled')) {
            checkboxText.innerText = checkboxText.innerText.replace('enabled', 'disabled');
        }
        checkbox.checked = false;
    }
}

window.addEventListener('load', (event) => {
   getStorageValue();
   const checkbox = document.getElementById('checkboxEnabler');
   checkbox.addEventListener('change', changeStatus);
});

function getStorageValue() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        // If Chrome-API available
        chrome.storage.local.get(["isenabled"]).then((result) => {
            if (result.isenabled === undefined) {
                window.isenabled = true;
            } else {
                window.isenabled = result.isenabled;
            }
            setStatus();
        });
    } else if (typeof browser !== 'undefined' && browser.storage) {
        // If Firefox-API available
        browser.storage.local.get(["isenabled"]).then((result) => {
            if (result.isenabled === undefined) {
                window.isenabled = true;
            } else {
                window.isenabled = result.isenabled;
            }
            setStatus();
        });
    } else {
        // If no API is available
        if (localStorage.getItem('isenabled') === null) {
            window.isenabled = true;
        } else {
            window.isenabled = JSON.parse(localStorage.getItem('isenabled'));
        }
        setStatus();
    }
}

function setStatus() {
    const checkboxText = document.getElementById('checkboxText');
    if (window.isenabled) {
        if (checkboxText.innerText.includes('disabled')) {
            checkboxText.innerText = checkboxText.innerText.replace('disabled', 'enabled');
        }
        checkbox.checked = true;
    } else {
        if (checkboxText.innerText.includes('enabled')) {
            checkboxText.innerText = checkboxText.innerText.replace('enabled', 'disabled');
        }
        checkbox.checked = false;
    }
}

const checkbox = document.getElementById('checkboxEnabler');
let isenabled;

function changeStatus() {
    const checkboxText = document.getElementById('checkboxText');
    if (checkbox.checked) {
        chrome.storage.local.set({ isenabled: true }, () => {
            if (chrome.runtime.lastError)
                console.log('Error QIS Helper - isenable storage menu:1');
        });

        if (checkboxText.innerText.includes('disabled')) {
            checkboxText.innerText = checkboxText.innerText.replace('disabled', 'enabled');
        }
        checkbox.checked = true;
    } else {
        chrome.storage.local.set({ isenabled: false }, () => {
            if (chrome.runtime.lastError)
                console.log('Error QIS Helper - isenable storage menu:2');
        });

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
    chrome.storage.local.get(["isenabled"]).then((result) => {
        if (result.isenabled === undefined) {
            window.isenabled = true;
        } else {
            window.isenabled = result.isenabled;
        }
        setStatus();
    });
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

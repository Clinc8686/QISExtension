const checkbox = document.getElementById('checkboxEnabler');
let isenabled;

function changeStatus() {
    const checkboxText = document.getElementById('checkboxText');
    if (checkbox.checked) {
        chrome.storage.local.set({ isenabled: true }, () => {
            if (chrome.runtime.lastError)
                console.log('Error setting');
        });

        if (checkboxText.innerText.includes('disabled')) {
            checkboxText.innerText = checkboxText.innerText.replace('disabled', 'enabled');
        }
        checkbox.checked = true;
    } else {
        chrome.storage.local.set({ isenabled: false }, () => {
            if (chrome.runtime.lastError)
                console.log('Error setting');
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
        console.log("Value currently is " + result.isenabled);  //true
        window.isenabled = result.isenabled;
        setStatus();
    });
}

function setStatus() {
    console.log('isenabled: ' + window.isenabled);
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

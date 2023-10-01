const linkColor = '#72B6CC';
const normalTextColor = '#A79E8B';
const backgroundColor = '#101417'
const headingTextColor = '#F78E66'
const borderColor = '#72B6CC';

function getStorageData() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        // If Chrome-API available
        chrome.storage.local.get(['darkModeEnabled']).then((result) => {
            if (result.darkModeEnabled === undefined) {
                window.darkModeEnabled = true;
                chrome.storage.local.set({ darkModeEnabled: true }, () => {
                    if (chrome.runtime.lastError)
                        console.log('Error QIS Helper - isenable storage content');
                });
            } else {
                window.darkModeEnabled = result.darkModeEnabled;
            }
            startDarkmode();
        });
    } else if (typeof browser !== 'undefined' && browser.storage) {
        // If Firefox-API available
        browser.storage.local.get('darkModeEnabled').then((result) => {
            if (result.darkModeEnabled === undefined) {
                window.darkModeEnabled = true;
                browser.storage.local.set({ darkModeEnabled: true }).then(() => {
                    if (browser.runtime.lastError)
                        console.log('Error QIS Helper - isenable storage content');
                });
            } else {
                window.darkModeEnabled = result.darkModeEnabled;
            }
            startDarkmode();
        });
    } else {
        // If no API is available
        if (!localStorage.getItem('darkModeEnabled')) {
            window.darkModeEnabled = true;
            localStorage.setItem('darkModeEnabled', true);
        } else {
            window.darkModeEnabled = JSON.parse(localStorage.getItem('darkModeEnabled'));
        }
        startDarkmode();
    }
}

function changeLinkColor() {
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
        link.style.color = linkColor;
    });

    const underlines = document.querySelectorAll("a u");
    underlines.forEach((underline) => {
        underline.style.color = linkColor;
        underline.style.backgroundColor = backgroundColor;
    });
}

function changeNormalTextColor() {
    const allTextElements = document.querySelectorAll(':not(a):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)');
    allTextElements.forEach((element) => {
        element.style.color = normalTextColor;
    });
}

function changeHeadingTextColor() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
        heading.style.color = headingTextColor;
    });
}

function changeBorderColor() {
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element) => {
        element.style.borderColor = borderColor;
        element.style.backgroundColor = backgroundColor;
    });
}

function changeBackgroundColor() {
    document.documentElement.style.backgroundColor = backgroundColor;
    document.body.style.backgroundColor = backgroundColor;
}

function changeImageColor() {
    const img = document.getElementsByClassName("logoHeight")[0];
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const hexCode = headingTextColor;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] === 0 && pixels[i + 1] === 0 && pixels[i + 2] === 0) {
            pixels[i] = parseInt(hexCode.slice(1, 3), 16);
            pixels[i + 1] = parseInt(hexCode.slice(3, 5), 16);
            pixels[i + 2] = parseInt(hexCode.slice(5, 7), 16);
        }
    }

    ctx.putImageData(imageData, 0, 0);

    img.src = canvas.toDataURL();
}

function startDarkmode() {
    if (window.darkModeEnabled) {
        changeImageColor();
        changeBackgroundColor();
        changeNormalTextColor();
        changeHeadingTextColor();
        changeBorderColor();
        changeLinkColor();
    }
}

window.onload = function () {
    getStorageData();
}

const observer = new MutationObserver((mutationsList, observer) => {
    startDarkmode();
});
observer.observe(document.body, { childList: true, subtree: true });
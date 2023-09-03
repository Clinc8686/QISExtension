const abstand_pruefinfo = document.getElementsByClassName('abstand_pruefinfo')[0];
const h1 = document.getElementsByTagName('h1')[0];
const alignLefts = document.getElementsByClassName('ns_tabelle1_alignleft');
const qis_konto = document.getElementsByClassName('qis_konto');
let semester = new Set();
let calculatedSumECTS = 0;
let sumGrades = 0;
let isenabled;
let deviatingECTS;
let userLanguage = 0;
let gradeValues;
getStorageData();

function defineLanguage() {
    if (document.documentElement.lang === "de") {
        userLanguage = 0;
    } else {
        userLanguage = 1;
    }
}

function start() {
    // Checks if checkbox from menu is enabled and if it is the right page
    if (window.isenabled && abstand_pruefinfo && (h1.textContent.trim() === 'Notenspiegel' || h1.textContent.trim() === 'Exams Extract')) {
        defineLanguage();
        getAllSemesters();
        changeHeader();
        printAverageGrade();
        addDownloadButton();
    }
}

// Search for isenabled object in local storage of the browser and starts extension
function getStorageData() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        // If Chrome-API available
        chrome.storage.local.get(['isenabled']).then((result) => {
            if (result.isenabled === undefined) {
                window.isenabled = true;
                chrome.storage.local.set({ isenabled: true }, () => {
                    if (chrome.runtime.lastError)
                        console.log('Error QIS Helper - isenable storage content');
                });
            } else {
                window.isenabled = result.isenabled;
            }
            start();
        });
    } else if (typeof browser !== 'undefined' && browser.storage) {
        // If Firefox-API available
        browser.storage.local.get('isenabled').then((result) => {
            if (result.isenabled === undefined) {
                window.isenabled = true;
                browser.storage.local.set({ isenabled: true }).then(() => {
                    if (browser.runtime.lastError)
                        console.log('Error QIS Helper - isenable storage content');
                });
            } else {
                window.isenabled = result.isenabled;
            }
            start();
        });
    } else {
        // If no API is available
        if (!localStorage.getItem('isenabled')) {
            window.isenabled = true;
            localStorage.setItem('isenabled', true);
        } else {
            window.isenabled = JSON.parse(localStorage.getItem('isenabled'));
        }
        start();
    }
}

function addDownloadButton() {
    const menu = document.getElementsByClassName('menue')[0];
    const excelText = ['Noten als Excel-Datei herunterladen', 'Download grades as Excel file'];

    //Get attributes from element above
    let nodes=[], values=[];
    for (const att of menu.firstElementChild.attributes) {
        nodes.push(att.nodeName);
        values.push(att.nodeValue);
    }

    //Set attributes on new element
    const menueListStyleDownloadButton = document.createElement('li');
    for (let i = 0; i < nodes.length; i++) {
        menueListStyleDownloadButton.setAttribute(nodes[i], values[i]);
    }

    const downloadLinkExcel = document.createElement('a');
    downloadLinkExcel.id = 'downloadButtonExcel';
    downloadLinkExcel.className = 'auflistung';
    downloadLinkExcel.textContent = excelText[userLanguage];
    downloadLinkExcel.style.fontWeight = 'bold';
    downloadLinkExcel.addEventListener('click', startDownload);

    menueListStyleDownloadButton.appendChild(downloadLinkExcel);
    menu.appendChild(menueListStyleDownloadButton);
}

function startDownload() {
    const filename = 'grades.csv';
    let text = 'Module;Note/Grades;ECTS;\n';
    let row = 1

    for (let i = 0; i < qis_konto.length; i++) {
        if (qis_konto[i].textContent.trim() === 'BE' && qis_konto[i-1].textContent.trim()) {
            const modulname = qis_konto[i-2].textContent.replace(/Modul:/g, '').replace(/Module:/g, '').trim();
            const grade = qis_konto[i-1].textContent.trim();
            const ects = qis_konto[i+1].textContent.trim();
            text += modulname + ';' + grade + ';' + ects + ';\n';
            row++;
        }
    }

    text += '\n\n' + 'Aktueller Notendurchschnitt:;' + ';=SUMMENPRODUKT(B2:B'+row+'\;C2:C'+row+')/SUMME(C2:C'+row+')';

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Select all semesters once
function getAllSemesters() {
    if (alignLefts.length > 0) {
        for (const alignLeft of alignLefts) {
            if (alignLeft.textContent.includes('SoSe') || alignLeft.textContent.includes('Summer term')) {
                semester.add(alignLeft.textContent.trim());
            } else if (alignLeft.textContent.includes('WiSe') || alignLeft.textContent.includes('Winter term')) {
                semester.add(alignLeft.textContent.trim());
            }
        }

        // Sort semesters
        semester = Array.from(semester).sort((a,b) => {
            const a1 = a.substr(5,2);
            const b1 = b.substr(5,2);
            if (a1 === b1)
                return 0;
            return a1 > b1 ? 1 : -1;
        });
    }
}

// Change semester header to selector field
function changeSemesterHeader(tableHeader) {
    const height = tableHeader.clientHeight;
    let nodes=[], values=[];
    for (const att of tableHeader.attributes) {
        nodes.push(att.nodeName);
        values.push(att.nodeValue);
    }

    const tableCell = document.createElement('th');
    for (let i = 0; i < nodes.length; i++) {
        tableCell.setAttribute(nodes[i], values[i]);
    }

    // Create select element
    const selectList = document.createElement('select');
    selectList.addEventListener('change', changeSemester);
    selectList.style.textDecoration = 'none';
    selectList.style.backgroundColor = '#1c2e44';
    selectList.style.color =  '#fff';
    selectList.id = 'semester';
    tableCell.appendChild(selectList);

    // Add Semester as first Element
    const top = document.createElement('option');
    const navbarText = ['Semester','Term'];
    top.text = navbarText[userLanguage];
    top.value = 'all';
    selectList.appendChild(top);

    // Add semesters
    // noinspection JSAssignmentUsedAsCondition
    for (let it = semester.values(), val = null; val = it.next().value;) {
        const opt = document.createElement('option');
        opt.text = val;
        opt.value = val;
        selectList.appendChild(opt);
    }
    tableHeader.parentNode.replaceChild(tableCell, tableHeader);
}

// Show only modules which contains letters of the searchstring
let noModules = false;
function changeExam() {
    const searchString = document.getElementById('searchBar').value;

    let displayValue = '';
    if (searchString !== '') {
        displayValue = 'none';
    }

    // Hide wrong modules and show correct modules
    let hideCounter = 0;
    if (alignLefts.length > 0) {
        for (let i = alignLefts.length-1; i >= 0; i--) {
            const alignLeft = alignLefts[i];
            if (alignLeft.textContent.trim().toLowerCase().includes(searchString.toLowerCase())) {
                alignLeft.parentElement.style.display = '';
                i = i - 2;
            } else {
                alignLeft.parentElement.style.display = displayValue;
                hideCounter++;
            }
        }

        for (let i = qis_konto.length-4; i >= 0; i--) {
            qis_konto[i].parentElement.style.display = displayValue;
            i = i - 8;
        }
    }

    // Prints hint if no modules found
    let latestRow = alignLefts[alignLefts.length-1].parentNode;
    if (hideCounter === alignLefts.length && noModules === false) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.id = 'noModules';
        td.setAttribute('valign', 'top');
        td.textContent = 'Es wurden keine Module gefunden!';
        td.setAttribute('colspan', '10');
        td.setAttribute('align', 'left');
        tr.appendChild(td);
        insertAfter(latestRow, tr);
        noModules = true;
    } else if (hideCounter !== alignLefts.length && noModules === true) {
        const nm = document.getElementById('noModules');
        if (nm)
            nm.remove();
        noModules = false;
    }
}

function changeExamName(tableHeader) {
    const height = tableHeader.clientHeight;
    let nodes=[], values=[];
    for (const att of tableHeader.attributes) {
        nodes.push(att.nodeName);
        values.push(att.nodeValue);
    }

    // Create input field
    const tableCell = document.createElement('th');
    for (let i = 0; i < nodes.length; i++) {
        tableCell.setAttribute(nodes[i], values[i]);
    }

    const inputField = document.createElement('input');
    const placeholder = ['Suche...', 'Search...'];
    inputField.addEventListener('input', changeExam);
    inputField.style.textDecoration = 'none';
    inputField.style.backgroundColor = '#1c2e44';
    inputField.id = 'searchBar';
    inputField.placeholder = placeholder[userLanguage];
    inputField.type = 'text';
    inputField.style.color = '#fff';

    tableCell.appendChild(inputField);
    tableHeader.parentNode.replaceChild(tableCell, tableHeader);
}

// Search for headers
function changeHeader() {
    // Get all attributes from old header
    const tableHeaders = document.getElementsByClassName('tabelleheader');
    for (let i = tableHeaders.length-1; i >= 0; i--) {
        if (tableHeaders[i].textContent.includes('Semester') || tableHeaders[i].textContent.includes('Term')) {
            changeSemesterHeader(tableHeaders[i]);
        } else if (tableHeaders[i].textContent.includes('Prüfungstext') || tableHeaders[i].textContent.includes('Name of Exam')) {
            changeExamName(tableHeaders[i]);
        }
    }
}

// Hide all semesters with different years and show correct semesters
function changeSemester() {
    const semester = document.getElementById('semester');
    const selectedSemester = semester.options[semester.selectedIndex].text;

    let displayValue = 'none';
    if (selectedSemester === 'Semester' || selectedSemester === 'Term') {
        displayValue = '';
    } else {
        displayValue = 'none';
    }

    if (alignLefts.length > 0) {
        for (let i = alignLefts.length-1; i >= 0; i--) {
            const alignLeft = alignLefts[i];
            if (alignLeft.textContent.includes(selectedSemester)) {
                alignLeft.parentElement.style.display = '';
                i = i - 2;
            } else {
                alignLeft.parentElement.style.display = displayValue;
                i = i - 2;
            }
        }

        for (let i = qis_konto.length-4; i >= 0; i--) {
            qis_konto[i].parentElement.style.display = displayValue;
            i = i - 8;
        }
    }
}

function checkElectiveModules(electiveModules, targetValue, otherModules) {
    let sum = otherModules.reduce((acc, val) => acc + val[2], 0);
    const diff = targetValue - sum;

    electiveModules.sort(function (a,b) {
        return a[1] - b[1];
    }).reverse();

    let x = 0;
    while (sum > diff && x < 10) {
        electiveModules.shift();
        sum = electiveModules.reduce((acc, curr) => acc + curr[2], 0);
        x++;
    }
    return electiveModules;
}

// Search all grades an ects and calculate average, best, worst
function calculateAverageGrade() {
    let requiredECTS;
    let QISSumECTS;
    const degrees = document.getElementsByClassName('qis_kontoOnTop');
    for (const degree of degrees) {
        const text = degree.textContent.trim();
        if (text === 'Master') {
            requiredECTS = 120.0;
        } else if (text === 'Bachelor') {
            requiredECTS = 180.0;
        } else if (parseInt(text)) {
            QISSumECTS = parseFloat(text.replace(/,/g, '.').trim());
        }
    }

    let isEM = false;
    let electiveModules = [];
    let otherModules = [];
    for (let i = 1; i < qis_konto.length; i++) {
        if (qis_konto[i].textContent.trim() === 'Wahlpflichtmodule') {
            isEM = true;
        } else if (qis_konto[i].textContent.trim() === 'Pflichtmodule' || qis_konto[i].textContent.trim() === 'Kernmodule' || qis_konto[i].textContent.trim() ===  'Praxisprojekte') {
            isEM = false;
        }

        if (qis_konto[i].textContent.trim() === 'BE' && qis_konto[i-1].textContent.trim() && (qis_konto[i-2].textContent.trim() !== 'Pflichtmodule' && qis_konto[i-2].textContent.trim() !== 'Kernmodule' && qis_konto[i-2].textContent.trim() !== 'Praxisprojekt')) {
            calculatedSumECTS += parseFloat(qis_konto[i+1].textContent.replace(/,/g, '.').trim());
            const modulname = qis_konto[i-2].textContent.replace(/Modul:/g, '').replace(/Module:/g, '').trim();
            const grade = parseFloat(qis_konto[i-1].textContent.replace(/,/g, '.').trim());
            const ects = parseFloat(qis_konto[i+1].textContent);
            sumGrades += (grade * ects);

            if (isEM) {
                electiveModules.push([modulname, grade, ects]);
            } else {
                otherModules.push([modulname, grade, ects])
            }
        }
    }

    if (calculatedSumECTS > QISSumECTS) {
        deviatingECTS = true;
        electiveModules = checkElectiveModules(electiveModules, QISSumECTS, otherModules);
        const allModules = electiveModules.concat(otherModules);
        sumGrades = 0;
        calculatedSumECTS = 0;
        for (const module of allModules) {
            sumGrades += (module[1] * module[2]);
            calculatedSumECTS += module[2];
        }
    } else {
        deviatingECTS = false;
    }

    let avgGrade = roundToTwo(sumGrades/calculatedSumECTS);
    const missingECTS = requiredECTS - calculatedSumECTS;
    let worstGrade = ((missingECTS * 4.0) + sumGrades) / requiredECTS;
    worstGrade = roundToTwo(worstGrade);
    let bestGrade = ((missingECTS * 1.0) + sumGrades) / requiredECTS;
    bestGrade = roundToTwo(bestGrade);
    gradeValues = [[avgGrade, bestGrade, worstGrade], ['', '', '']];
}

// Prints the average, best and worst grade
function printAverageGrade() {
    calculateAverageGrade();
    const tableValues = [
        ['Aktueller Notendurchschnitt: ' + gradeValues[0][0], 'Current grade point average: ' + gradeValues[0][0]],
        ['Bester erreichbarer Notendurchschnitt: ' + gradeValues[0][1], 'Best possible grade point average: ' + gradeValues[0][1]],
        ['Schlechtester erreichbarer Notendurchschnitt: ' + gradeValues[0][2], 'Worst possible grade point average: ' + gradeValues[0][2]],
        ['Aktueller Notendurchschnitt liegt möglicherweise zwischen ' + gradeValues[0][0] + ' und ' + gradeValues[0][1], 'The current grade point average may be between ' + gradeValues[0][0] + ' and ' + gradeValues[0][1]],
        ['Bester erreichbarer Notendurchschnitt liegt möglicherweise zwischen ' + gradeValues[0][1] + ' und ' + gradeValues[1][1], 'The best attainable grade point average may be between ' + gradeValues[0][1] + ' and ' + gradeValues[1][1]],
        ['Schlechtester erreichbarer Notendurchschnitt liegt möglicherweise zwischen ' + gradeValues[0][2] + ' und ' + gradeValues[1][2], 'The worst attainable grade point average may be between ' + gradeValues[0][2] + ' and ' + gradeValues[1][2]],
        ['Unterschiedliche ECTS Berechnung: Der Notendurchschnitt konnte nicht genau berechnet werden und ist möglicherweise abweichend.', 'Different ECTS calculation: The grade point average could not be calculated precisely and may be different.']
    ];
    let latestRow = alignLefts[alignLefts.length-1].parentNode;
    let startTableValue = 0;
    let endTableValue = 3;

    if (deviatingECTS) {
        latestRow = createFooter(latestRow, tableValues[tableValues.length-1][userLanguage]);
    }

    for (let i = startTableValue; i < endTableValue; i++) {
        latestRow = createFooter(latestRow, tableValues[i][userLanguage]);
    }
}

// Function to create footer in table
function createFooter(latestRow, text) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.className = 'qis_konto';
    td.setAttribute('valign', 'top');
    td.textContent = text;
    td.style.fontWeight = 'bold';
    td.setAttribute('colspan', '10');
    td.setAttribute('align', 'left');
    tr.appendChild(td);
    insertAfter(latestRow, tr);
    return tr;
}

// Function to insert a Node after a other Node
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Round to two decimal places
function roundToTwo(num) {
    return +(Math.round(num + 'e+2')  + 'e-2');
}

const abstand_pruefinfo = document.getElementsByClassName('abstand_pruefinfo')[0];
const h1 = document.getElementsByTagName('h1')[0];
const alignLefts = document.getElementsByClassName('ns_tabelle1_alignleft');
const qis_konto = document.getElementsByClassName('qis_konto');
let semester = new Set();
let avgGrade = 0;
let sumECTS = 0;
let sumGrades = 0;
let worstGrade = 0;
let bestGrade = 0;
let isenabled;

// Search for isenabled object in local storage of the browser and starts extension
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

function addDownloadButton() {
    const menu = document.getElementsByClassName('menue')[0];

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
    downloadLinkExcel.textContent = 'Noten als Excel-Datei herunterladen / Download grades as Excel file';
    downloadLinkExcel.style.fontWeight = 'bold';
    downloadLinkExcel.addEventListener('click', startDownload);

    menueListStyleDownloadButton.appendChild(downloadLinkExcel);
    menu.appendChild(menueListStyleDownloadButton);
}

function startDownload() {
    const filename = 'grades.csv';
    let text = 'Module;Note/Grades;ECTS;\n';

    for (let i = 0; i < qis_konto.length; i++) {
        if (qis_konto[i].textContent.trim() === 'BE') {
            const modulname = qis_konto[i-2].textContent.replace(/Modul:/g, '').replace(/Module:/g, '').trim();
            const grade = qis_konto[i-1].textContent.trim();
            const ects = qis_konto[i+1].textContent.trim();
            text += modulname + ';' + grade + ';' + ects + ';\n';
        }
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function start() {
    // Checks if checkbox from menu is enabled and if it is the right page
    if (window.isenabled && abstand_pruefinfo && (h1.textContent.trim() === 'Notenspiegel' || h1.textContent.trim() === 'Exams Extract')) {
        getAllSemesters();
        changeHeader();
        printAverageGrade();
        addDownloadButton();
    }
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
    top.text = 'Semester/Term';
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
    inputField.addEventListener('input', changeExam);
    inputField.style.textDecoration = 'none';
    inputField.style.backgroundColor = '#1c2e44';
    inputField.id = 'searchBar';
    inputField.placeholder = 'Search...';
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
    let displayValue = '';
    if (selectedSemester !== 'Semester/Term') {
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

// Search all grades an ects and calculate average, best, worst
function calculateAverageGrade() {
    for (let i = 0; i < qis_konto.length; i++) {
        if (qis_konto[i].textContent.trim() === 'BE') {
            const grade = qis_konto[i-1].textContent.replace(/,/g, '.');
            const ects = parseFloat(qis_konto[i+1].textContent);
            sumECTS += parseFloat(ects);
            sumGrades += (grade * ects);
        }
    }
    avgGrade = sumGrades/sumECTS;
    const requiredECTS = 180.0;
    const missingECTS = requiredECTS - sumECTS;
    worstGrade = ((missingECTS * 4.0) + sumGrades) / requiredECTS;
    worstGrade = roundToTwo(worstGrade);
    bestGrade = ((missingECTS * 1.0) + sumGrades) / requiredECTS;
    bestGrade = roundToTwo(bestGrade);
}

// Prints the average, best and worst grade
function printAverageGrade() {
    calculateAverageGrade();
    const tableValues = ['Aktueller Notendurchschnitt / Current grade average: ' + roundToTwo(avgGrade), 'Bester erreichbarer Notendurchschnitt / Best achievable grade average: ' + bestGrade, 'Schlechtester erreichbarer Notendurchschnitt / Worst achievable grade average: ' + worstGrade];
    let latestRow = alignLefts[alignLefts.length-1].parentNode;

    for (let i = 0; i < 3; i++) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.className = 'qis_konto';
        td.setAttribute('valign', 'top');
        td.textContent = tableValues[i];
        td.style.fontWeight = 'bold';
        td.setAttribute('colspan', '10');
        td.setAttribute('align', 'left');
        tr.appendChild(td);
        insertAfter(latestRow, tr);
        latestRow = tr;
    }
}

// Function to insert a Node after a other Node
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Round to two decimal places
function roundToTwo(num) {
    return +(Math.round(num + 'e+2')  + 'e-2');
}

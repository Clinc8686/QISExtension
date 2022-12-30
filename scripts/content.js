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

chrome.storage.local.get(["isenabled"]).then((result) => {
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

function start() {
    // Checks if checkbox from menu is enabled and if it is the right page
    if (window.isenabled && abstand_pruefinfo && h1.textContent.trim() === 'Notenspiegel') {
        getAllSemesters();
        changeHeader();
        printAverageGrade();
    }
}

// Select all semesters once
function getAllSemesters() {
    if (alignLefts.length > 0) {
        for (const alignLeft of alignLefts) {
            if (alignLeft.textContent.includes('SoSe')) {
                semester.add(alignLeft.textContent.trim());
            } else if (alignLeft.textContent.includes('WiSe')) {
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

// Add selector with all semester in header
function changeHeader() {
    // Get all attributes from old header
    const tableHeaders = document.getElementsByClassName('tabelleheader');
    for (const tableHeader of tableHeaders) {
        if (tableHeader.textContent.includes('Semester')) {
            const height = tableHeader.clientHeight;
            let nodes=[], values=[];
            for (const att of tableHeader.attributes) {
                nodes.push(att.nodeName);
                values.push(att.nodeValue);
            }

            // Create select element
            const selectList = document.createElement('select');
            selectList.addEventListener('change', changeSemester);
            selectList.style.textDecoration = 'none';
            selectList.style.backgroundColor = '#5381BE';
            //selectList.style.height = height+'px';
            selectList.style.minHeight = '44px';
            selectList.style.width = '100%';
            selectList.id = 'semester';
            selectList.after.style

            // Add Semester as first Element
            const top = document.createElement('option');
            top.text = 'Semester';
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
            for (let i = 0; i < nodes.length; i++) {
                selectList.setAttribute(nodes[i], values[i]);
            }
            tableHeader.parentNode.replaceChild(selectList,tableHeader)
        }
    }
}

// Hide all semesters with different years and show correct semesters
function changeSemester() {
    const semester = document.getElementById('semester');
    const selectedSemester = semester.options[semester.selectedIndex].text;
    let displayValue = '';
    if (selectedSemester !== 'Semester') {
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

/*
Funktionsweise kopiert, falls man nur die Noten bzw blauen hervorgehobenen Einzeiler sehen möchte
function changeSemester() {
    const semester = document.getElementById('semester');
    const selectedSemester = semester.options[semester.selectedIndex].text;

    const alignLefts = document.getElementsByClassName('ns_tabelle1_alignleft');
    if (alignLefts.length > 0) {
        //for (const alignLeft of alignLefts) {
        for (let i = alignLefts.length-1; i >= 0; i--) {
            const alignLeft = alignLefts[i];
            if (alignLeft.textContent.includes(selectedSemester)) {

            } else {
                alignLeft.parentElement.remove();
                i = i - 2;
            }
        }
    }
}
 */

// Search all grades an ects and calculate average, best, worst
function calculateAverageGrade() {
    for (let i = 0; i < qis_konto.length; i++) {
        if (qis_konto[i].textContent.trim() === 'BE') {
            const grade = qis_konto[i-1].textContent.replace(/,/g, '.');
            const ects = parseFloat(qis_konto[i+1].textContent.replace(/,/g, '.'));
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
    const tableValues = ['Aktueller Notendurchschnitt: ' + roundToTwo(avgGrade), 'Bester erreichbarer Notendurchschnitt: ' + bestGrade, 'Schlechtester erreichbarer Notendurchschnitt: ' + worstGrade];
    let latestRow = alignLefts[alignLefts.length-1].parentNode;

    for (let i = 0; i < 3; i++) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.className = 'qis_konto';
        td.setAttribute('valign', 'top');
        td.textContent = tableValues[i];
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
    return +(Math.round(num + "e+2")  + "e-2");
}

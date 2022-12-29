const abstand_pruefinfo = document.getElementsByClassName('abstand_pruefinfo')[0];
const semester = new Set();
let oldtbody;

if (abstand_pruefinfo) {
    saveData();
    getAllSemesters();
    changeHeader();
}

function saveData() {
    oldtbody = document.getElementsByTagName('tbody')[1];
}

function getAllSemesters() {
    const alignLefts = document.getElementsByClassName('ns_tabelle1_alignleft');
    if (alignLefts.length > 0) {
        for (const alignLeft of alignLefts) {
            if (alignLeft.textContent.includes('SoSe')) {
                semester.add(alignLeft.textContent);
            } else if (alignLeft.textContent.includes('WiSe')) {
                semester.add(alignLeft.textContent);
            }
        }
    }
}

function changeHeader() {
    const tableHeaders = document.getElementsByClassName('tabelleheader');
    for (const tableHeader of tableHeaders) {
        if (tableHeader.textContent.includes('Semester')) {
            const height = tableHeader.clientHeight;
            let nodes=[], values=[];
            for (const att of tableHeader.attributes) {
                nodes.push(att.nodeName);
                values.push(att.nodeValue);
            }

            const selectList = document.createElement('select');
            selectList.addEventListener('change', changeSemester);
            selectList.style.textDecoration = 'none';
            selectList.style.backgroundColor = '#5381BE';
            selectList.style.height = height+'px';
            selectList.id = 'semester';

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

function changeSemester() {
    restoreOldTable();

    const semester = document.getElementById('semester');
    const selectedSemester = semester.options[semester.selectedIndex].text;
    let displayValue = '';
    if (selectedSemester !== 'Semester') {
        displayValue = 'none';
    }

    const alignLefts = document.getElementsByClassName('ns_tabelle1_alignleft');
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
    }
}

/*
FUnktionsweise kopiert, falls man nur die Noten bzw blauen hervorgehobenen Einzeiler sehen möchte
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

function restoreOldTable() {
    const actualtbody = document.getElementsByTagName('tbody')[1];
    actualtbody.parentNode.replaceChild(oldtbody, actualtbody);
}
function handleEnterKey(event) {
    if (event.key === "Enter") {
        document.querySelector(".button").click();
    }
}

document.getElementById('name1').addEventListener('keypress', handleEnterKey);
document.getElementById('name2').addEventListener('keypress', handleEnterKey);

function calculateCompatibility() {
    const name1 = document.getElementById('name1').value.trim().toLowerCase();
    const name2 = document.getElementById('name2').value.trim().toLowerCase();
    const warningMessage = document.getElementById('warning-message');

    if (!name1 || !name2) {
        warningMessage.textContent = 'Enter two names, dummy!';
        return;
    } else {
        warningMessage.textContent = '';
    }

    const combinedNames = name1 + name2;
    const counts = {
        L: (combinedNames.match(/l/g) || []).length,
        O: (combinedNames.match(/o/g) || []).length,
        V: (combinedNames.match(/v/g) || []).length,
        E: (combinedNames.match(/e/g) || []).length,
        S: (combinedNames.match(/s/g) || []).length
    };

    const values = [
        counts.L,
        counts.O,
        counts.V,
        counts.E,
        counts.S
    ];

    let working = values;
    let steps = [];

    while (working.length > 2) {
        const nextStep = [];
        for (let i = 0; i < working.length - 1; i++) {
            const sum = working[i] + working[i + 1];
            const digits = String(sum).split('').map(Number);
            nextStep.push(...digits);
        }
        steps.push(working);
        working = nextStep;
    }

    steps.push(working);

    const compatibility = parseInt(working.join(''), 10);
    document.getElementById('result').textContent = `Compatibility: ${compatibility}%`;

    const workingOut = generateWorkingOut(values, steps);
    document.getElementById('details').innerHTML = workingOut;
    document.getElementById('expandable-section').style.display = 'block';
}


function generateWorkingOut(values, steps) {
    let treeHTML = '<div class="working-out">';

    treeHTML += '<div class="tree-row">L O V E S</div>';

    if (steps.length > 0) {
        treeHTML += `<div class="tree-row">${steps[0].join(' ')}</div>`;
    }

    for (let i = 1; i < steps.length; i++) {
        treeHTML += '<div class="tree-line"></div>';
        treeHTML += `<div class="tree-row">${steps[i].join(' ')}</div>`;
    }

    treeHTML += '</div>';
    return treeHTML;
}

function toggleDetails() {
    const detailsDiv = document.getElementById('details');
    const showDetailsSpan = document.querySelector('.show-details');

    const isHidden = detailsDiv.style.display === 'none' || !detailsDiv.style.display;
    detailsDiv.style.display = isHidden ? 'block' : 'none';

    showDetailsSpan.textContent = isHidden ? 'Hide working out' : 'Show working out';

    document.body.style.overflowY = isHidden ? 'auto' : 'hidden';
}
// Assuming you have a select element with id 'effectSelect' and a div with id 'formContainer'

let tunaParams = {};

// Load JSON and populate dropdown
fetch('tunaParams.JSON')
    .then(response => response.json())
    .then(data => {
        tunaParams = data;
        const select = document.getElementById('effectSelect');
        for (const effect in data) {
            let option = document.createElement('option');
            option.value = effect;
            option.textContent = effect;
            select.appendChild(option);
        }
    });

// Function to create form based on effect
function createEffectForm(effectName, effectParams) {
    console.log("createEffectForm", effectName, effectParams)
    const container = document.getElementById('formContainer');
    container.innerHTML = ''; // Clear previous form
    const form = document.createElement('form');
    form.id = effectName + 'Form';

    for (const param in effectParams) {
        const inputDiv = document.createElement('div');

    // Create label
    const label = document.createElement('label');
    label.htmlFor = effectName + '_' + param;
    label.textContent = param + ': ';
    inputDiv.appendChild(label);

    // Determine input type and create input element
    let input;
    //if the param has a true or false as the default, create a checkbox
    if (effectParams[param]['default'] === true || effectParams[param]['default'] === false) {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = effectParams[param]['default'];
    } else if (effectParams[param].hasOwnProperty('options')) {
        // Dropdown for options
        input = document.createElement('select');
        const options = effectParams[param]['options'].split(', ');
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            input.appendChild(option);
        });
    } else if (effectParams[param].hasOwnProperty('min') && effectParams[param].hasOwnProperty('max')) {
        // Slider or number input
        input = document.createElement('input');
        input.type = 'range';
        input.min = effectParams[param]['min'];
        input.max = effectParams[param]['max'];
        input.step = effectParams[param]['step'] || 'any';
        input.value = effectParams[param]['default'];
    } else {
        // Text input
        input = document.createElement('input');
        input.type = 'text';
        input.value = effectParams[param]['default'];
    }

    input.id = effectName + '_' + param;
    inputDiv.appendChild(input);

    form.appendChild(inputDiv);
}

container.appendChild(form);
}

// Event listener for dropdown change to create form
document.getElementById('effectSelect').addEventListener('change', function(data) {
    console.log("change");
    const selectedEffect = this.value;
    const effectParams = data;
    createEffectForm(selectedEffect, tunaParams[selectedEffect]);
});

// Event listener for form input changes
document.getElementById('formContainer').addEventListener('input', function(event) {
    var value;
    if (event.target.type === 'checkbox') {
        // For checkboxes, use the 'checked' property
        value = event.target.checked;
    } else {
        // For other input types, use the 'value' property
        value = event.target.value;
    }
    console.log(event.target.id + ' has changed to ' + value);
});
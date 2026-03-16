/* =============================================
   TDEE Calculator
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    initTDEECalculator();
});

let hasCalculated = false;

function initTDEECalculator() {
    initTDEEUnitToggles();

    const calculateBtn = document.getElementById('tdeeCalculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateTDEE);
    }

    // Auto-recalculate after first calculation
    const inputs = [
        'tdeeAge', 'tdeeHeightCm', 'tdeeHeightFt', 'tdeeHeightIn',
        'tdeeWeightKg', 'tdeeWeightSt', 'tdeeWeightLbs'
    ];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                if (hasCalculated) calculateTDEE();
            });
        }
    });

    const selects = ['tdeeActivityLevel'];
    const radios = document.querySelectorAll('input[name="tdeeSex"]');
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function() {
                if (hasCalculated) calculateTDEE();
            });
        }
    });
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (hasCalculated) calculateTDEE();
        });
    });
}

function initTDEEUnitToggles() {
    const unitBtns = document.querySelectorAll('.tdee-calculator-card .unit-btn');

    unitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            const unit = this.dataset.unit;
            const container = this.closest('.form-group');
            const siblings = container.querySelectorAll('.unit-btn');

            siblings.forEach(s => s.classList.remove('active'));
            this.classList.add('active');

            const metricInputs = container.querySelector(`#${target}Metric`);
            const imperialInputs = container.querySelector(`#${target}Imperial`);

            if (metricInputs && imperialInputs) {
                if (unit === 'metric') {
                    metricInputs.classList.remove('hidden');
                    metricInputs.style.display = 'flex';
                    imperialInputs.classList.add('hidden');
                    imperialInputs.style.display = 'none';
                } else {
                    metricInputs.classList.add('hidden');
                    metricInputs.style.display = 'none';
                    imperialInputs.classList.remove('hidden');
                    imperialInputs.style.display = 'flex';
                }
            }

            if (hasCalculated) calculateTDEE();
        });
    });
}

function getTDEEHeightInCm() {
    const activeBtn = document.querySelector('[data-target="tdeeHeight"].unit-btn.active');
    const metricActive = activeBtn && activeBtn.dataset.unit === 'metric';

    if (metricActive) {
        return parseFloat(document.getElementById('tdeeHeightCm').value) || null;
    } else {
        const ft = parseFloat(document.getElementById('tdeeHeightFt').value) || 0;
        const inches = parseFloat(document.getElementById('tdeeHeightIn').value) || 0;
        if (ft > 0) {
            return (ft * 30.48) + (inches * 2.54);
        }
        return null;
    }
}

function getTDEEWeightInKg() {
    const activeBtn = document.querySelector('[data-target="tdeeWeight"].unit-btn.active');
    const metricActive = activeBtn && activeBtn.dataset.unit === 'metric';

    if (metricActive) {
        return parseFloat(document.getElementById('tdeeWeightKg').value) || null;
    } else {
        const st = parseFloat(document.getElementById('tdeeWeightSt').value) || 0;
        const lbs = parseFloat(document.getElementById('tdeeWeightLbs').value) || 0;
        if (st > 0) {
            return (st * 6.35029) + (lbs * 0.453592);
        }
        return null;
    }
}

function calculateTDEE() {
    // Clear previous errors
    document.querySelectorAll('.tdee-calculator-card .form-input, .tdee-calculator-card .form-select').forEach(el => {
        el.classList.remove('error');
    });

    const age = parseInt(document.getElementById('tdeeAge').value);
    const sexEl = document.querySelector('input[name="tdeeSex"]:checked');
    const sex = sexEl ? sexEl.value : null;
    const heightCm = getTDEEHeightInCm();
    const weightKg = getTDEEWeightInKg();
    const activityLevel = document.getElementById('tdeeActivityLevel').value;

    // Validation
    let valid = true;

    if (!age || age < 18 || age > 100) {
        document.getElementById('tdeeAge').classList.add('error');
        valid = false;
    }

    if (!sex) {
        valid = false;
    }

    if (!heightCm || heightCm < 100 || heightCm > 250) {
        const activeBtn = document.querySelector('[data-target="tdeeHeight"].unit-btn.active');
        const metricActive = activeBtn && activeBtn.dataset.unit === 'metric';
        if (metricActive) {
            document.getElementById('tdeeHeightCm').classList.add('error');
        } else {
            document.getElementById('tdeeHeightFt').classList.add('error');
        }
        valid = false;
    }

    if (!weightKg || weightKg < 30 || weightKg > 300) {
        const activeBtn = document.querySelector('[data-target="tdeeWeight"].unit-btn.active');
        const metricActive = activeBtn && activeBtn.dataset.unit === 'metric';
        if (metricActive) {
            document.getElementById('tdeeWeightKg').classList.add('error');
        } else {
            document.getElementById('tdeeWeightSt').classList.add('error');
        }
        valid = false;
    }

    if (!activityLevel) {
        document.getElementById('tdeeActivityLevel').classList.add('error');
        valid = false;
    }

    if (!valid) return;

    // Mifflin-St Jeor equation
    let bmr;
    if (sex === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    const activityMultipliers = {
        'sedentary': 1.2,
        'lightly-active': 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
        'extra-active': 1.9
    };

    const multiplier = activityMultipliers[activityLevel];
    const tdee = Math.round(bmr * multiplier);
    const deficitLow = Math.round(tdee - 500);
    const deficitHigh = Math.round(tdee - 300);

    displayTDEEResults(tdee, deficitLow, deficitHigh);
    hasCalculated = true;
}

function formatCalories(num) {
    return num.toLocaleString('en-GB');
}

function displayTDEEResults(tdee, deficitLow, deficitHigh) {
    const resultsEl = document.getElementById('tdeeResults');
    const maintenanceEl = document.getElementById('tdeeMaintenance');
    const deficitEl = document.getElementById('tdeeDeficit');

    maintenanceEl.textContent = formatCalories(tdee);
    deficitEl.textContent = formatCalories(deficitLow) + ' – ' + formatCalories(deficitHigh);

    resultsEl.style.display = 'grid';

    // Smooth scroll to results
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

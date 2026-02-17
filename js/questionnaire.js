/* =============================================
   Logan Health - Questionnaire Logic
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    initQuestionnaire();
});

/* =============================================
   Questionnaire State
   ============================================= */
const questionnaireState = {
    currentStep: 1,
    totalSteps: 11,
    data: {
        // Step 1 (new - Motivation & Goals)
        weightLossReason: null,
        weightLossGoal: null,

        // Step 2: Measurements
        heightCm: null,
        weightKg: null,
        bmi: null,

        // Step 3: Personal Details
        dobDay: null,
        dobMonth: null,
        dobYear: null,
        age: null,
        ethnicity: null,
        sex: null,

        // Step 4: Weight History
        highestWeightKg: null,
        targetWeightKg: null,

        // Step 5: Medical Conditions
        pregnancy: null,
        conditions: [],
        medications: '',
        allergies: '',

        // Step 6 (new safety screening)
        eatingDisorder: null,
        eatingDisorderDetails: '',
        kidneyDisease: null,
        kidneyDiseaseDetails: '',
        pregnantOrTrying: null,
        pregnantOrTryingDetails: '',
        otherConditions: '',

        // Step 7 (new medical history)
        medicalHistory: [],
        thyroidOrLiver: null,
        diabetesInsulin: null,
        diabetesOtherMeds: null,
        gallbladderIssues: [],
        additionalHistory: [],

        // Step 8 (new medications & lifestyle)
        specificMedications: [],
        isSmoker: null,
        recentInjectableWeightLoss: null,

        // Step 9 (contraception)
        contraceptionAgreement: null,

        // Step 10 (important info)
        importantInfoConfirmed: false,

        // Step 11: Contact
        fullName: '',
        email: '',
        phone: '',
        contactMethod: 'email',
        consent: false,
        marketing: false,
        termsAgreement: false
    },
    eligible: null,
    eligibilityReason: ''
};

/* =============================================
   Initialize Questionnaire
   ============================================= */
function initQuestionnaire() {
    populateDateSelects();
    initUnitToggles();
    initBMICalculation();
    initNavigationButtons();
    initConditionalFields();
    initConditionsCheckbox();
    initSafetyScreeningFields();
    initMedicalHistoryCheckboxes();
    initPaymentButtons();
}

/* =============================================
   Populate Date Selects
   ============================================= */
function populateDateSelects() {
    const daySelect = document.getElementById('dobDay');
    const yearSelect = document.getElementById('dobYear');

    // Populate days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // Populate years (18-85 years ago)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 18; i >= currentYear - 85; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Add change listeners to calculate age
    [daySelect, document.getElementById('dobMonth'), yearSelect].forEach(select => {
        select.addEventListener('change', calculateAge);
    });
}

/* =============================================
   Unit Toggles
   ============================================= */
function initUnitToggles() {
    const unitBtns = document.querySelectorAll('.unit-btn');

    unitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            const unit = this.dataset.unit;
            const container = this.closest('.form-group');
            const siblings = container.querySelectorAll('.unit-btn');

            // Update active button
            siblings.forEach(s => s.classList.remove('active'));
            this.classList.add('active');

            // Toggle input visibility
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

            // Recalculate BMI if height/weight toggled
            if (target === 'height' || target === 'weight') {
                calculateBMI();
            }
        });
    });
}

/* =============================================
   BMI Calculation
   ============================================= */
function initBMICalculation() {
    // Height inputs
    const heightCm = document.getElementById('heightCm');
    const heightFt = document.getElementById('heightFt');
    const heightIn = document.getElementById('heightIn');

    // Weight inputs
    const weightKg = document.getElementById('weightKg');
    const weightSt = document.getElementById('weightSt');
    const weightLbs = document.getElementById('weightLbs');

    // Add listeners
    [heightCm, heightFt, heightIn, weightKg, weightSt, weightLbs].forEach(input => {
        if (input) {
            input.addEventListener('input', calculateBMI);
        }
    });
}

function calculateBMI() {
    let heightCm = getHeightInCm();
    let weightKg = getWeightInKg();

    if (heightCm && weightKg && heightCm > 0 && weightKg > 0) {
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);

        questionnaireState.data.heightCm = heightCm;
        questionnaireState.data.weightKg = weightKg;
        questionnaireState.data.bmi = bmi;

        displayBMI(bmi);
    } else {
        document.getElementById('bmiValue').textContent = '--';
        document.getElementById('bmiCategory').textContent = '';
        document.getElementById('bmiCategory').className = 'bmi-category';
    }
}

function getHeightInCm() {
    const metricActive = document.querySelector('[data-target="height"].unit-btn.active').dataset.unit === 'metric';

    if (metricActive) {
        return parseFloat(document.getElementById('heightCm').value) || null;
    } else {
        const ft = parseFloat(document.getElementById('heightFt').value) || 0;
        const inches = parseFloat(document.getElementById('heightIn').value) || 0;
        if (ft > 0) {
            return (ft * 30.48) + (inches * 2.54);
        }
        return null;
    }
}

function getWeightInKg() {
    const metricActive = document.querySelector('[data-target="weight"].unit-btn.active').dataset.unit === 'metric';

    if (metricActive) {
        return parseFloat(document.getElementById('weightKg').value) || null;
    } else {
        const st = parseFloat(document.getElementById('weightSt').value) || 0;
        const lbs = parseFloat(document.getElementById('weightLbs').value) || 0;
        if (st > 0) {
            return (st * 6.35029) + (lbs * 0.453592);
        }
        return null;
    }
}

function displayBMI(bmi) {
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');

    bmiValue.textContent = bmi.toFixed(1);

    let category = '';
    let categoryClass = '';

    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'healthy';
    } else if (bmi < 25) {
        category = 'Healthy';
        categoryClass = 'healthy';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'overweight';
    } else if (bmi < 35) {
        category = 'Obese (Class I)';
        categoryClass = 'obese';
    } else if (bmi < 40) {
        category = 'Obese (Class II)';
        categoryClass = 'obese';
    } else {
        category = 'Obese (Class III)';
        categoryClass = 'obese';
    }

    bmiCategory.textContent = category;
    bmiCategory.className = `bmi-category ${categoryClass}`;
}

/* =============================================
   Age Calculation
   ============================================= */
function calculateAge() {
    const day = document.getElementById('dobDay').value;
    const month = document.getElementById('dobMonth').value;
    const year = document.getElementById('dobYear').value;

    if (day && month && year) {
        const dob = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        questionnaireState.data.dobDay = day;
        questionnaireState.data.dobMonth = month;
        questionnaireState.data.dobYear = year;
        questionnaireState.data.age = age;

        document.getElementById('ageDisplay').textContent = `Age: ${age} years`;
    }
}

/* =============================================
   Conditional Fields
   ============================================= */
function initConditionalFields() {
    // No conditional fields to initialize on step load
    // Safety screening conditional fields are handled by initSafetyScreeningFields()
}

/* =============================================
   Safety Screening Conditional Fields
   ============================================= */
function initSafetyScreeningFields() {
    const fields = [
        { radio: 'eatingDisorder', detail: 'eatingDisorderDetailGroup' },
        { radio: 'kidneyDisease', detail: 'kidneyDiseaseDetailGroup' },
        { radio: 'pregnantOrTrying', detail: 'pregnantOrTryingDetailGroup' }
    ];

    fields.forEach(({ radio, detail }) => {
        const radios = document.querySelectorAll(`input[name="${radio}"]`);
        const detailGroup = document.getElementById(detail);
        if (!detailGroup) return;

        radios.forEach(r => {
            r.addEventListener('change', function() {
                detailGroup.style.display = this.value === 'yes' ? 'block' : 'none';
            });
        });
    });
}

/* =============================================
   Medical History Checkbox Logic
   ============================================= */
function initMedicalHistoryCheckboxes() {
    const groups = [
        { name: 'medicalHistory', noneValue: 'none_history' },
        { name: 'gallbladderIssues', noneValue: 'none_gallbladder' },
        { name: 'additionalHistory', noneValue: 'none_additional' },
        { name: 'specificMedications', noneValue: 'none_meds' }
    ];

    groups.forEach(({ name, noneValue }) => {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        const noneCheckbox = document.querySelector(`input[name="${name}"][value="${noneValue}"]`);
        if (!noneCheckbox) return;

        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                if (this.value === noneValue && this.checked) {
                    checkboxes.forEach(other => {
                        if (other !== noneCheckbox) other.checked = false;
                    });
                } else if (this.value !== noneValue && this.checked) {
                    noneCheckbox.checked = false;
                }
            });
        });
    });
}

/* =============================================
   Conditions Checkbox Logic
   ============================================= */
function initConditionsCheckbox() {
    const conditionCheckboxes = document.querySelectorAll('input[name="conditions"]');
    const noneCheckbox = document.querySelector('input[name="conditions"][value="none"]');

    conditionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === 'none' && this.checked) {
                // Uncheck all others when "None" is selected
                conditionCheckboxes.forEach(cb => {
                    if (cb !== noneCheckbox) {
                        cb.checked = false;
                    }
                });
            } else if (this.value !== 'none' && this.checked) {
                // Uncheck "None" when any other is selected
                noneCheckbox.checked = false;
            }
        });
    });
}

/* =============================================
   Navigation Buttons
   ============================================= */
function initNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.addEventListener('click', () => navigateStep(-1));
    nextBtn.addEventListener('click', () => navigateStep(1));
    submitBtn.addEventListener('click', submitQuestionnaire);
}

function navigateStep(direction) {
    // Validate current step before moving forward
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    // Save current step data
    saveStepData();

    // Update step
    questionnaireState.currentStep += direction;

    // Skip step 9 (contraception) for non-female users
    if (questionnaireState.currentStep === 9 && questionnaireState.data.sex !== 'female') {
        questionnaireState.currentStep += direction;
    }

    // Bounds check
    if (questionnaireState.currentStep < 1) questionnaireState.currentStep = 1;
    if (questionnaireState.currentStep > questionnaireState.totalSteps) questionnaireState.currentStep = questionnaireState.totalSteps;

    // Show/hide steps
    updateStepVisibility();

    // Update progress bar
    updateProgressBar();

    // Update navigation buttons
    updateNavigationButtons();

    // Scroll to top of form
    document.querySelector('.questionnaire-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepVisibility() {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((step, index) => {
        if (index + 1 === questionnaireState.currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updateProgressBar() {
    const progress = (questionnaireState.currentStep / questionnaireState.totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Step ${questionnaireState.currentStep} of ${questionnaireState.totalSteps}`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = questionnaireState.currentStep > 1 ? 'inline-flex' : 'none';

    if (questionnaireState.currentStep === questionnaireState.totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

/* =============================================
   Step Validation
   ============================================= */
function validateCurrentStep() {
    const step = questionnaireState.currentStep;
    let isValid = true;
    let errorMessage = '';

    clearErrors();

    switch (step) {
        case 1:
            // Validate motivation & goals
            if (!document.querySelector('input[name="weightLossReason"]:checked')) {
                errorMessage = 'Please select your main reason for wanting to lose weight';
                isValid = false;
            }
            if (!document.querySelector('input[name="weightLossGoal"]:checked')) {
                errorMessage = 'Please select your weight loss goal';
                isValid = false;
            }
            break;

        case 2:
            // Validate height and weight
            const heightCm = getHeightInCm();
            const weightKg = getWeightInKg();

            if (!heightCm || heightCm < 110 || heightCm > 234) {
                markError('heightCm');
                markError('heightFt');
                errorMessage = 'Please enter a valid height';
                isValid = false;
            }

            if (!weightKg || weightKg < 30 || weightKg > 300) {
                markError('weightKg');
                markError('weightSt');
                errorMessage = 'Please enter a valid weight';
                isValid = false;
            }
            break;

        case 3:
            // Validate DOB
            const day = document.getElementById('dobDay').value;
            const month = document.getElementById('dobMonth').value;
            const year = document.getElementById('dobYear').value;

            if (!day || !month || !year) {
                markError('dobDay');
                markError('dobMonth');
                markError('dobYear');
                errorMessage = 'Please enter your date of birth';
                isValid = false;
            }

            // Validate age
            if (questionnaireState.data.age < 18 || questionnaireState.data.age > 85) {
                markError('dobYear');
                errorMessage = 'You must be between 18 and 85 years old';
                isValid = false;
            }

            // Validate ethnicity
            if (!document.querySelector('input[name="ethnicity"]:checked')) {
                errorMessage = 'Please select your ethnic background';
                isValid = false;
            }

            // Validate sex
            if (!document.querySelector('input[name="sex"]:checked')) {
                errorMessage = 'Please select your sex assigned at birth';
                isValid = false;
            }
            break;

        case 4:
            // Weight history - optional
            break;

        case 5:
            // Medical conditions - no required validation
            break;

        case 6:
            // Safety screening
            if (!document.querySelector('input[name="eatingDisorder"]:checked')) {
                errorMessage = 'Please answer the eating disorder question';
                isValid = false;
            }
            if (!document.querySelector('input[name="kidneyDisease"]:checked')) {
                errorMessage = 'Please answer the kidney disease question';
                isValid = false;
            }
            if (!document.querySelector('input[name="pregnantOrTrying"]:checked')) {
                errorMessage = 'Please answer the pregnancy question';
                isValid = false;
            }
            break;

        case 7:
            // Medical history - no required validation (all sections optional)
            break;

        case 8:
            // Medications & lifestyle
            if (!document.querySelector('input[name="isSmoker"]:checked')) {
                errorMessage = 'Please answer the smoking question';
                isValid = false;
            }
            if (!document.querySelector('input[name="recentInjectableWeightLoss"]:checked')) {
                errorMessage = 'Please answer the injectable weight loss medication question';
                isValid = false;
            }
            break;

        case 9:
            // Contraception (only shown for females)
            const contraception = document.querySelector('input[name="contraceptionAgreement"]:checked');
            if (!contraception) {
                errorMessage = 'Please answer the contraception question';
                isValid = false;
            } else if (contraception.value === 'no') {
                errorMessage = 'You must agree to use alternative contraception while taking Mounjaro to proceed';
                isValid = false;
            }
            break;

        case 10:
            // Important information
            if (!document.getElementById('importantInfoConfirmed').checked) {
                errorMessage = 'Please confirm you have read and understood the important information';
                isValid = false;
            }
            break;

        case 11:
            // Contact details
            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const consent = document.getElementById('consent').checked;
            const terms = document.getElementById('termsAgreement').checked;

            if (!name || name.length < 2) {
                markError('fullName');
                errorMessage = 'Please enter your full name';
                isValid = false;
            }

            if (!email || !window.utils.isValidEmail(email)) {
                markError('email');
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }

            if (!phone || !window.utils.isValidUKPhone(phone)) {
                markError('phone');
                errorMessage = 'Please enter a valid UK phone number';
                isValid = false;
            }

            if (!terms) {
                errorMessage = 'Please agree to the Terms and Conditions and Privacy Policy';
                isValid = false;
            }

            if (!consent) {
                errorMessage = 'Please agree to the data processing terms';
                isValid = false;
            }
            break;
    }

    if (!isValid && errorMessage) {
        showError(errorMessage);
    }

    return isValid;
}

function markError(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.add('error');
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    const existingError = document.querySelector('.form-error');
    if (existingError) existingError.remove();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = 'background: var(--color-error-light); color: var(--color-error); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;';
    errorDiv.textContent = message;

    const currentStep = document.querySelector('.form-step.active');
    currentStep.insertBefore(errorDiv, currentStep.firstChild);
}

/* =============================================
   Save Step Data
   ============================================= */
function saveStepData() {
    const step = questionnaireState.currentStep;
    const data = questionnaireState.data;

    switch (step) {
        case 1:
            // Motivation & Goals
            const reason = document.querySelector('input[name="weightLossReason"]:checked');
            const goal = document.querySelector('input[name="weightLossGoal"]:checked');
            data.weightLossReason = reason ? reason.value : null;
            data.weightLossGoal = goal ? goal.value : null;
            break;

        case 2:
            // Measurements
            data.heightCm = getHeightInCm();
            data.weightKg = getWeightInKg();
            if (data.heightCm && data.weightKg) {
                data.bmi = data.weightKg / Math.pow(data.heightCm / 100, 2);
            }
            break;

        case 3:
            // Personal Details
            const ethnicity = document.querySelector('input[name="ethnicity"]:checked');
            const sex = document.querySelector('input[name="sex"]:checked');
            data.ethnicity = ethnicity ? ethnicity.value : null;
            data.sex = sex ? sex.value : null;
            break;

        case 4:
            // Weight History
            const hwMetric = document.querySelector('[data-target="highestWeight"].unit-btn.active').dataset.unit === 'metric';
            if (hwMetric) {
                data.highestWeightKg = parseFloat(document.getElementById('highestWeightKg').value) || null;
            } else {
                const hwSt = parseFloat(document.getElementById('highestWeightSt').value) || 0;
                const hwLbs = parseFloat(document.getElementById('highestWeightLbs').value) || 0;
                data.highestWeightKg = hwSt > 0 ? (hwSt * 6.35029) + (hwLbs * 0.453592) : null;
            }

            const twMetric = document.querySelector('[data-target="targetWeight"].unit-btn.active').dataset.unit === 'metric';
            if (twMetric) {
                data.targetWeightKg = parseFloat(document.getElementById('targetWeightKg').value) || null;
            } else {
                const twSt = parseFloat(document.getElementById('targetWeightSt').value) || 0;
                const twLbs = parseFloat(document.getElementById('targetWeightLbs').value) || 0;
                data.targetWeightKg = twSt > 0 ? (twSt * 6.35029) + (twLbs * 0.453592) : null;
            }
            break;

        case 5:
            // Medical Conditions
            const conditions = document.querySelectorAll('input[name="conditions"]:checked');
            data.conditions = Array.from(conditions).map(c => c.value);
            break;

        case 6:
            // Safety Screening
            const ed = document.querySelector('input[name="eatingDisorder"]:checked');
            data.eatingDisorder = ed ? ed.value : null;
            data.eatingDisorderDetails = document.getElementById('eatingDisorderDetails').value.trim();

            const kd = document.querySelector('input[name="kidneyDisease"]:checked');
            data.kidneyDisease = kd ? kd.value : null;
            data.kidneyDiseaseDetails = document.getElementById('kidneyDiseaseDetails').value.trim();

            const pt = document.querySelector('input[name="pregnantOrTrying"]:checked');
            data.pregnantOrTrying = pt ? pt.value : null;
            data.pregnancy = data.pregnantOrTrying; // backward compat for eligibility check
            data.pregnantOrTryingDetails = document.getElementById('pregnantOrTryingDetails').value.trim();

            data.otherConditions = document.getElementById('otherConditions').value.trim();
            data.medications = document.getElementById('medications').value.trim();
            data.allergies = document.getElementById('allergies').value.trim();
            break;

        case 7:
            // Medical History
            data.medicalHistory = Array.from(document.querySelectorAll('input[name="medicalHistory"]:checked')).map(c => c.value);

            const tl = document.querySelector('input[name="thyroidOrLiver"]:checked');
            data.thyroidOrLiver = tl ? tl.value : null;

            const di = document.querySelector('input[name="diabetesInsulin"]:checked');
            data.diabetesInsulin = di ? di.value : null;

            const dom = document.querySelector('input[name="diabetesOtherMeds"]:checked');
            data.diabetesOtherMeds = dom ? dom.value : null;

            data.gallbladderIssues = Array.from(document.querySelectorAll('input[name="gallbladderIssues"]:checked')).map(c => c.value);
            data.additionalHistory = Array.from(document.querySelectorAll('input[name="additionalHistory"]:checked')).map(c => c.value);
            break;

        case 8:
            // Medications & Lifestyle
            data.specificMedications = Array.from(document.querySelectorAll('input[name="specificMedications"]:checked')).map(c => c.value);

            const smoker = document.querySelector('input[name="isSmoker"]:checked');
            data.isSmoker = smoker ? smoker.value : null;

            const injectable = document.querySelector('input[name="recentInjectableWeightLoss"]:checked');
            data.recentInjectableWeightLoss = injectable ? injectable.value : null;
            break;

        case 9:
            // Contraception
            const ca = document.querySelector('input[name="contraceptionAgreement"]:checked');
            data.contraceptionAgreement = ca ? ca.value : null;
            break;

        case 10:
            // Important Info
            data.importantInfoConfirmed = document.getElementById('importantInfoConfirmed').checked;
            break;

        case 11:
            // Contact Details
            data.fullName = document.getElementById('fullName').value.trim();
            data.email = document.getElementById('email').value.trim();
            data.phone = document.getElementById('phone').value.trim();

            const contactMethod = document.querySelector('input[name="contactMethod"]:checked');
            data.contactMethod = contactMethod ? contactMethod.value : 'email';

            data.consent = document.getElementById('consent').checked;
            data.termsAgreement = document.getElementById('termsAgreement').checked;
            data.marketing = document.getElementById('marketing').checked;
            break;
    }
}

/* =============================================
   Submit Questionnaire
   ============================================= */
function submitQuestionnaire(e) {
    e.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    saveStepData();

    // Check eligibility
    const eligibility = checkEligibility();
    questionnaireState.eligible = eligibility.eligible;
    questionnaireState.eligibilityReason = eligibility.reason;

    // Submit to Formspree
    submitToFormspree();

    // Show results
    showResults();
}

/* =============================================
   Eligibility Check
   ============================================= */
function checkEligibility() {
    const data = questionnaireState.data;
    let eligible = true;
    let reason = '';

    // Age check
    if (data.age < 18) {
        eligible = false;
        reason = 'You must be at least 18 years old to be eligible for GLP-1 treatment.';
        return { eligible, reason };
    }

    if (data.age > 85) {
        eligible = false;
        reason = 'GLP-1 treatments are not recommended for individuals over 85 years old.';
        return { eligible, reason };
    }

    // BMI check with ethnicity adjustment
    // Lower thresholds for Asian, Black, Middle Eastern (NICE guidance)
    const lowerThresholdEthnicities = ['asian', 'black', 'middleeastern'];
    const useLowerThreshold = lowerThresholdEthnicities.includes(data.ethnicity);
    const bmiThreshold = useLowerThreshold ? 27.5 : 30;
    const bmiWithConditionsThreshold = useLowerThreshold ? 25 : 27;

    // Check if user has weight-related conditions
    const weightRelatedConditions = ['type2diabetes', 'highbloodpressure', 'heartdisease', 'prediabetes', 'highcholesterol', 'sleepapnoea', 'osteoarthritis'];
    const hasWeightRelatedCondition = data.conditions.some(c => weightRelatedConditions.includes(c));

    // Calculate highest BMI if provided
    let highestBMI = data.bmi;
    if (data.highestWeightKg && data.heightCm) {
        highestBMI = data.highestWeightKg / Math.pow(data.heightCm / 100, 2);
    }

    // Eligibility based on BMI
    if (data.bmi >= bmiThreshold || highestBMI >= bmiThreshold) {
        eligible = true;
    } else if (data.bmi >= bmiWithConditionsThreshold && hasWeightRelatedCondition) {
        eligible = true;
    } else {
        eligible = false;
        reason = `Based on your BMI of ${data.bmi.toFixed(1)}, you may not currently meet the eligibility criteria for GLP-1 treatment. The minimum BMI requirement is ${bmiThreshold} (or ${bmiWithConditionsThreshold} with weight-related health conditions).`;
        return { eligible, reason };
    }

    // Safety screening flags — these result in "review" status, not outright rejection
    if (data.eatingDisorder === 'yes' || data.kidneyDisease === 'yes' || data.pregnantOrTrying === 'yes') {
        eligible = 'review';
        reason = 'Based on your responses, you may not be eligible for this treatment. However, you can speak with one of our health team to discuss your options and find the right path forward.';
        return { eligible, reason };
    }

    // Check for pancreatitis (pharmacist review flag)
    if (data.conditions.includes('pancreatitis')) {
        reason = 'Based on your medical history, our pharmacist will need to conduct a thorough assessment to determine your suitability for GLP-1 treatment.';
    }

    return { eligible, reason };
}

/* =============================================
   Show Results
   ============================================= */
function showResults() {
    const form = document.getElementById('healthQuestionnaire');
    const resultContainer = document.getElementById('resultContainer');
    const eligibleResult = document.getElementById('eligibleResult');
    const reviewResult = document.getElementById('reviewResult');
    const notEligibleResult = document.getElementById('notEligibleResult');

    // Hide form, show results
    form.style.display = 'none';
    resultContainer.style.display = 'block';

    // Hide all result panels first
    eligibleResult.style.display = 'none';
    if (reviewResult) reviewResult.style.display = 'none';
    notEligibleResult.style.display = 'none';

    if (questionnaireState.eligible === true) {
        eligibleResult.style.display = 'block';
    } else if (questionnaireState.eligible === 'review') {
        if (reviewResult) {
            reviewResult.style.display = 'block';
        }
        if (questionnaireState.eligibilityReason) {
            const reviewMessage = document.getElementById('reviewMessage');
            if (reviewMessage) reviewMessage.textContent = questionnaireState.eligibilityReason;
        }
    } else {
        notEligibleResult.style.display = 'block';
        if (questionnaireState.eligibilityReason) {
            document.getElementById('notEligibleMessage').textContent = questionnaireState.eligibilityReason;
        }
    }

    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =============================================
   Payment Button Handlers
   ============================================= */
// JotForm URLs
const JOTFORM_URLS = {
    'one-off': 'https://pci.jotform.com/form/260355646726059',
    'subscription': 'https://pci.jotform.com/form/260355571683058'
};

function initPaymentButtons() {
    const oneOffBtn = document.getElementById('oneOffPaymentBtn');
    const subscriptionBtn = document.getElementById('subscriptionPaymentBtn');

    if (oneOffBtn) {
        oneOffBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handlePaymentSelection('one-off');
        });
    }

    if (subscriptionBtn) {
        subscriptionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handlePaymentSelection('subscription');
        });
    }
}

function handlePaymentSelection(paymentType) {
    const jotformUrl = JOTFORM_URLS[paymentType];

    if (!jotformUrl || jotformUrl.includes('YOUR_')) {
        console.warn('JotForm URL not configured for:', paymentType);
        alert('Payment form is being set up. Please contact us directly to proceed.');
        return;
    }

    // Build URL with prefilled data from questionnaire
    const userData = questionnaireState.data;
    const params = new URLSearchParams();

    // Prefill user data if available
    // JotForm name field expects separate first/last name parts
    if (userData.fullName) {
        const nameParts = userData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        params.set('name[first]', firstName);
        if (lastName) {
            params.set('name[last]', lastName);
        }
    }
    if (userData.email) {
        params.set('email', userData.email);
    }

    // Add payment type identifier
    params.set('paymentType', paymentType);

    const finalUrl = params.toString()
        ? `${jotformUrl}?${params.toString()}`
        : jotformUrl;

    // Redirect to JotForm
    window.location.href = finalUrl;
}

/* =============================================
   Export state for form handler
   ============================================= */
window.questionnaireState = questionnaireState;

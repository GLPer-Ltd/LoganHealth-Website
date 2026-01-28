/* =============================================
   Logan Health - Form Handler (Formspree)
   ============================================= */

/* =============================================
   Formspree Configuration

   To set up Formspree:
   1. Go to https://formspree.io
   2. Create a free account
   3. Create a new form
   4. Copy your form endpoint (e.g., https://formspree.io/f/xxxxxxxx)
   5. Replace the FORMSPREE_ENDPOINT below with your endpoint
   ============================================= */

// Replace this with your actual Formspree endpoint
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreqnoly';

/* =============================================
   Submit to Formspree
   ============================================= */
function submitToFormspree() {
    const data = window.questionnaireState.data;
    const eligible = window.questionnaireState.eligible;
    const eligibilityReason = window.questionnaireState.eligibilityReason;

    // Format the data for email
    const formData = {
        // Subject line
        _subject: `New GLP-1 Consultation Request - ${data.fullName}`,

        // Customer Details
        'Customer Name': data.fullName,
        'Email': data.email,
        'Phone': data.phone,
        'Preferred Contact': data.contactMethod,

        // Eligibility
        'Eligibility Status': eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE',
        'Eligibility Notes': eligibilityReason || 'Meets all criteria',

        // Measurements
        'BMI': data.bmi ? data.bmi.toFixed(1) : 'Not calculated',
        'Height (cm)': data.heightCm ? data.heightCm.toFixed(1) : 'Not provided',
        'Current Weight (kg)': data.weightKg ? data.weightKg.toFixed(1) : 'Not provided',
        'Highest Weight (kg)': data.highestWeightKg ? data.highestWeightKg.toFixed(1) : 'Not provided',
        'Target Weight (kg)': data.targetWeightKg ? data.targetWeightKg.toFixed(1) : 'Not provided',

        // Personal Info
        'Date of Birth': `${data.dobDay}/${data.dobMonth}/${data.dobYear}`,
        'Age': data.age,
        'Sex': data.sex,
        'Ethnicity': data.ethnicity === 'white' ? 'White' : 'Asian, Black, Mixed, or Other',

        // Medical
        'Pregnant/Breastfeeding': data.sex === 'female' ? (data.pregnancy || 'Not answered') : 'N/A',
        'Medical Conditions': formatConditions(data.conditions),
        'Current Medications': data.medications || 'None listed',
        'Allergies': data.allergies || 'None listed',

        // Consent
        'Data Consent': data.consent ? 'Yes' : 'No',
        'Marketing Consent': data.marketing ? 'Yes' : 'No',

        // Metadata
        'Submitted At': new Date().toLocaleString('en-GB', {
            dateStyle: 'full',
            timeStyle: 'short'
        }),
        'Source': window.location.href
    };

    // Send to Formspree
    fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            console.log('Form submitted successfully');
        } else {
            console.error('Form submission failed');
            // Optionally show user-friendly error message
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        // Form submission failed, but we still show results
        // The data is stored in the state and can be retrieved
    });
}

/* =============================================
   Format Conditions for Email
   ============================================= */
function formatConditions(conditions) {
    if (!conditions || conditions.length === 0) {
        return 'None selected';
    }

    if (conditions.includes('none')) {
        return 'None of the listed conditions';
    }

    const conditionLabels = {
        'type2diabetes': 'Type 2 Diabetes',
        'highbloodpressure': 'High Blood Pressure',
        'heartdisease': 'Heart Disease',
        'thyroid': 'Thyroid Conditions',
        'eatingdisorder': 'Eating Disorder (current or history)',
        'pancreatitis': 'Pancreatitis (current or history)'
    };

    return conditions
        .filter(c => c !== 'none')
        .map(c => conditionLabels[c] || c)
        .join(', ');
}

/* =============================================
   Email Data Backup (localStorage)

   In case of network failure, save data locally
   so it can be retrieved later
   ============================================= */
function backupFormData() {
    try {
        const backup = {
            data: window.questionnaireState.data,
            eligible: window.questionnaireState.eligible,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('pe_logan_questionnaire_backup', JSON.stringify(backup));
    } catch (e) {
        console.warn('Could not backup form data:', e);
    }
}

function clearBackup() {
    try {
        localStorage.removeItem('pe_logan_questionnaire_backup');
    } catch (e) {
        console.warn('Could not clear backup:', e);
    }
}

function getBackup() {
    try {
        const backup = localStorage.getItem('pe_logan_questionnaire_backup');
        return backup ? JSON.parse(backup) : null;
    } catch (e) {
        console.warn('Could not retrieve backup:', e);
        return null;
    }
}

/* =============================================
   Export Functions
   ============================================= */
window.submitToFormspree = submitToFormspree;
window.formBackup = {
    save: backupFormData,
    clear: clearBackup,
    get: getBackup
};

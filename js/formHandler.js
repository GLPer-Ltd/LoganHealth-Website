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
        'Eligibility Status': eligible === true ? 'ELIGIBLE' : eligible === 'review' ? 'NEEDS REVIEW' : 'NOT ELIGIBLE',
        'Eligibility Notes': eligibilityReason || 'Meets all criteria',

        // Step 1: Motivation & Goals
        'Weight Loss Reason': formatWeightLossReason(data.weightLossReason),
        'Weight Loss Goal': formatWeightLossGoal(data.weightLossGoal),

        // Step 2: Measurements
        'BMI': data.bmi ? data.bmi.toFixed(1) : 'Not calculated',
        'Height (cm)': data.heightCm ? data.heightCm.toFixed(1) : 'Not provided',
        'Current Weight (kg)': data.weightKg ? data.weightKg.toFixed(1) : 'Not provided',
        'Highest Weight (kg)': data.highestWeightKg ? data.highestWeightKg.toFixed(1) : 'Not provided',
        'Target Weight (kg)': data.targetWeightKg ? data.targetWeightKg.toFixed(1) : 'Not provided',

        // Step 3: Personal Info
        'Date of Birth': `${data.dobDay}/${data.dobMonth}/${data.dobYear}`,
        'Age': data.age,
        'Sex': data.sex,
        'Ethnicity': formatEthnicity(data.ethnicity),

        // Step 5: Medical Conditions
        'Medical Conditions': formatConditions(data.conditions),

        // Step 6: Safety Screening
        'Eating Disorder': data.eatingDisorder || 'Not answered',
        'Eating Disorder Details': data.eatingDisorderDetails || 'N/A',
        'Kidney Disease': data.kidneyDisease || 'Not answered',
        'Kidney Disease Details': data.kidneyDiseaseDetails || 'N/A',
        'Pregnant/Breastfeeding/Trying': data.pregnantOrTrying || 'Not answered',
        'Pregnancy Details': data.pregnantOrTryingDetails || 'N/A',
        'Other Conditions': data.otherConditions || 'None listed',
        'Current Medications': data.medications || 'None listed',
        'Allergies': data.allergies || 'None listed',

        // Step 7: Medical History
        'Medical History': formatCheckboxList(data.medicalHistory, medicalHistoryLabels),
        'Thyroid or Liver Disease': data.thyroidOrLiver || 'Not answered',
        'Diabetes - Using Insulin': data.diabetesInsulin || 'Not answered',
        'Diabetes - Other Meds': data.diabetesOtherMeds || 'Not answered',
        'Gallbladder Issues': formatCheckboxList(data.gallbladderIssues, gallbladderLabels),
        'Additional Health Conditions': formatCheckboxList(data.additionalHistory, additionalHistoryLabels),

        // Step 8: Medications & Lifestyle
        'Specific Medications': formatCheckboxList(data.specificMedications, specificMedicationLabels),
        'Smoker': data.isSmoker || 'Not answered',
        'Recent Injectable Weight Loss': data.recentInjectableWeightLoss || 'Not answered',

        // Step 9: Contraception
        'Contraception Agreement': data.sex === 'female' ? (data.contraceptionAgreement || 'Not answered') : 'N/A',

        // Consent
        'Important Info Confirmed': data.importantInfoConfirmed ? 'Yes' : 'No',
        'Terms Agreement': data.termsAgreement ? 'Yes' : 'No',
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
        'pancreatitis': 'Pancreatitis (current or history)',
        'prediabetes': 'Prediabetes',
        'type1diabetes': 'Type 1 Diabetes',
        'highcholesterol': 'High Cholesterol',
        'previousstroke': 'Previous Stroke',
        'sleepapnoea': 'Obstructive Sleep Apnoea',
        'acidreflux': 'Acid Reflux or GORD',
        'masld': 'MASLD (Metabolic Dysfunction-Associated Steatotic Liver Disease)',
        'osteoarthritis': 'Osteoarthritis',
        'depression': 'Depression (on regular medication)',
        'pcos': 'Polycystic Ovary Syndrome (PCOS)'
    };

    return conditions
        .filter(c => c !== 'none')
        .map(c => conditionLabels[c] || c)
        .join(', ');
}

/* =============================================
   Format Weight Loss Reason
   ============================================= */
function formatWeightLossReason(value) {
    const labels = {
        'health': 'Improve my long-term health',
        'confidence': 'Feel more confident in my body',
        'energy': 'Feel stronger, more energised, and rested',
        'mobility': 'Improve my mobility and reduce pain',
        'exercise': 'Make it easier to move around and exercise',
        'healthissues': 'Address specific health issues',
        'mentalwellbeing': 'Improve my mental wellbeing',
        'other': 'Other'
    };
    return labels[value] || value || 'Not selected';
}

/* =============================================
   Format Weight Loss Goal
   ============================================= */
function formatWeightLossGoal(value) {
    const labels = {
        'upto1stone': 'Up to 1 stone (approx. 6.5 kg)',
        '1to3.5stone': '1 to 3.5 stone (approx. 6.5 to 22 kg)',
        'morethan3.5stone': 'More than 3.5 stone (approx. 22 kg)',
        'notsure': 'Not sure, just want to lose some weight'
    };
    return labels[value] || value || 'Not selected';
}

/* =============================================
   Format Ethnicity
   ============================================= */
function formatEthnicity(value) {
    const labels = {
        'prefernottosay': 'Prefer not to say',
        'asian': 'Asian or Asian British',
        'black': 'Black, Black British, Caribbean, African',
        'middleeastern': 'Middle Eastern',
        'white': 'White',
        'noneofabove': 'None of the above'
    };
    return labels[value] || value || 'Not selected';
}

/* =============================================
   Checkbox List Label Maps
   ============================================= */
const medicalHistoryLabels = {
    'weightlosssurgery': 'Weight loss procedures/surgery in last 12 months',
    'thyroidcancer': 'Medullary thyroid cancer or MEN2 syndrome history',
    'activecancer': 'Cancer currently being treated',
    'retinopathy': 'Active retinopathy',
    'none_history': 'None of the above'
};

const gallbladderLabels = {
    'gallstones': 'Gallstones (not removed)',
    'blockedbile': 'Blocked bile flow (cholelithiasis)',
    'gallbladderinfection': 'Gallbladder infection (cholecystitis)',
    'gallbladdersurgery': 'Gallbladder surgery in past 12 months',
    'none_gallbladder': 'None of the above'
};

const additionalHistoryLabels = {
    'chronickidney': 'Chronic kidney disease (eGFR < 30ml/min)',
    'severegiissue': 'Severe gastrointestinal disease / IBD / gastroparesis',
    'malabsorption': 'Chronic malabsorption syndrome',
    'livercirrhosis': 'Liver cirrhosis or transplant',
    'endocrinedisorder': 'Endocrine (hormone) disorder',
    'alcoholrehab': 'Treatment/rehabilitation for excessive alcohol use',
    'cognitiveimpairment': 'Cognitive or memory impairment',
    'none_additional': 'None of the above'
};

const specificMedicationLabels = {
    'amiodarone': 'Amiodarone', 'carbamazepine': 'Carbamazepine',
    'ciclosporin': 'Ciclosporin', 'clozapine': 'Clozapine',
    'digoxin': 'Digoxin', 'fenfluramine': 'Fenfluramine',
    'lithium': 'Lithium', 'mycophenolate': 'Mycophenolate mofetil',
    'methotrexate': 'Oral methotrexate', 'phenobarbital': 'Phenobarbital',
    'phenytoin': 'Phenytoin', 'somatrogon': 'Somatrogon',
    'tacrolimus': 'Tacrolimus', 'theophylline': 'Theophylline',
    'warfarin': 'Warfarin', 'none_meds': 'None of the above'
};

/* =============================================
   Format Checkbox List
   ============================================= */
function formatCheckboxList(values, labels) {
    if (!values || values.length === 0) return 'None selected';
    return values.map(v => labels[v] || v).join(', ');
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

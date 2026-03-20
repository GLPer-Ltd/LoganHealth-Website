/* =============================================
   Logan Health - Form Handler (Worker API)
   ============================================= */

const WORKER_URL = 'https://loganhealth-payments.misty-heart-ac54.workers.dev';

/* =============================================
   Submit Questionnaire to Worker
   ============================================= */
function submitQuestionnaire() {
    const data = window.questionnaireState.data;
    const eligible = window.questionnaireState.eligible;
    const eligibilityReason = window.questionnaireState.eligibilityReason;

    // Format the data for the Worker email endpoint
    const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        contactMethod: data.contactMethod,

        eligible: eligible,
        eligibilityReason: eligibilityReason || 'Meets all criteria',

        weightLossReason: formatWeightLossReason(data.weightLossReason),
        weightLossGoal: formatWeightLossGoal(data.weightLossGoal),

        bmi: data.bmi ? data.bmi.toFixed(1) : null,
        heightCm: data.heightCm ? data.heightCm.toFixed(1) : null,
        weightKg: data.weightKg ? data.weightKg.toFixed(1) : null,
        highestWeightKg: data.highestWeightKg ? data.highestWeightKg.toFixed(1) : null,
        targetWeightKg: data.targetWeightKg ? data.targetWeightKg.toFixed(1) : null,

        dob: `${data.dobDay}/${data.dobMonth}/${data.dobYear}`,
        age: data.age,
        sex: data.sex,
        ethnicity: formatEthnicity(data.ethnicity),

        conditions: formatConditions(data.conditions),

        eatingDisorder: data.eatingDisorder || 'Not answered',
        eatingDisorderDetails: data.eatingDisorderDetails || '',
        kidneyDisease: data.kidneyDisease || 'Not answered',
        kidneyDiseaseDetails: data.kidneyDiseaseDetails || '',
        pregnantOrTrying: data.pregnantOrTrying || 'Not answered',
        pregnantOrTryingDetails: data.pregnantOrTryingDetails || '',
        otherConditions: data.otherConditions || 'None listed',
        medications: data.medications || 'None listed',
        allergies: data.allergies || 'None listed',

        medicalHistory: formatCheckboxList(data.medicalHistory, medicalHistoryLabels),
        thyroidOrLiver: data.thyroidOrLiver || 'Not answered',
        diabetesInsulin: data.diabetesInsulin || 'Not answered',
        diabetesOtherMeds: data.diabetesOtherMeds || 'Not answered',
        gallbladderIssues: formatCheckboxList(data.gallbladderIssues, gallbladderLabels),
        additionalHistory: formatCheckboxList(data.additionalHistory, additionalHistoryLabels),

        specificMedications: formatCheckboxList(data.specificMedications, specificMedicationLabels),
        isSmoker: data.isSmoker || 'Not answered',
        recentInjectableWeightLoss: data.recentInjectableWeightLoss || 'Not answered',

        contraceptionAgreement: data.sex === 'female' ? (data.contraceptionAgreement || 'Not answered') : 'N/A',

        importantInfoConfirmed: data.importantInfoConfirmed ? true : false,
        termsAgreement: data.termsAgreement ? true : false,
        consent: data.consent ? true : false,
        marketing: data.marketing ? true : false,

        submittedAt: new Date().toLocaleString('en-GB', {
            dateStyle: 'full',
            timeStyle: 'short'
        }),
    };

    fetch(`${WORKER_URL}/api/submit-questionnaire`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            console.log('Questionnaire submitted successfully');
        } else {
            console.error('Questionnaire submission failed');
        }
    })
    .catch(error => {
        console.error('Questionnaire submission error:', error);
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
window.submitQuestionnaire = submitQuestionnaire;
// Keep backward compat in case questionnaire.js still calls old name
window.submitToFormspree = submitQuestionnaire;
window.formBackup = {
    save: backupFormData,
    clear: clearBackup,
    get: getBackup
};

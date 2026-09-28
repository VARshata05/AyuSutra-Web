// AyuSutra i18n - Multi-language Support
// Languages: en, hi, kn, mr, gu, ta, te, ml, bn

const I18N = {
  en: {
    langNameNative: 'English',
    // Auth
    authSignIn: 'Sign In',
    authCreateAccount: 'Create Account',
    authEmail: 'Email Address',
    authPass: 'Password',
    authName: 'Full Name',
    authBlood: 'Blood Group',
    authNoAccount: 'No account?',
    authCreateOne: 'Create one free',
    authHaveAccount: 'Already have an account?',
    authSignInText: 'Sign In',
    authCreateAccountBtn: 'Create Account →',

    // Nav
    navHome: 'Home',
    navHospitals: 'Hospitals',
    navSymptoms: 'Symptoms',
    navChat: 'Chat',
    navHistory: 'Records',
    navDashboard: 'Dashboard',
    navLogout: 'Sign Out',

    // Hero
    heroHeadline: 'Healthcare, closer than you think.',
    heroTitle: 'AyuSutra — Lifespan, Guided',
    heroSub: 'Find hospitals, check symptoms, and get AI health guidance',
    symTileSub: 'AI scoring + specialist mapping',
    hospTileSub: 'Find nearby clinics and centers',
    chatTileSub: 'AI report analysis & guidance',
    histTileSub: 'Securely store your medical files',
    heroLocBtn: '📍 Use My Location',
    heroLocDetecting: '📍 Detecting…',

    // Hospitals
    hospTitle: 'Nearby Hospitals',
    hospSearch: 'Search hospitals…',
    hospNoResults: 'No hospitals found',
    hospTryAgain: 'Try different search terms or district',
    hospDirections: '🗺 Directions',
    hospCall: '📞 Call',
    hospLoadMore: 'Load More',
    hospLiveSearch: '🔴 Live Search',

    // Symptoms
    symTitle: 'Symptom Checker',
    symPlaceholder: 'Type a symptom (e.g. fever, headache)…',
    symAnalyze: 'Analyze Symptoms',
    symClear: 'Clear All',
    symDuration: 'Duration',
    symPain: 'Pain Level',
    symFrequency: 'Frequency',
    symImpact: 'Daily Impact',
    symSeverity: 'Severity Score',
    symConditions: 'Possible Conditions',
    symSpecialists: 'Recommended Specialists',
    symAiAnalysis: 'AI Differential Analysis',
    symNearbyHosp: 'Nearby Hospitals for You',

    // Chat
    chatTitle: 'Health Assistant',
    chatWelcome: '👋 Namaste! I\'m the AyuSutra assistant. I can help with symptoms, reports, and finding hospitals.',
    chatPlaceholder: 'Ask a health question…',
    chatSend: 'Send',
    chatVoice: '🎤',
    chatUpload: '📎',
    chatCamera: '📸',
    chatListening: 'Listening…',
    chatThinking: 'Thinking…',

    // History
    histTitle: 'Medical Records',
    histNew: 'New Medical Record',
    histType: 'Type',
    histDate: 'Date',
    histDoctor: 'Doctor Name',
    histNotes: 'Diagnosis / Notes',
    histAttach: '📎 Attachment:',
    histSave: 'Save Record',
    histCancel: 'Cancel',
    histAdd: '+ Add Record',
    histEmpty: 'No records yet',
    histEmptySub: 'Upload a file or add a record above.',
    histAiSummary: '🤖 AI Summary',
    histDelete: '🗑 Delete',

    // Blood Bank
    bloodTitle: 'Blood Bank Finder',
    bloodCallConfirm: '📞 Call to confirm availability before visiting',
    bloodCallBank: '📞 Call Bank',
    bloodHelpline: '📞 1910 Helpline',
    bloodWarning: 'Blood availability changes every hour. Always call ahead.',

    // Diagnostics
    diagTitle: 'Diagnostic Centres',
    diagSearch: 'Search tests (e.g. MRI, CBC)…',
    diagNearMe: '📍 Near Me',

    // Language
    langLabel: 'Language',
    langEn: 'English',
    langHi: '\u0939\u093F\u0902\u0926\u0940',
    langKn: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1',
    langMr: '\u092E\u0930\u093E\u0920\u0940',
    langGu: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0',
    langTa: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD',
    langTe: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41',
    langMl: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02',
    langBn: '\u09AC\u09BE\u0982\u09B2\u09BE',

    // Voice
    voiceListen: '🔊 Listen',
    voiceStop: '🔇 Stop',

    // Dashboard
    dashTitle: 'Patient Dashboard',
    dashHealthProfile: 'Health Profile',
    dashStats: 'Health Statistics',
    dashTotalRec: 'Total Records:',
    dashLastSym: 'Last Symptom Check:',
    dashAiInsights: 'AI Insights:',
    dashEnabled: 'Enabled',
    dashUpdateBtn: 'Update Profile →',
    dashMedicalNotes: 'Medical History/Notes',
    dashAllergies: 'Allergies',
    dashAge: 'Date of Birth',
    dashSuccess: 'Profile updated successfully!',

    // Common
    disclaimer: 'AI-assisted guidance only. Not a medical diagnosis. Always consult a licensed doctor.',
    emergencyMsg: 'For emergencies, call 112 immediately.',
    
    // Errors
    errGeoNotSupported: 'Geolocation not supported.',
    errUpdateFailed: 'Update failed',
    errNetwork: 'Network error',
    errEnableLocation: 'Please enable location first.',
    errEnterSymptom: 'Please enter at least one symptom.',
    errFillFields: 'Please fill all required fields.',
    errSaveRecord: 'Failed to save record',
    errVoiceNotSupported: 'Voice recognition not supported.',
    errCameraDenied: 'Camera access denied.',

    // Additional UI
    heroEyebrow: '👋 Ayu (आयुष) - Lifespan in Sanskrit',
    hospSubtitle: 'Live results via Google Maps + Verified Database',
    hospLocTitle: 'Enable Location for Best Results',
    hospLocSub: 'Share your location to find hospitals near you',
    histDrop: 'Drop PDF or Image here',
    histUploadSub: 'Or click to upload a prescription / lab report (PDF, JPG, PNG)',

    // Status
    locActive: '✅ Location Active',
    locFound: '✅ Location found',
    locDefault: '📍 Using Bengaluru (default)',
    chatSummarizing: 'Summarizing...',
    errGeneral: 'Sorry, I encountered an error. Please try again.',

    // Hospital Cards
    hospOpen: '🟢 Open Now',
    hospClosed: '🔴 Closed',
    hospGovtDb: 'Govt DB',
    hospMaps: 'Maps',
    hospSpecialities: 'Specialities',
    hospViewOnMaps: 'View on Maps',

    // Symptoms
    symAiAnalyzing: 'AI is performing deep differential analysis…',
    symNoMatch: 'Unable to identify — consult a General Physician',
    symFirstContact: 'Best first point of contact',

    // Misc
    authOr: '- or -',
    authSelectBlood: 'Select blood group',
    hospAllSpecs: 'All Specialities',
    hospAllSchemes: 'All Schemes',
    symYourSymptoms: 'Your Symptoms',
    symCommon: 'Common:',
    symSeverityFactors: 'Symptom Severity Factors',
    symScoreBreakdown: 'Severity Score Breakdown',
    symDoctorGuide: 'Doctor Specialization Guide',
  },

  hi: {
    langNameNative: '\u0939\u093F\u0902\u0926\u0940',
    authSignIn: 'साइन इन करें', authCreateAccount: 'खाता बनाएं', authEmail: 'ईमेल पता', authPass: 'पासवर्ड', authName: 'पूरा नाम', authBlood: 'रक्त समूह',
    authNoAccount: 'कोई खाता नहीं?', authCreateOne: 'मुफ़्त में बनाएं', authHaveAccount: 'क्या पहले से खाता है?', authSignInText: 'साइन इन करें', authCreateAccountBtn: 'खाता बनाएं →',
    navHome: 'होम', navHospitals: 'अस्पताल', navSymptoms: 'लक्षण', navChat: 'चैट', navHistory: 'रिकॉर्ड', navDashboard: 'डैशबोर्ड', navLogout: 'साइन आउट',
    heroHeadline: 'स्वास्थ्य सेवा, आपके करीब।', heroTitle: 'आयुसूत्र — जीवन, मार्गदर्शित', heroSub: 'अस्पताल खोजें, लक्षण जांचें, और AI स्वास्थ्य मार्गदर्शन पाएं',
    heroLocBtn: '📍 मेरा स्थान उपयोग करें', heroLocDetecting: '📍 ढूंढ रहे हैं…',
    hospTitle: 'नज़दीकी अस्पताल', hospSearch: 'अस्पताल खोजें…', hospNoResults: 'कोई अस्पताल नहीं मिला', hospTryAgain: 'अलग शब्द या ज़िला आज़माएं',
    hospDirections: '🗺 रास्ता', hospCall: '📞 कॉल करें', hospLoadMore: 'और दिखाएं', hospLiveSearch: '🔴 लाइव खोज',
    symTitle: 'लक्षण जांच', symPlaceholder: 'लक्षण लिखें (जैसे बुखार, सिरदर्द)…', symAnalyze: 'लक्षण जांचें', symClear: 'सब हटाएं',
    symDuration: 'अवधि', symPain: 'दर्द का स्तर', symFrequency: 'कितनी बार', symImpact: 'दैनिक प्रभाव',
    symSeverity: 'गंभीरता स्कोर', symConditions: 'संभावित स्थितियां', symSpecialists: 'सुझाए गए विशेषज्ञ',
    symAiAnalysis: 'AI विश्लेषण', symNearbyHosp: 'आपके लिए नज़दीकी अस्पताल',
    chatTitle: 'स्वास्थ्य सहायक', chatPlaceholder: 'स्वास्थ्य सवाल पूछें…', chatSend: 'भेजें', chatVoice: '🎤', chatUpload: '📎', chatCamera: '📸',
    chatListening: 'सुन रहे हैं…', chatThinking: 'सोच रहे हैं…',
    histTitle: 'चिकित्सा रिकॉर्ड', histAdd: '+ रिकॉर्ड जोड़ें', histEmpty: 'अभी कोई रिकॉर्ड नहीं', histEmptySub: 'फ़ाइल अपलोड करें या ऊपर रिकॉर्ड जोड़ें।',
    histAiSummary: '🤖 AI सारांश', histDelete: '🗑 हटाएं',
    bloodTitle: 'ब्लड बैंक खोजें', bloodCallConfirm: '📞 जाने से पहले उपलब्धता की पुष्टि करें', bloodCallBank: '📞 बैंक को कॉल करें', bloodHelpline: '📞 1910 हेल्पलाइन',
    bloodWarning: 'रक्त उपलब्धता हर घंटे बदलती है। हमेशा पहले कॉल करें।',
    diagTitle: 'डायग्नोस्टिक केंद्र', diagSearch: 'टेस्ट खोजें (जैसे MRI, CBC)…', diagNearMe: '📍 मेरे पास',
    langLabel: 'भाषा', voiceListen: '🔊 सुनें', voiceStop: '🔇 रोकें',
    dashTitle: 'पेशेंट डैशबोर्ड', dashHealthProfile: 'स्वास्थ्य प्रोफाइल', dashUpdateBtn: 'प्रोफाइल अपडेट करें →',
    dashMedicalNotes: 'चिकित्सा इतिहास / नोट्स', dashAllergies: 'एलर्जी', dashAge: 'जन्म तिथि', dashSuccess: 'प्रोफाइल सफलतापूर्वक अपडेट हो गया!',
    disclaimer: 'AI-सहायित मार्गदर्शन। चिकित्सा निदान नहीं। हमेशा डॉक्टर से सलाह लें।',
    emergencyMsg: 'आपातकाल में, तुरंत 112 पर कॉल करें।',

    errGeoNotSupported: 'जियोलोकेशन समर्थित नहीं है।',
    errUpdateFailed: 'अपडेट विफल रहा',
    errNetwork: 'नेटवर्क त्रुटि',
    errEnableLocation: 'कृपया पहले स्थान सक्षम करें।',
    errEnterSymptom: 'कृपया कम से कम एक लक्षण दर्ज करें।',
    errFillFields: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    errSaveRecord: 'रिकॉर्ड सहेजने में विफल',
    errVoiceNotSupported: 'आवाज पहचान समर्थित नहीं है।',
    errCameraDenied: 'कैमरा एक्सेस नहीं मिला।',

    hospOpen: '🟢 अभी खुला है',
    hospClosed: '🔴 बंद है',
    hospGovtDb: 'सरकारी डेटाबेस',
    hospMaps: 'मैप्स',
    hospSpecialities: 'विशेषज्ञता',
    hospViewOnMaps: 'मैप्स पर देखें',
    symAiAnalyzing: 'AI गहन विश्लेषण कर रहा है…',
    symNoMatch: 'पहचानने में असमर्थ — सामान्य चिकित्सक से परामर्श लें',
    symFirstContact: 'संपर्क का सबसे अच्छा पहला बिंदु',
  },

  kn: {
    langNameNative: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1',
    authSignIn: 'ಸೈನ್ ಇನ್', authCreateAccount: 'ಖಾತೆ ಸೃಜಿಸಿ', authEmail: 'ಇಮೇಲ್ ವಿಳಾಸ', authPass: 'ಗುಪ್ತಪದ', authName: 'ಪೂರ್ಣ ಹೆಸರು', authBlood: 'ರಕ್ತದ ಗುಂಪು',
    authNoAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?', authCreateOne: 'ಉಚಿತವಾಗಿ ರಚಿಸಿ', authHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?', authSignInText: 'ಸೈನ್ ಇನ್', authCreateAccountBtn: 'ಖಾತೆ ತೆರೆಯಿರಿ →',
    navHome: 'ಮುಖಪುಟ', navHospitals: 'ಆಸ್ಪತ್ರೆಗಳು', navSymptoms: 'ಲಕ್ಷಣಗಳು', navChat: 'ಚಾಟ್', navHistory: 'ದಾಖಲೆಗಳು', navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', navLogout: 'ಸೈನ್ ಔಟ್',
    heroHeadline: 'ಆರೋಗ್ಯ ಸೇವೆ, ನಿಮ್ಮ ಹತ್ತಿರ.', heroTitle: 'ಆಯುಸೂತ್ರ — ಜೀವಿತಾವಧಿ, ಮಾರ್ಗದರ್ಶಿ', heroSub: 'ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ, ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, AI ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
    heroLocBtn: '📍 ನನ್ನ ಸ್ಥಳ ಬಳಸಿ', heroLocDetecting: '📍 ಹುಡುಕುತ್ತಿದ್ದೇವೆ…',
    hospTitle: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು', hospSearch: 'ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ…', hospNoResults: 'ಯಾವುದೇ ಆಸ್ಪತ್ರೆ ಸಿಗಲಿಲ್ಲ', hospTryAgain: 'ಬೇರೆ ಪದಗಳನ್ನು ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಪ್ರಯತ್ನಿಸಿ',
    hospDirections: '🗺 ದಿಕ್ಕು', hospCall: '📞 ಕರೆ ಮಾಡಿ', hospLoadMore: 'ಇನ್ನಷ್ಟು ತೋರಿಸಿ', hospLiveSearch: '🔴 ನೇರ ಹುಡುಕಾಟ',
    symTitle: 'ಲಕ್ಷಣ ಪರಿಶೀಲಕ', symPlaceholder: 'ಲಕ್ಷಣ ಟೈಪ್ ಮಾಡಿ…', symAnalyze: 'ಲಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಿ', symClear: 'ಎಲ್ಲಾ ತೆಗೆಯಿರಿ',
    symDuration: 'ಅವಧಿ', symPain: 'ನೋವಿನ ಮಟ್ಟ', symFrequency: 'ಆವರ್ತನ', symImpact: 'ದೈನಂದಿನ ಪರಿಣಾಮ',
    symSeverity: 'ತೀವ್ರತೆ ಸ್ಕೋರ್', symConditions: 'ಸಂಭಾವ್ಯ ಸ್ಥಿತಿಗಳು', symSpecialists: 'ತಜ್ಞರು',
    symAiAnalysis: 'AI ವಿಶ್ಲೇಷಣೆ', symNearbyHosp: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು',
    chatTitle: 'ಆರೋಗ್ಯ ಸಹಾಯಕ', chatWelcome: '👋 ನಮಸ್ಕಾರ! ನಾನು ಆಯುಸೂತ್ರ ಸಹಾಯಕ.', chatPlaceholder: 'ಆರೋಗ್ಯ ಪ್ರಶ್ನೆ ಕೇಳಿ…', chatSend: 'ಕಳುಹಿಸಿ',
    chatListening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ…', chatThinking: 'ಯೋಚಿಸುತ್ತಿದ್ದೇವೆ…',
    histTitle: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು', histAdd: '+ ದಾಖಲೆ ಸೇರಿಸಿ', histEmpty: 'ದಾಖಲೆಗಳಿಲ್ಲ', histAiSummary: '🤖 AI ಸಾರಾಂಶ', histDelete: '🗑 ಅಳಿಸಿ',
    bloodTitle: 'ರಕ್ತ ಬ್ಯಾಂಕ್', bloodCallConfirm: 'ಲಭ್ಯತೆಯನ್ನು ದೃಢೀಕರಿಸಿ', bloodCallBank: '📞 ಕರೆ ಮಾಡಿ', bloodHelpline: '📞 1910',
    bloodWarning: 'ರಕ್ತ ಲಭ್ಯತೆ ಪ್ರತಿ ಗಂಟೆ ಬದಲಾಗುತ್ತದೆ.',
    diagTitle: 'ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಕೇಂದ್ರಗಳು', diagSearch: 'ಪರೀಕ್ಷೆಗಳನ್ನು ಹುಡುಕಿ…', diagNearMe: '📍 ಹತ್ತಿರ',
    langLabel: 'ಭಾಷೆ', voiceListen: '🔊 ಕೇಳಿ', voiceStop: '🔇 ನಿಲ್ಲಿಸಿ',
    dashTitle: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', dashHealthProfile: 'ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್', dashUpdateBtn: 'ನವೀಕರಿಸಿ →',
    dashSuccess: 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ!', disclaimer: 'AI ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ.', emergencyMsg: 'ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 112 ಕರೆ ಮಾಡಿ.',

    hospOpen: '🟢 ಈಗ ತೆರೆದಿದೆ',
    hospClosed: '🔴 ಮುಚ್ಚಲಾಗಿದೆ',
    hospGovtDb: 'ಸರ್ಕಾರಿ ಡೇಟಾಬೇಸ್',
    hospMaps: 'ಮ್ಯಾಪ್‌ಗಳು',
    hospSpecialities: 'ವಿಶೇಷತೆಗಳು',
    hospViewOnMaps: 'ಮ್ಯಾಪ್‌ನಲ್ಲಿ ನೋಡಿ',
    symAiAnalyzing: 'AI ವಿಶ್ಲೇಷಣೆ ನಡೆಸುತ್ತಿದೆ…',
    symNoMatch: 'ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ — ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
    symFirstContact: 'ಸಂಪರ್ಕದ ಮೊದಲ ಹಂತ',
  },

  mr: { // Marathi
    langNameNative: '\u092E\u0930\u093E\u0920\u0940',
    authSignIn: 'साइन इन करा', authCreateAccount: 'खाते तयार करा', authEmail: 'ईमेल पत्ता', authPass: 'पासवर्ड', authName: 'पूर्ण नाव', authBlood: 'रक्त गट',
    authNoAccount: 'खाते नाही?', authCreateOne: 'एक विनामूल्य तयार करा', authHaveAccount: 'आधीच खाते आहे का?', authSignInText: 'साइन इन करा', authCreateAccountBtn: 'खाते तयार करा →',
    navHome: 'होम', navHospitals: 'रुग्णालये', navSymptoms: 'लक्षणे', navChat: 'चॅट', navHistory: 'रेकॉर्ड', navDashboard: 'डॅशबोर्ड', navLogout: 'साइन आउट',
    heroHeadline: 'आरोग्य सेवा, तुमच्या जवळ.', heroTitle: 'आयुसूत्र — जीवन, मार्गदर्शित', heroSub: 'रुग्णालये शोधा, लक्षणे तपासा आणि AI आरोग्य मार्गदर्शन मिळवा',
    heroLocBtn: '📍 माझे स्थान वापरा', heroLocDetecting: '📍 शोधत आहे…',
    hospTitle: 'जवळपासची रुग्णालये', hospSearch: 'रुग्णालये शोधा…', hospNoResults: 'कोणतेही रुग्णालय आढळले नाही', hospTryAgain: 'वेगळे शब्द किंवा जिल्हा वापरून पहा',
    hospDirections: '🗺 दिशा', hospCall: '📞 कॉल करा', hospLoadMore: 'आणखी पहा', hospLiveSearch: '🔴 लाइव्ह शोध',
    symTitle: 'लक्षणे तपासा', symPlaceholder: 'लक्षणे टाइप करा…', symAnalyze: 'विश्लेषण करा', symClear: 'सर्व हटवा',
    symSeverity: 'गंभीरता धावसंख्या', symAiAnalysis: 'AI विश्लेषण', symNearbyHosp: 'जवळपासची रुग्णालये',
    chatTitle: 'आरोग्य सहाय्यक', chatWelcome: '👋 नमस्ते! मी आयुसूत्र सहाय्यक आहे.', chatPlaceholder: 'प्रश्न विचारा…', chatSend: 'पाठवा',
    chatListening: 'ऐकत आहे…', chatThinking: 'विचार करत आहे…',
    histTitle: 'वैद्यकीय रेकॉर्ड', histAdd: '+ रेकॉर्ड जोडा', histEmpty: 'रेकॉर्ड नाही', histAiSummary: '🤖 AI सारांश', histDelete: '🗑 हटवा',
    bloodTitle: 'ब्लड बँक शोधा', bloodCallConfirm: 'उपलब्धतेची खात्री करा', bloodCallBank: '📞 कॉल करा', bloodHelpline: '📞 १९१०',
    bloodWarning: 'रक्ताची उपलब्धता दर तासाला बदलत असते.',
    diagTitle: 'निदान केंद्रे', diagSearch: 'चाचण्या शोधा…', diagNearMe: '📍 जवळ',
    langLabel: 'भाषा', voiceListen: '🔊 ऐका', voiceStop: '🔇 थांबा',
    dashTitle: 'डॅशबोर्ड', dashHealthProfile: 'आरोग्‍य प्रोफाइल', dashUpdateBtn: 'अपडेट करा →',
    dashSuccess: 'प्रोफाइल अपडेट झाले!', disclaimer: 'AI-सहाय्यित मार्गदर्शन.', emergencyMsg: 'आणीबाणीसाठी ११२ वर कॉल करा.',
    hospOpen: '🟢 आता उघडे आहे', hospClosed: '🔴 बंद आहे', hospGovtDb: 'सरकारी डेटाबेस', hospMaps: 'मॅप्स',
    hospSpecialities: 'तज्ञता', hospViewOnMaps: 'मॅपवर पहा', symAiAnalyzing: 'AI सखोल विश्लेषण करत आहे…',
    symNoMatch: 'ओळखण्यात अक्षम — डॉक्टरांचा सल्ला घ्या', symFirstContact: 'संपर्काचा सर्वोत्तम बिंदू',
  },

  gu: { // Gujarati
    langNameNative: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0',
    authSignIn: 'સાઇન ઇન', authCreateAccount: 'ખાતું બનાવો', authEmail: 'ઇમેઇલ', authPass: 'પાસવર્ડ', authName: 'પૂરું નામ', authBlood: 'બ્લડ ગ્રુપ',
    authNoAccount: 'ખાતું નથી?', authCreateOne: 'મફત બનાવો', authHaveAccount: 'ખાતું છે?', authSignInText: 'સાઇન ઇન', authCreateAccountBtn: 'ખાતું બનાવો →',
    navHome: 'હોમ', navHospitals: 'હોસ્પિટલો', navSymptoms: 'લક્ષણો', navChat: 'ચેટ', navHistory: 'રેકોર્ડ્સ', navDashboard: 'ડેશબોર્ડ', navLogout: 'સાઇન આઉટ',
    heroHeadline: 'આરોગ્ય સેવા, તમારી નજીક.', heroTitle: 'આયુસૂત્ર — જીવન, માર્ગદર્શિત', heroSub: 'હોસ્પિટલો શોધો, લક્ષણો તપાસો અને AI માર્ગદર્શન મેળવો',
    heroLocBtn: '📍 મારું સ્થાન', heroLocDetecting: '📍 શોધી રહ્યા છીએ…',
    hospTitle: 'નજીકની હોસ્પિટલો', hospSearch: 'શોધો…', hospNoResults: 'મળી નથી', hospTryAgain: 'ફરી પ્રયાસ કરો',
    hospDirections: '🗺 દિશા', hospCall: '📞 કોલ', hospLoadMore: 'વધુ જુઓ', hospLiveSearch: '🔴 લાઇવ સર્ચ',
    symTitle: 'લક્ષણો તપાસો', symPlaceholder: 'લક્ષણ લખો…', symAnalyze: 'વિશ્લેષણ', symClear: 'બધું ભૂંસી નાખો',
    symSeverity: 'ગંભીરતા સ્કોર', symAiAnalysis: 'AI વિશ્લેષણ', symNearbyHosp: 'નજીકની હોસ્પિટલો',
    chatTitle: 'આરોગ્ય સહાયક', chatWelcome: '👋 નમસ્તે! હું આયુસૂત્ર સહાયક છું.', chatPlaceholder: 'પ્રશ્ન પૂછો…', chatSend: 'મોકલો',
    chatListening: 'સાંભળી રહ્યા છીએ…', chatThinking: 'વિચારી રહ્યા છીએ…',
    histTitle: 'મેડિકલ રેકોર્ડ્સ', histAdd: '+ રેકોર્ડ ઉમેરો', histEmpty: 'રેકોર્ડ નથી', histAiSummary: '🤖 AI સારાંશ', histDelete: '🗑 કાઢી નાખો',
    bloodTitle: 'બ્લડ બેંક', bloodCallConfirm: 'ઉપલબ્ધતા તપાસો', bloodCallBank: '📞 કોલ કરો', bloodHelpline: '📞 1910',
    bloodWarning: 'બ્લડની ઉપલબ્ધતા બદલાતી રહે છે.',
    diagTitle: 'નિદાન કેન્દ્રો', diagSearch: 'ટેસ્ટ શોધો…', diagNearMe: '📍 નજીક',
    langLabel: 'ભાષા', voiceListen: '🔊 સાંભળો', voiceStop: '🔇 થોભો',
    dashTitle: 'ડેશબોર્ડ', dashHealthProfile: 'પ્રોફાઇલ', dashUpdateBtn: 'અપડેટ →',
    dashSuccess: 'અપડેટ સફળ!', disclaimer: 'AI માર્ગદર્શન.', emergencyMsg: 'ઇમરજન્સી માટે 112.',
    hospOpen: '🟢 અત્યારે ખુલ્લું છે', hospClosed: '🔴 બંધ છે', hospGovtDb: 'સરકારી ડેટાબેઝ', hospMaps: 'મેપ્સ',
    hospSpecialities: 'નિષ્ણાતો', hospViewOnMaps: 'મેપ પર જુઓ', symAiAnalyzing: 'AI વિશ્લેષણ કરી રહ્યું છે…',
    symNoMatch: 'ઓળખવામાં અસમર્થ — ડૉક્ટરની સલાહ લો', symFirstContact: 'સંપર્ક માટે શ્રેષ્ઠ સ્થાન',
  },

  ta: { // Tamil
    langNameNative: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD',
    authSignIn: 'உள்நுழைக', authCreateAccount: 'கணக்கை உருவாக்கு', authEmail: 'மின்னஞ்சல்', authPass: 'கடவுச்சொல்', authName: 'முழு பெயர்', authBlood: 'இரத்த வகை',
    authNoAccount: 'கணக்கு இல்லையா?', authCreateOne: 'இலவசமாக உருவாக்கு', authHaveAccount: 'கணக்கு உள்ளதா?', authSignInText: 'உள்நுழைக', authCreateAccountBtn: 'உருவாக்கு →',
    navHome: 'முகப்பு', navHospitals: 'மருத்துவமனைகள்', navSymptoms: 'அறிகுறிகள்', navChat: 'சாட்', navHistory: 'பதிவுகள்', navDashboard: 'டாஷ்போர்டு', navLogout: 'வெளியேறு',
    heroHeadline: 'ஆரோக்கிய சேவை, உங்கள் அருகில்.', heroTitle: 'ஆயுசூத்ரா — ஆயுள், வழிகாட்டி', heroSub: 'மருத்துவமனைகளைக் கண்டறியவும், அறிகுறிகளைச் சரிபார்க்கவும்',
    heroLocBtn: '📍 எனது இருப்பிடம்', heroLocDetecting: '📍 தேடுகிறது…',
    hospTitle: 'அருகிலுள்ள மருத்துவமனைகள்', hospSearch: 'தேடுங்கள்…', hospNoResults: 'எதுவும் இல்லை', hospTryAgain: 'மீண்டும் முயலவும்',
    hospDirections: '🗺 திசை', hospCall: '📞 அழையுங்கள்', hospLoadMore: 'மேலும் பார்க்க', hospLiveSearch: '🔴 நேரடித் தேடல்',
    symTitle: 'அறிகுறிகள் சரிபார்ப்பு', symPlaceholder: 'அறிகுறிகள்…', symAnalyze: 'பகுப்பாய்வு', symClear: 'அனைத்தையும் நீக்கு',
    symSeverity: 'தீவிரத்தன்மை', symAiAnalysis: 'AI ஆய்வு', symNearbyHosp: 'அருகிலுள்ள மருத்துவமனைகள்',
    chatTitle: 'ஆரோக்கிய உதவியாளர்', chatWelcome: '👋 நமஸ்தே! நான் ஆயுசூத்ரா உதவியாளர்.', chatPlaceholder: 'கேள்வி கேட்கவும்…', chatSend: 'அனுப்பு',
    chatListening: 'கேட்கிறது…', chatThinking: 'யோசிக்கிறது…',
    histTitle: 'மருத்துவ பதிவுகள்', histAdd: '+ பதிவு செய்', histEmpty: 'பதிவுகள் இல்லை', histAiSummary: '🤖 AI சுருக்கம்', histDelete: '🗑 நீக்கு',
    bloodTitle: 'இரத்த வங்கி', bloodCallConfirm: 'இருப்பை உறுதி செய்யவும்', bloodCallBank: '📞 அழையுங்கள்', bloodHelpline: '📞 1910',
    bloodWarning: 'இரத்த இருப்பு மாறும்.',
    diagTitle: 'பரிசோதனை மையங்கள்', diagSearch: 'சோதனைகள்…', diagNearMe: '📍 அருகில்',
    langLabel: 'மொழி', voiceListen: '🔊 கேள்', voiceStop: '🔇 நிறுத்து',
    dashTitle: 'டாஷ்போர்டு', dashHealthProfile: 'சுயவிவரம்', dashUpdateBtn: 'மேம்படுத்து →',
    dashSuccess: 'புதுப்பிக்கப்பட்டது!', disclaimer: 'AI வழிகாட்டல்.', emergencyMsg: 'அவசரத்திற்கு 112.',
    hospOpen: '🟢 இப்போது திறந்துள்ளது', hospClosed: '🔴 மூடப்பட்டது', hospGovtDb: 'அரசு தரவுத்தளம்', hospMaps: 'மேப்ஸ்',
    hospSpecialities: 'சிறப்புப்பிரிவுகள்', hospViewOnMaps: 'மேப்பில் காண்க', symAiAnalyzing: 'AI ஆய்வு செய்கிறது…',
    symNoMatch: 'கண்டறிய முடியவில்லை — மருத்துவரை அணுகவும்', symFirstContact: 'சிறந்த முதல் தொடர்பு',
  },

  te: { // Telugu
    langNameNative: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41',
    authSignIn: 'సైన్ ఇన్', authCreateAccount: 'ఖాతాను సృష్టించండి', authEmail: 'ఈమెయిల్', authPass: 'పాస్‌వర్డ్', authName: 'పూర్తి పేరు', authBlood: 'రక్త రకం',
    authNoAccount: 'ఖాతా లేదా?', authCreateOne: 'ఉచితంగా సృష్టించండి', authHaveAccount: 'ఖాతా ఉందా?', authSignInText: 'సైన్ ఇన్', authCreateAccountBtn: 'సృష్టించండి →',
    navHome: 'హోమ్', navHospitals: 'ఆసుపత్రులు', navSymptoms: 'లక్షణాలు', navChat: 'చాట్', navHistory: 'రికార్డులు', navDashboard: 'డాష్‌బోర్డ్', navLogout: 'సైన్ అవుట్',
    heroHeadline: 'ఆరోగ్య సేవ, మీకు దగ్గరలో.', heroTitle: 'ఆయుసూత్ర — జీవితం, మార్గదర్శి', heroSub: 'ఆసుపత్రులను కనుగొనండి, లక్షణాలను తనిಖీ చేయండి',
    heroLocBtn: '📍 నా లోకేషన్', heroLocDetecting: '📍 వెతుకుతున్నాం…',
    hospTitle: 'దగ్గరలోని ఆసుపత్రులు', hospSearch: 'వెతకండి…', hospNoResults: 'ఏమీ లేవు', hospTryAgain: 'మళ్ళీ ప్రయత్నించండి',
    hospDirections: '🗺 దిశలు', hospCall: '📞 కాల్', hospLoadMore: 'ఇంకా చూడండి', hospLiveSearch: '🔴 లైవ్ సెర్చ్',
    symTitle: 'లక్షణాల తనిಖీ', symPlaceholder: 'లక్షణాలు…', symAnalyze: 'విశ్લેషించు', symClear: 'అన్నీ తొలగించు',
    symSeverity: 'తీవ్రత', symAiAnalysis: 'AI విశ్ಲೇషణ', symNearbyHosp: 'దగ్గరలోని ఆసుపత్రులు',
    chatTitle: 'ఆరోగ్య సహాయకుడు', chatWelcome: '👋 నమస్తే! నేను ఆయుసూత్ర సహాయకుడిని.', chatPlaceholder: 'ప్రశ్న అడగండి…', chatSend: 'పంపండి',
    chatListening: 'వింటున్నాం…', chatThinking: 'ఆలోచిస్తున్నాం…',
    histTitle: 'వైద్య రికార్డులు', histAdd: '+ రికార్డు జోడించు', histEmpty: 'రికార్డులు లేవు', histAiSummary: '🤖 AI సారాంశం', histDelete: '🗑 తొలగించు',
    bloodTitle: 'బ్లడ్ బ్యాంక్', bloodCallConfirm: 'లభ్యతను సరిచూసుకోండి', bloodCallBank: '📞 కాల్ చేయండి', bloodHelpline: '📞 1910',
    bloodWarning: 'రక్తం లభ్యత మారుతుంటుంది.',
    diagTitle: 'డయాగ్నస్టిక్ సెంటర్లు', diagSearch: 'పరీక్షలు…', diagNearMe: '📍 దగ్గరలో',
    langLabel: 'భాష', voiceListen: '🔊 వినండి', voiceStop: '🔇 ఆపండి',
    dashTitle: 'డాష్‌బోర్డ్', dashHealthProfile: 'ప్రొఫైల్', dashUpdateBtn: 'అప్‌డేట్ →',
    dashSuccess: 'అప్‌డేట్ అయింది!', disclaimer: 'AI మార్గదర్శకత్వం.', emergencyMsg: 'అత్యవసర సమయంలో 112.',
    hospOpen: '🟢 ఇప్పుడు తెరిచి ఉంది', hospClosed: '🔴 మూసివేయబడింది', hospGovtDb: 'ప్రభుత్వ డేటాబేస్', hospMaps: 'మ్యాప్స్',
    hospSpecialities: 'నిపుణులు', hospViewOnMaps: 'మ్యాప్‌లో చూడండి', symAiAnalyzing: 'AI విశ్લેషిస్తోంది…',
    symNoMatch: 'గుర్తించలేకపోయాము — వైద్యుడిని సంప్రదించండి', symFirstContact: 'సంప్రదించడానికి ఉత్తమ మార్గం',
  },

  ml: { // Malayalam
    langNameNative: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02',
    authSignIn: 'സൈൻ ഇൻ', authCreateAccount: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', authEmail: 'ഇമെയിൽ', authPass: 'പാസ്‌വേഡ്', authName: 'പൂർണ്ണനാമം', authBlood: 'രക്തഗ്രൂപ്പ്',
    authNoAccount: 'അക്കൗണ്ട് ഇല്ലേ?', authCreateOne: 'സൗജന്യമായി സൃഷ്ടിക്കൂ', authHaveAccount: 'അക്കൗണ്ട് ഉണ്ടോ?', authSignInText: 'സൈൻ ഇൻ', authCreateAccountBtn: 'സൃഷ്ടിക്കുക →',
    navHome: 'ഹോം', navHospitals: 'ആശുപത്രികൾ', navSymptoms: 'ലക്ഷണങ്ങൾ', navChat: 'ചാറ്റ്', navHistory: 'റെക്കോർഡുകൾ', navDashboard: 'ഡാഷ്‌ബോർഡ്', navLogout: 'സൈൻ ഔട്ട്',
    heroHeadline: 'ആരോഗ്യ സേവനം, നിങ്ങളുടെ അരികിൽ.', heroTitle: 'ആയുസൂത്ര — ആയുസ്സ്, വഴികാട്ടി', heroSub: 'ആശുപത്രികൾ കണ്ടെത്തുക, ലക്ഷണങ്ങൾ പരിശോധിക്കുക',
    heroLocBtn: '📍 എന്റെ ലൊക്കേഷൻ', heroLocDetecting: '📍 തിരയുന്നു…',
    hospTitle: 'അടുത്തുള്ള ആശുപത്രികൾ', hospSearch: 'തിരയുക…', hospNoResults: 'ലഭ്യമല്ല', hospTryAgain: 'വീണ്ടും ശ്രമിക്കുക',
    hospDirections: '🗺 ദിശകൾ', hospCall: '📞 വിളിക്കുക', hospLoadMore: 'കൂടുതൽ കാണുക', hospLiveSearch: '🔴 ലൈവ് സെർച്ച്',
    symTitle: 'ലക്ഷണ പരിശോധന', symPlaceholder: 'ലക്ഷണങ്ങൾ…', symAnalyze: 'പരിശോധിക്കുക', symClear: 'എല്ലാം മായ്ക്കുക',
    symSeverity: 'തീവ്രത', symAiAnalysis: 'AI വിശകലനം', symNearbyHosp: 'അടുത്തുള്ള ആശുപത്രികൾ',
    chatTitle: 'ആരോഗ്യ സഹായി', chatWelcome: '👋 നമസ്തേ! ഞാൻ ആയുസൂത്ര സഹായിയാണ്.', chatPlaceholder: 'ചോദിക്കൂ…', chatSend: 'അയക്കുക',
    chatListening: 'ശ്രദ്ധിക്കുന്നു…', chatThinking: 'ചിന്തിക്കുന്നു…',
    histTitle: 'മെഡിക്കൽ റെക്കോർഡുകൾ', histAdd: '+ റെക്കോർഡ് ചേർക്കൂ', histEmpty: 'റെക്കോർഡുകൾ ഇല്ല', histAiSummary: '🤖 AI സംഗ്രഹം', histDelete: '🗑 നീക്കം ചെയ്യുക',
    bloodTitle: 'ബ്ലഡ് ബാങ്ക്', bloodCallConfirm: 'ലഭ്യത ഉറപ്പാക്കുക', bloodCallBank: '📞 വിളിക്കുക', bloodHelpline: '📞 1910',
    bloodWarning: 'രക്തലഭ്യത മാറിക്കൊണ്ടിരിക്കും.',
    diagTitle: 'ഡയഗ്നോസ്റ്റിക് സെന്ററുകൾ', diagSearch: 'ടെസ്റ്റുകൾ…', diagNearMe: '📍 അടുത്ത്',
    langLabel: 'ഭാഷ', voiceListen: '🔊 കേൾക്കുക', voiceStop: '🔇 നിർത്തുക',
    dashTitle: 'ഡാഷ്‌ബോർഡ്', dashHealthProfile: 'പ്രൊഫൈൽ', dashUpdateBtn: 'അപ്‌ഡേറ്റ് →',
    dashSuccess: 'അപ്‌ഡേറ്റ് ചെയ്തു!', disclaimer: 'AI മാർഗ്ഗനിർദ്ദേശം.', emergencyMsg: 'അടിയന്തര സാഹചര്യത്തിൽ 112.',
    hospOpen: '🟢 ഇപ്പോൾ തുറന്നിരിക്കുന്നു', hospClosed: '🔴 അടച്ചു', hospGovtDb: 'ഗവ. ഡാറ്റാബേസ്', hospMaps: 'മാപ്‌സ്',
    hospSpecialities: 'സ്പെഷ്യാലിറ്റികൾ', hospViewOnMaps: 'മാപ്പിൽ കാണുക', symAiAnalyzing: 'AI പരിശോധിക്കുന്നു…',
    symNoMatch: 'തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല — ഡോക്ടറെ കാണുക', symFirstContact: 'ആദ്യമായി ബന്ധപ്പെടാൻ മികച്ച ഇടം',
  },

  bn: { // Bengali
    langNameNative: '\u09AC\u09BE\u0982\u09B2\u09BE',
    authSignIn: 'সাইন ইন', authCreateAccount: 'অ্যাকাউন্ট তৈরি করুন', authEmail: 'ইমেল', authPass: 'পাসওয়ার্ড', authName: 'নাম', authBlood: 'রক্তের গ্রুপ',
    authNoAccount: 'অ্যাকাউন্ট নেই?', authCreateOne: 'ফ্রি তৈরি করুন', authHaveAccount: 'অ্যাকাউন্ট আছে?', authSignInText: 'সাইন ইন', authCreateAccountBtn: 'তৈরি করুন →',
    navHome: 'হোম', navHospitals: 'হাসপাতাল', navSymptoms: 'লक्षण', navChat: 'চ্যাট', navHistory: 'রেকর্ড', navDashboard: 'ড্যাশবোর্ড', navLogout: 'সাইন আউট',
    heroHeadline: 'স্বাস্থ্য পরিষেবা, আপনার কাছে।', heroTitle: 'আয়ূসূত্র — জীবন, নির্দেশিত', heroSub: 'হাসপাতাল খুঁজুন, লক্ষণ পরীক্ষা করুন',
    heroLocBtn: '📍 আমার অবস্থান', heroLocDetecting: '📍 খুঁজছি…',
    hospTitle: 'নিকটবর্তী হাসপাতাল', hospSearch: 'খুঁজুন…', hospNoResults: 'পাওয়া যায়নি', hospTryAgain: 'আবার চেষ্টা করুন',
    hospDirections: '🗺 দিশা', hospCall: '📞 কল', hospLoadMore: 'আরো দেখুন', hospLiveSearch: '🔴 লাইভ সার্চ',
    symTitle: 'লক্ষণ পরীক্ষা', symPlaceholder: 'লক্ষণ লিখুন…', symAnalyze: 'বিশ্লেষণ', symClear: 'সব মুছুন',
    symSeverity: 'তীব্রতা', symAiAnalysis: 'AI বিশ্লেষণ', symNearbyHosp: 'নিকটবর্তী হাসপাতাল',
    chatTitle: 'স্বাস্থ্য সহায়ক', chatWelcome: '👋 নমস্তে! আমি আয়ূসূত্র সহায়ক।', chatPlaceholder: 'প্রশ্ন করুন…', chatSend: 'পাঠান',
    chatListening: 'শুনছি…', chatThinking: 'ভাবছি…',
    histTitle: 'মেডিক্যাল রেকর্ড', histAdd: '+ রেকর্ড যোগ করুন', histEmpty: 'রেকর্ড নেই', histAiSummary: '🤖 AI সারাংশ', histDelete: '🗑 মুছুন',
    bloodTitle: 'ব্লাড ব্যাঙ্ক', bloodCallConfirm: 'উপলব্ধতা যাচাই করুন', bloodCallBank: '📞 কল করুন', bloodHelpline: '📞 1910',
    bloodWarning: 'রক্তের প্রাপ্যতা পরিবর্তিত হয়।',
    diagTitle: 'ডায়াগনস্টিক সেন্টার', diagSearch: 'পরীক্ষা…', diagNearMe: '📍 কাছে',
    langLabel: 'ভাষা', voiceListen: '🔊 শুনুন', voiceStop: '🔇 থামুন',
    dashTitle: 'ড্যাশবোর্ড', dashHealthProfile: 'প্রোফাইল', dashUpdateBtn: 'আপডেট →',
    dashSuccess: 'আপডেট সফল!', disclaimer: 'AI নির্দেশিকা মাত্র।', emergencyMsg: 'জরুরি প্রয়োজনে 112.',
    hospOpen: '🟢 এখন খোলা', hospClosed: '🔴 বন্ধ', hospGovtDb: 'সরকারি ডেটাবেস', hospMaps: 'ম্যাপস',
    hospSpecialities: 'বিশেষজ্ঞগণ', hospViewOnMaps: 'ম্যাপে দেখুন', symAiAnalyzing: 'AI বিশ্লেষণ করছে…',
    symNoMatch: 'সনাক্ত করা যায়নি — ডাক্তারের পরামর্শ নিন', symFirstContact: 'যোগাযোগের সেরা মাধ্যম',
  }
};

// Current language state
let currentLang = 'en';

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  // Update all elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[currentLang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = I18N[currentLang][key];
      } else {
        el.innerHTML = I18N[currentLang][key];
      }
    }
  });
  // Update lang selector highlight
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  // Sync dropdowns
  const sAuth = document.getElementById('langSelectAuth'); if(sAuth) sAuth.value = lang;
  const sNav = document.getElementById('langSelectNav'); if(sNav) sNav.value = lang;
  
  // Update dropdown labels dynamically
  ['langSelectAuth', 'langSelectNav'].forEach(id => {
    const sel = document.getElementById(id);
    if(sel) {
      Array.from(sel.options).forEach(opt => {
        const l = opt.value;
        if(I18N[l] && I18N[l].langNameNative) {
          opt.textContent = I18N[l].langNameNative;
        }
      });
    }
  });

  // Store preference
  localStorage.setItem('ayusutra_lang', lang);
}

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.en[key]) || key;
}

function getLang() {
  return currentLang;
}

function initLanguage() {
  const saved = localStorage.getItem('ayusutra_lang');
  if (saved && I18N[saved]) {
    currentLang = saved;
  }
  setLanguage(currentLang);
}

// Speech recognition language codes
function getSpeechLang() {
  const map = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', bn: 'bn-IN' };
  return map[currentLang] || 'en-IN';
}

// TTS language codes
function getTTSLang() {
  const map = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', bn: 'bn-IN' };
  return map[currentLang] || 'en-IN';
}

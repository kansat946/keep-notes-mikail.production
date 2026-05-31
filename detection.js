// Language & Pronoun Detection Module
class DetectionManager {
    constructor() {
        // Words that indicate informal/casual Indonesian (gw, lu, aku, etc)
        this.informalWords = [
            'gw', 'aku', 'lu', 'kamu', 'yang', 'dengan',
            'gua', 'elo', 'loe', 'kita', 'dulu', 'dong',
            'lah', 'nih', 'nah', 'yuk', 'sih', 'kan'
        ];

        // Words that indicate formal Indonesian (saya, Anda, dll)
        this.formalWords = [
            'saya', 'anda', 'beliau', 'mereka', 'oleh karena itu',
            'dengan demikian', 'sebagaimana', 'sesuai dengan'
        ];

        // English words
        this.englishWords = [
            'the', 'a', 'is', 'are', 'am', 'be', 'been', 'being',
            'have', 'has', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'can',
            'this', 'that', 'these', 'those', 'i', 'you', 'he',
            'she', 'it', 'we', 'they', 'what', 'which', 'who'
        ];
    }

    // Detect if text contains multiple languages
    detectMultipleLanguages(text) {
        if (!text) return false;

        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);

        let hasInformal = false;
        let hasEnglish = false;

        for (let word of words) {
            // Remove punctuation
            const cleanWord = word.replace(/[^\w]/g, '');

            if (this.informalWords.includes(cleanWord)) {
                hasInformal = true;
            }

            if (this.englishWords.includes(cleanWord)) {
                hasEnglish = true;
            }

            // If we found both, return true
            if (hasInformal && hasEnglish) {
                return {
                    detected: true,
                    languages: ['Informal Indonesian', 'English'],
                    message: 'Catatan menggunakan bahasa ganda!'
                };
            }
        }

        // Check if informal Indonesian + formal Indonesian
        let hasFormal = false;
        for (let word of words) {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (this.formalWords.includes(cleanWord)) {
                hasFormal = true;
                break;
            }
        }

        if (hasInformal && hasFormal) {
            return {
                detected: true,
                languages: ['Informal Indonesian', 'Formal Indonesian'],
                message: 'Catatan menggunakan bahasa ganda!'
            };
        }

        return {
            detected: false,
            languages: [],
            message: 'Catatan dalam satu bahasa'
        };
    }

    // Detect specific pronouns
    detectPronouns(text) {
        if (!text) return [];

        const lowerText = text.toLowerCase();
        const pronounMap = {
            'gw': 'Informal I (gw)',
            'aku': 'Informal I (aku)',
            'lu': 'Informal you (lu)',
            'kamu': 'You (kamu)',
            'elo': 'Informal you (elo)',
            'saya': 'Formal I (saya)',
            'anda': 'Formal you (Anda)',
            'yang': 'Relative pronoun (yang)',
            'dengan': 'With (dengan)',
            'kita': 'We (kita)',
            'mereka': 'They (mereka)'
        };

        const foundPronouns = [];

        for (let [word, label] of Object.entries(pronounMap)) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            if (regex.test(lowerText)) {
                foundPronouns.push({
                    word: word,
                    label: label,
                    count: (lowerText.match(regex) || []).length
                });
            }
        }

        return foundPronouns;
    }

    // Get detection summary
    getSummary(text) {
        const languageDetection = this.detectMultipleLanguages(text);
        const pronounDetection = this.detectPronouns(text);

        return {
            multipleLanguages: languageDetection.detected,
            languages: languageDetection.languages,
            detectionMessage: languageDetection.message,
            pronouns: pronounDetection,
            requiresLayer2: languageDetection.detected
        };
    }
}

// Global detection manager
const detectionManager = new DetectionManager();
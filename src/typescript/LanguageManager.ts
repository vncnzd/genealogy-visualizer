import * as languageData from './languageData.json';
import { LanguageIdentifier } from './languageIdentifier';

export class LanguageManager {
    private static instance: LanguageManager;
    private currentLanguageId: LanguageIdentifier;
    private currentLanguageData: Object;

    private constructor() {}

    public static getInstance(): LanguageManager {
        if (LanguageManager.instance == null) {
            LanguageManager.instance = new LanguageManager();
        }

        return LanguageManager.instance;
    }

    public setlanguage(languageParameter) {
        switch (languageParameter) {
            case "de":
                this.currentLanguageId = LanguageIdentifier.DE;
                this.currentLanguageData = languageData["de"];
                break;
            case "en":
            default:
                this.currentLanguageId = LanguageIdentifier["en"];
                this.currentLanguageData = languageData.en
                break;
        }
    }

    public getCurrentLanguageId(): LanguageIdentifier {
        return this.currentLanguageId;
    }

    public getCurrentLanguageData(): Object {
        return this.currentLanguageData;
    }
}
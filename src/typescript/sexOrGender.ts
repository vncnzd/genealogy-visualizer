import { SexOrGenderIdentifier } from "./sexOrGenderIdentifier";

export class SexOrGender {
    private sexOrGenderIdentifier: SexOrGenderIdentifier;
    private sexOrGenderLabel: string;

    constructor(sexOrGenderIdentifier: SexOrGenderIdentifier, sexOrGenderLabel: string) {
        this.sexOrGenderIdentifier = sexOrGenderIdentifier;
        this.sexOrGenderLabel = sexOrGenderLabel;
    }

    public static buildBySexOrGenderId(id: string, label: string): SexOrGender {
        let sexOrGenderIdentifier: SexOrGenderIdentifier;

        switch (id) {
            case "Q6581097":
                sexOrGenderIdentifier = SexOrGenderIdentifier.male;
                break;
            case "Q6581072":
                sexOrGenderIdentifier = SexOrGenderIdentifier.female;
                break;
            case "Q1097630":
                sexOrGenderIdentifier = SexOrGenderIdentifier.intersex;
                break;
            case "Q1052281":
                sexOrGenderIdentifier = SexOrGenderIdentifier.transgenderFemale;
                break;
            case "Q2449503":
                sexOrGenderIdentifier = SexOrGenderIdentifier.transgenderMale;
                break;
            default:
                sexOrGenderIdentifier = null;
                break;
        }

        return new SexOrGender(sexOrGenderIdentifier, label);
    }

    // getters and setters

    public getSexOrGenderIdentifier(): SexOrGenderIdentifier {
        return this.sexOrGenderIdentifier;
    }

    public getSexOrGenderLabel(): string {
        return this.sexOrGenderLabel;
    }
}
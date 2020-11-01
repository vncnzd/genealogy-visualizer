import { SexOrGenderIdentifier } from "./sexOrGenderIdentifier";

export class SexOrGender {
    private sexOrGenderId: SexOrGenderIdentifier;
    private sexOrGenderLabel: string;

    constructor(sexOrGenderId: string, sexOrGenderLabel: string) {
        switch (sexOrGenderId) {
            case "Q6581097":
                this.sexOrGenderId = SexOrGenderIdentifier.male;
                break;
            case "Q6581072":
                this.sexOrGenderId = SexOrGenderIdentifier.female;
                break;
            case "Q1097630":
                this.sexOrGenderId = SexOrGenderIdentifier.intersex;
                break;
            case "Q1052281":
                this.sexOrGenderId = SexOrGenderIdentifier.transgenderFemale;
                break;
            case "Q2449503":
                this.sexOrGenderId = SexOrGenderIdentifier.transgenderMale;
                break;
            default:
                this.sexOrGenderId = null;
                break;
        }
    }

    // getters and setters

    public getSexOrGenderIdentifier(): SexOrGenderIdentifier {
        return this.sexOrGenderId;
    }

    public getSexOrGenderLabel(): string {
        return this.sexOrGenderLabel;
    }
}
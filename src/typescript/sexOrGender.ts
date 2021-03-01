import { SexOrGenderId } from "./sexOrGenderId";

export class SexOrGender {   
    private sexOrGenderId: SexOrGenderId;
    private sexOrGenderLabel: string;

    public static getSexOrGenderIdForWikidataId(sexOrGenderWikidataId: string): SexOrGenderId {
        switch (sexOrGenderWikidataId) {
            case "Q6581097":
                return SexOrGenderId.male;
            case "Q6581072":
                return SexOrGenderId.female;
            case "Q1097630":
                return  SexOrGenderId.intersex;
            case "Q1052281":
                return  SexOrGenderId.transgenderFemale;
            case "Q2449503":
                return SexOrGenderId.transgenderMale;
            default:
                return null;
        }
    }

    constructor(sexOrGenderId: SexOrGenderId, sexOrGenderLabel: string) {
        this.sexOrGenderId = sexOrGenderId;
        this.sexOrGenderLabel = sexOrGenderLabel;
    }

    // getters and setters

    public getSexOrGenderId(): SexOrGenderId {
        return this.sexOrGenderId;
    }

    public getSexOrGenderLabel(): string {
        return this.sexOrGenderLabel;
    }
}
import { SexOrGenderId } from "./sexOrGenderId";

export class SexOrGender {
    private static sexOrGenderIds: Map<string, SexOrGenderId>;
    
    private sexOrGenderId: SexOrGenderId;
    private sexOrGenderLabel: string;

    public static initializeSexOrGenderIds(): void {
        this.sexOrGenderIds = new Map<string, SexOrGenderId>();
        this.sexOrGenderIds.set("Q6581097", SexOrGenderId.male);
        this.sexOrGenderIds.set("Q6581072", SexOrGenderId.female);
        this.sexOrGenderIds.set("Q1097630", SexOrGenderId.intersex);
        this.sexOrGenderIds.set("Q1052281", SexOrGenderId.transgenderFemale);
        this.sexOrGenderIds.set("Q2449503", SexOrGenderId.transgenderMale)
    }

    public static getSexOrGenderIdForWikidataId(sexOrGenderWikidataId: string): SexOrGenderId {
        return this.sexOrGenderIds.get(sexOrGenderWikidataId);
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

SexOrGender.initializeSexOrGenderIds();
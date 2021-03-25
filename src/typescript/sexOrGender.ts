import { SexOrGenderId } from "./sexOrGenderId";

export class SexOrGender {   
    private sexOrGenderId: SexOrGenderId;
    private sexOrGenderLabel: string;

    constructor(sexOrGenderId: SexOrGenderId, sexOrGenderLabel: string) {
        this.sexOrGenderId = sexOrGenderId;
        this.sexOrGenderLabel = sexOrGenderLabel;
    }

    public getSexOrGenderId(): SexOrGenderId {
        return this.sexOrGenderId;
    }

    public getSexOrGenderLabel(): string {
        return this.sexOrGenderLabel;
    }
}
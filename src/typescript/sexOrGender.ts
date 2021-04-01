import { SexOrGenderId } from "./sexOrGenderId";

export class SexOrGender {   
    private sexOrGenderId: SexOrGenderId;
    private label: string;

    constructor(sexOrGenderId: SexOrGenderId, sexOrGenderLabel: string) {
        this.sexOrGenderId = sexOrGenderId;
        this.label = sexOrGenderLabel;
    }

    public getSexOrGenderId(): SexOrGenderId {
        return this.sexOrGenderId;
    }

    public getSexOrGenderLabel(): string {
        return this.label;
    }
}
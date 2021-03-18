import { SexOrGender } from "../sexOrGender";
import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";

export class Person {    
    private id: string;
    private name: string;
    private description: string;
    private father: Person;
    private mother: Person;
    private children: Person[];
    private datesOfBirth: Date[];
    private datesOfDeath: Date[];
    private sexOrGender: SexOrGender;

    constructor(id: string) {
        this.id = id;
        this.name = id;
        this.datesOfBirth = [];
        this.datesOfDeath = [];
        this.children = [];
        this.setSexOrGender(new SexOrGender("Q6581097", "male"));
    }

    // getters and setters
    public setId(id: string): void {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getDescription(): string {
        return this.description
    }

    public getFather(): Person {
        return this.father;
    }

    public setFather(father: Person): void {
        this.father = father;
    }

    public getMother(): Person {
        return this.mother;
    }

    public setMother(mother: Person): void {
        this.mother = mother;
    }

    public getChildren(): Person[] {
        return this.children;
    }

    public getDatesOfBirth(): Date[] {
        return this.datesOfBirth;
    }

    public getDatesOfDeath(): Date[] {
        return this.datesOfDeath;
    }

    public setSexOrGender(sexOrGender: SexOrGender): void {
        this.sexOrGender = sexOrGender;
    }

    public getSexOrGender(): SexOrGender {
        return this.sexOrGender;
    }

    public setParent(person: Person) {
        if (person.getSexOrGender().getSexOrGenderId() == SexOrGenderIdentifier.female) {
            this.setMother(person);
        } else if (person.getSexOrGender().getSexOrGenderId() == SexOrGenderIdentifier.male) {
            this.setFather(person);
        }
    }
}
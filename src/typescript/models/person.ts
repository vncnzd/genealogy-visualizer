import { SexOrGender } from "../sexOrGender";
import { SexOrGenderId } from "../sexOrGenderId";

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
        this.datesOfBirth = [];
        this.datesOfDeath = [];
        this.children = [];
    }

    // getters and setters
    public setId(id: string, duplicateAddition: string = null): void {
        if (duplicateAddition != null) {
            this.id = id + "-" + duplicateAddition;
        } else {
            this.id = id;
        }
    }

    public delete(): void {
        if (this.father != null) {
            let indexOfThisPerson: number = this.father.getChildren().indexOf(this);
            this.father.setChildren(this.father.getChildren().splice(indexOfThisPerson, 1));
        }
        if (this.mother != null) {
            let indexOfThisPerson: number = this.mother.getChildren().indexOf(this);
            this.mother.setChildren(this.mother.getChildren().splice(indexOfThisPerson, 1));
        }
        for (const child of this.children) {
            if (child.father == this) {
                child.father = null;
            } else if (child.mother == this) {
                child.mother = null;
            }
        }
    }

    public getId(): string {
        return this.id;
    }

    public getBaseId(): string {
        return this.id.split("-")[0];
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

    public setChildren(children: Person[]): void {
        this.children = children;
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
        if (person.getSexOrGender().getSexOrGenderId() == SexOrGenderId.female) {
            this.setMother(person);
        } else if (person.getSexOrGender().getSexOrGenderId() == SexOrGenderId.male) {
            this.setFather(person);
        }
    }
}
import { Person } from "./models/person";
import { SexOrGender } from "./sexOrGender";
import { SexOrGenderId } from "./sexOrGenderId";

export class TestTreeGenerator {
    public static getTestRootPerson(): Person {
        let root: Person = new Person("root");
        root.setName("Root");
        root.getDatesOfBirth().push(new Date("0100-01-01"));
        root.getDatesOfDeath().push(new Date("0150-01-01"));
        root.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let mother: Person = new Person("mother");
        mother.setName("mother");
        mother.getDatesOfBirth().push(new Date("0075-01-01"));
        mother.getDatesOfDeath().push(new Date("0125-01-01"));
        mother.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

        let father: Person = new Person("father");
        father.setName("father");
        father.getDatesOfBirth().push(new Date("0060-01-01"));
        father.getDatesOfDeath().push(new Date("0110-01-01"));
        father.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let grandFather: Person = new Person("grandfather");
        grandFather.setName("grandfather");
        grandFather.getDatesOfBirth().push(new Date("0030-01-01"));
        grandFather.getDatesOfDeath().push(new Date("0070-01-01"));
        grandFather.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let grandMother: Person = new Person("grandmother");
        grandMother.setName("grandmother");
        grandMother.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMother.getDatesOfDeath().push(new Date("0090-01-01"));
        grandMother.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

        let grandFatherTwo: Person = new Person("grandfatherTwo");
        grandFatherTwo.setName("grandfatherTwo");
        grandFatherTwo.getDatesOfBirth().push(new Date("0030-01-01"));
        grandFatherTwo.getDatesOfDeath().push(new Date("0080-01-01"));
        grandFatherTwo.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let grandMotherTwo: Person = new Person("grandmotherTwo");
        grandMotherTwo.setName("grandmotherTwo");
        grandMotherTwo.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMotherTwo.getDatesOfDeath().push(new Date("0070-01-01"));
        grandMotherTwo.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

        root.setMother(mother);
        root.setFather(father);

        mother.getChildren().push(root);
        father.getChildren().push(root);

        mother.setFather(grandFather);
        mother.setMother(grandMother);

        grandMother.getChildren().push(mother);
        grandFather.getChildren().push(mother);

        father.setFather(grandFatherTwo);
        father.setMother(grandMotherTwo);
        
        grandFatherTwo.getChildren().push(father);
        grandMotherTwo.getChildren().push(father);

        return root;
    }

    // public static getExampleDescendantsTree(): Person {

    // }

    public static generateAncestorsTree(depth: number, id: string): Person {
        let person: Person = new Person(id);
        person.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        person.setName(id);
        
        if (depth > 0) {
            let father = this.generateAncestorsTree(depth - 1, id + "father");
            father.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

            let mother = this.generateAncestorsTree(depth - 1, id + "mother");
            mother.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

            person.setFather(father);
            person.setMother(mother);

            father.getChildren().push(person);
            mother.getChildren().push(person);
        }

        return person;
    }

    public static generateDescedantsTree(depth: number, id: string): Person {
        let person: Person = new Person(id);
        person.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));
        person.setName(id);
        
        if (depth > 0) {
            let maxNumberOfChildren: number = 4;
            let numberOfChildren: number = Math.round(Math.random() * maxNumberOfChildren);
            
            for (let i = 0; i < numberOfChildren; i++) {
                let child = this.generateDescedantsTree(depth - 1, id + " " + i);
                
                if (Math.random() > 0.5) {
                    child.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));
                } else {
                    child.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
                }
                
                person.getChildren().push(child);

                if (person.getSexOrGender().getSexOrGenderId() == SexOrGenderId.male) {
                    child.setFather(person);
                } else if (person.getSexOrGender().getSexOrGenderId() == SexOrGenderId.female) {
                    child.setMother(person);
                }
            }
        }

        return person;
    }
}
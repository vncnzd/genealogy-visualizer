import { Person } from "./models/person";
import { SexOrGender } from "./sexOrGender";
import { SexOrGenderId } from "./sexOrGenderId";

export class TestTreeGenerator {
    public static getAncestorsExampleTree(): Person {
        let root: Person = new Person("root");
        root.setName(root.getId());
        root.getDatesOfBirth().push(new Date("0100-01-01"));
        root.getDatesOfDeath().push(new Date("0150-01-01"));
        root.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let mother: Person = new Person("mother");
        mother.setName(mother.getId());
        mother.getDatesOfBirth().push(new Date("0075-01-01"));
        mother.getDatesOfDeath().push(new Date("0125-01-01"));
        mother.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

        let father: Person = new Person("father");
        father.setName(father.getId());
        father.getDatesOfBirth().push(new Date("0060-01-01"));
        father.getDatesOfDeath().push(new Date("0110-01-01"));
        father.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let grandFather: Person = new Person("grandfather0");
        grandFather.setName(grandFather.getId());
        grandFather.getDatesOfBirth().push(new Date("0030-01-01"));
        grandFather.getDatesOfDeath().push(new Date("0090-01-01"));
        grandFather.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let grandMother: Person = new Person("grandmother0");
        grandMother.setName(grandMother.getId());
        grandMother.getDatesOfBirth().push(new Date("0040-01-01"));
        // grandMother.getDatesOfDeath().push(new Date("0080-01-01"));
        grandMother.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

        let grandFatherTwo: Person = new Person("grandfather1");
        grandFatherTwo.setName(grandFatherTwo.getId());
        grandFatherTwo.getDatesOfBirth().push(new Date("0060-01-01"));
        grandFatherTwo.getDatesOfDeath().push(new Date("0080-01-01"));
        grandFatherTwo.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let grandMotherTwo: Person = new Person("grandmother1");
        grandMotherTwo.setName(grandMotherTwo.getId());
        grandMotherTwo.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMotherTwo.getDatesOfDeath().push(new Date("0070-01-01"));
        grandMotherTwo.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

        root.setMother(mother);
        root.setFather(father);

        mother.getChildren().push(root);
        father.getChildren().push(root);

        // father.setFather(grandFather);
        father.setMother(grandMother);

        grandMother.getChildren().push(mother);
        grandFather.getChildren().push(mother);

        mother.setFather(grandFatherTwo);
        mother.setMother(grandMotherTwo);
        
        grandFatherTwo.getChildren().push(father);
        grandMotherTwo.getChildren().push(father);

        return root;
    }

    public static getExampleDescendantsTree(): Person {
        let root: Person = new Person("root");
        root.setName(root.getId());
        root.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));
        root.getDatesOfBirth().push(new Date("0160-01-01"));
        root.getDatesOfDeath().push(new Date("0220-01-01"));

        let child0: Person = new Person("child 0");
        child0.setName(child0.getId());
        child0.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child0.getDatesOfBirth().push(new Date("0180-01-01"));
        child0.getDatesOfDeath().push(new Date("0250-01-01"));
        root.getChildren().push(child0);

        // let child00: Person = new Person("child 00");
        // child00.setName(child00.getId());
        // child00.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        // child00.getDatesOfBirth().push(new Date("0200-01-01"));
        // child00.getDatesOfDeath().push(new Date("0290-01-01"));
        // child0.getChildren().push(child00);

        // let child01: Person = new Person("child 01");
        // child01.setName(child01.getId());
        // child01.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));
        // child01.getDatesOfBirth().push(new Date("0210-01-01"));
        // child01.getDatesOfDeath().push(new Date("0240-01-01"));
        // child0.getChildren().push(child01);

        // let child010: Person = new Person("child 01");
        // child010.setName(child010.getId());
        // child010.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        // child010.getDatesOfBirth().push(new Date("0230-01-01"));
        // child010.getDatesOfDeath().push(new Date("0290-01-01"));
        // child01.getChildren().push(child010);

        let child1: Person = new Person("child 1");
        child1.setName(child1.getId());
        child1.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child1.getDatesOfBirth().push(new Date("0190-01-01"));
        child1.getDatesOfDeath().push(new Date("0220-01-01"));
        root.getChildren().push(child1);

        let child10: Person = new Person("child 10");
        child10.setName(child10.getId());
        child10.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child10.getDatesOfBirth().push(new Date("0230-01-01"));
        child10.getDatesOfDeath().push(new Date("0270-01-01"));
        child1.getChildren().push(child10);

        let child11: Person = new Person("child 11");
        child11.setName(child11.getId());
        child11.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child11.getDatesOfBirth().push(new Date("0190-01-01"));
        child11.getDatesOfDeath().push(new Date("0280-01-01"));
        child1.getChildren().push(child11);

        let child12: Person = new Person("child 12");
        child12.setName(child12.getId());
        child12.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child12.getDatesOfBirth().push(new Date("0190-01-01"));
        child12.getDatesOfDeath().push(new Date("0280-01-01"));
        child1.getChildren().push(child12);

        let child2: Person = new Person("child 2");
        child2.setName(child2.getId());
        child2.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child2.getDatesOfBirth().push(new Date("0200-01-01"));
        child2.getDatesOfDeath().push(new Date("0240-01-01"));
        root.getChildren().push(child2);

        let child3: Person = new Person("child 3");
        child3.setName(child3.getId());
        child3.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        child3.getDatesOfBirth().push(new Date("0200-01-01"));
        child3.getDatesOfDeath().push(new Date("0240-01-01"));
        root.getChildren().push(child3);

        // let child4: Person = new Person("child 4");
        // child4.setName(child4.getId());
        // child4.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        // child4.getDatesOfBirth().push(new Date("0200-01-01"));
        // child4.getDatesOfDeath().push(new Date("0240-01-01"));
        // root.getChildren().push(child4);

        return root;
    }

    public static generateRandomAncestorsTree(depth: number, id: string, deathYear: number): Person {
        let person: Person = new Person(id);
        person.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));
        person.setName(id);
        
        let birthDate: Date = new Date();
        birthDate.setFullYear(deathYear - Math.random() * 100);
        if (Math.random() > 0.000001) {
            person.getDatesOfBirth().push(birthDate);   
        }

        let deathDate: Date = new Date();
        deathDate.setFullYear(deathYear);
        if (Math.random() > 0.000001) {
            person.getDatesOfDeath().push(deathDate);
        }

        let age = deathDate.getFullYear() - birthDate.getFullYear();
        if (depth > 0) {
            let father = this.generateRandomAncestorsTree(depth - 1, id + "father", birthDate.getFullYear() + age * Math.random());
            father.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

            let mother = this.generateRandomAncestorsTree(depth - 1, id + "mother", deathYear - 25);
            mother.setSexOrGender(new SexOrGender(SexOrGenderId.female, "female"));

            person.setFather(father);
            person.setMother(mother);

            father.getChildren().push(person);
            mother.getChildren().push(person);
        }

        return person;
    }

    public static generateRandomDescedantsTree(depth: number, id: string, birthDateYear: number): Person {
        let person: Person = new Person(id);
        person.setName(person.getId());
        person.setSexOrGender(new SexOrGender(SexOrGenderId.male, "male"));

        let birthDate: Date = new Date();
        birthDate.setFullYear(birthDateYear);
        if (Math.random() > 0.1) {
            person.getDatesOfBirth().push(birthDate);
        }

        let deathDate: Date = new Date();
        deathDate.setFullYear(birthDateYear + Math.round(Math.random() * 100));
        if (Math.random() > 0.1) {
            person.getDatesOfDeath().push(deathDate);
        }

        
        if (depth > 0) {
            let maxNumberOfChildren: number = 4;
            let numberOfChildren: number = Math.round(Math.random() * maxNumberOfChildren);
            
            for (let i = 0; i < numberOfChildren; i++) {
                let childBirthDateYear: number = Math.round((deathDate.getFullYear() + birthDate.getFullYear()) / 2);
                let child = this.generateRandomDescedantsTree(depth - 1, id + " " + i, childBirthDateYear);
                
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
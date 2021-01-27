import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { SexOrGender } from "../sexOrGender";
import { GenealogyView } from "../views/genealogyView";
import { PersonView } from "../views/personView";
import { PersonController } from "./personController";

export class GenealogyController {
    private genealogy: Genealogy;
    private genealogyView: GenealogyView;
    private personControllers: PersonController[];

    constructor(genealogy: Genealogy, genealogyView: GenealogyView) {
        this.genealogy = genealogy;
        this.genealogyView = genealogyView;
        this.personControllers = [];
        this.addEventListenersToButtonsAndInput();

        // test code
        this.genealogyView.displayAncestors(this.getTestRootPerson());
    }

    private addEventListenersToButtonsAndInput(): void {
        this.genealogyView.getDepthInput().addEventListener("change", (event: Event): void => {
            let depth = parseInt((<HTMLInputElement> event.target).value);
            this.genealogy.setDepth(depth);
        });

        this.genealogyView.getDescendantsButton().addEventListener("click", (event: MouseEvent): void => {
            this.genealogy.getDescendantsOfRootPerson(this.genealogy.getDepth()).then((descendants: Map<string, Person>) => {
                console.log(descendants.size + " descendants found");
                console.log(this.genealogy.getRootPerson());
            });
        });

        this.genealogyView.getAncestorsButton().addEventListener("click", (event: MouseEvent): void => {
            this.genealogy.getAncestorsOfRootPerson(this.genealogy.getDepth()).then((ancestors: Map<string, Person>) => {
                this.genealogyView.displayAncestors(this.genealogy.getRootPerson());
                console.log(ancestors.size + " ancestors found");
                console.log(this.genealogy.getRootPerson());
            });
        });
    }

    private getTestRootPerson(): Person {
        let root: Person = new Person("root");
        root.setName("Root");
        root.getDatesOfBirth().push(new Date("0100-01-01"));
        root.getDatesOfDeath().push(new Date("0150-01-01"));
        root.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let mother: Person = new Person("mother");
        mother.setName("mother");
        mother.getDatesOfBirth().push(new Date("0075-01-01"));
        mother.getDatesOfDeath().push(new Date("0125-01-01"));
        mother.setSexOrGender(new SexOrGender("Q6581072", "female"));

        let father: Person = new Person("father");
        father.setName("father");
        father.getDatesOfBirth().push(new Date("0060-01-01"));
        father.getDatesOfDeath().push(new Date("0110-01-01"));
        father.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let grandFather: Person = new Person("grandfather");
        grandFather.setName("grandfather");
        grandFather.getDatesOfBirth().push(new Date("0030-01-01"));
        grandFather.getDatesOfDeath().push(new Date("0070-01-01"));
        grandFather.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let grandMother: Person = new Person("grandmother");
        grandMother.setName("grandmother");
        grandMother.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMother.getDatesOfDeath().push(new Date("0090-01-01"));
        grandMother.setSexOrGender(new SexOrGender("Q6581072", "female"));

        let grandFatherTwo: Person = new Person("grandfatherTwo");
        grandFatherTwo.setName("grandfatherTwo");
        grandFatherTwo.getDatesOfBirth().push(new Date("0030-01-01"));
        grandFatherTwo.getDatesOfDeath().push(new Date("0080-01-01"));
        grandFatherTwo.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let grandMotherTwo: Person = new Person("grandmotherTwo");
        grandMotherTwo.setName("grandmotherTwo");
        grandMotherTwo.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMotherTwo.getDatesOfDeath().push(new Date("0070-01-01"));
        grandMotherTwo.setSexOrGender(new SexOrGender("Q6581072", "female"));

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

        this.genealogy.getPeople().set(root.getId(), root);

        this.genealogy.getPeople().set(mother.getId(), mother);
        this.genealogy.getPeople().set(father.getId(), father);

        this.genealogy.getPeople().set(grandFather.getId(), grandFather);
        this.genealogy.getPeople().set(grandMother.getId(), grandMother);

        this.genealogy.getPeople().set(grandFatherTwo.getId(), grandFatherTwo);
        this.genealogy.getPeople().set(grandMotherTwo.getId(), grandMotherTwo);

        return root;
    }

    private getTestRootPersonTwo(): Person {
        let root: Person = new Person("root");
        root.setName("Root");
        root.getDatesOfBirth().push(new Date("0100-01-01"));
        root.getDatesOfDeath().push(new Date("0150-01-01"));
        root.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let mother: Person = new Person("mother");
        mother.setName("mother");
        mother.getDatesOfBirth().push(new Date("0075-01-01"));
        mother.getDatesOfDeath().push(new Date("0125-01-01"));
        mother.setSexOrGender(new SexOrGender("Q6581072", "female"));

        let father: Person = new Person("father");
        father.setName("father");
        father.getDatesOfBirth().push(new Date("0060-01-01"));
        father.getDatesOfDeath().push(new Date("0110-01-01"));
        father.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let grandFather: Person = new Person("grandfather");
        grandFather.setName("grandfather");
        grandFather.getDatesOfBirth().push(new Date("0030-01-01"));
        grandFather.getDatesOfDeath().push(new Date("0070-01-01"));
        grandFather.setSexOrGender(new SexOrGender("Q6581097", "male"));

        let grandMother: Person = new Person("grandmother");
        grandMother.setName("grandmother");
        grandMother.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMother.getDatesOfDeath().push(new Date("0090-01-01"));
        grandMother.setSexOrGender(new SexOrGender("Q6581072", "female"));

        let grandMotherTwo: Person = new Person("grandmotherTwo");
        grandMotherTwo.setName("grandmotherTwo");
        grandMotherTwo.getDatesOfBirth().push(new Date("0040-01-01"));
        grandMotherTwo.getDatesOfDeath().push(new Date("0070-01-01"));
        grandMotherTwo.setSexOrGender(new SexOrGender("Q6581072", "female"));

        root.setMother(mother);
        root.setFather(father);

        mother.getChildren().push(root);
        father.getChildren().push(root);

        mother.setFather(grandFather);
        mother.setMother(grandMother);

        grandMother.getChildren().push(mother);
        grandFather.getChildren().push(mother);

        father.setFather(grandFather);
        father.setMother(grandMotherTwo);
        
        grandFather.getChildren().push(father);
        grandMotherTwo.getChildren().push(father);

        this.genealogy.getPeople().set(root.getId(), root);

        this.genealogy.getPeople().set(mother.getId(), mother);
        this.genealogy.getPeople().set(father.getId(), father);

        this.genealogy.getPeople().set(grandFather.getId(), grandFather);
        this.genealogy.getPeople().set(grandMother.getId(), grandMother);

        this.genealogy.getPeople().set(grandMotherTwo.getId(), grandMotherTwo);

        return root;
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}
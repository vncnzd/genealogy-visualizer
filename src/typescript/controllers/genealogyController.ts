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
        let personViews: Map<string, PersonView> = genealogyView.getPersonViews();
        this.connectViewsWithPersonAndController(personViews);
    }

    private connectViewsWithPersonAndController(personViews: Map<string, PersonView>): void {
        personViews.forEach((personView: PersonView, personId: string): void => {
            let person: Person = this.genealogy.getPeople().get(personId);
            if (person != null) {
                this.personControllers.push(new PersonController(person, personView));
            }
        })
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
        mother.setSexOrGender(new SexOrGender("Q6581072", "male"));

        let father: Person = new Person("father");
        father.setName("father");
        father.getDatesOfBirth().push(new Date("0060-01-01"));
        father.getDatesOfDeath().push(new Date("0110-01-01"));
        father.setSexOrGender(new SexOrGender("Q6581097", "male"));

        root.setMother(mother);
        root.setFather(father);

        this.genealogy.getPeople().set(root.getId(), root);
        this.genealogy.getPeople().set(mother.getId(), mother);
        this.genealogy.getPeople().set(father.getId(), father);

        return root;
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}
import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { TestTreeGenerator } from "../testTreeGenerator";
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
        this.genealogy.setDepth(parseInt(genealogyView.getDepthInput().value));

        // test code
        // this.genealogyView.displayDescendants(TestTreeGenerator.generateRandomDescedantsTree(3, "root", 500));
        // this.genealogyView.displayAncestors(TestTreeGenerator.generateRandomAncestorsTree(2, "root", 50));
        // this.genealogyView.displayAncestors(TestTreeGenerator.getAncestorsExampleTree(), this.i);
        // this.genealogyView.displayDescendants(TestTreeGenerator.getExampleDescendantsTree());
    }

    private addEventListenersToButtonsAndInput(): void {
        this.genealogyView.getDepthInput().addEventListener("change", (event: Event): void => {
            let depth = parseInt((<HTMLInputElement> event.target).value);
            this.genealogy.setDepth(depth);
        });

        this.genealogyView.getDescendantsButton().addEventListener("click", (event: MouseEvent): void => {
            this.genealogy.getDescendantsOfRootPerson(this.genealogy.getDepth()).then((descendants: Map<string, Person>) => {
                let personViews: Map<string, PersonView> = new Map<string, PersonView>();
                this.instantiateViewsAndControllersForDescendantsAndAddItToMap(this.genealogy.getRootPerson(), personViews);

                this.genealogyView.displayDescendants(this.genealogy.getRootPerson(), personViews);
                console.log(descendants.size + " descendants found");
                console.log(this.genealogy.getRootPerson());
            });
        });

        this.genealogyView.getAncestorsButton().addEventListener("click", (event: MouseEvent): void => {
            this.genealogy.getAncestorsOfRootPerson(this.genealogy.getDepth()).then((ancestors: Map<string, Person>) => {
                let personViews: Map<string, PersonView> = new Map<string, PersonView>();
                this.instantiateViewsAndControllersForAncestorsAndAddItToMap(this.genealogy.getRootPerson(), personViews);
                
                this.genealogyView.displayAncestors(this.genealogy.getRootPerson(), personViews);
                this.genealogyView.connectDuplicates(this.genealogy.getDuplicates(), personViews);
                console.log(ancestors.size + " ancestors found");
                console.log(this.genealogy.getRootPerson());
            });
        });
    }

    private instantiateViewsAndControllersForAncestorsAndAddItToMap(person: Person, personViews: Map<string, PersonView>) {
        let personView: PersonView = new PersonView(person, this.genealogyView.getContainer(), this.genealogyView.getJSPlumbInstance());
        let personController: PersonController = new PersonController(person, personView); // maybe add to list here.

        personViews.set(person.getId(), personView);

        if (person.getFather() != null) {
            this.instantiateViewsAndControllersForAncestorsAndAddItToMap(person.getFather(), personViews);
        }
        if (person.getMother() != null) {
            this.instantiateViewsAndControllersForAncestorsAndAddItToMap(person.getMother(), personViews);
        }
    }

    private instantiateViewsAndControllersForDescendantsAndAddItToMap(person: Person, personViews: Map<string, PersonView>) {
        let personView: PersonView = new PersonView(person, this.genealogyView.getContainer(), this.genealogyView.getJSPlumbInstance());
        let personController: PersonController = new PersonController(person, personView);
        personViews.set(person.getId(), personView);

        for (const child of person.getChildren()) {
            this.instantiateViewsAndControllersForDescendantsAndAddItToMap(child, personViews);
        }
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}
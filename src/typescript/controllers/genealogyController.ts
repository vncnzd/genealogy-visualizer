import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { TestTreeGenerator } from "../testTreeGenerator";
import { GenealogyView } from "../views/genealogyView";
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
        // this.genealogyView.displayAncestors(TestTreeGenerator.generateRandomAncestorsTree(5, "root", 500));
        // this.genealogyView.displayAncestors(TestTreeGenerator.getTestRootPerson());
        this.genealogyView.displayDescendants(TestTreeGenerator.getExampleDescendantsTree());
    }

    private addEventListenersToButtonsAndInput(): void {
        this.genealogyView.getDepthInput().addEventListener("change", (event: Event): void => {
            let depth = parseInt((<HTMLInputElement> event.target).value);
            this.genealogy.setDepth(depth);
        });

        this.genealogyView.getDescendantsButton().addEventListener("click", (event: MouseEvent): void => {
            this.genealogy.getDescendantsOfRootPerson(this.genealogy.getDepth()).then((descendants: Map<string, Person>) => {
                this.genealogyView.displayDescendants(this.genealogy.getRootPerson());
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

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}
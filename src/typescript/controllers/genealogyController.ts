import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { GenealogyView } from "../views/genealogyView";

export class GenealogyController {
    private genealogy: Genealogy;
    private genealogyView: GenealogyView;

    constructor(genealogy: Genealogy, genealogyView: GenealogyView) {
        this.genealogy = genealogy;
        this.genealogyView = genealogyView;
        this.addEventListenersToButtonsAndInput();
    }

    private addEventListenersToButtonsAndInput(): void {
        this.genealogyView.getAscendantsButton().addEventListener("click", () => {
            // this.genealogy.getChildrenOfPerson();
        });

        this.genealogyView.getDescendantsButton().addEventListener("click", () => {
            console.log("descendantsButton");
        });
    }

    // this should be somewhere else really... 
    public getChildrenOfPerson(person: Person, depth: number): void {
        this.genealogy.getChildrenOfPerson(person, depth);
    }
}
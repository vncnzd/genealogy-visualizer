import { GenealogyType } from "../genealogyType";
import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { TestTreeGenerator } from "../testTreeGenerator";
import { GenealogyView } from "../views/genealogyView";
import { PersonView } from "../views/personView";
import { PersonController } from "./personController";

export class GenealogyController {
    private genealogy: Genealogy;
    private genealogyView: GenealogyView;

    constructor(genealogy: Genealogy, genealogyView: GenealogyView) {
        this.genealogy = genealogy;
        this.genealogyView = genealogyView;

        this.addEventListenersToInteractiveElements();
        this.genealogy.setNumberOfGenerations(parseInt(genealogyView.getNumberOfGenerations().value));
      
        // test code
        const personViews: Map<string, PersonView> = new Map<string, PersonView>();
        const duplicates: Map<string, Person[]> = new Map<string, Person[]>();

        // let rootPerson: Person = TestTreeGenerator.generateRandomDescedantsTree(3, "root", 500);
        // this.instantiateViewsAndControllersForDescendantsAndAddItToMap(rootPerson, personViews);
        // this.genealogyView.displayDescendants(rootPerson, personViews);
        
        // this.genealogyView.displayAncestors(TestTreeGenerator.generateRandomAncestorsTree(2, "root", 50));

        // let rootPerson: Person = TestTreeGenerator.getAncestorsExampleTree();
        // this.instantiateViewsAndControllersForAncestorsAndAddItToMap(rootPerson, personViews);
        // this.genealogyView.drawGenealogyTree(TestTreeGenerator.getAncestorsExampleTree(), personViews, GenealogyType.Ancestors, duplicates);
        
        // let rootPerson: Person = TestTreeGenerator.getExampleDescendantsTree();
        // this.instantiateViewsAndControllersForDescendantsAndAddItToMap(rootPerson, personViews);
        // this.genealogyView.drawGenealogyTree(rootPerson, personViews, GenealogyType.Descendants, duplicates);
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
        this.genealogyView.setCurrentRootPerson(person);
        this.genealogyView.setIsActiveOfDrawNewButton(true);
        this.genealogyView.setIsActiveOfRedrawButton(false);
    }

    private addEventListenersToInteractiveElements(): void {
        this.genealogyView.getNumberOfGenerations().addEventListener("change", this.setNumberOfGenerations.bind(this));
        this.genealogyView.getGenealogyTypeSelectElement().addEventListener("change", this.setGenealogyType.bind(this));
        this.genealogyView.getDrawNewTreeButton().addEventListener("click", this.getDataAndDrawTree.bind(this));
        this.genealogyView.getRedrawTreeButton().addEventListener("click", this.redrawTree.bind(this));
    }

    private getDataAndDrawTree(event: MouseEvent): void {
        this.genealogyView.setLoaderIsVisible(true);

        this.genealogy.getGenealogyOfCurrentPersonFromDatabase().then((people: Map<string, Person>): void => {
            this.drawTree(this.genealogy.getRootPerson(), this.genealogy.getGenealogyType());
            this.genealogyView.setIsActiveOfRedrawButton(true);
        }).finally(() => {
            this.genealogyView.setLoaderIsVisible(false);
        });
    }

    private redrawTree(event: MouseEvent): void {
        this.drawTree(this.genealogy.getRootPerson(), this.genealogy.getGenealogyType());
    }

    private drawTree(rootPerson: Person, genealogyType: GenealogyType): void {
        this.genealogyView.clearContainer(); // Put this into the view
        const personViews: Map<string, PersonView> = new Map<string, PersonView>();
        
        switch (genealogyType) {
            case GenealogyType.Ancestors:
                this.instantiateViewsAndControllersForAncestorsAndAddItToMap(rootPerson, personViews); // Remove the old ones before?
                break;
            case GenealogyType.Descendants:
                this.instantiateViewsAndControllersForDescendantsAndAddItToMap(rootPerson, personViews);
                break;
        }

        this.genealogyView.drawGenealogyTree(rootPerson, personViews, genealogyType, this.genealogy.getDuplicates());
        this.addSettingRootPersonEventListenerToNameParagraphsOfPersonViews(personViews);
    }

    private setGenealogyType(event: Event): void {
        const selectElement: HTMLSelectElement = <HTMLSelectElement> event.target;
        switch (selectElement.selectedIndex) {
            case 0:
                this.genealogy.setGenealogyType(GenealogyType.Ancestors);
                break;
            case 1:
                this.genealogy.setGenealogyType(GenealogyType.Descendants);
                break;
        }

        this.genealogyView.setIsActiveOfRedrawButton(false);
    }

    private instantiateViewsAndControllersForAncestorsAndAddItToMap(person: Person, personViews: Map<string, PersonView>) {
        const personView: PersonView = new PersonView(person, this.genealogyView.getContainer(), this.genealogyView.getJSPlumbInstance());
        const personController: PersonController = new PersonController(person, personView);

        personViews.set(person.getId(), personView);

        if (person.getFather() != null) {
            this.instantiateViewsAndControllersForAncestorsAndAddItToMap(person.getFather(), personViews);
        }
        if (person.getMother() != null) {
            this.instantiateViewsAndControllersForAncestorsAndAddItToMap(person.getMother(), personViews);
        }
    }

    private instantiateViewsAndControllersForDescendantsAndAddItToMap(person: Person, personViews: Map<string, PersonView>) {
        const personView: PersonView = new PersonView(person, this.genealogyView.getContainer(), this.genealogyView.getJSPlumbInstance());
        const personController: PersonController = new PersonController(person, personView);
        
        personViews.set(person.getId(), personView);

        for (const child of person.getChildren()) {
            this.instantiateViewsAndControllersForDescendantsAndAddItToMap(child, personViews);
        }
    }

    private addSettingRootPersonEventListenerToNameParagraphsOfPersonViews(personViews: Map<string, PersonView>): void {
        personViews.forEach((personView: PersonView, id: string) => {
            const nameElement: HTMLElement = personView.getNameParagraphElement();
            
            nameElement.addEventListener("click", (mouseEvent: MouseEvent): void => {
                let person: Person = this.genealogy.getPeople().get(id);
                this.setRootPerson(person);
            });
        });
    }

    private setNumberOfGenerations(event: Event): void {
        const depth: number = parseInt((<HTMLInputElement> event.target).value);
        this.genealogy.setNumberOfGenerations(depth);
        this.genealogyView.setIsActiveOfRedrawButton(false);
    }
}
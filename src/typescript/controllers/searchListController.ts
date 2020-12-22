import { Person } from "../models/person";
import { SearchList } from "../models/searchList";
import { PersonDatabase } from "../personDatabase";
import { SearchListView } from "../views/searchListView";
import { GenealogyController } from "./genealogyController";

export class SearchListController {
    private searchList: SearchList;
    private searchListView: SearchListView;
    private genealogyController: GenealogyController;
    private personDatabase: PersonDatabase;

    constructor(searchList: SearchList, searchListView: SearchListView, genealogyController: GenealogyController, personDatabase: PersonDatabase) {
        this.searchList = searchList;
        this.searchListView = searchListView;
        this.genealogyController = genealogyController;
        this.personDatabase = personDatabase;
        this.addSearchEventListener();
    }

    private addSearchEventListener(): void {
        this.searchListView.getSearchButtonElement().addEventListener("click", () => {
            this.personDatabase.findPersonByLabel(this.searchListView.getSearchInputElement().value, 20).then((people: Person[]) => {
                this.searchList.clearSearchResultPeople();
                this.searchList.getSearchResultPeople().push.apply(this.searchList.getSearchResultPeople(), people);

                this.searchListView.updateList(people);
                this.addEventListenersToResultTableRows();
            });
        });
    }

    private addEventListenersToResultTableRows(): void {
        let tableChildNodes: NodeList = this.searchListView.getResultTableElement().childNodes;

        for (let index: number = 0; index < tableChildNodes.length; index++) {
            const rowElement: HTMLElement = <HTMLElement> tableChildNodes[index];
            this.addSelectionEventListener(rowElement);
        }
    }

    private addSelectionEventListener(element: HTMLElement): void {
        element.addEventListener("click", (event: Event) => {
            let rowElement: HTMLElement = <HTMLElement> event.currentTarget;
            let id: string = rowElement.dataset.id;
            let selectedPerson: Person = this.searchList.findPersonInSearchResultPeople(id);

            if (selectedPerson != undefined) {
                this.searchList.setSelectedPerson(selectedPerson);
                this.searchListView.markElementAsSelected(rowElement);
                console.log("Selected Person:")
                console.log(selectedPerson);
              
                this.genealogyController.setRootPerson(selectedPerson);              
            } else {
                console.error("Selected Person was not found in memory");
            }
        });
    }
}
import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { SearchList } from "../models/searchList";
import { GenealogyView } from "../views/genealogyView";
import { SearchListView } from "../views/searchListView";
import { GenealogyController } from "./genealogyController";

export class SearchListController {
    private searchList: SearchList;
    private searchListView: SearchListView;
    private genealogyController: GenealogyController;

    constructor(searchList: SearchList, searchListView: SearchListView, genealogyController: GenealogyController) {
        this.searchList = searchList;
        this.searchListView = searchListView;
        this.genealogyController = genealogyController;
        this.addSearchEventListener();
    }

    private addSearchEventListener(): void {
        this.searchListView.getSearchButtonElement().addEventListener("click", () => {
            Person.findHumansByEntitySearch(this.searchListView.getSearchInputElement().value).then((people: Array<Person>) => {
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
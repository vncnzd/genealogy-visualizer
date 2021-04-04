import { Person } from "../models/person";
import { SearchList } from "../models/searchList";
import { PersonDatabase } from "../personDatabase";
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
        this.searchListView.getSearchInputElement().addEventListener("input", this.startSearchForPerson.bind(this));
        this.searchListView.getSearchInputElement().addEventListener("focus", this.startSearchForPerson.bind(this));
    }

    private startSearchForPerson(event: Event): void {
        const input: HTMLInputElement = <HTMLInputElement> event.target;
        const inputValue: string = input.value;
        this.searchList.findPersonByLabel(inputValue, 20);

        this.searchList.findPersonByLabel(inputValue, 20).then((foundPeople: Person[]): void => {
            this.searchListView.setSuggestionList(foundPeople);
            this.addEventListenersToResultTableRows();
        });
    }

    private addEventListenersToResultTableRows(): void {
        const tableChildNodes: NodeList = this.searchListView.getResultTableElement().childNodes;

        for (let index: number = 0; index < tableChildNodes.length; index++) {
            const rowElement: HTMLElement = <HTMLElement> tableChildNodes[index];
            rowElement.addEventListener("click", this.setSeletedAsRootPerson.bind(this));
        }
    }

    private setSeletedAsRootPerson(event: Event): void {
        const rowElement: HTMLElement = <HTMLElement> event.currentTarget;
        const id: string = rowElement.dataset.id;
        const selectedPerson: Person = this.searchList.findPersonInSearchResultPeople(id);

        if (selectedPerson != null) {
            this.searchList.setSelectedPerson(selectedPerson);
            this.searchListView.setValueOfInputField(selectedPerson.getName());
            this.searchListView.emptySearchResultsTable();
            this.genealogyController.setRootPerson(selectedPerson);             
        } else {
            console.error("Selected Person was not found in memory");
        }
    }
}
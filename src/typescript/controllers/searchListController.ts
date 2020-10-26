import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { SearchList } from "../models/searchList";
import { SearchListView } from "../views/searchListView";

export class SearchListController {
    private searchList: SearchList;
    private searchListView: SearchListView;

    constructor(searchList: SearchList, searchListView: SearchListView) {
        this.searchList = searchList;
        this.searchListView = searchListView;
        this.addSearchEventListener();
    }

    private addSearchEventListener(): void {
        this.searchListView.getSearchButtonElement().addEventListener("click", () => {
            Person.findHumansByEntitySearch(this.searchListView.getSearchInputElement().value).then((people: Array<Person>) => {
                this.searchList.clearResultPeople();
                this.searchList.getResultPeople().push.apply(this.searchList.getResultPeople(), people);

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
            let selectedPerson: Person = this.searchList.findPersonInResultPeople(id);

            if (selectedPerson != undefined) {
                this.searchList.setSelectedPerson(selectedPerson);
                this.searchListView.markElementAsSelected(rowElement);
                console.log("Selected Person:")
                console.log(selectedPerson);

                // Test
                let genealogy: Genealogy = new Genealogy();
                genealogy.getChildrenOfPerson(selectedPerson, new Map<string, Person>(), 1).then((result) => console.log(result));
                
            } else {
                console.error("Selected Person was not found in memory");
            }
        });
    }
}
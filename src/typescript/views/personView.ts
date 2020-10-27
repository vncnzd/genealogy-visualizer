import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";

export class PersonView {
    private rootElement: HTMLElement;
    private divContainerElement: HTMLElement;
    private deleteButtonElement: HTMLElement;

    private jsPlumbInst: jsPlumbInstance;
    private connectionParameters: ConnectParams;

    constructor(rootElement: HTMLElement, jsPlumbInst: jsPlumbInstance) {
        this.rootElement = rootElement;
        this.jsPlumbInst = jsPlumbInst;

        this.connectionParameters = {
            anchors: ["Bottom", "Top"],
            connector: [ "Flowchart", {}],
            endpoint: "Dot",
            deleteEndpointsOnDetach: false,
            detachable: false
        }
    }

    public createPersonNode(person: Person): void {
        this.divContainerElement = document.createElement("div");
        this.divContainerElement.classList.add("square");
        this.divContainerElement.id = person.getId();

        let paragraphElement: HTMLElement = document.createElement("p");
        let nameTextNode: Text = document.createTextNode(person.getName());
        paragraphElement.classList.add("person-name");
        paragraphElement.appendChild(nameTextNode);
        this.divContainerElement.appendChild(paragraphElement);

        let buttonElement: HTMLElement = document.createElement("button");
        let buttonTextNode: Text = document.createTextNode("Delete");
        buttonElement.appendChild(buttonTextNode);
        this.divContainerElement.appendChild(buttonElement);
        this.deleteButtonElement = buttonElement;
        
        this.rootElement.appendChild(this.divContainerElement);

        this.jsPlumbInst.draggable(this.divContainerElement.id);
    }

    // this should probably be in the treeView
    // public connect(source: Person, target: Person): void {
    //     //     jsPlumbInst.connect({ source: 'div-one', target: 'div-two' }, connectionParameters);
    // }

    public getDeleteButtonElement(): HTMLElement {
        return this.deleteButtonElement;
    }

    public remove() {
        this.rootElement.removeChild(this.divContainerElement);
    }
}
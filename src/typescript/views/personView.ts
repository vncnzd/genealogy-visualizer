import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";

export class PersonView {
    static width = 100;
    static height = 100;

    private rootElement: HTMLElement;
    private divContainerElement: HTMLElement;
    private deleteButtonElement: HTMLElement;

    private jsPlumbInst: jsPlumbInstance;
    // private connectionParameters: ConnectParams;

    constructor(person: Person, rootElement: HTMLElement, jsPlumbInst: jsPlumbInstance) {
        this.rootElement = rootElement;
        this.jsPlumbInst = jsPlumbInst;
        this.createPersonNode(person);
    }

    public createPersonNode(person: Person): void {
        this.divContainerElement = document.createElement("div");
        this.divContainerElement.classList.add("square");
        this.divContainerElement.id = person.getId();
        this.divContainerElement.style.width = PersonView.width + "px";
        this.divContainerElement.style.height = PersonView.height + "px";

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

    public moveToPositionInPx(left: number, top: number) {
        this.divContainerElement.style.left = left + "px";
        this.divContainerElement.style.top = top + "px";
    }

    public getViewWidthInPx(): number {
        return this.divContainerElement.offsetWidth;
    }

    public getViewHeightInPx(): number {
        return this.divContainerElement.offsetHeight;
    }

    public getPositionLeft(): number {
        return this.divContainerElement.offsetLeft;
    }

    public getPositionTop(): number {
        return this.divContainerElement.offsetTop;
    }

    public getDeleteButtonElement(): HTMLElement {
        return this.deleteButtonElement;
    }

    public remove() {
        this.rootElement.removeChild(this.divContainerElement);
    }
}
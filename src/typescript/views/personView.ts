import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";

export class PersonView {
    static width = 150;
    static height = 150;

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
        this.rootElement.appendChild(this.divContainerElement);

        let paragraphElement: HTMLElement = document.createElement("p");
        paragraphElement.classList.add("person-name");
        this.divContainerElement.appendChild(paragraphElement);

        let nameTextNode: Text = document.createTextNode(person.getName());
        paragraphElement.appendChild(nameTextNode);

        let birthAndDeathParagraph: HTMLElement = document.createElement("p");
        this.divContainerElement.appendChild(birthAndDeathParagraph);

        let birthAndDeathTextNode: Text = document.createTextNode(person.getDatesOfBirth()[0]?.getFullYear() + " - " + person.getDatesOfDeath()[0]?.getFullYear());
        birthAndDeathParagraph.appendChild(birthAndDeathTextNode);

        this.jsPlumbInst.draggable(this.divContainerElement);
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
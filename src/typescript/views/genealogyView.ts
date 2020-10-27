import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { PersonController } from "../controllers/personController";
import { Person } from "../models/person";
import { PersonView } from "./personView";

export class GenealogyView {
    private containerElement: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private depthInput: HTMLInputElement;
    private descendantsButton: HTMLElement;
    private connectionParameters: ConnectParams;

    constructor(containerElement: HTMLElement, jsPlumbInst: jsPlumbInstance, depthInput: HTMLInputElement, descendantsButton: HTMLElement) {
        this.containerElement = containerElement;
        this.jsPlumbInst = jsPlumbInst;
        this.depthInput = depthInput;
        this.descendantsButton = descendantsButton;

        this.connectionParameters = {
            anchors: ["Bottom", "Top"],
            connector: [ "Flowchart", {}],
            endpoint: "Dot",
            deleteEndpointsOnDetach: false,
            detachable: false
        }
    }

    public displayPersonWithDescendants(person: Person) {
        let personView = new PersonView(person, this.containerElement, this.jsPlumbInst);
        let distanceFromLeftBorder = this.containerElement.clientWidth / 2 - personView.getViewWidthInPx() / 2;
        personView.moveToPositionInPx(distanceFromLeftBorder, 0);
        this.jsPlumbInst.revalidate(person.getId());
        this.displayDescendants(person, personView);
    }

    public displayDescendants(parent: Person, parentPersonView: PersonView) {
        let parentTop: number = parentPersonView.getPositionTop();
        let parentLeft: number = parentPersonView.getPositionLeft();
        let numberOfChildren: number = parent.getChildren().length;
        let personViewHeight: number = PersonView.height;
        let personViewWidth: number = PersonView.width;

        let calculatedTop = parentTop + personViewHeight + 100;
        let parentMiddleLeft = (parentLeft + personViewWidth / 2);
        let spaceBetweenEachChild = 50;
        let widthOfChildren = numberOfChildren * personViewWidth + (numberOfChildren - 1) * spaceBetweenEachChild; 
        let calculatedLeft = parentMiddleLeft - widthOfChildren / 2;

        for (let index = 0; index < parent.getChildren().length; index++) {
            const child = parent.getChildren()[index];
            let childPersonView = new PersonView(child, this.containerElement, this.jsPlumbInst);
            childPersonView.moveToPositionInPx(calculatedLeft + index * (personViewWidth + spaceBetweenEachChild), calculatedTop);
            this.jsPlumbInst.revalidate(child.getId());
            this.connect(parent, child);
            this.displayDescendants(child, childPersonView);
        }
    }
    
    public connect(source: Person, target: Person): void {
        this.jsPlumbInst.connect({ source: source.getId(), target: target.getId() }, this.connectionParameters);
    }

    // getters and setters

    public getDepthInput(): HTMLInputElement {
        return this.depthInput;
    }

    public getDepth(): number {
        return parseInt(this.depthInput.value);
    }

    public getDescendantsButton(): HTMLElement {
        return this.descendantsButton;
    }
}
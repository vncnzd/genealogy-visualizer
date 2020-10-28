import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { PersonController } from "../controllers/personController";
import { Person } from "../models/person";
import { PersonView } from "./personView";

export class GenealogyView {
    private containerElement: HTMLElement;
    private containerElementWrapper: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private depthInput: HTMLInputElement;
    private descendantsButton: HTMLElement;
    private zoomInButton: HTMLElement;
    private zoomOutButton: HTMLElement;
    private connectionParameters: ConnectParams;

    private scale = 1;
    private isPaning: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;
    private transformX: number = 0;
    private transformY: number = 0

    constructor(containerElement: HTMLElement, jsPlumbInst: jsPlumbInstance, depthInput: HTMLInputElement, descendantsButton: HTMLElement, containerElementWrapper: HTMLElement, zoomInButton: HTMLElement, zoomOutButton: HTMLElement) {
        this.containerElement = containerElement;
        this.jsPlumbInst = jsPlumbInst;
        this.depthInput = depthInput;
        this.descendantsButton = descendantsButton;
        this.containerElementWrapper = containerElementWrapper;
        this.zoomInButton = zoomInButton;
        this.zoomOutButton = zoomOutButton;

        this.connectionParameters = {
            anchors: ["Bottom", "Top"],
            connector: [ "Flowchart", {}],
            endpoint: "Dot",
            deleteEndpointsOnDetach: false,
            detachable: false
        }

        this.addZoomEventListeners();
        this.addPanningEventListeners();
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

    private addZoomEventListeners() {
        this.zoomOutButton.addEventListener("click", (event: MouseEvent) => {
            this.scale -= 0.1;
            if (this.scale < 0.1) {
                this.scale = 0.1;
            }
            // jsPlumbInst.setZoom(scale);
            this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
        });

        this.zoomInButton.addEventListener("click", (event: MouseEvent) => {
            this.scale += 0.1;
            // jsPlumbInst.setZoom(scale);
            this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
        });    
    }

    private addPanningEventListeners() {
        this.containerElementWrapper.addEventListener("mousedown", (event: MouseEvent) => {
            this.lastX = event.offsetX;
            this.lastY = event.offsetY;
            this.isPaning = true;
        });
    
        this.containerElementWrapper.addEventListener("mousemove", (event: MouseEvent) => {
            if (this.isPaning) {
                let xDifference = event.offsetX - this.lastX;
                let yDifference = event.offsetY - this.lastY;
    
                this.transformX += xDifference;
                this.transformY += yDifference;
                
                this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
                this.jsPlumbInst.repaintEverything();
    
                this.lastX = event.offsetX;
                this.lastY = event.offsetY;
            }
        });
    
        this.containerElementWrapper.addEventListener("mouseup", (event: MouseEvent) => {
            this.isPaning = false;
        });
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
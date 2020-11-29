import { ConnectParams, EndpointOptions, jsPlumb, jsPlumbInstance, jsPlumbUtil } from "jsplumb";
import { Person } from "../models/person";
import { PersonView } from "./personView";

export class GenealogyView {
    private containerElement: HTMLElement;
    private containerElementWrapper: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private depthInput: HTMLInputElement;
    private descendantsButton: HTMLElement;
    private ascendantsButton: HTMLElement;
    private zoomInButton: HTMLElement;
    private zoomOutButton: HTMLElement;
    private connectionParameters: ConnectParams;

    private scale = 1;
    private isPaning: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;
    private transformX: number = 0;
    private transformY: number = 0

    constructor(parentElement: HTMLElement) {
        const optionsContainer: HTMLElement = document.createElement("div");
        parentElement.appendChild(optionsContainer);

        this.ascendantsButton = document.createElement("button");
        this.ascendantsButton.innerHTML = "Ascendants";
        this.ascendantsButton.id = "ascendants-button";
        optionsContainer.appendChild(this.ascendantsButton);

        this.descendantsButton = document.createElement("button");
        this.descendantsButton.innerHTML = "Descendants";
        this.descendantsButton.id = "descendants-button";
        optionsContainer.appendChild(this.descendantsButton);

        const depthInputLabel = document.createElement("label");
        depthInputLabel.innerHTML = "Depth";
        depthInputLabel.setAttribute("for", "depth-input");
        optionsContainer.appendChild(depthInputLabel);

        this.depthInput = document.createElement("input");
        this.depthInput.type = "number";
        this.depthInput.name = "depth-input";
        this.depthInput.id = "depth-input";
        this.depthInput.max = "50";
        this.depthInput.min = "1";
        this.depthInput.value = "4";
        optionsContainer.appendChild(this.depthInput);

        this.containerElementWrapper = document.createElement("div");
        this.containerElementWrapper.id = "jsplumb-container-wrapper";
        parentElement.appendChild(this.containerElementWrapper);
        
        this.containerElement = document.createElement("div");
        this.containerElement.id = "jsplumb-container";
        this.containerElementWrapper.appendChild(this.containerElement);

        this.jsPlumbInst = jsPlumb.getInstance();
        this.jsPlumbInst.setContainer(this.containerElement);

        this.zoomInButton = document.createElement("button");
        this.zoomInButton.id = "zoom-in-button";
        this.zoomInButton.innerHTML = "Zoom in";
        parentElement.appendChild(this.zoomInButton);

        this.zoomOutButton = document.createElement("button");
        this.zoomOutButton.id = "zoom-out-button";
        this.zoomOutButton.innerHTML = "Zoom out";
        parentElement.appendChild(this.zoomOutButton);

        this.connectionParameters = {
            anchors: ["Bottom", "Top"],
            connector: [ "Flowchart", {}],
            endpoint: "Dot",
            deleteEndpointsOnDetach: false,
            detachable: false,
            // @ts-ignore
            paintStyle:{ 
                stroke: "black", 
                strokeWidth: 5 
            },
            endpointStyles: [
                { fill:"black"},
                { fill:"grey" }
            ]
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
            this.zoomOut();
        });

        this.zoomInButton.addEventListener("click", (event: MouseEvent) => {
            this.zoomIn();
        });
        
        window.addEventListener("wheel", (event: WheelEvent) => {
            const delta = Math.sign(event.deltaY);

            if (delta > 0) {
                this.zoomOut();
            } else {
                this.zoomIn();
            }
        });
    }

    private zoomIn(): void {
        this.scale += 0.1;
        this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
        this.jsPlumbInst.setZoom(this.scale);
    }

    private zoomOut(): void {
        this.scale -= 0.1;
        if (this.scale < 0.1) {
            this.scale = 0.1;
        }
        this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
        this.jsPlumbInst.setZoom(this.scale);
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
                // this.jsPlumbInst.repaintEverything();
    
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
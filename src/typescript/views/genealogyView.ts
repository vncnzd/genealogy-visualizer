import { ConnectParams, jsPlumb, jsPlumbInstance, jsPlumbUtil } from "jsplumb";
import { Person } from "../models/person";
import { PersonView } from "./personView";
import { Position } from "../position"
import { AncestorsTreeDrawer } from "../ancestorsTreeDrawer";
import { TreeDrawer } from "../treeDrawer";
import { WSTreeDrawer } from "../wsTreeDrawer";
import { WSPersonNode } from "../wsPersonNode";
import { RTTreeDrawer } from "../rtTreeDrawer";
import { WalkerTreeDrawer } from "../walkerTreeDrawer";

export class GenealogyView {
    private containerElement: HTMLElement;
    private containerElementWrapper: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private depthInput: HTMLInputElement;
    private descendantsButton: HTMLElement;
    private ancestorsButton: HTMLElement;
    private zoomInButton: HTMLElement;
    private zoomOutButton: HTMLElement;
    private connectionParameters: ConnectParams;

    private timelineContainerWrapper: HTMLElement;
    private timelineContainer: HTMLElement;
    private timelineLineContainers: HTMLElement[];
    private pixelPerYear: number;

    private scale = 1;
    private isPaning: boolean = false;
    private transformX: number = 0;
    private transformY: number = 0
    private zoomFactor: number;

    private personViews: Map<string, PersonView>;

    constructor(parentElement: HTMLElement, languageData: Object) {
        this.timelineLineContainers = new Array<HTMLElement>(6000);
        this.pixelPerYear = 10;
        this.zoomFactor = 0.1;
        this.personViews = new Map<string, PersonView>();
        
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

        this.initializeHTMLElements(parentElement, languageData);
        this.addZoomEventListeners();
        this.addPanningEventListeners();
    }

    private initializeHTMLElements(parentElement: HTMLElement, languageData: Object) {
        const optionsContainer: HTMLElement = document.createElement("div");
        parentElement.appendChild(optionsContainer);

        this.ancestorsButton = document.createElement("button");
        this.ancestorsButton.innerHTML = languageData["ancestorsButtonText"];
        this.ancestorsButton.id = "ancestors-button";
        optionsContainer.appendChild(this.ancestorsButton);

        this.descendantsButton = document.createElement("button");
        this.descendantsButton.innerHTML = languageData["descendantsButtonText"];
        this.descendantsButton.id = "descendants-button";
        optionsContainer.appendChild(this.descendantsButton);

        const depthInputLabel = document.createElement("label");
        depthInputLabel.innerHTML = languageData["depthInputLabelText"];
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
        this.zoomInButton.innerHTML = languageData["zoomInButtonText"];
        parentElement.appendChild(this.zoomInButton);

        this.zoomOutButton = document.createElement("button");
        this.zoomOutButton.id = "zoom-out-button";
        this.zoomOutButton.innerHTML = languageData["zoomOutButtonText"];
        parentElement.appendChild(this.zoomOutButton);

        this.addTimeline();
    }

    private addTimeline() {
        this.timelineContainerWrapper = document.createElement("div");
        this.timelineContainerWrapper.id = "timeline-container-wrapper";
        this.containerElementWrapper.appendChild(this.timelineContainerWrapper);

        this.timelineContainer = document.createElement("div");
        this.timelineContainer.id = "timeline-container";
        this.timelineContainerWrapper.appendChild(this.timelineContainer);

        for (let year = -5000; year < 2500; year+= 5) {
            const lineContainer: HTMLElement = document.createElement("div");
            this.timelineContainer.appendChild(lineContainer);
            lineContainer.style.top = `${year * this.pixelPerYear}px`
            lineContainer.classList.add("timeline-line-container");
            this.timelineLineContainers.push(lineContainer);

            const line: HTMLElement = document.createElement("div");
            line.classList.add("timeline-line");
            lineContainer.appendChild(line);

            const number: HTMLElement = document.createElement("div");
            number.classList.add("timeline-number");
            const numberText: Text = document.createTextNode("" + year)
            number.appendChild(numberText);

            lineContainer.appendChild(number);
        }
    }

    public displayAncestors(rootPerson: Person) {
        this.instantiateViewsForAncestorsAndAddItToMap(rootPerson, this.personViews);
        let drawer: TreeDrawer = new WalkerTreeDrawer();
        drawer.run(rootPerson, this.personViews, this.pixelPerYear, this.jsPlumbInst, true);
    }

    public displayDescendants(rootPerson: Person) {
        this.instantiateViewsForDescendantsAndAddItToMap(rootPerson, this.personViews);
        let drawer: TreeDrawer = new WalkerTreeDrawer();
        drawer.run(rootPerson, this.personViews, this.pixelPerYear, this.jsPlumbInst, false);
    }

    private instantiateViewsForAncestorsAndAddItToMap(ancestor: Person, personViews: Map<string, PersonView>) {
        let personView: PersonView = new PersonView(ancestor, this.containerElement, this.jsPlumbInst);
        personViews.set(ancestor.getId(), personView);

        if (ancestor.getFather() != null) {
            this.instantiateViewsForAncestorsAndAddItToMap(ancestor.getFather(), personViews);
        }
        if (ancestor.getMother() != null) {
            this.instantiateViewsForAncestorsAndAddItToMap(ancestor.getMother(), personViews);
        }
    }

    private instantiateViewsForDescendantsAndAddItToMap(person: Person, personViews: Map<string, PersonView>) {
        let personView: PersonView = new PersonView(person, this.containerElement, this.jsPlumbInst);
        personViews.set(person.getId(), personView);

        for (const child of person.getChildren()) {
            this.instantiateViewsForDescendantsAndAddItToMap(child, personViews);
        }
    }

    private addZoomEventListeners() {
        this.zoomOutButton.addEventListener("click", (event: MouseEvent) => {
            const relativeMousePosition: Position = this.getRelativeMousePosition(event);
            this.zoom(relativeMousePosition, -this.zoomFactor)
        });

        this.zoomInButton.addEventListener("click", (event: MouseEvent) => {
            const relativeMousePosition: Position = this.getRelativeMousePosition(event);
            this.zoom(relativeMousePosition, this.zoomFactor);
        });
        
        this.containerElementWrapper.addEventListener("wheel", (event: WheelEvent) => {
            const delta = Math.sign(event.deltaY);
            const minimumScale = 0.2;

            const relativeMousePosition: Position = this.getRelativeMousePosition(event);

            if (delta > 0) {
                if (this.scale > minimumScale) {
                    this.zoom(relativeMousePosition, -this.zoomFactor);
                }
            } else {
                this.zoom(relativeMousePosition, this.zoomFactor);
            }
        });
    }

    private zoom(mousePosition: Position, zoomFactor: number) {
        this.scaleAndTranslateElementsWithMousePosition(this.scale, this.scale + zoomFactor, mousePosition.x, mousePosition.y);
        this.scale += zoomFactor;
    }

    private getRelativeMousePosition(mouseEvent: MouseEvent): Position {
        let rect = this.containerElementWrapper.getBoundingClientRect();
        let mousePositionX = mouseEvent.clientX - rect.left;
        let mousePositionY = mouseEvent.clientY - rect.top;

        return new Position(mousePositionX, mousePositionY);
    }

    private scaleAndTranslateElementsWithMousePosition(currentScale: number, newScale: number, mousePositionX: number, mousePositionY: number): void {
        let scaleRatio = newScale / currentScale;

        let scaledMousePositionX = this.transformX + (mousePositionX - this.transformX) * scaleRatio;
        let scaledMousePositionY = this.transformY + (mousePositionY- this.transformY) * scaleRatio;

        this.transformX += mousePositionX - scaledMousePositionX;
        this.transformY += mousePositionY - scaledMousePositionY;

        this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, newScale);
        this.adjustTimelineScale(newScale);
    }

    private adjustTimelineScale(scale: number): void {
        this.timelineLineContainers.forEach((element: Element, index: number) => {
            const htmlElement: HTMLElement = (element as HTMLElement);

            if (index % 5 !== 0) {
                if (scale <= 0.3) {
                    htmlElement.style.visibility = "hidden";
                } else {
                    htmlElement.style.visibility = "visible";
                }
            }
            
            // (element as HTMLElement).style.transform = `scale(${1 / scale})`;
        });
    }

    private translateAndScaleContainerAndTimeline(x: number, y: number, scale: number): void {
        this.containerElement.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
        this.timelineContainerWrapper.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${y})`;
    }

    private addPanningEventListeners() {
        this.containerElementWrapper.addEventListener("mousedown", (event: MouseEvent) => {
            this.isPaning = true;
        });
            
        this.containerElementWrapper.addEventListener("mouseup", (event: MouseEvent) => {
            this.isPaning = false;
        });
    
        this.containerElementWrapper.addEventListener("mousemove", (event: MouseEvent) => {
            if (this.isPaning) {
                let xDifference = event.movementX;
                let yDifference = event.movementY;
    
                this.transformX += xDifference;
                this.transformY += yDifference;

                this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, this.scale);
            }
        });
    }

    // getters and setters

    public getDepthInput(): HTMLInputElement {
        return this.depthInput;
    }

    public getDescendantsButton(): HTMLElement {
        return this.descendantsButton;
    }

    public getAncestorsButton(): HTMLElement {
        return this.ancestorsButton;
    }

    public getPersonViews(): Map<string, PersonView> {
        return this.personViews;
    }
}
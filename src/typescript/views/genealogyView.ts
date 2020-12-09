import { ConnectParams, jsPlumb, jsPlumbInstance, jsPlumbUtil } from "jsplumb";
import { PersonController } from "../controllers/personController";
import { Person } from "../models/person";
import { SexOrGender } from "../sexOrGender";
import { PersonView } from "./personView";

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
    private lastX: number = 0;
    private lastY: number = 0;
    private transformX: number = 0;
    private transformY: number = 0

    constructor(parentElement: HTMLElement) {
        this.timelineLineContainers = new Array<HTMLElement>(6000);
        this.pixelPerYear = 10;

        const optionsContainer: HTMLElement = document.createElement("div");
        parentElement.appendChild(optionsContainer);

        this.ancestorsButton = document.createElement("button");
        this.ancestorsButton.innerHTML = "Ancestors";
        this.ancestorsButton.id = "ancestors-button";
        optionsContainer.appendChild(this.ancestorsButton);

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
        this.addTestPerson();
        this.addTimeline();
    }

    private addTimeline() {
        this.timelineContainerWrapper = document.createElement("div");
        this.timelineContainerWrapper.id = "timeline-container-wrapper";
        this.containerElementWrapper.appendChild(this.timelineContainerWrapper);

        this.timelineContainer = document.createElement("div");
        this.timelineContainer.id = "timeline-container";
        this.timelineContainerWrapper.appendChild(this.timelineContainer);

        for (let year = -5000; year < 2500; year+= 10) {
            const lineContainer: HTMLElement = document.createElement("div");
            this.timelineContainer.appendChild(lineContainer);
            lineContainer.style.top = `${year * this.pixelPerYear}px`
            lineContainer.classList.add("timeline-line-container");
            this.timelineLineContainers.push(lineContainer);

            const line: HTMLElement = document.createElement("div");
            line.classList.add("timeline-line");
            lineContainer.appendChild(line);

            const number: HTMLElement = document.createElement("div");
            const numberText: Text = document.createTextNode("" + year)
            number.appendChild(numberText);

            lineContainer.appendChild(number);
        }
    }

    private addTestPerson(): void {
        // put this into the genealogy controller
        let person: Person = new Person("testid");
        person.setName("testperson");
        person.setSexOrGender(new SexOrGender("Q6581097", "male"));
        let birthDate = new Date();
        birthDate.setFullYear(0);
        person.getDatesOfBirth().push(birthDate);

        let deathDate = new Date();
        deathDate.setFullYear(40);
        person.getDatesOfDeath().push(deathDate);
        let personView: PersonView = new PersonView(person, this.containerElement, this.jsPlumbInst);
        personView.setHeightInPx((deathDate.getFullYear() - birthDate.getFullYear()) * this.pixelPerYear);
        let personController: PersonController = new PersonController(person, personView);
        this.placePersonAccordingToYear(person, personView);
    }

    private placePersonAccordingToYear(person: Person, personView: PersonView): void {
        const year: number = person.getDatesOfBirth()[0].getFullYear();
        personView.moveToPositionInPx(50, year * this.pixelPerYear);
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
        let personViewHeight: number = PersonView.boxHeight;
        let personViewWidth: number = PersonView.boxWidth;

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
            // this.zoomOut();
        });

        this.zoomInButton.addEventListener("click", (event: MouseEvent) => {
            // this.zoomIn();
        });
        
        this.containerElementWrapper.addEventListener("wheel", (event: WheelEvent) => {
            const delta = Math.sign(event.deltaY);

            let rect = this.containerElementWrapper.getBoundingClientRect();
            let mouseX = event.clientX - rect.left; //x position within the element.
            let mouseY = event.clientY - rect.top;  //y position within the element.

            

            if (delta > 0) {
                console.log("MouseX: " + mouseX + " MouseY: " + mouseY)
                console.log("Old Scale: " + this.scale);
                let oldScale = this.scale;
                this.scale -= 0.1;
                let scaleRatio = this.scale / oldScale;
                console.log("New Scale: " + this.scale);
                console.log("TransformX: " + this.transformX)
                console.log("TransformY: " + this.transformY)
                let scaledMouseX = this.transformX + (mouseX - this.transformX) * scaleRatio;
                let scaledMouseY = this.transformY + (mouseY- this.transformY) * scaleRatio;

                this.transformX += mouseX - scaledMouseX;
                this.transformY += mouseY - scaledMouseY;

                console.log("New TransformX: " + this.transformX);
                console.log("new Transform Y: " + this.transformY);

                this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
                // this.zoomOut(event);
            } else {
                // mouseX = 3;
                // mouseY = 1.5;
                console.log("MouseX: " + mouseX + " MouseY: " + mouseY)
                console.log("Old Scale: " + this.scale);
                let oldScale = this.scale;
                this.scale += 0.1;
                let scaleRatio = this.scale / oldScale;
                console.log("New Scale: " + this.scale);
                console.log("TransformX: " + this.transformX)
                console.log("TransformY: " + this.transformY)
                let scaledMouseX = this.transformX + (mouseX - this.transformX) * scaleRatio;
                let scaledMouseY = this.transformY + (mouseY- this.transformY) * scaleRatio;

                this.transformX += mouseX - scaledMouseX;
                this.transformY += mouseY - scaledMouseY;

                console.log("New TransformX: " + this.transformX);
                console.log("new Transform Y: " + this.transformY);

                this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
                // this.zoomIn(event);
            }
        });
    }

    private zoomIn(wheelEvent: WheelEvent): void {
        let scaleRatio = 1 - this.scale + 0.1 / this.scale;
        this.scale += 0.1;
        let scale = this.scale;
        // this.transformX += (wheelEvent.offsetX - this.transformX) * scaleRatio;
        // this.transformX += (wheelEvent.offsetX - this.transformX) * scaleRatio;

        this.containerElement.style.transform = `matrix(${scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
        // this.adjustElementsToScale(this.scale, wheelEvent);
    }

    private zoomOut(wheelEvent: WheelEvent): void {
        this.scale -= 0.1;

        if (this.scale < 0.1) {
            this.scale = 0.1;
        }

        // this.adjustElementsToScale(this.scale, wheelEvent);        
    }

    private adjustElementsToScale(scale: number, wheelEvent: WheelEvent): void {
        // let xDifference = wheelEvent.offsetX * this.scale;
        // let yDifference = wheelEvent.offsetY * this.scale;

        // this.transformX += xDifference;
        // this.transformY += yDifference;
        
        
        //timeline code
        this.timelineContainerWrapper.style.transform = `scale(${scale})`;
        this.timelineLineContainers.forEach((element: Element, index: number) => {
            const htmlElement: HTMLElement = (element as HTMLElement);

            if (index % 10 !== 0) {
                if (scale < 0.25) {
                    htmlElement.style.visibility = "hidden";
                } else {
                    htmlElement.style.visibility = "visible";
                }
            }

            (element as HTMLElement).style.transform = `scale(${1 / this.scale})`;
        });

        this.jsPlumbInst.setZoom(this.scale);
    }

    private addPanningEventListeners() {
        this.containerElementWrapper.addEventListener("mousedown", (event: MouseEvent) => {
            this.isPaning = true;
        });
    
        this.containerElementWrapper.addEventListener("mousemove", (event: MouseEvent) => {
            if (this.isPaning) {
                let xDifference = event.movementX;
                let yDifference = event.movementY;
    
                this.transformX += xDifference;
                this.transformY += yDifference;

                this.containerElement.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.transformX}, ${this.transformY})`;
                this.timelineContainerWrapper.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, 0, ${this.transformY})`;
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

    public getAncestorsButton(): HTMLElement {
        return this.ancestorsButton;
    }
}
import { jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";

export class GenealogyView {
    private containerElement: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private depthInput: HTMLInputElement;

    constructor(containerElement: HTMLElement, jsPlumbInst: jsPlumbInstance, depthInput: HTMLInputElement) {
        this.containerElement = containerElement;
        this.jsPlumbInst = jsPlumbInst;
        this.depthInput = depthInput;
    }

    // this should probably be in the treeView
    // public connect(source: Person, target: Person): void {
    //     //     jsPlumbInst.connect({ source: 'div-one', target: 'div-two' }, connectionParameters);
    // }

    // getters and setters

    public getDepthInput(): HTMLInputElement {
        return this.depthInput;
    }

    public getDepth(): number {
        return parseInt(this.depthInput.value);
    }
}
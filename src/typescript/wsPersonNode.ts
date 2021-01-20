import { Person } from "./models/person";
import { Position } from "./position";
import { PersonView } from "./views/personView";

export class WSPersonNode {
    private person: Person;
    private status: string;
    private height: number
    private modifier: number

    constructor(person: Person, height: number) {
        this.person = person;
        this.height = height
        this.modifier = 0;
    }

    public setStatus(status: string): void {
        this.status = status;
    }

    public getStatus(): string {
        return this.status;
    }

    public getHeight(): number {
        return this.height;
    }

    public setModifier(modifier: number): void {
        this.modifier = modifier;
    }

    public getModifier(): number {
        return this.modifier;
    }
}
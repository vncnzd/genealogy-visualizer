import { Person } from "../models/person";
import { PersonView } from "../views/personView";

export class WalkerNode {
    public mod: number;
    public prelim: number;
    public shift: number;
    public change: number;
    public number: number;

    public thread: WalkerNode;
    public ancestor: WalkerNode;

    public parent: WalkerNode;
    public children: WalkerNode[];
    public leftSibling: WalkerNode;
    public rightSibling: WalkerNode;

    public person: Person;
    public personView: PersonView;

    constructor(person: Person, personView: PersonView) {
        this.mod = 0;
        this.prelim = 0;
        this.shift = 0;
        this.change = 0;
        this.number = 0;

        this.person = person;
        this.personView = personView;
        this.children = [];
    }

    public isLeaf(): boolean {
        return this.children.length == 0;
    }

    public getLeftMostChild(): WalkerNode {
        return this.children[0];
    }

    public getRightMostChild(): WalkerNode {
        return this.children[this.children.length - 1];
    }

    public getNextRight(): WalkerNode {
        if (this.children.length > 0) {
            return this.getRightMostChild();
        } else {
            return this.thread;
        }
    }

    public getNextLeft(): WalkerNode {
        if (this.children.length > 0) {
            return this.getLeftMostChild();
        } else {
            return this.thread;
        }
    }
}
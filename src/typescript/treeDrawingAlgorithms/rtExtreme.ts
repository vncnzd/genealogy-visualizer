import { RTNode } from "./RTNode";

export class RTExtreme {
    public address: RTNode; 
    public offset: number; // offset from root of subtree
    public level: number;  // tree level

    constructor() {
        this.offset = 0;
        this.level = 0;
    }
}
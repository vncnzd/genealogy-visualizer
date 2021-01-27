import { jsPlumbInstance } from "jsplumb";
import { Person } from "./models/person";
import { RTExtreme } from "./rtExtreme";
import { RTNode } from "./RTNode";
import { TreeDrawer } from "./treeDrawer";
import { PersonView } from "./views/personView";

export class RTTreeDrawer implements TreeDrawer {
    private nodeMap: Map<string, RTNode>;

    private l: RTNode;
    private r: RTNode;
    private lr: RTExtreme;
    private ll: RTExtreme;
    private rr: RTExtreme;
    private rl: RTExtreme;
    private cursep: number;
    private rootsep: number;
    private minsep: number;
    private leftOffsetSum: number;
    private rightOffsetSum: number;


    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, height: number, pixelPerYear: number, jsPlumbInst: jsPlumbInstance): void {
        this.nodeMap = new Map<string, RTNode>();
        this.instantiateNodeAndLinkWithViews(rootPerson, personViewsMap, this.nodeMap);
        
        
        let rightMost: Person;
        let leftMost: Person;
        let level: number;
    }

    private setup(currentNode: RTNode, level: number, rightMost: RTExtreme, leftMost: RTExtreme): void {
        if (currentNode == null) {
            leftMost.level = -1;
            rightMost.level = -1;
        } else {
            currentNode.personView.setOffsetTopInPx(level);
            
            this.l = this.nodeMap.get(currentNode.person.getFather().getId());
            this.r= this.nodeMap.get(currentNode.person.getMother().getId());

            this.setup(this.l, level++, this.lr, this.ll);
            this.setup(this.r, level++, this.rr, this.rl);

            if (this.r == null && this.l == null) {
                rightMost.address = currentNode;
                leftMost.address = currentNode;

                rightMost.level = level;
                leftMost.level = level;

                rightMost.offset = 0;
                leftMost.offset = 0;
                currentNode.offset = 0;
            } else {
                this.cursep = this.minsep;
                this.rootsep = this.minsep;
                this.leftOffsetSum = 0;
                this.rightOffsetSum = 0;

                while (this.l != null && this.r != null) {
                    if (this.cursep < this.minsep) {
                        this.rootsep = this.rootsep + (this.minsep - this.cursep);
                        this.cursep = this.minsep;
                    }

                    if (this.l.person.getMother() != null) {
                        this.leftOffsetSum = this.leftOffsetSum + this.l.offset;
                        this.cursep = this.cursep - this.l.offset;
                        this.l = this.nodeMap.get(this.l.person.getMother().getId());
                    } else {
                        this.leftOffsetSum = this.leftOffsetSum - this.l.offset;
                        this.cursep = this.cursep + this.l.offset;
                        this.l = this.nodeMap.get(this.l.person.getFather().getId());
                    }

                    if (this.r.person.getFather() != null) {
                        this.rightOffsetSum = this.rightOffsetSum - this.r.offset;
                        this.cursep = this.cursep - this.r.offset;
                        this.r = this.nodeMap.get(this.r.person.getFather().getId());
                    } else {
                        this.rightOffsetSum = this.rightOffsetSum + this.r.offset;
                        this.cursep = this.cursep + this.r.offset;
                        this.r = this.nodeMap.get(this.r.person.getMother().getId());
                    }
                }

                currentNode.offset = (this.rootsep + 1) / 2;
                this.leftOffsetSum = this.leftOffsetSum - currentNode.offset;
                this.rightOffsetSum = this.rightOffsetSum + currentNode.offset;

                // Update extreme descendants information

                if (this.rl.level > this.ll.level || currentNode.person.getFather() == null) {
                    leftMost = this.rl;
                    leftMost.offset = leftMost.offset + currentNode.offset;
                } else {
                    leftMost = this.ll;
                    leftMost.offset = leftMost.offset - currentNode.offset;
                }

                if (this.lr.level > this.rr.level || currentNode.person.getMother() == null) {
                    rightMost = this.lr;
                    rightMost.offset = rightMost.offset - currentNode.offset;
                } else {
                    rightMost = this.rr;
                    rightMost.offset = rightMost.offset + currentNode.offset;
                }

                // If subtrees of T were of uneven height, check to see if threading is necessary.
                // At most one thread needs to be inserted.

                // if (this.l != null && this.l != this.nodeMap.get(currentNode.person.getFather().getId())) {
                //     this.rr.address.thread = true;
                //     this.rr.address.offset = Math.abs((this.rr.offset + currentNode.offset) - this.leftOffsetSum);
                //     if ((this.leftOffsetSum - currentNode.offset) >= this.rr.offset) {
                //         this.rr.address.person.get
                //     }
                // }
            }
        }
    }

    private instantiateNodeAndLinkWithViews(currentPerson: Person, personViewsMap: Map<string, PersonView>, nodeMap: Map<string, RTNode>) {
        let node = new RTNode(currentPerson, personViewsMap.get(currentPerson.getId()), 0, false)
        nodeMap.set(currentPerson.getId(), node);

        if (currentPerson.getFather() != null) {
            this.instantiateNodeAndLinkWithViews(currentPerson.getFather(), personViewsMap, nodeMap);
        }
        if (currentPerson.getMother() != null) {
            this.instantiateNodeAndLinkWithViews(currentPerson.getMother(), personViewsMap, nodeMap);
        }
    }
}
import { jsPlumbInstance } from "jsplumb";
import { Person } from "./models/person";
import { TreeDrawer } from "./treeDrawer";
import { PersonView } from "./views/personView";
import { WalkerNode } from "./walkerNode";

export class WalkerTreeDrawer implements TreeDrawer {
    private distance: number;
    private pixelPerYear: number;
    private jsPlumbInst: jsPlumbInstance;

    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, height: number, pixelPerYear: number, jsPlumbInst: jsPlumbInstance): void {
        this.pixelPerYear = pixelPerYear;
        this.jsPlumbInst = jsPlumbInst;

        let rootNode: WalkerNode = this.initializeChildrenNodes(rootPerson, personViewsMap);
        this.distance = rootNode.personView.getWidthInPx() + 50;
    
        this.firstWalk(rootNode);
        this.secondWalk(rootNode, -rootNode.prelim, 0);
    }

    private initializeChildrenNodes(person, personViewMap: Map<string, PersonView>): WalkerNode {
        let walkerNode: WalkerNode = new WalkerNode(person, personViewMap.get(person.getId()));
        walkerNode.thread = null;
        walkerNode.ancestor = walkerNode;

        if (walkerNode.person.getFather() != null) {
            let fatherNode: WalkerNode = this.initializeChildrenNodes(walkerNode.person.getFather(), personViewMap);
            fatherNode.parent = walkerNode;
            walkerNode.children.push(fatherNode);
        }
        if (walkerNode.person.getMother() != null) {
            let motherNode: WalkerNode = this.initializeChildrenNodes(walkerNode.person.getMother(), personViewMap);
            motherNode.parent = walkerNode;
            walkerNode.children.push(motherNode);
        }

        if (walkerNode.children.length == 2) { // children have siblings
            walkerNode.children[0].rightSibling = walkerNode.children[1];
            walkerNode.children[1].leftSibling = walkerNode.children[0];
        }

        // maybe put this into the firstWalk method
        for (let index = 0; index < walkerNode.children.length; index++) {
            const child = walkerNode.children[index];
            child.number = index;
        }

        return walkerNode;
    }

    private firstWalk(v: WalkerNode): void {
        if (v.isLeaf()) {
            // In the algorithm described by Buchheimer et al. the preliminary x position of every leaf is just 0, 
            // which does not make sense, since the right sibling needs to have a distance to its left sibling.
            // v.prelim = 0;

            if (v.leftSibling == null) {
                v.prelim = 0;
            } else {
                v.prelim = v.leftSibling.prelim + this.distance;
            }
        } else {
            let defaultAncestor: WalkerNode = v.getLeftMostChild();

            for (const w of v.children) {
                this.firstWalk(w);
                defaultAncestor = this.apportion(w, defaultAncestor);
            }

            this.executeShifts(v);

            let midpoint = 0.5 * (v.getLeftMostChild().prelim + v.getRightMostChild().prelim);

            let w: WalkerNode = v.leftSibling;
            if (w != null) {
                v.prelim = w.prelim + this.distance;
                v.mod = v.prelim - midpoint;
            } else {
                v.prelim = midpoint;
            }
        }
    }

    private secondWalk(v: WalkerNode, m: number, level: number) {
        v.personView.setOffsetLeftInPx(v.prelim + m);
        v.personView.setOffsetTopInPx(level * this.distance);

        for (const child of v.children) {
            this.secondWalk(child, m + v.mod, level + 1);
        }
    }

    private apportion(v: WalkerNode, defaultAncestor: WalkerNode): WalkerNode {
        let w: WalkerNode = v.leftSibling;
        
        if (w != null) {

            let vInsideRightTree: WalkerNode = v;
            let vOutsideRightTree: WalkerNode = v; 
            let vInsideLeftTree: WalkerNode = w;
            let vOutsideLeftTree : WalkerNode = vInsideRightTree.parent.getLeftMostChild();

            let sInsideRightTree: number = vInsideRightTree.mod;
            let sOutsideRightTree: number = vOutsideRightTree.mod;
            let sInsideLeftTree: number = vInsideLeftTree.mod;
            let sOutsideLeftTree: number = vOutsideLeftTree.mod;

            while(vInsideLeftTree.getNextRight() != null && vInsideRightTree.getNextLeft != null) {
                vInsideLeftTree = vInsideLeftTree.getNextRight();
                vInsideRightTree = vInsideRightTree.getNextLeft();
                vOutsideLeftTree = vOutsideLeftTree.getNextLeft();
                vOutsideRightTree = vOutsideRightTree.getNextRight();

                vOutsideRightTree.ancestor = v;

                let shift: number = (vInsideLeftTree.prelim + sInsideLeftTree) - (vInsideRightTree.prelim + sInsideRightTree) + this.distance;

                if (shift > 0) {
                    this.moveSubtree(this.ancestor(vInsideLeftTree, v, defaultAncestor), v, shift);
                    sInsideRightTree += shift;
                    sOutsideRightTree += shift;
                }

                sInsideLeftTree += vInsideLeftTree.mod;
                sInsideRightTree += vInsideRightTree.mod;
                sOutsideLeftTree += vOutsideLeftTree.mod;
                sOutsideRightTree += vOutsideRightTree.mod;
            }

            if (vInsideLeftTree.getNextRight() != null && vOutsideRightTree.getNextRight() == null) {
                vOutsideRightTree.thread = vInsideLeftTree.getNextRight();
                vOutsideRightTree.mod += sInsideLeftTree - sOutsideRightTree;
            }

            if (vInsideRightTree.getNextLeft() != null && vOutsideLeftTree.getNextLeft == null) {
                vOutsideLeftTree.thread = vInsideRightTree.getNextLeft();
                vOutsideLeftTree.mod += sInsideRightTree - sOutsideLeftTree;
                defaultAncestor = v;
            }
        }

        return defaultAncestor;
    }

    private executeShifts(v: WalkerNode): void {
        let shift: number = 0;
        let change: number = 0;

        for (let i = v.children.length - 1; i >= 0; i--) {
            const w = v.children[i];
            w.prelim += shift;
            w.mod += shift;
            change += w.change;
            shift += w.shift + change;
        }
    }

    private ancestor(vInsideLeftTree: WalkerNode, v: WalkerNode, defaultAncestor: WalkerNode) {
        if (v.parent.children.includes(vInsideLeftTree.ancestor)) {
            return vInsideLeftTree.ancestor;
        } else {
            return defaultAncestor;
        }
    }

    private moveSubtree(wLeft: WalkerNode, wRight: WalkerNode, shift: number): void {
        // let subtrees: number = (wRight.number - wLeft.number) * this.distance;
        let subtrees: number = wRight.number - wLeft.number;

        wRight.change -= shift / subtrees;
        wRight.shift += shift;

        wLeft.change += shift / subtrees;
        wRight.prelim += shift;

        wRight.mod += shift;
    }
}
import { jsPlumbInstance } from "jsplumb";
import { Person } from "./models/person";
import { RTExtreme } from "./rtExtreme";
import { RTNode } from "./RTNode";
import { TreeDrawer } from "./treeDrawer";
import { PersonView } from "./views/personView";

export class RTTreeDrawer implements TreeDrawer {
    private nodeMap: Map<string, RTNode>;

    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, height: number, pixelPerYear: number, jsPlumbInst: jsPlumbInstance): void {
        this.nodeMap = new Map<string, RTNode>();
        this.instantiateNodeAndLinkWithViews(rootPerson, personViewsMap, this.nodeMap);

        let rootNode: RTNode = this.nodeMap.get(rootPerson.getId());

        this.setup(rootNode, 0, new RTExtreme(), new RTExtreme());
        this.petrify(rootNode, 0);
    }

    private setup(t: RTNode, level: number, rMost: RTExtreme, lMost: RTExtreme): void {
        let l: RTNode;
        let r: RTNode;

        let cursep: number = 0;
        let rootsep: number = 0;
        let minsep: number = 1;
        let lOffSum: number = 0;
        let rOffSum: number = 0;

        let lr: RTExtreme = new RTExtreme();
        let ll: RTExtreme = new RTExtreme();
        let rr: RTExtreme = new RTExtreme();
        let rl: RTExtreme = new RTExtreme();

        if (t == null) { // avoid selecting as extreme
            lMost.level = -1;
            rMost.level = -1;
        } else {
            t.personView.setOffsetTopInPx(level * 200);
            
            l = this.nodeMap.get(t.person.getFather()?.getId()); // follows contour of tleft subtree
            r= this.nodeMap.get(t.person.getMother()?.getId()); // follows contour of right subtree

            // Position subtrees recursively
            this.setup(l, level + 1, lr, ll); 
            this.setup(r, level + 1, rr, rl);

            if (r == null && l == null) { // leaf
                rMost.address = t; // a leaf is both the leftmost and rightmost node on the lowerst level of the subtree
                lMost.address = t; // consisting of itself.

                rMost.level = level;
                lMost.level = level;

                rMost.offset = 0;
                lMost.offset = 0;
                t.offset = 0;
            } else { // t is not a leaf
                // Set up for subtree pushing. Place Roots of subtrees minimum distance apart.
                cursep = minsep;
                rootsep = minsep;
                lOffSum = 0;
                rOffSum = 0;

                // Now consider each level in turn until one subtree is exhausted, pushing the subtress apart when necessary.

                while (l != null && r != null) {
                    if (cursep < minsep) { // push?
                        rootsep = rootsep + (minsep - cursep);
                        cursep = minsep;
                    }

                    // Advance L & R. Follow the right nodes of the left subtree and the left nodes of the right subtrees when possible
                    if (l.person.getMother() != null) { // if l.rightLink != null
                        lOffSum = lOffSum + l.offset;
                        cursep = cursep - l.offset;
                        l = this.nodeMap.get(l.person.getMother().getId());
                    } else {
                        lOffSum = lOffSum - l.offset;
                        cursep = cursep + l.offset;
                        l = this.nodeMap.get(l.person.getFather()?.getId());
                    }

                    if (r.person.getFather() != null) { // if r.leftLink != null
                        rOffSum = rOffSum - r.offset;
                        cursep = cursep - r.offset;
                        r = this.nodeMap.get(r.person.getFather().getId());
                    } else {
                        rOffSum = rOffSum + r.offset;
                        cursep = cursep + r.offset;
                        r = this.nodeMap.get(r.person.getMother()?.getId());
                    }
                }

                // Set the offset in node t, and include it in accumulated offsets for L and R

                t.offset = (rootsep + 1) / 2;
                lOffSum = lOffSum - t.offset;
                rOffSum = rOffSum + t.offset;

                // Update extreme descendants information

                if (rl.level > ll.level || t.person.getFather() == null) {
                    // lMost = rl; original code, does not work because in the calling method this does not get changed
                    lMost.address = rl.address
                    lMost.level = rl.level;
                    lMost.offset = rl.offset

                    lMost.offset = lMost.offset + t.offset;
                } else {
                    // lMost = ll;
                    lMost.address = ll.address;
                    lMost.level = ll.level;
                    lMost.offset = ll.offset;

                    lMost.offset = lMost.offset - t.offset;
                }

                if (lr.level > rr.level || t.person.getMother() == null) {
                    // rMost = lr;
                    rMost.address = lr.address;
                    rMost.level = lr.level;
                    rMost.offset = lr.offset;

                    rMost.offset = rMost.offset - t.offset;
                } else {
                    // rMost = rr;
                    rMost.address = rr.address;
                    rMost.level = rr.level;
                    rMost.offset = rr.offset;

                    rMost.offset = rMost.offset + t.offset;
                }

                // If subtrees of T were of uneven height, check to see if threading is necessary.
                // At most one thread needs to be inserted.

                if (l != null && l != this.nodeMap.get(t.person.getFather().getId())) {
                    rr.address.thread = true;
                    rr.address.offset = Math.abs((rr.offset + t.offset) - lOffSum);
                    if ((lOffSum - t.offset) <= rr.offset) {
                        rr.address.person.setFather(l.person);
                    } else {
                        rr.address.person.setMother(l.person);
                    }
                } else if (r != null && r != this.nodeMap.get(t.person.getMother().getId())) {
                    ll.address.thread = true;
                    ll.address.offset = Math.abs((ll.offset - t.offset) - rOffSum);
                    if (rOffSum + t.offset >= ll.offset) {
                        ll.address.person.setMother(r.person);
                    } else {
                        ll.address.person.setFather(r.person)
                    }
                }
            }
        }
    }

    // This procedure performs a preorder traversal of the tree, converting the relative offsets to absolute coordinates.
    private petrify(t: RTNode, xPos: number) {
        if (t != null) {
            t.personView.setOffsetLeftInPx(xPos * t.personView.getBoxWidth());
            
            if (t.thread) {
                t.thread = false;
                t.person.setFather(null); 
                t.person.setMother(null);
            }

            this.petrify(this.nodeMap.get(t.person.getFather()?.getId()), xPos - t.offset);
            this.petrify(this.nodeMap.get(t.person.getMother()?.getId()), xPos + t.offset)
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
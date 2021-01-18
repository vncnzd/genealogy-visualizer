import { Person } from './models/person';
import { TreeDrawer } from './treeDrawer';
import { PersonView } from './views/personView';

export class AncestorsTreeDrawer implements TreeDrawer {
    public run (rootPerson: Person, personViewMap: Map<string, PersonView>): void {
        
    }
}
import { Person } from './models/person';
import { Positioner } from './positioner';
import { PersonView } from './views/personView';

export class AncestorsPositioner implements Positioner {
    public run (rootPerson: Person, personViewMap: Map<string, PersonView>): void {
        
    }
}
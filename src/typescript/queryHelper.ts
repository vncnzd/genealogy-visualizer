import { LanguageIdentifier } from "./languageIdentifier";

export class QueryHelper {
    private selectVariables: string[];
    private languageIdentifier: LanguageIdentifier;

    private itemVariable: string;
    private sexOrGenderVariable: string;
    private dateOfBirthVariable: string;
    private dateOfDeathVariable: string;

    constructor(languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN) {
        this.languageIdentifier = languageIdentifier;
        this.itemVariable = "item";
        this.sexOrGenderVariable = "sexOrGender";
        this.dateOfBirthVariable = "dateOfBirth";
        this.dateOfDeathVariable = "dateOfDeath";

        this.selectVariables = [
            this.itemVariable, 
            this.getItemLabelVariable(), 
            this.getItemDescriptionVariable(), 
            this.sexOrGenderVariable, 
            this.getSexOrGenderLabelVariable(), 
            this.dateOfBirthVariable, 
            this.dateOfDeathVariable];
    }

    public generateGetChildrenQuery(fatherId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${fatherId} wdt:P40 ?${this.itemVariable}.`;
        query +=        this.generateTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public generateGetFatherQuery(personId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${personId} wdt:P22 ?${this.itemVariable}.`;
        query +=        this.generateTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public generateGetMotherQuery(personId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${personId} wdt:P25 ?${this.itemVariable}.`;
        query +=        this.generateTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public generateGetParentsQuery(personId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `?${this.itemVariable} wdt:P40 wd:${personId}.`;
        query +=        this.generateTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public generateEntitySearchQuery(searchValue: string, limit: number = 20): string {
        let query: string = `${this.getSelectVariables()} WHERE { `;
        query +=        this.generateTriples();
        query +=        `SERVICE wikibase:mwapi {`;
        query +=            `bd:serviceParam wikibase:endpoint "www.wikidata.org";`;
        query +=            `wikibase:api "EntitySearch";`;
        query +=            `mwapi:search "${searchValue}";`
        query +=            `mwapi:language "${this.languageIdentifier}".`;
        query +=            `?${this.itemVariable} wikibase:apiOutputItem mwapi:item.`;
        query +=        "} ";
        query +=        this.getLabelService();
        query +=    `} LIMIT ${limit}`;

        return query;
    }

    private getSelectVariables(): string {
        let select: string = "SELECT";

        for (const selectVariable of this.selectVariables) {
            select += " ?" + selectVariable;
        }

        return select;
    }

    private getLabelService(): string {
        return `SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.languageIdentifier}". }`
    }

    private generateTriples(): string {
        let triples: string = `?${this.itemVariable} wdt:P31 wd:Q5.`;
        triples += ` OPTIONAL{ ?${this.itemVariable} wdt:P21 ?${this.sexOrGenderVariable}. }`;
        triples += ` OPTIONAL{ ?${this.itemVariable} wdt:P569 ?${this.dateOfBirthVariable}. }`;
        triples += ` OPTIONAL{ ?${this.itemVariable} wdt:P570 ?${this.dateOfDeathVariable}. }`;

        return triples;
    }

    public getItemVariable(): string {
        return this.itemVariable
    }

    public getItemLabelVariable(): string {
        return this.itemVariable + "Label";
    }

    public getItemDescriptionVariable(): string {
        return this.itemVariable + "Description";
    }

    public getSexOrGenderVariable(): string {
        return this.sexOrGenderVariable;
    }

    public getSexOrGenderLabelVariable(): string {
        return this.sexOrGenderVariable + "Label";
    }

    public getDateOfBirthVariable(): string {
        return this.dateOfBirthVariable;
    }

    public getDateOfDeathVariable(): string {
        return this.dateOfDeathVariable;
    }
}
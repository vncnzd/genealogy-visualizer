import { LanguageIdentifier } from "./languageIdentifier";

export class QueryBuilder {
    private selectVariables: string[];
    private languageIdentifier: LanguageIdentifier;

    constructor(languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN) {
        this.languageIdentifier = languageIdentifier;
        this.selectVariables = ["item", "itemLabel", "itemDescription", "sexOrGender", "dateOfBirth", "dateOfDeath"];
    }

    public buildGetChildrenQuery(fatherId: string): string {
        let query = `${this.getSelect()} WHERE
        {
            wd:${fatherId} wdt:P40 ?item.
            ${this.getTriples()}
            ${this.getLabelService()}
        }`;

        return query;
    }

    public buildEntitySearchQuery(searchValue: string): string {
        let query =
        `${this.getSelect()} WHERE {
            ${this.getTriples()}

            SERVICE wikibase:mwapi {
                bd:serviceParam wikibase:endpoint "www.wikidata.org";
                wikibase:api "EntitySearch";
                mwapi:search "${searchValue}";
                mwapi:language "${this.languageIdentifier}".
                ?item wikibase:apiOutputItem mwapi:item.
            }
            ${this.getLabelService()}
        }
        LIMIT 15`;

        return query;
    }

    private getSelect(): string {
        let select = "SELECT";
        for (const selectVariable of this.selectVariables) {
            select += " ?" + selectVariable;
        }

        return select;
    }

    private getLabelService(): string {
        return `SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.languageIdentifier}". }`
    }

    private getTriples(): string {
        let triples: string = "?item wdt:P31 wd:Q5.";
        triples += " OPTIONAL{ ?item wdt:P21 ?sexOrGender. }";
        triples += " OPTIONAL{ ?item wdt:P569 ?dateOfBirth. }";
        triples += " OPTIONAL{ ?item wdt:P570 ?dateOfDeath. }";

        return triples;
    }
}
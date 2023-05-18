import { Pattern } from "Pattern";
import { NewCardSearch } from "cardSearch";

export class AosrAPI {
    async getAllPattern() {
        let search = NewCardSearch()
		let allcards = await search.search()
        let allPattern: Pattern[] = []
        for (let card of allcards.AllCard) {
            for (let p of card.patterns) {
                allPattern.push(p)
            }
        }
        return allPattern
    }
}

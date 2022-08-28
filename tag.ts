
class TagInfo {
    Head:string
    Suffix:string
    Original:string
    SubTag:TagInfo
    constructor(original:string, head:string, suffix:string) {
        this.Head = head
        if (suffix.at(0) == "/") {
            suffix = suffix.substring(1)
        }
        this.Suffix = suffix
        this.Original = original
        if (suffix.contains("/")) {
            let [subhead, subsuffix] = suffix.split("/")
            this.SubTag = new TagInfo(original, subhead, subsuffix)
        }
    }
}

class TagsInfo {
    private Tags:TagInfo[]
    constructor(tags:TagInfo[]) {
        this.Tags = tags
    }
    findTag(head:string, subhead?:string) {
        for (let tag of this.Tags) {
            if (tag.Head == head) {
                if(!subhead) {
                    return tag
                } else {
                    if (tag.SubTag) {
                        if (tag.SubTag.Head == subhead) {
                            return tag
                        }
                    }
                }
            }
        }
    }
}


export class TagParser {
    static reg = /(?<=^| |\t)#(\w+)((\/\w+)*)\b/gm
    static parse(str:string) {
        let tags:TagInfo[] = [] 
        let results = str.matchAll(TagParser.reg)
        for (let result of results ) {
            tags.push(new TagInfo(result[0], result[1], result[2]))
        }
        return new TagsInfo(tags)
    }
}
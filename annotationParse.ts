import { CardSchedule } from "schedule"
import yaml from "yaml"

export class AnnotationWrapper {
    static defaultRegAnnotation = String.raw`%%[^\%\^]+?%%\n\^blockID`
    static defaultRegWrapper = /%%\n\`\`\`(YAML|AOSRDATA)\n([\s\S]+?)\`\`\`\n%%\n\^.+/gm
    static findAnnotationWrapper(fileText:string, blockID:string) {
        let regAnnotation = this.defaultRegAnnotation.replace("blockID", blockID)
        let matchReg = new RegExp(regAnnotation, "gm")
        let annotation = ""
        fileText.match(matchReg)?.forEach((value) => {
            annotation = value
        })
        return annotation
    }
    static deWrapper(annotation:string):string {
        let results = annotation.matchAll(AnnotationWrapper.defaultRegWrapper)
        for (let result of results) {
            return result[2]
        }
        return ""
    }
    static enWrapper(ID: string, annotation: string, format: string): string {
        if (format === "YAML") {
            return "%%\n\`\`\`YAML\n" + annotation + "\`\`\`\n%%\n^" + ID
        } else if (format === "AOSRDATA") {
            return "%%\n\`\`\`AOSRDATA\n" + annotation + "\`\`\`\n%%\n^" + ID
        } else {
            throw new Error("Invalid format: " + format)
        }
    }
}

export class AnnotationObject {
    copy(obj: AnnotationObject) {
        this.cardSchedule.copy(obj.cardSchedule)
    }
    cardSchedule:CardSchedule
    constructor() {
        this.cardSchedule = new CardSchedule()
    }
    static Parse(annotation:string):AnnotationObject {
        if (!annotation) {
            return new AnnotationObject()
        }
        let ret = new AnnotationObject()
        try {
            let obj:AnnotationObject = yaml.parse(annotation)
            ret.copy(obj)
        } catch (error) {
            console.log(error)
        }
        return ret
    }
    static Stringify(fmt:AnnotationObject):string {
        let s = yaml.stringify(fmt, (key, value)=> {
            if (value !== null) return value
        })
        return s
    }
}
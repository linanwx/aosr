import { CardSchedule } from "schedule"
import yaml from "yaml"

export class AnnotationWrapper {
    static defaultRegWrapper = /%%\n\`\`\`YAML\n([\s\S]+?)\`\`\`\n%%\n\^.+/gm
    static findAnnotationWrapper(fileText: string, blockID: string): string {
        let suffix = `\n^${blockID}`
        let endpos = fileText.lastIndexOf(suffix)
        if (endpos < 0) {
            return ""
        }
        let startpos = fileText.lastIndexOf("%%", endpos)
        if (startpos < 0) {
            return ""
        }
        startpos = fileText.lastIndexOf("%%", startpos - 1)
        if (startpos < 0) {
            return ""
        }
        let annotationWrapper = fileText.substring(startpos, endpos + suffix.length)
        if (!annotationWrapper.contains("```YAML")) {
            return ""
        }
        return annotationWrapper
    }
    static deWrapper(annotation: string): string {
        let results = annotation.matchAll(AnnotationWrapper.defaultRegWrapper)
        for (let result of results) {
            return result[1]
        }
        return ""
    }
    static enWrapper(ID: string, annotation: string): string {
        return "%%\n\`\`\`YAML\n" + annotation + "\`\`\`\n%%\n^" + ID
    }
}

export class AnnotationObject {
    copy(obj: AnnotationObject) {
        this.cardSchedule.copy(obj.cardSchedule)
    }
    cardSchedule: CardSchedule
    constructor() {
        this.cardSchedule = new CardSchedule()
    }
    static Parse(annotation: string): AnnotationObject {
        if (!annotation) {
            return new AnnotationObject()
        }
        let ret = new AnnotationObject()
        let obj: AnnotationObject = yaml.parse(annotation)
        ret.copy(obj)
        return ret
    }
    static Stringify(fmt: AnnotationObject): string {
        let s = yaml.stringify(fmt, (key, value) => {
            if (value !== null) return value
        })
        return s
    }
}
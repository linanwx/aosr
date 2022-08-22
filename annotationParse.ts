// import toml from "toml"
import { parseYaml, stringifyYaml } from "obsidian"
import { CardSchedule } from "schedule"
import yaml from "yaml"

export class AnnotationWrapper {
    static defaultRegAnnotation = String.raw`%%[\s\S]+?\^blockID`
    static defaultRegWrapper = /%%\n([\s\S]+?)%%\n\^.+/gm
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
            return result[1]
        }
        return ""
    }
    static enWrapper(ID:string, annotation:string):string{
        return "%%\n" + annotation + "\n%%\n^" + ID
    }
}


export class AnnotationFormat {
    copy(obj: AnnotationFormat) {
        this.cardSchedule.copy(obj.cardSchedule)
    }
    cardSchedule:CardSchedule
    constructor() {
        this.cardSchedule = new CardSchedule()
    }
}

export function AnnotationParseFormat(annotation:string):AnnotationFormat {
    if (!annotation) {
        return new AnnotationFormat()
    }
    let ret = new AnnotationFormat()
    let obj:AnnotationFormat = yaml.parse(annotation)
    ret.copy(obj)
    return ret
}

export function AnnotationStringifyFormat(fmt:AnnotationFormat):string {
    let s = yaml.stringify(fmt)
    return s
}
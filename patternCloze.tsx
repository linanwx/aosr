import { Card } from "card";
import { CardIDTag } from "cardHead";
import { cyrb53 } from "hash";
import { renderMarkdown } from "markdown";
import { NodeContainer } from "nodeContainer";
import { PatternParser } from "ParserCollection";
import { Pattern, PatternProps, prettyText } from "Pattern";
import React from "react";
import { Operation } from "schedule";
import { TagParser } from "tag";

const hasClozeReg = /==(\S[\s\S]*?)==/m
const clozeReg = /==(\S[\s\S]*?)==/gm

class multiclozePattern extends Pattern {
    insertPatternID() {
        if (this.originalID) {
            return
        }
        this.card.updateFile({
            updateFunc: (contentText): string => {
                let newtext = this.text.replace("#multicloze", ()=>{return `#multicloze ${this.TagID} `})
                return contentText.replace(this.text, ()=>{return newtext})
            }
        })
    }
    async SubmitOpt(opt: Operation): Promise<void> {
        this.card.getSchedule(this.TagID).apply(opt)
        this.insertPatternID()
        await this.card.commitFile({ ID: true, annotation: true })
    }
    Component = (props: PatternProps): JSX.Element => {
        return <ClozePatternComponent index={0} text={this.text} patternProps={props} clozeOriginal={""} clozeInner={""} path={this.card.note.path} replaceAll={true}></ClozePatternComponent>
    }
    text: string
    originalID: string
    constructor(card: Card, text: string, originalID: string, tagid: string) {
        super(card, tagid)
        this.text = text
        this.originalID = originalID
    }
}

function replaceClosestSubstring(
    inputStr: string,
    targetSubstr: string,
    replacement: string,
    referenceIndex: number
): string {
    // 找到所有子字符串B的索引位置
    let indices: number[] = [];
    let currentIndex = inputStr.indexOf(targetSubstr);

    while (currentIndex !== -1) {
        indices.push(currentIndex);
        currentIndex = inputStr.indexOf(targetSubstr, currentIndex + 1);
    }

    // 如果A中没有子字符串B，直接返回原始字符串A
    if (indices.length === 0) {
        return inputStr;
    }

    // 找到距离给定index最近的子字符串B的索引位置
    let closestIndex = indices.reduce((prev, curr) => {
        return Math.abs(curr - referenceIndex) < Math.abs(prev - referenceIndex)
            ? curr
            : prev;
    });

    // 将找到的子字符串B替换为C
    return (
        inputStr.substring(0, closestIndex) +
        replacement +
        inputStr.substring(closestIndex + targetSubstr.length)
    );
}


class clozePattern extends Pattern {
    text: string // 整段文本
    clozeOriginal: string // 带==和标签的完形文本
    clozeInner: string // ==内部的文本
    originalID: string
    index: number // 匹配到的索引位置
    async SubmitOpt(opt: Operation): Promise<void> {
        this.card.getSchedule(this.TagID).apply(opt)
        this.insertPatternID()
        await this.card.commitFile({ ID: true, annotation: true })
    }
    insertPatternID() {
        if (this.originalID) {
            return
        }
        this.card.updateFile({
            updateFunc: (content): string => {
                let addtag = `${this.clozeOriginal} ${this.TagID} `
                let newtext = replaceClosestSubstring(this.text, this.clozeOriginal, addtag, this.index)
                return content.replace(this.text, ()=>{return newtext})
            }
        })
    }
    Component = (props: PatternProps): JSX.Element => {
        return <ClozePatternComponent index={this.index} text={this.text} patternProps={props} clozeOriginal={this.clozeOriginal} clozeInner={this.clozeInner} path={this.card.note.path} replaceAll={false}></ClozePatternComponent>
    }
    constructor(card: Card, text: string, index: number, clozeOriginal: string, clozeInner: string, originalID: string, tagid: string) {
        super(card, tagid)
        this.text = text
        this.clozeInner = clozeInner
        this.clozeOriginal = clozeOriginal
        this.originalID = originalID
        this.index = index
    }
}

type clozePatternComponentProps = {
    text: string
    clozeOriginal: string
    clozeInner: string
    replaceAll: boolean
    path: string
    patternProps: PatternProps
    index: number
}

type clozePatternComponentState = {
    markdownDivMask: HTMLDivElement
    // markdownDivUnmask: HTMLDivElement
}

class ClozePatternComponent extends React.Component<clozePatternComponentProps, clozePatternComponentState> {
    private loadFlag: boolean
    async componentDidMount() {
        if (this.loadFlag) {
            return
        }
        this.loadFlag = true
        this.state.markdownDivMask.empty()
        let masktext: string
        if (this.props.replaceAll) {
            masktext = this.props.text.replace(clozeReg, `<span style="border-bottom: 2px solid #dbdbdb;"><mark class="aosr-fuzzy-el">$1</mark></span>`)
        } else {
            masktext = replaceClosestSubstring(this.props.text, this.props.clozeOriginal, `<span style="border-bottom: 2px solid #dbdbdb;"><mark class="aosr-fuzzy-el">${this.props.clozeInner}</mark></span>`, this.props.index)
        }
        masktext = prettyText(masktext)
        await renderMarkdown(masktext, this.state.markdownDivMask, this.props.path, this.props.patternProps.view)
        this.setState({
            markdownDivMask: this.state.markdownDivMask,
        })
    }
    constructor(props: clozePatternComponentProps) {
        super(props)
        this.state = {
            markdownDivMask: createDiv(),
        }
        this.loadFlag = false
    }
    render() {
        return <div className={this.props.patternProps.showAns ? 'aosr-unblur-ctrl' : 'aosr-fuzzy-ctrl'} >
            <NodeContainer node={this.state.markdownDivMask}></NodeContainer>
        </div>

    }
}

export class ClozeParser implements PatternParser {
    Parse(card: Card): Pattern[] {
        let reg = /==(\S[\s\S]*?)==((?: #[\w\/]+\b)*)/gm
        let results: Pattern[] = []
        for (let body of card.bodyList) {
            let bodytag = TagParser.parse(body)
            let multicloze = bodytag.findTag("multicloze")
            if (multicloze) {
                let has = hasClozeReg.test(body)
                if (has) {
                    let newID = `#${CardIDTag}/${card.ID}/mc/${cyrb53(body, 4)}`
                    let originalID = bodytag.findTag(CardIDTag, card.ID, "mc")?.Original || ""
                    let result = new multiclozePattern(card, body, originalID, originalID || newID)
                    results.push(result)
                } else {
                    console.log(`missing multicloze tag. ${body} ${bodytag}`)
                    console.log(bodytag)

                }
            } else {
                for (let i = 0; i < 10000; i++) {
                    let regArr = reg.exec(body)
                    if (regArr == null) {
                        break
                    }
                    let newID = `#${CardIDTag}/${card.ID}/c/${cyrb53(i.toString() + regArr[0], 4)}`
                    let tagInfo = TagParser.parse(regArr[2] || "")
                    let originalID = tagInfo.findTag(CardIDTag, card.ID, "c")?.Original || ""
                    let result = new clozePattern(card, body, regArr.index, regArr[0], regArr[1], originalID, originalID || newID)
                    results.push(result)
                }
            }
        }
        return results
    }
}
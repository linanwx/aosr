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
            updateFunc: (filetext): string => {
                let newtext = this.text.replace("#multicloze", `#multicloze ${this.TagID} `)
                return filetext.replace(this.text, newtext)
            }
        })
    }
    async SubmitOpt(opt: Operation): Promise<void> {
        this.card.getSchedule(this.TagID).apply(opt)
        this.insertPatternID()
        await this.card.commitFile()
    }
    Component = (props: PatternProps): JSX.Element => {
        return <ClozePatternComponent text={this.text} patternProps={props} clozeOriginal={""} clozeInner={""} path={this.card.note.path} replaceAll={true}></ClozePatternComponent>
    }
    text: string
    originalID: string
    constructor(card: Card, text: string, originalID: string, tagid: string) {
        super(card, tagid)
        this.text = text
        this.originalID = originalID
    }
}

class clozePattern extends Pattern {
    text: string // 整段文本
    clozeOriginal: string // 带==和标签的完形文本
    clozeInner: string // ==内部的文本
    originalID: string
    async SubmitOpt(opt: Operation): Promise<void> {
        this.card.getSchedule(this.TagID).apply(opt)
        this.insertPatternID()
        await this.card.commitFile()
    }
    insertPatternID() {
        if (this.originalID) {
            return
        }
        this.card.updateFile({
            updateFunc: (filetext): string => {
                let newCloze = `${this.clozeOriginal} ${this.TagID} `
                return filetext.replace(this.clozeOriginal, newCloze)
            }
        })
    }
    Component = (props: PatternProps): JSX.Element => {
        return <ClozePatternComponent text={this.text} patternProps={props} clozeOriginal={this.clozeOriginal} clozeInner={this.clozeInner} path={this.card.note.path} replaceAll={false}></ClozePatternComponent>
    }
    constructor(card: Card, text: string, clozeOriginal: string, clozeInner: string, originalID: string, tagid: string) {
        super(card, tagid)
        this.text = text
        this.clozeInner = clozeInner
        this.clozeOriginal = clozeOriginal
        this.originalID = originalID
    }
}

type clozePatternComponentProps = {
    text: string
    clozeOriginal: string
    clozeInner: string
    replaceAll: boolean
    path: string
    patternProps: PatternProps
}

type clozePatternComponentState = {
    markdownDivMask: HTMLDivElement
    markdownDivUnmask: HTMLDivElement
}

class ClozePatternComponent extends React.Component<clozePatternComponentProps, clozePatternComponentState> {
    private loadFlag: boolean
    async componentDidMount() {
        if (this.loadFlag) {
            return
        }
        this.loadFlag = true
        this.state.markdownDivMask.empty()
        this.state.markdownDivUnmask.empty()
        let masktext: string
        let unmasktext: string
        if (this.props.replaceAll) {
            masktext = this.props.text.replace(clozeReg, `<span style="border-bottom: 2px solid #dbdbdb;"><mark class="fuzzy">$1</mark></span>`)
            unmasktext = this.props.text.replace(clozeReg, `<span style="border-bottom: 2px solid #dbdbdb;">$1</span>`)
        } else {
            masktext = this.props.text.replace(this.props.clozeOriginal, `<span style="border-bottom: 2px solid #dbdbdb;"><mark class="fuzzy">${this.props.clozeInner}</mark></span>`)
            unmasktext = this.props.text.replace(this.props.clozeOriginal, `<span style="border-bottom: 2px solid #dbdbdb;">${this.props.clozeInner}</span>`)
        }
        masktext = prettyText(masktext)
        unmasktext = prettyText(unmasktext)
        await renderMarkdown(masktext, this.state.markdownDivMask, this.props.path, this.props.patternProps.view)
        await renderMarkdown(unmasktext, this.state.markdownDivUnmask, this.props.path, this.props.patternProps.view)
        this.setState({
            markdownDivMask: this.state.markdownDivMask,
            markdownDivUnmask: this.state.markdownDivUnmask,
        })
    }
    constructor(props: clozePatternComponentProps) {
        super(props)
        this.state = {
            markdownDivMask: createDiv(),
            markdownDivUnmask: createDiv(),
        }
        this.loadFlag = false
    }
    render() {
        return <div>
            {
                !this.props.patternProps.showAns &&
                <div>
                    <NodeContainer node={this.state.markdownDivMask}></NodeContainer>
                </div>
            }
            {this.props.patternProps.showAns &&
                <NodeContainer node={this.state.markdownDivUnmask}></NodeContainer>
            }
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
                    let newID = `#${CardIDTag}/${card.ID}/c/${cyrb53(regArr[0], 4)}`
                    let tagInfo = TagParser.parse(regArr[2] || "")
                    let originalID = tagInfo.findTag(CardIDTag, card.ID, "c")?.Original || ""
                    let result = new clozePattern(card, body, regArr[0], regArr[1], originalID, originalID || newID)
                    results.push(result)
                }
            }
        }
        return results
    }
}
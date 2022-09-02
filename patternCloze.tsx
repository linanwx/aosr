import Button from "@mui/material/Button";
import { Card } from "card";
import { cyrb53 } from "hash";
import { renderMarkdown } from "markdown";
import { NodeContainer } from "nodeContainer";
import { PatternParser } from "ParserCollection";
import { Pattern, PatternProps } from "Pattern";
import React from "react";
import { Operation } from "schedule";
import { TagParser } from "tag";

class clozePattern extends Pattern {
    text: string
    clozeOriginal: string
    clozeInner: string
    originalID: string
    async submitOpt(opt: Operation): Promise<void> {
        this.card.getSchedule(this.TagID).apply(opt)
        this.insertPatternID()
        await this.card.commitFile()
    }
    insertPatternID() {
        if (this.originalID) {
            return
        }
        this.card.updateFile({
            updateFunc: (filetext):string=>{
                let newCloze = `${this.clozeOriginal} ${this.TagID} `
                return filetext.replace(this.clozeOriginal, newCloze)
            }
        })
    }
    Component = (props: PatternProps): JSX.Element => {
        return <ClozePatternComponent text={this.text} patternProps={props} clozeOriginal={this.clozeOriginal} clozeInner={this.clozeInner} path={this.card.note.path}></ClozePatternComponent>
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
    // pattern: clozePattern
    text:string
    clozeOriginal:string
    clozeInner:string
    path:string
    patternProps: PatternProps
}

type clozePatternComponentState = {
    showAns: boolean
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
        let masktext = this.props.text.replace(this.props.clozeOriginal, `<span style="border-bottom: 2px solid #dbdbdb;"><mark class="fuzzy">${this.props.clozeInner}</mark></span>`)
        let unmasktext = this.props.text.replace(this.props.clozeOriginal, `<span style="border-bottom: 2px solid #dbdbdb;">${this.props.clozeInner}</span>`)
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
            showAns: false,
            markdownDivMask: createDiv(),
            markdownDivUnmask: createDiv(),
        }
        this.loadFlag = false
    }
    showAns = () => {
        this.setState({
            showAns: true
        })
        this.props.patternProps.clickShowAns()
    }
    render() {
        return <div>
            {
                !this.state.showAns &&
                <div>
                    <NodeContainer node={this.state.markdownDivMask}></NodeContainer>
                    <Button onClick={this.showAns}>Answer</Button>
                </div>
            }
            {this.state.showAns &&
                <NodeContainer node={this.state.markdownDivUnmask}></NodeContainer>
            }
        </div>
    }
}

export class ClozeParser implements PatternParser {
    Parse(card: Card): Pattern[] {
        let reg = /==(\w[\s\S]*?)==( #[\w\/]+\b)*/gm
        let results: Pattern[] = []
        for (let i = 0; i < 10000; i++) {
            let regArr = reg.exec(card.body)
            if (regArr == null) {
                break
            }
            let newID = "#AOSR\/" + card.ID + "\/c\/" + cyrb53(regArr[0], 4)
            let tagInfo = TagParser.parse(regArr[2] || "")
            let originalID = tagInfo.findTag("AOSR", card.ID)?.Original || ""
            let result = new clozePattern(card, card.body, regArr[0], regArr[1], originalID, originalID || newID)
            results.push(result)
        }
        return results
    }
}
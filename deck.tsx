import { Pattern } from "Pattern";
import { Engine, RuleProperties } from "json-rules-engine";
import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { App } from "view";


export interface DeckConfig {
    rule: RuleProperties
}

interface FactPattern {
    card: {
        path: string
        tags: string[]
        text: string
    }
}

function convertToFact(p: Pattern): FactPattern {
    return {
        card: {
            path: p.card.note.path,
            tags: p.card.tags,
            text: p.card.cardText,
        }
    }
}

export async function ParseRule(rule: RuleProperties, allPattern: Pattern[]) {
    console.log("开始解析规则")
    let results: Pattern[] = []
    let engine = new Engine()
    try {
        engine.addRule(rule)
        engine.addOperator('regexMatch', (factValue, regex) => {
            if (typeof regex !== "string") {
                return false
            }
            if (typeof factValue != "string") {
                return false
            }
            const regexPattern = new RegExp(regex);
            return regexPattern.test(factValue);
        })
        await Promise.all(allPattern.map(async (pattern, index) => {
            let fact = convertToFact(pattern)
            try {
                return engine.run(fact).then((events) => {
                    if (events.events.length > 0) {
                        results.push(pattern);
                    }
                })
            } catch (error) {
                console.log(error)
            }
        }))
    } catch (error) {
        console.log(error)
    }
    return results
}

export function handlerDeckCode(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    let config: DeckConfig
    try {
        config = JSON.parse(source) as DeckConfig
        let testEngine = new Engine()
        testEngine.addRule(config.rule)
        ctx.addChild(new DeckView(el, config))
    } catch (error) {
        console.log(error)
        el.createSpan(
            { "text": error }
        )
    }
}

export class DeckView extends MarkdownRenderChild {
    root: Root
    rule: RuleProperties
    constructor(containerEl: HTMLElement, rule: DeckConfig) {
        super(containerEl)
        this.rule = rule.rule
    }
    onload(): void {
        let rootDiv = this.containerEl.createDiv()
        this.root = createRoot(rootDiv);
        this.root.render(
            <App view={this} rule={this.rule}></App>
        )
    }
    onunload(): void {
        this.root.unmount()
    }
}
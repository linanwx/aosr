import {
    Decoration,
    EditorView,
    WidgetType,
    DecorationSet,
    PluginValue,
    PluginSpec,
    ViewPlugin,
    ViewUpdate,
} from "@codemirror/view";
import {
    RangeSetBuilder,
    EditorSelection,
} from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";


// Define the widget that will be used to replace the matched text
export class EmojiWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        const span = document.createElement("span");
		span.classList.add("aosr-emoji-widget");
        span.innerText = "🏷";
        return span;
    }
}

export class emojiplugin implements PluginValue {
    decorations: DecorationSet;
    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }
    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged || update.selectionSet || update.heightChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }
    destroy() { }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const docText = view.state.doc.toString();
        for (let { from, to } of view.visibleRanges) {
            let tree = syntaxTree(view.state)
            if (tree === null) {
                continue
            }
            tree.iterate({
                from,
                to,
                enter(node) {
                    // 注释写法 %%AOSR/xxx%%：语法树里是 comment-start / comment / comment-end 三个节点，
                    // 从 comment-start 起整段替换
                    if (node.name.contains("comment-start")) {
                        let m = docText.slice(node.from, node.from + 200).match(/^%%AOSR\/[\/\w]+%%/)
                        if (m && !inSelection(view.state.selection, node.from, node.from + m[0].length)) {
                            builder.add(
                                node.from,
                                node.from + m[0].length,
                                Decoration.replace({
                                    widget: new EmojiWidget()
                                })
                            )
                        }
                        return
                    }
                    if (node.name.startsWith("hashtag") && node.name.contains("AOSR")) {
                        let text = docText.substring(node.from, node.to)
                        if (text.startsWith("AOSR/")) {
                            if (!inSelection(view.state.selection, node.from, node.to)) {
                                builder.add(
                                    node.from - 1,
                                    node.to,
                                    Decoration.replace({
                                        widget: new EmojiWidget()
                                    })
                                )
                            }
                        }
                    }
                },
            });
        }
        return builder.finish();
    }

}

const pluginSpec: PluginSpec<emojiplugin> = {
    decorations: (value: emojiplugin) => value.decorations,
};

export const emojiTagPlugin = ViewPlugin.fromClass(
    emojiplugin,
    pluginSpec
);


function inSelection(selection: EditorSelection, from: number, to: number) {
    return selection.ranges.some(range => {
        return !(to < range.from || from > range.to)
    })
}

class TagInfo {
    Original: string
    Head: string
    Suffix: string
    SubTag: TagInfo
    // 规范写法 #a/b/c，作为复习数据的键；Original 是笔记里的原文（可能是 %%a/b/c%%）
    Canonical: string
    constructor(original: string, tagstr: string) {
        this.Original = original
        if (tagstr.at(0) == "#") {
            tagstr = tagstr.substring(1)
        }
        this.Canonical = "#" + tagstr
        if (tagstr.contains("/")) {
            let idx = tagstr.indexOf('/');
            let head = tagstr.slice(0, idx);
            let suffix = tagstr.slice(idx + 1)
            this.Head = head
            this.Suffix = suffix
            this.SubTag = new TagInfo(original, suffix)
        } else {
            this.Head = tagstr
        }
    }
}

class TagsInfo {
    Tags: TagInfo[]
    constructor(tags: TagInfo[]) {
        this.Tags = tags
    }
    findTag(...heads: string[]) {
        for (let tag of this.Tags) {
            let flag = true
            heads.forEach((value: string, index: number) => {
                let subtag = tag
                for (let i = 0; i < index; i++) {
                    subtag = subtag?.SubTag
                }
                if (subtag?.Head != value) {
                    flag = false
                }
            })
            if (flag) {
                return tag
            }
        }
    }
    getStringArray() {
        return this.Tags.map((taginfo) => {
            return taginfo.Original
        })
    }
}


export class TagParser {
    static parse(str: string) {
        let tags: TagInfo[] = []
        // #tag 或 %%AOSR/xxx%%（注释写法的卡片 ID）
        let results = str.matchAll(/#[\/\w]+|%%(AOSR\/[\/\w]+)%%/gm)
        for (let result of results) {
            tags.push(new TagInfo(result[0], result[1] || result[0]))
        }
        return new TagsInfo(tags)
    }
}

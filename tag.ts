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
    Extension,
    RangeSetBuilder,
    StateField,
    Transaction,
    EditorSelection,
} from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";


// Define the widget that will be used to replace the matched text
export class EmojiWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        const span = document.createElement("span");
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
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
            this.decorations = this.buildDecorations(update.view);
        }
    }
    destroy() { }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const docText = view.state.doc.toString();

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node) {
                    view.visibleRanges
                    let text = docText.substring(node.from, node.to)
                    // console.log(`name: ${node.name}, text: ${text}`)
                    if (node.name.startsWith("hashtag")) {
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
    Head: string
    Suffix: string
    Original: string
    SubTag: TagInfo
    constructor(original: string, tagstr: string) {
        this.Original = original
        if (tagstr.at(0) == "#") {
            tagstr = tagstr.substring(1)
        }
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
}


export class TagParser {
    static parse(str: string) {
        let tags: TagInfo[] = []
        let results = str.matchAll(/#[\/\w]+/gm)
        for (let result of results) {
            tags.push(new TagInfo(result[0], result[0]))
        }
        return new TagsInfo(tags)
    }
}
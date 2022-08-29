import { moment } from "obsidian";

export async function test() {

    const cyrb53 = function (str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };

    console.log("begin")
    let newstr = ""
    try {

        const file = await this.quickAddApi.wideInputPrompt("原文");
        console.log(file)
        let multiLine = String(file)
        console.log(multiLine)

        newstr = String(multiLine)

        let reg = /^(.+::.+)\n<!--SR:!(.+),(.+),.+-->/gm

        let results = multiLine.matchAll(reg)

        for (let result of results) {
            console.log("first", result[0], "second", result[1], "3", result[2], "4", result[3])
            let next = window.moment(result[2])
            let last = window.moment(result[2]).subtract(Number(result[3]), "days")
            let nexttime = next.format("YYYY-MM-DD HH:mm")
            let lasttime = last.format("YYYY-MM-DD HH:mm")
            let id = "q" + cyrb53(result[0]).toString(32).slice(0, 5)
            let tag = `#${id}/s/q1`
            let newtext =
                getNewText(id, result, tag, lasttime, nexttime)
            newstr = newstr.replace(String(result[0]), newtext)
        }

        let reg2 = /(((?!^\n)[^<])*(==.+==)[^<]*)\n<!--SR:!([\d-]+),(\d+),\d+-->/gm

        let results2 = multiLine.matchAll(reg2)

        for (let result of results2) {
            let next = window.moment(result[4])
            let last = window.moment(result[4]).subtract(Number(result[5]), "days")
            let nexttime = next.format("YYYY-MM-DD HH:mm")
            let lasttime = last.format("YYYY-MM-DD HH:mm")
            let id = "q" + cyrb53(result[0]).toString(32).slice(0, 5)
            let tag = `#${id}/c/q1`
            let text = result[1].replace(result[3], `${result[3]} ${tag} `)
            let newtext = getNewText2(id, text, tag, lasttime, nexttime)
            newstr = newstr.replace(String(result[0]), newtext)
        }

        let reg3 = /((((?!^\n)[^<])+\n\?)\n[^<]+)<!--SR:!([\-\d]+),(\d+),\d+-->/mg

        let results3 = multiLine.matchAll(reg3)

        for (let result of results3) {
            let next = window.moment(result[4])
            let last = window.moment(result[4]).subtract(Number(result[5]), "days")
            let nexttime = next.format("YYYY-MM-DD HH:mm")
            let lasttime = last.format("YYYY-MM-DD HH:mm")
            let id = "q" + cyrb53(result[0]).toString(32).slice(0, 5)
            let tag = `#${id}/m/q1`
            let text = result[1].replace(result[2], result[2] + ` ${tag}`)
            let newtext = getNewText2(id, text, tag, lasttime, nexttime)
            newstr = newstr.replace(String(result[0]), newtext)
        }

    } catch (error) {
        console.log(error)
    }

    newstr = newstr.replace("#flashcards", "")
    return `${newstr}`;


    function getNewText(id, result, tag, lasttime, nexttime) {
        return `

#Q #AOSR/${id}
${result[1]} ${tag}

\%\%
\`\`\`YAML
cardSchedule:
  schedules:
    "${tag}":
      id: "${tag}"
      Opts: "1"
      Last: ${lasttime}
      Next: ${nexttime}
\`\`\`
\%\%
^${id}

`;
    }
    function getNewText2(id, text, tag, lasttime, nexttime) {
        return `

#Q #AOSR/${id}
${text}

\%\%
\`\`\`YAML
cardSchedule:
  schedules:
    "${tag}":
      id: "${tag}"
      Opts: "1"
      Last: ${lasttime}
      Next: ${nexttime}
\`\`\`
\%\%
^${id}

`;
    }
}
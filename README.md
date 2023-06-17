# Aosr

Aosr is **A**nother **O**bsidian plugin for **S**paced **R**epetition.

It uses flashcards to help remember knowledge.

This plugin is similar to [spaced repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition), but some changes have been made according to personal habits.

# Features

- **Rich Text Format Support**: The plugin supports rich text formats such as audio. This allows you to create multimedia flashcards for a more immersive learning experience.
- **Dedicated Review Window**: The plugin features a separate review window, allowing you to review cards while simultaneously making changes to them in the editor. This is perfect for making quick adjustments on the fly.
- **Minute-Level Review Intervals**: The plugin allows you to set review intervals down to the minute. This offers a high level of precision in scheduling your reviews.
- **Three Basic Learning Types**: The plugin supports three basic learning types - single line, multi-line, and cloze deletion.
- **Mobile Optimization for Review Interface:** The plugin now supports mobile devices, providing an optimized review interface specifically designed for mobile users. This ensures a seamless and user-friendly experience when reviewing cards on your mobile device.
- **Multi-language support**: Supports virtually all languages within Obsidian. Translated by ChatGPT.

# What's New

- **Multi-language Support:** Added support for multiple languages.
- **Scope Cards:** Introduced [scope cards](https://github.com/linanwx/aosr#range-cards-scope-cards) as a new feature. 

# Demo


![屏幕录制2022-11-08 17 56 11](https://user-images.githubusercontent.com/16589958/200536163-9aa947ff-0898-40ec-ae6a-911fc9107098.gif)

# Format

## Card

A CARD begins with `#Q` and ends with an empty line.

```
#Q 
This is a card.
Here, please write your questions and answers in Pattern format. The format of Pattern is described below.
Only content within the #Q and the empty line will be treated as review content.
Pattern formats outside this range will not be processed.
<- There should have an empty line if this is not the end of the document.
```

In the card, the PATTERN is your question and answer. 

A card can contain multiple patterns. For instance, if you're studying a vocabulary list, your card could include several lines of :: style patterns, each pairing a word with its definition. In essence, you can think of a card as a text block within Obsidian, while a pattern is a question and its corresponding answer. A single text block can contain multiple questions and their respective answers.

Using `***` to split the card into sub-cards. This would be helpful if you don't want to write `#Q` and create a new card.

```
#Q
Card1
***
Card2
```

The effect of the above writing is the same as that of the following.

```
#Q
Card1

#Q
Card2
```

### Range Cards (Scope Cards)

Range Cards, also known as Scope Cards, are a special type of card in the Markdown format. They were introduced as a new feature to enhance the flexibility of creating flashcards.

A Range Card begins with `#Q` and ends with `#/Q`. The Range Card's unique feature is that it supports formats that include empty lines, making it versatile for various content types. Here is an example:

```markdown
#Q
...
(blank line)
...
(blank line)
...
#/Q
```

Apart from this, Range Cards behave similarly to Block Cards in all other respects.

In the context of Range Cards, patterns still follow their usual rules. Notably, the multi-line pattern does not include complete blank lines. However, within Range Cards, you can create multiple multi-line patterns, each separated by blank lines. In the cloze deletion format, the question - that is, the remaining text - extends across the entire card.

This introduces some best practices for using Range Cards. 

1. **Creating Multiple Multi-line Question Groups**: You can leverage the format of Range Cards to create multiple multi-line patterns. These patterns can be individually grouped and separated by blank lines, providing you with a flexible way of organizing complex information. 

2. **Creating a Complex Question with a Cloze Deletion Answer**: If you're dealing with intricate topics, you can create a comprehensive question, and then use the cloze deletion format (`==`) to encapsulate the answer. If your answer spans multiple lines or you need to consider different sections as a whole answer, you may need to use the `#multicloze` tag to bundle multiple answers together.

Please be aware that if your answer is excessively complicated, involving many blank lines, you may need to reconsider your question structuring. Extremely complex answers may not be suitable for flashcard-based review.


## Pattern

A pattern represents a question and its corresponding answer.

### :: Pattern

In the card, `::` symbol is used to split a line. The front part will become a question, and the back part will become an answer.

```
word::definition
```

Each line will be processed as a separate Pattern.

```
word::definition
word::definition
word::definition
```

You can use the symbol `:::` to create cards that can be reviewed in both directions - from question to answer and from answer to question.

```
word:::definition
```


### ? Pattern

In the card, a line with a `?` will divide the content into a question and an answer. The front part will become a question, and the back part will become an answer.

```
Question.
Maybe there are many lines.
?
Answer.
Maybe there are many lines.
```

### == Pattern

In the card, a cloze with a pair of `==` will split this card. The remaining part will become a question, and the cloze part will become an answer. Note that each cloze will be treated as a separate Pattern.

```
A ==cloze==.
```

```
Fruits include ==watermelons==, ==apples== and ==pears==.
```

Note that each cloze will be treated as a separate Pattern. Otherwise, you should write like this.

```
Fruits include ==watermelons, apples, and pears==.
```

In addition, you could add a [#multicloze](https://github.com/linanwx/aosr#multicloze-pattern) tag to the card to get the same effect.

##### Multicloze Pattern

If a `#multicloze` tag has been found in the card, Aosr treats all cloze in the card as a group of cloze.

```
You should remember ==this== and ==that== at the same time. #multicloze 
```

# Example

Several examples are shown below. Their writing is valid in the document.

```
#Q
word1::ans1
word2::ans2
word3::ans3
word:::definition

#Q
This is a question1.
?
This is an answer.
***
This is a question2.
?
This is an answer.

#Q
This is a very ==important== answer.

#Q
word1::ans1
***
This is a question.
?
This is an answer.
***
This is a very ==important== answer.
***
This is multi-cloze ==question== and ==answer==. #multicloze

#Q

Information

Complex card information

Complex card information

Complex card information

Answer:
==The answer.==

#/Q
```

# Review

Once you've finished your document, click on the card icon in the sidebar to start reviewing.

<img width="174" alt="屏幕快照 2022-11-15 的 12 59 37 下午" src="https://user-images.githubusercontent.com/16589958/201830351-1f2959d7-3610-4fc1-b0e5-1f031de25ee4.png">

It consists of three parts. New, Review and Learning.

<img width="660" alt="Screenshot 2023-06-13 at 11 52 37 AM" src="https://github.com/linanwx/aosr/assets/16589958/572181c7-70e6-4f0a-9db0-2b0c31dd5819">

New content means something new that hasn't been reviewed.

Review means something needs to review.

Reinforcement learning means you need to consolidate some concepts.

Once you click one of the buttons, the review begins. Please follow the buttons and instructions on the screen to review.

<img width="914" alt="Screenshot 2023-06-13 at 12 09 46 PM" src="https://github.com/linanwx/aosr/assets/16589958/4ce6a725-51c4-46bc-8f13-cd3e7bc216ee">



# Annotation

Please take note of the presence of generated comments within your document. This is a normal occurrence and is essential for the functioning of the plug-in, as it requires this data for the purpose of calculating review time.

<img width="713" alt="Screenshot 2023-06-13 at 12 11 48 PM" src="https://github.com/linanwx/aosr/assets/16589958/624e627e-fa10-4234-8446-fc139b51d355">

I acknowledge that the appearance of these comments may not be visually pleasing and may disrupt the document's formatting. However, at present, this arrangement suffices for my daily usage. It is possible that I may discover a solution to this matter in the future.

The comments will be automatically appended to the end of the document. Furthermore, their placement can be adjusted within the same document if necessary.

# Work with Dataview

By installing the Dataview plugin, you can view information about your review progress.


<img width="843" alt="Screenshot 2023-05-18 at 9 37 16 PM" src="https://github.com/linanwx/aosr/assets/16589958/be0bb419-23a0-44a4-b2f1-112e67522a7c">

You can obtain the complete set of review data by using the code `let patterns = await app.plugins.plugins.aosr.api.getAllPattern();`. Then, you can write Dataview code to display the data. Below is an example provided for you to copy and run.

Please note that you need to enable the corresponding option in Dataview to use `dataviewjs`!

`````
```dataviewjs
let patterns = await app.plugins.plugins.aosr.api.getAllPattern();

let today = new Date();
today.setHours(0, 0, 0, 0);

let futureLimit = new Date();
futureLimit.setDate(today.getDate() + 15); // Set the future limit to 15 days from today.

let reviewCountsByDate = {};

patterns.forEach(pattern => {
    let nextReviewDate = new Date(pattern.schedule.Next);

    if (nextReviewDate < today) {
        nextReviewDate = today;
    }

    if (nextReviewDate <= futureLimit) {
        nextReviewDate.setHours(0, 0, 0, 0);
        let dateStr = nextReviewDate.toISOString().split('T')[0];
        if (!reviewCountsByDate[dateStr]) {
            reviewCountsByDate[dateStr] = 0;
        }
        reviewCountsByDate[dateStr]++;
    }
});

let tableData = Object.entries(reviewCountsByDate)
    .map(([date, count]) => [date, count])
    .sort((a, b) => new Date(a[0]) - new Date(b[0])); // Sort by date

dv.header(3, "Total amount of Review");
dv.table(["Count"], [[patterns.length]])

dv.header(3, "The amount of daily Review required in the future");
dv.table(["Date", "Review Count"], tableData);


let difficultPatterns = patterns
    .map(pattern => [pattern.TagID.substring(1), pattern.schedule.Ease])
    .sort((a, b) => a[1] - b[1]) // Sort by Ease
    .slice(0, 10); // Take only the first 10
dv.header(3, "The most difficult content in terms of review")

dv.table(["TagID", "Ease"], difficultPatterns);
```
`````

> Conflict between the double colon (::) review format and the metadata format of Dataview. It may be necessary to introduce a new format to replace the double colon review format.

# What's the difference? 

What's the difference between Aosr and obsidian-spaced-repetition?

- The review time is calculated in minutes, not days. This helps to review the time calculation more accurately. And the calculation when reviewing across the zero point of the day will also be more accurate. For example, at 23:59 and 00:01 in the evening, the review time will not be rudely counted as the day before and the day after.
- The review interface will now open a standard page instead of a pop-up window. Under the standard page, you can do many obsidian activities at the same time, for example, you can review and comment on the document at the same time. In pop-up mode, this mode hinders further operation.
- The review process has been optimized. Now a learning process has been added to learn the last item that was marked as forgotten.
- Redesigned the format. The new format contributes to some minor changes. For example, the cloze will no longer be disrupted by the addition of a new cloze. In addition, the new review format should also be easier to develop and expand.

However, some core functions, such as viewing review data statistics, are not available yet. I will improve the function according to my free time.

# Precautions:

- Please do not create identical content with the same pattern in the same file, as the current implementation relies on unique string matching, and creating duplicate patterns will cause exceptions and prevent review.
- Currently, development and testing are only carried out with "strict line breaks" mode turned off. It has not been tested with the mode turned on, so it is recommended to turn it off.

# License

- MIT [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

```
react (MIT)   https://github.com/facebook/react
YAML (ISC)    https://github.com/eemeli/yaml
MUI (MIT)     https://github.com/mui/material-ui
```

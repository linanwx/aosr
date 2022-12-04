# Aosr

Another obsidian spaced repetition.

It uses flashcards to help remember knowledge.

This plugin is similar to [spaced repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition), but some changes have been made according to personal habits.

# Demo


![屏幕录制2022-11-08 17 56 11](https://user-images.githubusercontent.com/16589958/200536163-9aa947ff-0898-40ec-ae6a-911fc9107098.gif)

# Format

## Card

A CARD is begin with `#Q` and ends with an empty line.

```
#Q 
This is a card.
Here, please write your questions and answers in Pattern format. The format of Pattern is described below.
Only content within the #Q and the empty line will be treated as review content.
Pattern formats outside this range will not be processed.
<- There should have an empty line if this is not the end of the document.
```

In the card, the PATTERN is your question and answer. A card can have not only one pattern but more than 1000 patterns. See the next section for the specific Pattern format.

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

## Pattern

Pattern is your question and answer.

### :: Pattern

In the card, `::` will split this line. The front part will become a question, and the back part will become an answer.

```
word::definition
```

Each line will be processed as a separate Pattern.

```
word::definition
word::definition
word::definition
```

### ? Pattern

In the card, a line with a `?` will split this card. The front part will become a question, and the back part will become an answer.

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
Note that each cloze will be treated as a separate Pattern. Otherwise, you should write like this.
Fruits include ==watermelons, apples, and pears==.
In addition, you could add a #multicloze tag to the card to get the same effect.
```

##### Multicloze Pattern !Experimental

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

#Q
This is a question.
?
This is an answer.
***
This is a question.
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
This is multi-cloze ==question== and ==answer==. #multicloze  !Experimental
```

# Review

Once you've finished your document, click on the card icon in the sidebar to start reviewing.

<img width="174" alt="屏幕快照 2022-11-15 的 12 59 37 下午" src="https://user-images.githubusercontent.com/16589958/201830351-1f2959d7-3610-4fc1-b0e5-1f031de25ee4.png">

It consists of four parts. New, learn, review, and wait.

<img width="266" alt="屏幕快照 2022-11-15 的 12 45 09 下午" src="https://user-images.githubusercontent.com/16589958/201828532-4658642d-8f22-4845-b603-e07da46d3df5.png">

New means something new that hasn't been reviewed.

Review means something needs to review.

Learn means something you need to remember right now.

Wait means something you need to remember after a few seconds, but you can't check it right now. Because you have checked it just now. 

Once you click one of the buttons, the review begins. Please follow the buttons and instructions on the screen to review.

<img width="657" alt="屏幕快照 2022-11-15 的 12 57 01 下午" src="https://user-images.githubusercontent.com/16589958/201830101-0acaef28-d7ba-488e-9bf4-2c7aeb3e560f.png">

# Annotation

You will notice that some comments are generated in your document. This is normal. The plug-in needs this data to calculate review time.

<img width="732" alt="屏幕快照 2022-11-15 的 13 02 04 下午" src="https://user-images.githubusercontent.com/16589958/201830638-2605556e-9312-4e39-898b-979ca06954eb.png">

I know it's not pretty, and it messes up the format of the document. But for me now, this is enough for my daily use. Maybe I'll find a way to solve this in the future.

The comments will be automatically generated at the end of the document. Its location can also be moved, as long as it is in the same document.

# What's the difference? 

What's the difference between Aosr and obsidian-spaced-repetition?

- The review time is calculated in minutes, not days. This helps to review the time calculation more accurately. And the calculation when reviewing across the zero point of the day will also be more accurate. For example, at 23:59 and 00:01 in the evening, the review time will not be rudely counted as the day before and the day after.
- The review interface will now open a standard page instead of a pop-up window. Under the standard page, you can do many obsidian activities at the same time, for example, you can review and comment on the document at the same time. In pop-up mode, this mode hinders further operation.
- The review process has been optimized. Now a learning process has been added to learn the last item that was marked as forgotten.
- Redesigned the format. The new format contributes to some minor changes. For example, the cloze will no longer be disrupted by the addition of a new cloze. In addition, the new review format should also be easier to develop and expand.

However, some core functions, such as viewing review data statistics, are not available yet. I will improve the function according to my free time.

# License

- MIT [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

```
react (MIT)   https://github.com/facebook/react
YAML (ISC)    https://github.com/eemeli/yaml
MUI (MIT)     https://github.com/mui/material-ui
```

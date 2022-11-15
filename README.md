# Aosr

Another obsidian spaced repetition.

It uses flashcards to help remember knowledge.

This plugin is similar to [spaced repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition), but some changes have been made according to personal habits.

# Demo


![屏幕录制2022-11-08 17 56 11](https://user-images.githubusercontent.com/16589958/200536163-9aa947ff-0898-40ec-ae6a-911fc9107098.gif)


# Format

A CARD is begin with `#Q` and ends with an empty line.

```
#Q 
This is a card.
<- There should have an empty line if this is not the end of the document.
```

In the card, the PATTERN is your question and answer. A card can have not only one pattern but more than 1000 patterns.

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

# Pattern

In the card, `::` will split this line. The front part will become a question, and the back part will become an answer.

```
word::definition
```

In the card, a line with a `?` will split this card. The front part will become a question, and the back part will become an answer.

```
question
?
answer
```

In the card, a cloze with a pair of `==` will split this card. The remaining part will become a question, and the cloze part will become an answer.

```
A ==cloze==.
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
```

# Review

Once you've finished your document, click on the card icon in the sidebar to start reviewing.

<img width="174" alt="屏幕快照 2022-11-15 的 12 59 37 下午" src="https://user-images.githubusercontent.com/16589958/201830351-1f2959d7-3610-4fc1-b0e5-1f031de25ee4.png">

It consists of four parts. New, learn, review, and wait.

<img width="266" alt="屏幕快照 2022-11-15 的 12 45 09 下午" src="https://user-images.githubusercontent.com/16589958/201828532-4658642d-8f22-4845-b603-e07da46d3df5.png">

New means something new and hasn't been reviewed.

Review means something needs to review.

Learn means something you need to remember right now.

Wait means something you need to remember after a few seconds, but you can't check it right now. Because you have checked it just now. 

Once you click one of the buttons, the review begins. Please follow the buttons and instructions on the screen to review.

<img width="657" alt="屏幕快照 2022-11-15 的 12 57 01 下午" src="https://user-images.githubusercontent.com/16589958/201830101-0acaef28-d7ba-488e-9bf4-2c7aeb3e560f.png">

# Annotation

You will notice that some comments are generated in your document. This is normal. The plug-in needs this data to calculate review time.

<img width="732" alt="屏幕快照 2022-11-15 的 13 02 04 下午" src="https://user-images.githubusercontent.com/16589958/201830638-2605556e-9312-4e39-898b-979ca06954eb.png">

I know it's not pretty, and it messes up the format of the document. But for me now, this is enough for my daily use. Maybe I'll find a way to solve this in the future.


# License

- MIT [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

```
react (MIT)   https://github.com/facebook/react
yaml (ISC)    https://github.com/eemeli/yaml
MUI (MIT)     https://github.com/mui/material-ui
```

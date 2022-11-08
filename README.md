# Aosr

Another obsidian spaced repetition.

It uses flashcards to help remember knowledge.

This plugin is similar to [spaced repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition), but some changes have been made according to personal habits.

# Demo


![屏幕录制2022-11-08 17 56 11](https://user-images.githubusercontent.com/16589958/200536163-9aa947ff-0898-40ec-ae6a-911fc9107098.gif)


# Format

A CARD is begin with `#Q` and ends with an empty line.

In the card, the PATTERN is your question and answer. A card can have not only one pattern but more than 1000 patterns.

Using `***` to split the card into sub-cards. This would be helpful if you don't want to write `#Q` and create a new card.

# Pattern

In the card, `::` will split this line. The front part will become a question, and the back part will become an answer.

In the card, a line with a `?` will split this card. The front part will become a question, and the back part will become an answer.

In the card, a cloze with a pair of `==` will split this card. The remaining part will become a question, and the cloze part will become an answer.

# Example

```
#Q
word1::ans1
word2::ans2
word3::ans3

#Q
This is a question.
?
This is an answer.

#Q
This is a very ==important== answer.
```

# Review

Once you've finished your document, click on the card icon in the sidebar to start reviewing.

It consists of four parts. New, learn, review, and wait.

New means something new and hasn't been reviewed.

Review means something needs to review.

Learn means something you need to remember right now.

Wait means something you need to remember after a few seconds, but you can't check it right now. Because you have checked it just now. 

# Annotation

You will notice that some comments are generated in your document. This is normal. The plug-in needs this data to calculate review time.

# License

- MIT [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

```
react (MIT)   https://github.com/facebook/react
yaml (ISC)    https://github.com/eemeli/yaml
MUI (MIT)     https://github.com/mui/material-ui
```

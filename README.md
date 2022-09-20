# Aosr

Another obsidian spaced repetition.

This plugin is similar to spaced repetition, but with some improvements.

# Demonstration video

https://user-images.githubusercontent.com/16589958/191187487-87a026ae-a03e-4736-a041-3d9003a3fd22.mov

# Format

A CARD is begin with #Q and end with an empty line.

In the card, the PATTERN is what your question and answer. A card can have not only one pattern, but more than 1000 patterns.

# Pattern

In the card, `::` will split this line. The front part will become question, and back part will become answer.

In the card, a line with a `?` will split this card. The front part will become question, and the back part will become answer.

In the card, a cloze with a pair of `==` will split this card. The left part will become question, and cloze part will become answer.

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

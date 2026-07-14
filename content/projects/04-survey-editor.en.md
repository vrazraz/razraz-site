---
title: Interview survey editor
tags: [LeadFrog, nodes, research]
year: 2021
cover: ./survey-editor-hero.webp
---

![The new survey editor: question nodes with connections on a canvas](./survey-editor-hero.webp)

**Problem.** Building surveys for trade shows was inflexible and hard to understand. We needed a new editor version that marketers could actually use: surveys are built in the desktop version before the show and filled in inside the app at the show itself.

## Research

Competitive analysis, in-depth interviews with managers, field studies. The takeaways:

- Many companies don’t build surveys themselves and are happy to pay our managers to do it
- Surveys are often deep and heavily branched
- Requests to create surveys arrive right in the middle of a show
- Most participants don’t understand how to link an answer to the next question
- Some question types are missing: city picker, product picker, price range

## Conclusions

Surveys will be built by a trained person (our support or the company’s marketer). We need: convenient branching, an intuitive way to link questions, more question types, minimal creation time and a foundation for future features.

## How surveys work

![How it works: a participant builds the survey in the web account or via support, and it ships to the app](./survey-flow.webp)

## The old editor

![The old survey editor: a long list of questions with a settings sidebar](./survey-editor-old.webp)

Downsides: users didn’t understand how answers connect to questions, and the editor didn’t scale — deep nesting was impossible.

## Implementation

For the new version I chose **nodes** — a pattern from signal-processing tools and mind maps: they visualize relationships and reduce cognitive load. A branched survey is assembled on a canvas from connected nodes:

![The node editor: an answer of one question linked to the next question](./survey-editor-nodes.webp)

On the user’s device the survey unfolds into a regular step-by-step questionnaire:

![The survey on a mobile device: single and multiple choice, an important-question marker](./survey-mobile.webp)

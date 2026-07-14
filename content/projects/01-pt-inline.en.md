---
title: PT NGFW — inline creation of nested entities
tags: [PT NGFW, UX research, enterprise]
nda: true
year: 2024
cover: ./pt-inline-hero.webp
---

![PT NGFW — the Positive Technologies appliance lineup](./pt-inline-hero.webp)

**About the product.** PT NGFW is the first Russian next-generation firewall and the second fastest in the world. Think of it as a “smart router” that large companies put in front of their internet traffic: filtering, mirroring, encryption, attacker containment. I worked on its management system.

## Problem

Creating NAT policies (network address translation) took too long. Measuring seven administrators showed a spread from 3 to 8 minutes. Reviewing the recordings of the “abnormally slow” sessions revealed the cause: at the moment of creating a policy, users were missing one or more nested entities — they had to abandon the flow, go to another section, create the object there and come back.

The original creation flow looked like this:

![Original flow: a missing entity interrupts policy creation](./pt-inline-flow-old.webp)

## Hypothesis

If users can create one entity inline while creating another, the time will drop.

![Fixed flow: the missing entity is created inline](./pt-inline-flow-new.webp)

Digging deeper, I found places with second-order nesting — the flow had to be extended for them too:

![Flow with inline creation of second-order entities](./pt-inline-flow-nested.webp)

## Implementation

Every entity in the management system is created in a modal window. I decided to open a second modal on top of the first — despite that being considered bad manners. To preserve context, the previous window slides to the left.

I documented the multi-window mechanics in detail — in light and dark themes:

![Multi-window mechanics spec in light and dark themes](./pt-inline-multiwindow-spec.webp)

The resulting mechanics look like this:

<video src="./pt-inline-multiwindow-demo.mp4" controls muted loop playsinline></video>

## Results

Thank-you messages started arriving in the support chat on day two after the release. A control measurement with six other engineers — on the exact case with missing nested entities:

![Measurement after the change: about 4 minutes for all six engineers](./pt-inline-time-after.webp)

The average policy creation time dropped by ~2 minutes and got close to the time with pre-created entities.

---
title: PT NGFW — navigation
tags: [PT NGFW, navigation, research, dark theme]
nda: true
year: 2024
cover: ./pt-nav-hero.webp
---

![PT NGFW management system interface](./pt-nav-hero.webp)

**The task.** Management knew the navigation was the problem but couldn’t pinpoint where exactly. The brief: make navigation easier to use and reduce negative feedback.

## Hypotheses

1. A static unified menu will make orientation easier ✓
2. Breadcrumbs used as breadcrumbs, not visually mixed with the device group ✓
3. Stronger visual accents will help users orient themselves ✓
4. Global search and adjustable data views will improve the experience ✓
5. The Push to devices button is primary and belongs in the menu ✗
6. Users need to switch between objects quickly ✗

How navigation looked “before”: the menu changed from section to section, and breadcrumbs visually blended with the device group indicator:

![Old navigation: every section had its own menu](./pt-nav-menus-before.webp)

![Old breadcrumbs were indistinguishable from the device group](./pt-nav-breadcrumbs-before.webp)

## Testing with respondents

13 respondents from a professional chat of NGFW administrators across vendors. I tested the hypotheses on prototypes and picked up new insights: poor contrast on low-quality panels; fatigue from the white background and requests for a dark theme; “jumping” between sections while creating a policy; the primary button getting lost on ultra-wide monitors; policies accidentally applied to the wrong device group; long group names being hard to recognize.

## Solutions

**Contrast and dark theme.** Strengthened contrast and added a dark theme — design system variables let a screen switch to dark in one click.

**A unified static menu.** You always see which section you are in and which device group is selected; the menu width is adjustable:

![New static menu with the device group tree](./pt-nav-static-menu.webp)

**Smart search (spotlight).** It finds not only objects but also actions — for example, “Add device”:

![Spotlight search with quick actions](./pt-nav-spotlight.webp)

**The primary action button on the left**, right after search and filters — the clearest pattern according to the interviews:

![Add profile button on the left, next to search and filters](./pt-nav-action-left.webp)

## Evaluation

The product runs in air-gapped environments — web analytics is unavailable. I used local logging servers (traveling to customers to export stats), internal surveys, session recordings and expert feedback.

## Results

- Task completion time −20%; “empty” clicks −30%; returns to the home page to re-search −20%
- Mirroring rules setup −40% time; log search −35%; device setup −30%
- Visits to the documentation portal −30%
- 75% of users reported finding features faster; 87% of administrators said the update made their work noticeably easier
- Filling in 100 security policies now takes 27 minutes instead of 1 hour 22 minutes

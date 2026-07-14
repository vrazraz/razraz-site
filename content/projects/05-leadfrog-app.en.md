---
title: LeadFrog app
tags: [mobile app, trade shows, research]
year: 2021
cover: ./leadfrog-hero.webp
---

![LeadFrog app: a contact card and an interactive expo map](./leadfrog-hero.webp)

**About the product.** A mobile app — part of an ecosystem for collecting and processing contacts at trade shows: registration, a business card/QR/barcode scanner, the business program, an interactive map, surveys, notes, collected data views, chats between attendees.

## Specifics and research

The product’s peculiarity is intermittent usage: some users open the app three days a year, while their show is on. I ran research on my own initiative, mostly outside working hours: field trips to trade shows (the most effective), metrics on every action, hallway tests, interviews with in-house expo experts, discussions with the founder, task-based session recordings, secondary research of competitors, reviews with design communities.

## Registration

The old scheme: heavy dependence on the organizer (“no contract — no users”), a new account for every show, no accounts for visitors at all:

![The old registration scheme: from an organizer contract to badge-scan login](./leadfrog-reg-old.webp)

The new scheme fixes all of that and adds invite codes (deep links were postponed due to tight deadlines):

![The new registration scheme: a personal phone-based account, creating a company and a show](./leadfrog-reg-new.webp)

The show picker: search by name, adding a new show, sorting by date; “your” shows come first (three by default, the rest under a spoiler):

![The show picker: my shows first, add by name](./leadfrog-expo-select.webp)

The full registration flow — sign-in, choosing a workspace and a show:

![Screen map: sign-in, registration, workspace and show selection](./leadfrog-reg-flow.webp)

## Scanner

The scanner captures a contact from a business card, barcode or QR code and recognizes related entities (products, companies). Field checks exposed a gap between expectation and reality:

![Expectation: the Figma mockup with a clearly visible frame](./leadfrog-scanner-expected.webp)

![Reality: in working conditions the recognition frame is barely visible](./leadfrog-scanner-reality.webp)

Not seeing the frame, users scanned only part of the card and got unusable data; the flash and close icons got lost too:

![The result: only scraps of the card data were recognized](./leadfrog-scanner-baddata.webp)

After the redesign the frame and controls are readable, and manual input was added for cases when scanning is impossible:

![The scanner after the redesign: a contrast backdrop, a hint and a manual-create button](./leadfrog-scanner-redesign.webp)

![Screen map of manual contact creation: phone, email, website, address, company, badge](./leadfrog-custom-contact.webp)

## Business program

Requested by our biggest partner-organizer: an exhibitor catalog, show sections and news (filled in by the organizer via a markdown editor in the admin panel), plus a COVID restrictions block:

![Business program map: sections, exhibitor catalog, news, favorites](./leadfrog-bp-flow.webp)

Show sections with visitor analytics and the section’s exhibitors:

![The “Finishing materials” section with visitor stats](./leadfrog-bp-sections.webp)

News is purely informational and can link to contacts:

![Show news: a webinar announcement with the speaker photo](./leadfrog-bp-news.webp)

The exhibitor catalog: find an exhibitor by booth or name, add to favorites, drill into details:

![Exhibitor catalog: booth number, company, favorites](./leadfrog-bp-catalog.webp)

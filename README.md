# NyayaFlow

A clickable design prototype of a case-management screen for Indian district courts. It shows how a court office could use AI suggestions to take in a new case and manage the day's hearing list, with a person approving every suggestion.

**Try it:** https://case-aid-dashboard.lovable.app

> This is a concept demo, not a working court system. There is no AI model, no database and no real case data behind it. Every case, name, score and "AI" suggestion is sample text written into the code, and nothing you click is saved or sent anywhere.

## Who it is for

Anyone who wants to see the product idea: reviewers of a case study, people interested in court technology, or a designer or developer who wants a starting point. It is not something a court could use as it is.

## What you can click through

The prototype has two screens, switched from the top bar.

**Case Intake**

1. Click **Upload File**. No file is actually read; after two seconds the screen shows a sample result.
2. The left side shows the details "extracted" from the petition (case type, parties, law cited, urgency, filing date) and a defect report listing two problems with the filing.
3. The right side shows three suggestions: a hearing date, a judge, and the risk that the hearing gets postponed (an "adjournment"). Each has its own **Approve** button.
4. **Approve & Schedule** or **Override & Register** finishes and resets the screen.

**Cause List** (the list of cases set for hearing on a given day)

- A table of eight sample cases spread over a few dates in June 2026. Use the date picker to move between days.
- Each case has a risk level (high, medium or low) for being postponed.
- Filter by all cases, high risk, recommended for Lok Adalat (a settlement forum that takes cases off the judge's calendar), or approved.
- Open a high-risk case to see a side panel with the reasons behind the score and buttons to approve the slot or "send" a notification.
- Route a suitable case to Lok Adalat, with a confirmation step.

Labels on the Cause List screen can be switched between English, Hindi and Telugu from the top bar. The Case Intake screen is in English only.

## What is simulated

| What the screen shows | What actually happens |
| --- | --- |
| Uploading and reading a case PDF | A two-second timer, then fixed sample text |
| AI suggestions and risk scores | Fixed values written into the code |
| "Generated from 12,847 similar prior cases" | Display text only; there is no such dataset in this project |
| SMS notifications | A pop-up message; nothing is sent |
| Approving, routing to Lok Adalat | Changes the screen until you reload the page |

## What you need

- [Node.js](https://nodejs.org) with npm. I checked the commands below with Node 26; the repo does not pin a version.
- No accounts, keys or environment settings.

## Run it on your computer

```bash
git clone https://github.com/Abitha-Rao/NyayaFlow.git
```

```bash
cd NyayaFlow
```

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:8080.

The whole prototype is one file, [src/routes/index.tsx](src/routes/index.tsx), including the sample cases and the translations. The files under `src/components/ui/` are ready-made interface pieces (buttons, dialogs, tables) that came with the project template.

## Status and limits

- A prototype built with [Lovable](https://lovable.dev), an AI app builder, on React and TanStack Start.
- No sign-in, no saved data, no connection to any court system such as e-Courts.
- The names, case numbers and judges are made up for the demo.
- There are no automated tests.
- The Cause List opens on 12 June 2026, the first date that has sample cases.

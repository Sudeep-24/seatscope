# SeatScope

**Karnataka KCET / UGCET counselling decision-support platform built on verified historical cutoff data.**

**Live website:** https://sudeep-24.github.io/seatscope/

**Repository:** https://github.com/Sudeep-24/seatscope

> **Important:** SeatScope shows *historical indicators only*. It does not predict results and does **not** guarantee admission. Seats, competition and counselling rules change every year. Always check the official KEA information before making final decisions.

---

## Table of contents

1. [What is SeatScope?](#what-is-seatscope)
2. [Who is it for?](#who-is-it-for)
3. [Features](#features)
4. [How the rank rule works](#how-the-rank-rule-works)
5. [How to use it](#how-to-use-it)
6. [The dataset](#the-dataset)
7. [Technology used](#technology-used)
8. [Project structure](#project-structure)
9. [Run it on your own computer](#run-it-on-your-own-computer)
10. [Updating the live site](#updating-the-live-site)
11. [Updating the data](#updating-the-data)
12. [Performance](#performance)
13. [Privacy](#privacy)
14. [Limitations](#limitations)
15. [Roadmap](#roadmap)
16. [Data sources and credits](#data-sources-and-credits)

---

## What is SeatScope?

Karnataka's cutoff data is published as very large PDF files. Comparing one rank against hundreds of colleges, several years and several rounds by hand is slow and easy to get wrong.

SeatScope turns those PDFs into one searchable database. A student enters a rank, category, seat type, course and counselling round. SeatScope compares the rank with past closing ranks and sorts the options into **High Chance**, **Moderate** and **Ambitious**. The student can then build an ordered **Choice List** (Dream, Realistic, Safe) and export it.

SeatScope is a **frontend-only prototype**. There is no server code and no database server. The browser downloads one data file and does all the work itself.

## Who is it for?

- Students preparing for Karnataka KCET / UGCET counselling
- Parents who want to understand historical cutoffs
- Anyone who wants a quick, source-aware way to explore college and course options

## Features

### Counselling form
Enter your rank, category, seat type, course group, branch, preferred location and counselling round. The dropdowns update each other so only valid combinations appear.

### Result cards
Each card shows the college name and code, branch, city, historical closing rank, your rank, the cutoff margin, category, seat type, counselling round, latest cutoff year, historical years, source information and a disclaimer.

### Historical Match percentage
Shows the share of available years in which your rank was at or inside the closing rank. For example, 75% means your rank would have made the cutoff in 3 of 4 years.
It is **not** a probability of admission. When only one year of data exists, the card says the history is limited.

### Cutoff History
Press **View Cutoff History** on a card to see one row per year and round, with a bar for the closing rank, a marker for your rank, the margin and a High / Moderate / Ambitious label.

### Charts
Two charts follow your results: **Options by Chance** (bar chart) and **Share of Options** (donut chart).

### Choice List planner
- Add any option to **Dream** (Ambitious), **Realistic** (Moderate) or **Safe** (High Chance).
- Each group has its own numbering, with **Move Up**, **Move Down** and **Remove** buttons.
- The list is saved in your browser, so it is still there next time.
- **Export PDF** (print-friendly page) and **Export Excel** (.xls) both include a "not an admission guarantee" disclaimer.

### College Search
Search colleges by name or college code. See courses and location, and open Google Maps.

### HelpBot
A built-in assistant that answers common questions about how SeatScope works, what High Chance means, Dream / Realistic / Safe choices and whether admission is guaranteed.

### Dashboard interface
A left sidebar with active-section highlighting, a top bar, stat cards, charts, animations and a phone layout with a slide-in menu.

## How the rank rule works

Let **R** be your rank and **C** the historical closing rank of a matching record.

```
Cutoff Margin = C - R
```

| Margin (C - R) | Group | Meaning |
|---|---|---|
| 2000 or more | **High Chance** | A comfortable gap to the historical closing rank |
| 0 to 1999 | **Moderate** | Close to the closing rank |
| Below 0 | **Ambitious** | The closing rank was more competitive than your rank |

These are simple, transparent thresholds. They are not a forecast.

## How to use it

1. Open https://sudeep-24.github.io/seatscope/
2. Enter your **rank** and choose your **category**, **seat type**, **course group**, **branch** and **counselling round**. Preferred location is optional.
3. Click **Find Colleges**.
4. Look at the summary cards, the charts and the three result groups.
5. Click **View Cutoff History** on any card to see the years behind it.
6. Click **Add to Choice List** on the options you like.
7. Reorder your list and click **Export PDF** or **Export Excel**.

## The dataset

| Item | Detail |
|---|---|
| Source | KEA KCET / UGCET cutoff PDFs, about 2022 to 2025 |
| Includes | 2025 Round 1 engineering cutoffs and non-engineering cutoffs such as nursing |
| Records | 111,830 |
| Highest closing rank | 274,884 |
| Records with a closing rank above 1,000,000 | 0 |
| Stored file | `data/cutoffs.packed.json` (about 5 MB, about 0.8 MB after automatic compression) |

Only years that exist in the verified data are shown. No year is invented.

### Fields in each record

`exam`, `courseGroup`, `year`, `round`, `collegeCode`, `collegeName`, `branch`, `city`, `category`, `seatType`, `closingRank`, `sourceFile`, `sourceDocument`, `sourceUrl`, `verificationStatus`. Some records also have `branchCode`.

### Verification labels

Records carry a status such as `official_source_verified` or `source_document_reviewed`. SeatScope does not present unverified data as officially verified, and does not invent source links.

### Source terminology is preserved

Codes such as **OPN** and **KKR** are shown exactly as the source gives them. SeatScope never changes their meaning.

### Branch grouping

Many source branch names are grouped into 19 easy categories (for example Computer Science & Engineering, Mechanical Engineering, Civil Engineering). The original records are never deleted. Grouping is only a search layer.

### How the data was repaired

The first extraction produced 102,639 records, and 2,438 of them had impossible closing ranks above 1,000,000. In some PDF rows, neighbouring numbers had been joined together and shifted into the wrong category.

The ten affected PDFs were re-read using the exact position of each character on the page, instead of guessing. This also recovered rows that had been missed.

Examples checked against the source PDFs:

- **College E300**, 2023 final round: a Computer Science GM value that read `145719141411` was really `69156`.
- **College E184**, 2023 final round: GM closing rank `203,287` was confirmed and kept.

## Technology used

| Technology | Used for |
|---|---|
| **HTML** (`index.html`) | Page structure: sidebar, form, results, Choice List, sections |
| **CSS** (`style.css`) | Layout, colours, cards, charts, animations, phone layout |
| **JavaScript** (`script.js`) | Loading data, filtering by rank, classifying options, building cards, Choice List, exports |
| **JSON** | The read-only database file |
| **`fetch()`** | Downloading the data file in the browser |
| **localStorage** | Saving the Choice List in the browser |
| **iframe** | Keeping the HelpBot separate from the main page |
| **CSS animations and `conic-gradient`** | Motion and the donut chart |
| **IntersectionObserver / MutationObserver** | Pausing animation off screen and keeping charts in sync with the results |
| **GitHub Pages** | Free static hosting |
| **Python** (local only) | A local test server and one-time data preparation scripts |

## Project structure

```
seatscope/
├── index.html              Main page
├── style.css               All styling and animation
├── script.js               All logic
├── helpbot.html            HelpBot page
├── helpbot.css             HelpBot styling
├── helpbot.js              HelpBot answers
├── helpbot-loader.js       Places the HelpBot in the corner of the page
├── data/
│   └── cutoffs.packed.json Packed cutoff database
└── college-locations/      College Search page, its styles, script and data
```

## Run it on your own computer

You need Python installed. Do **not** open `index.html` by double-clicking it. The page loads its data with `fetch()`, and browsers block that on files opened directly.

1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Start a local server:

```
python -m http.server 8000
```

4. Open **http://localhost:8000** in Chrome.
5. Press **Ctrl + Shift + R** to load the newest files.

To stop the server, press **Ctrl + C** in the terminal.

## Updating the live site

The site is hosted with GitHub Pages from the `main` branch.

1. Change a file in the repository (edit it on GitHub, or use **Add file → Upload files**).
2. Click **Commit changes**.
3. Wait about a minute, then refresh the live site with **Ctrl + Shift + R**.

## Updating the data

The browser keeps a saved copy of the data file. If you replace `data/cutoffs.packed.json`, also change this line near the top of the loader in `script.js`:

```js
const DATA_VERSION='2026-10-18-v2';
```

Use any new text (for example today's date). If you forget, browsers may keep showing the old data.

### Preparing the packed file

The original database was a 67.7 MB JSON file. It is packed into a much smaller file by storing each repeated text value once. The packing script rebuilds every record from the packed file and checks that it is identical to the original before it is used.

| Stage | Size |
|---|---|
| Original `cutoffs.json` | 67.7 MB |
| Minified copy | 57.3 MB |
| `cutoffs.packed.json` | 5.3 MB |
| Sent to visitors after automatic compression | about 0.8 MB |

The packing scripts are kept outside this repository. Keep the original `cutoffs.json` as a backup.

## Performance

- Dropdown changes used to re-process all 111,830 records with slow text matching. Remembering the result for repeated text made them much faster, with identical search results.
- Blur effects and constantly repainting animation were removed, and hero animation pauses when it is off screen.
- The packed database and browser caching make the first load and repeat visits faster.

## Privacy

- There are no accounts and no login.
- Nothing you enter is sent to a server.
- The Choice List is stored only in your own browser (localStorage).

## Limitations

- Results are historical indicators, not predictions or guarantees.
- Only years present in the verified data are shown, and different rounds are not directly comparable.
- Data accuracy depends on the source PDFs. Always check the official KEA source.
- The HelpBot is rule-based and answers only the topics it was prepared for.
- The prototype has no admin page for adding new data.

## Roadmap

- A server-side version with Next.js, an API, PostgreSQL and Prisma
- A review-first admin workflow for importing and verifying new data
- More years, rounds, colleges and categories
- Cutoff trend charts across years
- Correction requests and a data-freshness dashboard
- Other exams and state quotas, such as NEET
- An optional AI explanation assistant that uses verified records only

## Data sources and credits

- Cutoff data comes from KEA (Karnataka Examinations Authority) published KCET / UGCET cutoff PDFs. The official source links stored in the records point to `cetonline.karnataka.gov.in`.
- One extraction step used a third-party copy of a PDF. That copy is **not** an official KEA source and is not presented as one.
- SeatScope is an independent student project. It is not affiliated with or endorsed by KEA.

---

*SeatScope: verified data, rank-based filtering, clear chance categories, source awareness and choice-list planning, in one place.*

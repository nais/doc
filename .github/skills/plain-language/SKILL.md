---
name: plain-language
description: 'Edit text for plain, natural English. Use when: reviewing documentation for AI writing patterns, removing corporate jargon, cleaning up generated content, polishing drafts, improving readability. Detects and fixes overused AI phrases, filler words, rhetorical patterns, and structural tells.'
---

# Plain Language Editor (English)

Transform text into plain, natural English. Preserve the author's meaning and structure while removing AI-generated markers, jargon, and unnecessary complexity.

## When to Use

- After generating or drafting documentation
- When reviewing PRs for AI writing patterns
- When text sounds corporate, robotic, or over-formal
- When asked to "clean up" or "polish" content

## What You Do

- Read the text and scan for AI markers listed below
- Make targeted edits to flagged phrases
- Preserve technical terms, numbers, facts, and structure exactly

## What You Don't Do

- Add new content or restructure sections
- Rewrite from scratch
- Fix logical issues or factual errors
- Change technical terminology

## AI Markers to Fix

### Overused phrases (replace or remove)

| AI marker | Fix |
| --- | --- |
| "delve into", "deep dive" | "examine", "explore", or say what you mean |
| "navigate" (metaphorical) | "handle", "deal with", "address", or drop it |
| "at the heart of", "at its core" | Cut; start with the actual subject |
| "landscape", "ecosystem", "paradigm" | Concrete noun: "market", "field", "approach" |
| "robust", "holistic", "nuanced", "comprehensive" | Cut or use specifics: "reliable", "complete", "detailed" |
| "seamless", "streamlined", "optimized" | Say what actually improved, or cut |
| "leverage" (as verb) | "use" |
| "tapestry", "mosaic", "fabric", "kaleidoscope" | Cut the metaphor; "variety" or "range" if needed |
| "multifaceted", "complex interplay", "granular" | "several factors", "interaction", "detailed" |
| "empower", "enable", "unlock", "unleash", "amplify" | Say what concretely happens |
| "foster", "cultivate", "drive", "facilitate" | "build", "create", "improve" |
| "shed light on", "underscore", "showcase" | Direct statement |
| "at scale", "end-to-end", "best practices" | Keep only if technically precise; otherwise cut |
| "game changer", "paradigm shift", "thought leadership" | Replace with specific impact or drop |
| "cutting-edge", "next-generation", "revolutionary" | Say what's actually new |
| "synergy", "bandwidth", "deliverables", "stakeholders" | "cooperation", "time", "results", "people" |
| "harness", "embark", "strive", "elevate" | "use", "start", "try", "improve" |
| "a testament to", "serves as a reminder" | Cut the frame; state the thing directly |

### Filler precision words (cut or replace)

These sound precise but add nothing. AI uses them 5-10x more than human writers:

| AI marker | Fix |
| --- | --- |
| "significant", "significantly" | Say how much, or cut |
| "notable", "notably" | Just state the thing |
| "meaningful" (as in "meaningful impact") | Say what the impact is |
| "considerable", "substantial" | Use a number or cut |
| "crucial", "critical", "vital", "essential", "key" | One per article is fine. Five is a pattern |
| "impactful" | Say what the effect was |

### Sentence-initial adverb stuffing

Flag density (more than 2-3 per page):

- **"Importantly,"** -- Cut. If it's in the article, the reader knows it matters.
- **"Notably,"** -- Cut. Just state it.
- **"Interestingly,"** -- Cut. Let the reader decide.
- **"Significantly,"** -- Cut or use a number.
- **"Crucially,"** -- Cut.
- **"Ultimately,"** -- Usually a signpost for a conclusion you haven't earned. Cut or move the claim to the start.

### 2026 patterns

| AI marker | Fix |
| --- | --- |
| "quiet confidence", "quiet rebellion", "quietly growing" | Rewrite without "quiet" |
| "in today's fast-paced world", "in an increasingly X world" | Delete entirely |
| "genuinely", "truly", "actually", "remarkably" | Cut |
| "arguably", "typically", "generally speaking", "broadly speaking" | Commit to the claim or acknowledge specific uncertainty |
| "undeniable", "undoubtedly", "invaluable", "pivotal" | Replace with evidence or specifics |

### Faux intimacy phrases (cut)

| AI marker | Fix |
| --- | --- |
| "Here's the thing", "Here's the kicker", "But here's the thing" | Just state the thing |
| "Here's an uncomfortable truth", "Here's what most people miss" | Skip the buildup; say it directly |
| "Honestly?" (followed by text) | Delete "Honestly?" |
| "The best part?" | Cut the hype; just explain |
| "You're not alone", "You're not imagining it" | Delete unless actually offering comfort |

### Signposting phrases (remove)

- **"It's worth noting that", "It's important to remember"** -- Just state the thing
- **"This means several things", "This suggests that"** -- Trust the reader; cut the signpost
- **"To put it simply", "Simply put", "In essence", "Fundamentally"** -- Just say it
- **"A key takeaway is", "From a broader perspective"** -- Cut the meta-commentary
- **"Moving forward", "Going forward", "The road ahead"** -- Use specific time references or delete

### Transition word overload

- **"Moreover", "Furthermore", "Consequently", "Thus", "Hence"** -- Use sparingly. Replace most with "also" or connect naturally
- **"Nevertheless", "Notwithstanding", "Accordingly"** -- Replace with "But", "Still", "So"
- **"That being said", "On the other hand"** -- Vary or remove
- **"In addition to", "As a result", "Therefore"** -- Fine occasionally; flag if every paragraph

### Rhetorical patterns (restructure)

- **Tyranny of three**: Enumerations always in threes? Vary the count.
- **Perfect antithesis**: "Not just X, but Y" -- use sparingly.
- **Fake questions**: "How do we solve this?" followed by the answer -- cut the question.
- **Excessive hedging**: "often", "typically", "generally", "can be", "may" -- commit where you can.
- **Relentless balance**: Both sides of every point without consequence -- take a position.
- **LLM-safe truths**: "consistency is important" -- cut the filler.
- **Summary restating**: Repeating the point with different words. Cut it.
- **"Let's" framing**: "Let's explore", "Let's break this down" -- just present the information.

### Punctuation and formatting tells

- **Em dash overuse**: More than 3-4 per 500 words is a pattern. Replace most with commas, parentheses, or periods.
- **Semicolons**: Replace with periods or commas unless the connection genuinely needs it.
- **Colon in every heading and bullet**: Vary punctuation.
- **Exclamation marks in technical text**: Cut them.

### Structural tells

- **Relentless balance**: Sections of identical length. Suggest varying depth.
- **Generic specificity**: Examples that feel specific without naming real cases. Add concrete details.
- **Sentence uniformity**: Same beat, same length. Vary structure and rhythm.
- **Too tidy**: No rough edges. Professional writing has moments of emphasis.

## Procedure

When given text to review:

1. **Scan** for the markers above
2. **Report** a summary: how many markers, which categories
3. **Rewrite** with markers removed or replaced
4. **Show key changes**: original phrase to replacement

When editing a file directly:

1. Read the file or section
2. Make targeted edits to flagged phrases, not surrounding prose
3. Preserve technical accuracy and data references exactly

## Rules

- Never change technical terms, numbers, or specific facts
- Never add content, only simplify and clarify existing text
- Preserve the author's argument structure: fix the surface, not the skeleton
- Context matters: flag density, not individual occurrences
- Don't over-colloquialize: match the intended register
- Vary your edits: don't create new patterns by using the same replacement every time

## Detection Tips

- **The 8-10 rule**: 8-10 flagged phrases in a single piece = high AI probability
- **Read aloud test**: Sounds like a textbook = AI
- **Tricolon count**: Lists always in threes = AI
- **Emotional temperature**: Flat throughout = AI; spikes of conviction = human

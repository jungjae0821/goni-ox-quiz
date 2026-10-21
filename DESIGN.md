---
name: Goni OX Archive
description: A source-backed study desk for repeating Korean OX quizzes.
colors:
  ink-navy: "#102731"
  ink-soft: "#334c52"
  ink-faint: "#52666a"
  cool-paper: "#f0f3f1"
  cool-paper-deep: "#dfe8e6"
  paper-line: "#c8d3d1"
  paper-line-strong: "#aab8b8"
  register-teal: "#086b64"
  register-teal-soft: "#d8e9e4"
  correction-coral: "#a94034"
  correction-coral-soft: "#f1d8d3"
  white: "#fcfdfa"
typography:
  display:
    fontFamily: "Noto Sans KR, Malgun Gothic, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Noto Sans KR, Malgun Gothic, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Cascadia Code, SFMono-Regular, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "14px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "28px"
  xl: "52px"
components:
  button-primary:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "39px"
  button-answer:
    backgroundColor: "transparent"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.md}"
    padding: "14px 17px"
    height: "94px"
  input-search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
---

# Design System: Goni OX Archive

## Overview

**Creative North Star: "The Printed Proof Desk"**

The interface borrows the discipline of a print proof and an index card: cool paper, deep ink, narrow registration labels, and a single line that reveals where a claim came from. It is a working study desk first. Navigation, filters, buttons, and drawers remain recognisable web controls; the print language contributes only type, palette, density, and the registration-strip signature.

The page is intentionally calm and evidence-led. A learner should notice the sentence, choose O or X, then see the source location before chasing a score. The visual system uses tonal layering and thin rules rather than decorative texture or glow.

**Key Characteristics:**

- Cool paper surfaces with navy ink and restrained teal/coral state colors.
- Monospace labels for source, location, counts, and other measurement-like metadata.
- One-pixel registration marks that make evidence feel aligned, not ornamental.
- Standard web interaction patterns with generous focus states and mobile reflow.

## Colors

The palette is a cool printed stock with strong ink contrast. Teal carries confirmation and evidence; coral carries correction. Neither state relies on color alone: each also has a label.

### Primary

- **Deep Ink Navy** (#102731): top bar, primary actions, headline text.
- **Register Teal** (#086b64): correct state, active metadata, progress.
- **Correction Coral** (#a94034): wrong state and corrective emphasis.

### Neutral

- **Cool Paper** (#f0f3f1): reading surface and page background.
- **Cool Paper Deep** (#dfe8e6): outer frame and mobile surroundings.
- **Paper Line** (#c8d3d1): quiet dividers and progress track.
- **Strong Paper Line** (#aab8b8): field borders and registration edges.
- **White** (#fcfdfa): question panels and controls.

**The Register Rule.** Every answer state has a visible source register; correctness is never presented as an unexplained color flash.

## Typography

**Display Font:** Noto Sans KR, Malgun Gothic, system-ui, sans-serif

**Body Font:** Noto Sans KR, Malgun Gothic, system-ui, sans-serif

**Label/Mono Font:** Cascadia Code, SFMono-Regular, Consolas, monospace

**Character:** The sans is direct and readable for long Korean statements. The mono is reserved for file names, counts, locations, and state labels where it behaves like a measuring instrument rather than a costume.

### Hierarchy

- **Display** (700, clamp(2rem, 4vw, 3rem), 1.1): queue headings and drawer titles.
- **Headline** (700, clamp(22px, 3.4vw, 40px), 1.3): the OX statement.
- **Title** (700, 26px, 1.1): sidebar and small surface titles.
- **Body** (400, 13px, 1.5): instructions, descriptions, and evidence.
- **Label** (500, 11px, 1.4, tracked): source, status, and operational metadata.

## Layout

Desktop uses a fixed filter rail beside a fluid learning desk. The content column caps at 1100px so long statements remain readable while the question panel has room for two answer controls. Mobile collapses the rail into a slide-in filter, keeps the statement first, and stacks O/X controls vertically. Spacing follows a compact 8/12/18 rhythm with larger 28/52 separations at task boundaries.

## Elevation & Depth

Depth comes from tonal layering and one neutral, soft ambient shadow on the question panel and source drawer. Resting controls stay flat. The registration strip expands with a short ease-out motion after an answer, and reduced-motion users receive the same information without the transition.

### Shadow Vocabulary

- **Desk lift** (`0 18px 50px rgba(0, 0, 0, 0.12)`): the question work surface against the paper field.
- **Drawer lift** (`-18px 0 50px rgba(16, 39, 49, 0.16)`): separates the source index from the desk.

## Shapes

Panels use 14px corners; controls use 6–8px corners. Borders are one pixel and carry more of the form than rounded surfaces. Registration marks are square crosshairs, never ornamental blobs. There are no pills except the compact topic tag, where its role is to identify a category.

## Components

### Buttons

- **Primary:** navy fill, white label, 39px minimum height, 8px radius.
- **Secondary:** transparent surface with a navy one-pixel border.
- **Answer:** large two-column controls with a monospaced O/X code and a clear text label; correct and wrong states use teal/coral plus text feedback.
- **Hover / Focus:** small lift on answer controls; all controls use a visible warm focus ring.

### Chips

- **Topic tag:** pale teal fill, teal text, compact mono label; identifies the topic but does not act as the answer.

### Cards / Containers

- **Question panel:** white surface, one-pixel strong border, 14px radius, desk-lift shadow, 24–52px internal padding.
- **Evidence strip:** cool paper inset with a top rule and crosshair marker; opens only after an answer.

### Inputs / Fields

- **Search:** white fill, strong one-pixel border, 8px radius, 40px height.
- **Focus:** border shifts to teal and the global warm focus ring remains visible.

### Navigation

- **Filter rail:** left-side standard button list with active ink border and white fill.
- **Mobile:** slide-in rail with a close control; the main task remains visible underneath.

### Source Register

The signature component aligns file name, page/slide/body location, question type, and original excerpt. It is the proof moment of the product and should not be replaced by a generic tooltip or toast.

## Do's and Don'ts

### Do:

- **Do** keep the statement readable before showing supporting metadata.
- **Do** use teal and coral only for meaningful state or evidence signals.
- **Do** keep source file names and locations visible at the moment of feedback.
- **Do** preserve keyboard O/X/N shortcuts and visible focus.

### Don't:

- **Don't** turn the print reference into a fake paper notebook, ledger, or terminal costume.
- **Don't** use color alone to communicate correct or wrong.
- **Don't** add gradients, glow shadows, decorative grid overlays, or tiny functional labels.
- **Don't** hide the public-source boundary when publishing the static site.

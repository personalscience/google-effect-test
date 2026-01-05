# Google Effect Test - Personal Offloading Experiment

## Project Overview

A React web app implementing a self-experiment to measure the **Google Effect** (Sparrow et al., 2011).

**Purpose**: Interactive tool for PSWeek250108 post.

## Tech Stack

- React 18.2.0 (Create React App)
- Pure CSS (no frameworks)
- Netlify deployment ready
- No backend required

## Experiment Flow (~15 minutes)

1. **Encoding** - Type 20 trivia statements (10 saved, 10 deleted)
2. **Distractor** - 2 min math problems
3. **Free Recall** - Write remembered statements
4. **Recognition** - 30 items Yes/No
5. **Location Memory** - Which folder for saved items?
6. **Stroop Task** - Color-naming tech vs neutral words

## Key Metrics

- Offloading Effect: (deleted - saved recalled) / 10
- Location Accuracy: correct folders / 10 (chance = 20%)
- Google Effect: RT difference for tech words after hard vs easy Qs

## Commands

```bash
npm install
npm start
npm run build
```

## Deployment

Drag build/ folder to Netlify, or connect GitHub repo.

## Scientific Background

Sparrow et al 2011 Science: we remember WHERE better than WHAT.
Note: Stroop effect failed 2018 replication; save/delete more robust.

## TODOs

- [ ] Add persistent storage for aggregating results
- [ ] Add comparison to published effect sizes
- [ ] Improve mobile Stroop handling

## Context

Tests the what-vs-how framework: AI handles how, making what more valuable.

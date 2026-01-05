# The Personal Offloading Test

A self-experiment to measure the **Google Effect** — how knowing you can look things up changes how you remember them.

Based on Sparrow, Liu & Wegner (2011) "Google Effects on Memory: Cognitive Consequences of Having Information at Our Fingertips" published in *Science*.

## What It Tests

1. **Offloading Effect**: Do you remember "deleted" information better than "saved" information?
2. **Location Memory**: Do you remember WHERE information was stored better than WHAT it contained?
3. **Google Stroop Effect**: After hard trivia questions, do tech-related words (Google, ChatGPT, etc.) interfere with your thinking more than neutral words?

## Time Required

~15 minutes

## Deployment to Netlify

### Option 1: Deploy from GitHub

1. Push this folder to a GitHub repository
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to your GitHub repository
5. Build settings will auto-detect from `netlify.toml`
6. Click "Deploy"

### Option 2: Manual Deploy

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Drag the `build` folder to Netlify's deploy drop zone

### Option 3: Netlify CLI

```bash
npm install -g netlify-cli
npm install
npm run build
netlify deploy --prod
```

## Local Development

```bash
npm install
npm start
```

Opens at http://localhost:3000

## Data Output

Results are downloadable as JSON with:
- Free recall performance (saved vs. deleted items)
- Recognition memory (hit rates, false alarm rates)
- Location memory accuracy
- Stroop reaction times (tech words vs. neutral words, after hard vs. easy questions)
- Calculated "Google Effect" coefficient

## Scientific Background

The original Sparrow et al. (2011) study found:
- People remember less when they expect information to be saved
- People remember WHERE to find information better than the information itself
- Hard trivia questions prime thoughts about computers/internet

**Note**: The "Google Stroop" effect failed to replicate in a 2018 Nature study. The save/delete memory effects have been more robust across replications.

## License

MIT

## Citation

If you use this for research or writing:

```
Personal Offloading Test. Based on: Sparrow, B., Liu, J., & Wegner, D. M. (2011). 
Google effects on memory: Cognitive consequences of having information at our fingertips. 
Science, 333(6043), 776-778.
```

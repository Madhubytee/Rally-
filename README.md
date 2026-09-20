# Rally

A map of located problems and the people who'll fix them.

Three roles share one surface: residents report, organizers convert reports into
events, and anyone nearby joins.

Volunteering fails at the discovery step, not the willingness step. The work
exists and people exist, but the information sits in group chats, org emails and
city systems nobody reads. Rally puts both halves on one map so finding work and
finding people is the same action.

## Running it

```bash
npm install
npm run dev
```

- `/` — the landing page
- `/app` — the community app: map, board, report

Copy `.env.example` to `.env.local` if you want to change the city or map
defaults. Nothing in it is secret and the app runs without it.

## Layout

```
app/
  (site)/      landing page and the secondary routes
  (app)/app/   the community app, phone-shaped, no site chrome
components/
  app/         the community app
  demo/        the walkthrough on the landing page
  landing/     landing page sections
  layout/      nav, footer, ribbon
lib/           data, region bounds, scoring, the GLOBE client
data/          the import pipeline and its notes
prototype/     the original single-file Vite build, kept for reference
```

## The data

Three layers, all sharing one record shape so they render identically:

1. **NASA GLOBE Observer** — Mosquito Habitat Mapper observations. Standing
   water sites and whether larvae were found. Public API, no key required.
2. **Resident reports** — created in the app.
3. **Events** — derived from a pin, never entered from scratch.

Priority is one printed rule, not a model: larvae confirmed is high, standing
water with no larvae found or no sample taken is medium, and anything last
observed over a year ago is low. A blank larvae count is kept blank — it means
nobody sampled, not that the site is clear.

See [`data/README.md`](data/README.md) for the pipeline and the current state of
the GLOBE layer.

## Status

The app runs end to end against seed data: filtering, reporting, turning a pin
into an event, publishing a flyer, and signing up. Nothing persists yet — a
reload resets it.

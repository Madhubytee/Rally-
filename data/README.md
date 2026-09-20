# The data pipeline

## Layer 1 — NASA GLOBE Observer

Mosquito Habitat Mapper records. A volunteer finds standing water, reports
whether larvae are present, and optionally counts them.

**No API key is required.** The search API is open and anonymous, and CORS is
open, so it can be called from the browser or the server:

```
https://api.globe.gov/search/v1/measurement/protocol/measureddate/lat/lon/
  ?protocols=mosquito_habitat_mapper
  &startdate=2017-01-01&enddate=<today>
  &minlat=&maxlat=&minlon=&maxlon=
  &geojson=FALSE&sample=FALSE
```

The key-gated API at `api.globe.gov/docs` is a different service — that one is
for *submitting* measurements into GLOBE, not reading them out. It is easy to
land on it and conclude credentials are needed. They are not.

`lib/globe.js` wraps this.

### Coverage — read this before planning around it

Records inside the county bounding box, whole archive, measured 2026-09-20:

| Region | Records |
| --- | --- |
| Alachua County | 6 |
| North Florida | 15 |
| Florida | 634 |
| Southeast US | 1,163 |

Alachua County has **six observations across nine years** — three from August
2019 and three from January 2026, clustered around UF campus and Bivens Arm,
all still water, **none with a positive larvae count**.

That is not enough to seed a county map, and it means any "larvae confirmed"
pin shown for Gainesville today is demo data, not GLOBE data. The options are
to widen the region to statewide Florida, treat GLOBE as a sparse supplementary
layer over a denser primary source, or keep Gainesville and say plainly that
the GLOBE layer is thin here.

Publication lag is roughly six months, so this is an archive rather than a live
feed. Nothing from it should be labelled current conditions.

### Field names

Verbose and easy to get wrong. The ones that matter:

| Need | Field |
| --- | --- |
| latitude / longitude | top-level `latitude`, `longitude` |
| measured at | `data.mosquitohabitatmapperMeasuredAt` |
| water source | `data.mosquitohabitatmapperWaterSource` (31 values) |
| water source type | `data.mosquitohabitatmapperWaterSourceType` (4 values) |
| larvae count | `data.mosquitohabitatmapperLarvaeCount` |

Gotchas, all observed in live responses:

- **Larvae count is a string or null**, never a number. The archive contains at
  least one negative value, so validate the range.
- **null is not zero.** A null means nobody sampled; a `"0"` means someone
  looked and found none. `lib/globe.js` preserves the distinction and
  `lib/severity.js` depends on it.
- **There are two coordinate pairs per record** and they disagree by 50–100 m.
  Use the top-level one; the pair inside `data` is rounded to four decimals.
- `geojson=TRUE` stringifies everything including nulls, which arrive as the
  literal string `"null"`. Use `geojson=FALSE`.
- Dates have no timezone designator. Treat them as naive local times.
- Photo URLs are `"; "`-joined strings, not arrays.

Fields deliberately ignored: species ID and photo URLs. Volunteers skip the
optional steps constantly, so anything built on them breaks on most records.

### Attribution, required wherever the data is shown

> Global Learning and Observations to Benefit the Environment (GLOBE) Program,
> [date accessed], globe.gov

### CSV fallback

`globe.gov/globe-data/retrieve-data` → Enter Data Access Tool →
`datasearch.globe.gov`. Filter by protocol, date range and latitude/longitude
range, then download CSV. Column names are not published outside the Data User
Guide PDF, but historically mirror the API's `mosquitohabitatmapper*` names.

## Clean, filter, score

Implemented in `lib/issues.js`, `lib/geo.js` and `lib/severity.js` rather than a
notebook, so the rules run in the app and cannot drift from what is displayed.

**Clean** — three rules. Drop records with no coordinates, since an unmappable
site cannot be acted on. Drop coordinates outside valid ranges, which are entry
errors. Keep records where the larvae count is blank, and never coerce blank to
zero.

**Filter** — one bounding box constant in `lib/geo.js`. Change four numbers and
it runs anywhere with GLOBE coverage.

**Score** — the rule in `lib/severity.js`, printed on the map screen so it is
auditable. Staleness is checked first: a year-old larvae confirmation describes
a site that has probably dried up, and calling it high priority would send
volunteers to the wrong place.

Scores are computed against `DATA_ASOF`, a fixed date, rather than the wall
clock. Same input, same output, on the server and in the browser.

## Layers 2 and 3

Resident reports and events are generated in the app and held in React state.
They are demo-state, which is the honest description. Making them real needs a
store — the shapes they would persist are in `lib/issues.js` and `lib/board.js`.

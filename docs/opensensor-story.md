# OpenSensor scroll presentation and evidence

Reviewed 2026-10-08. The presentation is at `/opensensor#sensor-story`.
It explains an architecture, not a deployed OpenAQ integration. No readings
were submitted, cloud resources created, or third parties contacted.

## Review of the existing diagram

`app/opensensor/components/sensor-flow.tsx` accurately communicates the intended
local-first experience: keep Parquet on the edge, optionally relay through a
phone/hub, then share through object storage. Its three connection modes make
outages understandable. It does not explain the conventional ingest/database
chain, batching, downstream sharing, or the distinction between working firmware
and planned cloud functions. Its interactive Offline / Phone / Internet modes are available from “Try a
connection” throughout the scroll story. The separate connection section has been
removed. The original large introduction and numbered-slide treatment were also
removed: a persistent scene now carries the explanation, with a modest caption.

Local project evidence was read from the `aq-parquet` README, `air-quality-sync`
README and `docs/platforms.md`, and the `opensensor-space` README in the sibling
OpenSensor workspace. These repositories have separate implementation scopes:

- On-device Parquet and file rotation are demonstrated. The firmware documents
  15-minute rotation and 30/60-minute options. Rotation is not an averaging window.
- Direct ESP32 cloud uploads, cloud compaction and the provider feed are not
  established as production features by those documents.
- The sync reference has a local Go ingest service and Lambda/S3 example. It does
  not demonstrate that the entire direct-device path already runs without ingress.
- The dashboard's intended model is reading public files across cloud providers.

The story therefore labels the transition from demonstrated capture to proposed
cloud flow, and distinguishes the current OpenAQ archive from our proposed
Parquet contribution. In particular, it does not claim zero servers everywhere:
object storage still uses infrastructure, and authorization, retries, validation,
compaction, storage requests, device power and downstream services still exist.
Removing a dedicated always-on ingest tier and primary database can reduce the
components a network operates. Energy, carbon and cost savings need measurement.
AirGradient is an example of provider-API integration, not evidence that every
vendor uses permanently running VMs or that OpenAQ itself must operate that way.

## OpenAQ: can we POST a batch every 15 minutes?

**Not through its public v3 API.** The complete live
[OpenAPI specification](https://api.openaq.org/openapi.json) has 39 HTTP operations,
all GET, as enumerated below. There is no public POST, PUT, PATCH or DELETE
operation, no upload endpoint and consequently no public minimum upload row
count, batch size or POST interval. API retrieval rate limits are not ingestion
quotas. See also [About the API](https://docs.openaq.org/about/about).

Publishing an object every 15 minutes is a choice we can make. Whether OpenAQ
fetches it, how often, which averaging windows it accepts, its payload limits,
backfill rules and correction handling require an agreed provider integration.
Do not promise a 15–30 minute API latency or a 1–2 hour upper bound.

The [legacy fetcher criteria](https://github.com/openaq/openaq-fetch#data-criteria)
mention averages from 10 minutes to 24 hours, but also exclude low-cost sensors.
That is not adequate evidence of a current universal minimum for new low-cost
sensor partners. The supplied agent report's stronger claim was not adopted.
The current [Before You Buy guide](https://documents.openaq.org/guides/OpenAQ+Before+You+Buy+Guide.pdf)
was downloaded and read in full. It does not specify an averaging window, polling
rate, batch count or file serialization. It requests structured machine-readable
data, physical units, precise coordinates, accurate observation times and open
licensing (CC BY 4.0 or no copyright restrictions). Provider ownership/sharing
rights and technical integration are separate requirements. A read-only public
feed can isolate the shared data from the rest of our systems.

## How OpenAQ reads AirGradient

The published [source configuration](https://github.com/openaq/openaq-lcs-fetch/blob/main/fetcher/sources/airgradient.json)
sets `frequency: "hour"`. The [adapter](https://github.com/openaq/openaq-lcs-fetch/blob/main/fetcher/providers/airgradient.js):

1. Lists opted-in locations using
   `GET /public/api/v1/openaq/locations/measures/current` on AirGradient.
2. Fetches `GET /public/api/v1/openaq/locations/{id}/measures/last/buckets/60`
   for each location, processing up to 20 location requests concurrently.
3. Looks back three hours and excludes the current, unfinished hour.
4. Converts hour-start timestamps into hour-ending timestamps, maps parameters
   and returns locations/measures for OpenAQ's internal provider writer.

These are **AirGradient provider endpoints**, not endpoints on OpenAQ's public
API. The source code describes the published implementation, not verified live
scheduler telemetry. [AirGradient's sharing guide](https://www.airgradient.com/blog/share-data-with-openaq/)
also describes opt-in outdoor sharing. Avoid submitting the same station through
both AirGradient and an independent OpenSensor integration.

## OpenAQ archive and proposed Parquet contribution

The [published archive](https://docs.openaq.org/aws/about) uses Hive-style
location/year/month prefixes and daily `CSV.gz` files. This is the same
partitioning idea, with a different file format. The supplied October 2 example
was downloaded successfully; its gzip contents matched the documented columns.
The archive docs describe publication 72 hours after the local day ends, with
possible later patches. This archive delay is separate from provider polling or
public API latency.

The [exporter code](https://github.com/openaq/openaq-open-data/blob/main/lambda/open_data_export/main.py)
reads Postgres measurements, writes compressed CSV and uploads an object.
Its [README](https://github.com/openaq/openaq-open-data#readme) describes the change
log and scheduled export process; the [CDK configuration](https://github.com/openaq/openaq-open-data/blob/main/cdk/stacks.py)
contains a Lambda schedule. The exporter also has a Parquet **output** option.
These sources do not establish a Parquet-to-CSV ingestion path, or the current
acceptance of a provider's Parquet feed.

The presentation therefore shows the existing **database → export job → CSV.gz**
archive separately from the proposed **Parquet → object storage → analysis**
path. It labels location/date partitioning rather than implying that partitioning
belongs exclusively to Parquet. OpenAQ uses cloud services; describing the whole
system as “non-cloud-native” or claiming measured Lambda cost savings would be
unsupported. Its aggregation and quality-control responsibilities also differ
from those of an individual sensor network.

[DuckDB documents](https://duckdb.org/docs/lts/core_extensions/httpfs/https)
selective Parquet reads over HTTP using metadata and range requests. CSV generally
requires a full file download in that reader. Both formats remain queryable, and
partition pruning can benefit both. Benefits depend on file sizes, query patterns
and the reader; no cost or speed benchmark was performed here.

The user intends to contribute a Parquet integration to OpenAQ. The lilac dashed
branch is explicitly marked **Proposed contribution**. It connects the retained
Parquet files to the OpenAQ ecosystem, separately from the current archive chain;
it does not promise that OpenAQ will replace its database, convert these files to
CSV, or accept this integration unchanged. The contribution's adapter, schema,
licensing, timing and ownership still need agreement and implementation. Lilac
uses `brandPalettes.action` (light `deep`, dark `main`); the dashed stroke and label
carry the same meaning without relying on color alone.

## Compatibility feed option

Until a Parquet integration is agreed, a compatibility feed remains an option.
Keep immutable raw Parquet as the source of truth. Use a bounded scheduled or
event-triggered export job to derive settled averages and publish small HTTPS
JSON/CSV objects. This avoids maintaining a dynamic provider API just to serve
OpenAQ. It still requires an OpenAQ adapter and provider agreement; an existing
internal adapter schema is not a published universal acceptance contract.

```text
archive/station=…/year=…/month=…/day=…/*.parquet
openaq/v1/locations.json
openaq/v1/latest.json.gz
openaq/v1/windows/YYYY/MM/DD/HHmm.json.gz
openaq/v1/index.json
```

This layout is a proposal, not deployed URLs. Agree on the schema before building
the exporter. Include station and sensor identity, parameter, units, values,
UTC window start/end, averaging seconds, quality/coverage, license and attribution.
Publish only eligible outdoor observations with known timestamps and physical
units; unknown readings must not become zero, and arrival time must not replace
measurement time. Device/board temperature is not ambient temperature. Retain
raw readings even if a destination cannot accept them.

A possible first contract is completed 15-minute averages and a rolling 24-hour
feed with immutable historical windows. These numbers are design proposals.
Specify a lateness cutoff based on measured arrivals, a correction/revision
policy, deduplication and explicit backfill behavior with OpenAQ. A rolling feed
helps recovery but does not guarantee replay or acceptance. Do not discard late
measurements from the source archive or assume repeated/corrected rows are always
safe. Compression, conditional requests and cache headers can reduce traffic;
polling still consumes requests and is not automatically free.

Ask OpenAQ to confirm acceptance window/minimum period, fetch schedule, format,
maximum object size, supported parameters, precision, license/attribution,
corrections, deduplication and historical import. A 15-minute device batch can
contain many unaveraged samples; a 15-minute exported mean is a different thing;
OpenAQ's polling frequency is a third independent clock.

## Presentation implementation

- `app/opensensor/components/story/` owns the native scroll wrapper, concise copy,
  localization, caption, cadence control and accessible milestone navigation.
  There is no large introduction block. The first moment explicitly describes
  the common receiving-server/database/API path we propose to simplify. The API
  label represents the application layer, not necessarily another dedicated server.
- `public/opensensor-story/index.html` is one continuous HyperFrames composition:
  1100×700, 70 seconds, one synchronously registered paused GSAP timeline. Air
  lines, measurement dots, the same sensor, detailed sample-data file cards,
  storage and readers share one scene. `DESIGN.md` records the site-derived identity.
- Card perspective and shallow stacks follow the principles demonstrated by the
  [Orbit Card](https://hyperframes.heygen.com/catalog/blocks/orbit-card) and
  [Camera Rig Depth Stack](https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/components/camera-rig-depth-stack/camera-rig-depth-stack.html)
  catalog references. Curved routes and tracing use the ideas in
  [Arc Motion Path](https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/components/arc-motion-path/arc-motion-path.html)
  and [SVG Stroke Trace](https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/components/svg-stroke-trace/svg-stroke-trace.html).
  These are adapted techniques, not a wholesale embed of the Three.js Orbit Card
  block. No WebGL dependency or remote font was added.
- Phone layouts align sensor, storage and browser in one row after removal,
  give the optional export its own row, and simplify stored-file details. The
  viewport framing follows the story to avoid reserving space for removed services.
- The old server and primary database are crossed out in the existing coral
  palette. A separate lilac dashed route marks the proposed Parquet contribution
  to OpenAQ. Labels explain removal and proposal status without relying on color. Sample measurement
  values are explicitly illustrative, not live sensor readings or averages.
- The parent sends bounded seeks and palette/locale/cadence using same-origin
  messages. The iframe accepts only its same-origin parent and makes no data calls.
  A base-URL correction preserves relative assets when static hosts canonicalize
  `index.html` to its directory name.
- GSAP 3.14.2 is served locally with its upstream distribution license header.
  Quicksand and Cairo reuse the site's committed fonts. No runtime CDN is used.
- “Try a connection” opens the existing three-mode explorer in a shared Radix
  dialog with focus trapping, Escape dismissal and focus return. It is available
  throughout the journey, rather than replacing the animated scene for a slide.
- Ordinary scrolling drives the diagram; text remains readable. Milestone buttons,
  arrows, a skip link and a four-icon visual summary remain available. The long
  transcript and evidence accordion were removed; source research stays in this guide. Short viewports
  (≤720px tall) use normal page flow and explicit arrow navigation. Reduced motion
  seeks directly to settled states. English, Arabic and Egyptian Arabic are covered.
- Cadence is a single-line 15-minute/hour toggle. The daily file counter and
  explanatory footnote were removed. Captions reserve the tallest localized
  narrative at the current width, with a fixed-height control/status row, so
  chapter changes and wrapping do not resize the diagram viewport. Batching
  retains individual samples; it does not imply calculating an average.

Run `pnpm dev` for the website. For standalone composition checks:

```sh
pnpm dlx hyperframes@0.7.21 lint public/opensensor-story
pnpm dlx hyperframes@0.7.21 validate public/opensensor-story
pnpm dlx hyperframes@0.7.21 inspect public/opensensor-story --at 3,13,23,33,43,53,63
```

## Complete public API endpoint inventory

Fetched from the live specification on 2026-10-08; version field `3.0.0`.
All operations below are GET. No write endpoints are advertised.

| Method | Path                                               | Purpose                                                             |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/v3/instruments/{instruments_id}`                 | Get an instrument by ID                                             |
| GET    | `/v3/instruments`                                  | Get instruments                                                     |
| GET    | `/v3/manufacturers/{manufacturers_id}/instruments` | Get instruments by manufacturer ID                                  |
| GET    | `/v3/locations/{locations_id}`                     | Get a location by ID                                                |
| GET    | `/v3/locations`                                    | Get locations                                                       |
| GET    | `/v3/licenses/{licenses_id}`                       | Get a license by ID                                                 |
| GET    | `/v3/licenses`                                     | Get licenses                                                        |
| GET    | `/v3/parameters/{parameters_id}`                   | Get a parameter by ID                                               |
| GET    | `/v3/parameters`                                   | Get a parameters                                                    |
| GET    | `/v3/countries/{countries_id}`                     | Get a country by ID                                                 |
| GET    | `/v3/countries`                                    | Get countries                                                       |
| GET    | `/v3/manufacturers/{manufacturers_id}`             | Get a manufacturer by ID                                            |
| GET    | `/v3/manufacturers`                                | Get manufacturers                                                   |
| GET    | `/v3/sensors/{sensors_id}/measurements`            | Get measurements by sensor ID                                       |
| GET    | `/v3/sensors/{sensors_id}/measurements/hourly`     | Get measurements aggregated to hours by sensor ID                   |
| GET    | `/v3/sensors/{sensors_id}/measurements/daily`      | Get measurements aggregated to days by sensor ID                    |
| GET    | `/v3/sensors/{sensors_id}/hours`                   | Get precomputed hourly measurements by sensor ID                    |
| GET    | `/v3/sensors/{sensors_id}/hours/daily`             | Get measurements aggregated from hour to day by sensor ID           |
| GET    | `/v3/sensors/{sensors_id}/hours/monthly`           | Get measurements aggregated from hour to month by sensor ID         |
| GET    | `/v3/sensors/{sensors_id}/hours/yearly`            | Get measurements aggregated from hour to year by sensor ID          |
| GET    | `/v3/sensors/{sensors_id}/hours/hourofday`         | Get measurements aggregated from hour to hour of day by sensor ID   |
| GET    | `/v3/sensors/{sensors_id}/hours/dayofweek`         | Get measurements aggregated from hour to day of week by sensor ID   |
| GET    | `/v3/sensors/{sensors_id}/hours/monthofyear`       | Get measurements aggregated from hour to month of year by sensor ID |
| GET    | `/v3/sensors/{sensors_id}/days/dayofweek`          | Get measurements aggregated from day to day of week by sensor ID    |
| GET    | `/v3/sensors/{sensors_id}/days/monthofyear`        | Get measurements aggregated from day to month of year by sensor ID  |
| GET    | `/v3/sensors/{sensors_id}/days`                    | Get measurements aggregated to day by sensor ID                     |
| GET    | `/v3/sensors/{sensors_id}/days/monthly`            | Get measurements aggregated from day to month by sensor ID          |
| GET    | `/v3/sensors/{sensors_id}/days/yearly`             | Get measurements aggregated from day to year by sensor ID           |
| GET    | `/v3/sensors/{sensors_id}/years`                   | Get measurements aggregated to year by sensor ID                    |
| GET    | `/v3/owners/{owners_id}`                           | Get a owner by ID                                                   |
| GET    | `/v3/owners`                                       | Get owners                                                          |
| GET    | `/v3/providers/{providers_id}`                     | Get a provider by ID                                                |
| GET    | `/v3/providers`                                    | Get providers                                                       |
| GET    | `/v3/locations/{locations_id}/sensors`             | Get sensors by location ID                                          |
| GET    | `/v3/sensors/{sensors_id}`                         | Get a sensor by ID                                                  |
| GET    | `/v3/parameters/{parameters_id}/latest`            | Get latest measurements by parameters ID                            |
| GET    | `/v3/locations/{locations_id}/latest`              | Get a location's latest measurements                                |
| GET    | `/v3/locations/{locations_id}/flags`               | Get flags by location ID                                            |
| GET    | `/v3/sensors/{sensor_id}/flags`                    | Get flags by sensor ID                                              |

## Verification

The continuous-scene redesign passed `pnpm check` (170 tests), production static
export, and HyperFrames lint/runtime/layout checks. Browser verification covered
all seven moments on the exported page at desktop and phone sizes, both themes,
Arabic and Egyptian Arabic, reduced motion, and short screens. Sample cards,
removal marks and the OpenAQ branch were visually reviewed. Cadence controls,
keyboard navigation, dialog focus restoration and reverse seeking also passed.
No page errors or diagram overflow were observed in these checks. An independent
agent reviewed 320–497px mobile layouts, including Arabic and Egyptian Arabic.
The review found and verified fixes for a narrow footer hint and a wrapping
connection button. Diagram viewport height stayed identical across all seven
moments and reverse navigation in the measured profiles.

The optional animation-map helper cannot load its unbundled
`@hyperframes/producer` dependency in this environment. The working CLI
runtime/layout checks and direct browser timeline seeks provide verification.

'use client'

import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/components/auth/AuthProvider'
import { SEED_EVENTS, draftFromIssue, publishDraft } from '@/lib/board'
import { config } from '@/lib/config'
import { createEvent, createIssue, createSignup, fetchEvents, fetchIssues } from '@/lib/data'
import { formatCoord } from '@/lib/geo'
import { ISSUES, filterIssues } from '@/lib/issues'
import { explain, suggestFor } from '@/lib/suggestions'
import { useGeolocation } from '@/lib/useGeolocation'

import BoardScreen from './BoardScreen'
import DraftSheet from './DraftSheet'
import IssueSheet from './IssueSheet'
import MapCanvas from './MapCanvas'
import MapScreen from './MapScreen'
import PublishedSheet from './PublishedSheet'
import ReportScreen from './ReportScreen'
import SignupSheet from './SignupSheet'
import TabBar from './TabBar'
import styles from './app.module.css'

/**
 * The whole community app: three tabs over one shared set of records.
 *
 * State lives here because every screen reads the same two lists and the
 * flows cross between them — publishing has to mark the pin and push a board
 * row in the same tick.
 *
 * Writes are optimistic. The list updates immediately and the database call
 * follows, because a volunteer on a phone at the kerb should not watch a
 * spinner to find out whether their report counted. When there is no database
 * configured the app runs on bundled seed data and behaves identically,
 * minus the persistence.
 */
export default function RallyApp() {
  const { user, hostName, configured } = useAuth()

  const [tab, setTab] = useState('map')
  const [filter, setFilter] = useState('All')
  const [issues, setIssues] = useState(ISSUES)
  const [events, setEvents] = useState(SEED_EVENTS)
  const [live, setLive] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [draft, setDraft] = useState(null)
  const [published, setPublished] = useState(null)
  const [signupId, setSignupId] = useState(null)
  const [publishError, setPublishError] = useState('')

  const { position, error: locateError, locating, locate } = useGeolocation()

  /*
   * Seed data renders first and the database replaces it once it answers.
   * An empty issues table is treated as "not populated yet" rather than
   * "no problems in Gainesville", so the seed stays until there is something
   * real to show. data/seed.mjs fills it.
   */
  useEffect(() => {
    if (!configured) return

    let active = true

    Promise.all([fetchIssues(), fetchEvents()]).then(([rows, eventRows]) => {
      if (!active) return
      if (rows?.length) {
        setIssues(rows)
        setLive(true)
      }
      if (eventRows) setEvents(eventRows)
    })

    return () => {
      active = false
    }
  }, [configured])

  const shown = useMemo(() => filterIssues(issues, filter), [issues, filter])
  const selected = issues.find((issue) => issue.id === selectedId) || null

  const closeSheets = () => {
    setSheet(null)
    setSelectedId(null)
    setPublishError('')
  }

  const openIssue = (id) => {
    setSelectedId(id)
    setSheet('issue')
  }

  const startDraft = () => {
    setDraft({ ...draftFromIssue(selected), host: hostName || 'A neighbor' })
    setSheet('draft')
  }

  const publish = async () => {
    const optimistic = publishDraft(draft)

    setEvents((prev) => [optimistic, ...prev])
    setIssues((prev) =>
      prev.map((issue) => (issue.id === draft.issueId ? { ...issue, done: true } : issue)),
    )
    setPublished(optimistic)
    setSheet('published')

    if (!live && !user) return

    const saved = await createEvent(draft, { userId: user.id, hostName })

    if (saved?.error) {
      /* Roll the optimistic row back rather than leave a phantom event. */
      setEvents((prev) => prev.filter((event) => event.id !== optimistic.id))
      setIssues((prev) =>
        prev.map((issue) => (issue.id === draft.issueId ? { ...issue, done: false } : issue)),
      )
      setPublishError(saved.error)
      setSheet('draft')
      return
    }

    if (saved) {
      setEvents((prev) => prev.map((event) => (event.id === optimistic.id ? saved : event)))
      setPublished(saved)
    }
  }

  const joinEvent = (id) => {
    setSignupId(id)
    setSheet('signup')
  }

  const confirmSignup = async (party, details) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === signupId ? { ...event, going: event.going + party, signed: true } : event,
      ),
    )

    if (live || user) await createSignup(signupId, { ...details, party })
  }

  const addReport = async ({ type, lat, lng, detail }) => {
    const base = {
      id: `u${Date.now()}`,
      lat,
      lng,
      type,
      waterSource: type === 'Standing water' ? 'Container' : 'Not applicable',
      larvaeCount: null,
      sev: 'med',
      measuredAt: new Date().toISOString().slice(0, 10),
      loc: formatCoord(lat, lng),
      detail,
      when: 'just now',
      reports: 1,
      src: 'Resident report',
      ...suggestFor(type),
    }

    const optimistic = { ...base, why: explain(base) }

    setIssues((prev) => [...prev, optimistic])
    setFilter('All')
    setTab('map')

    if (!live) return

    const saved = await createIssue({ type, lat, lng, detail })
    if (saved) {
      setIssues((prev) => prev.map((issue) => (issue.id === optimistic.id ? saved : issue)))
    }
  }

  const signupEvent = events.find((event) => event.id === signupId) || null
  const coords = position ? formatCoord(position.lat, position.lng) : ''

  return (
    /*
     * data-tab drives the phone-width rule that mounts the map only on its
     * own tab. On desktop the map is always up, so the attribute is ignored.
     */
    <div className={styles.app} data-tab={tab}>
      <header className={styles.top}>
        <div className={styles.topRow}>
          <span className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2.5c3.6 3.9 5.6 6.9 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-2.7 2-5.7 5.6-9.6Z"
                fill="#7612fa"
              />
              <circle cx="12" cy="13" r="2.4" fill="#fff" />
            </svg>
            {config.appName}
          </span>
          <span className={styles.count}>{shown.filter((i) => !i.done).length} open</span>
        </div>
        <div className={styles.where}>
          {config.defaultCity} · {position ? 'near you' : 'city wide'}
        </div>
      </header>

      <div className={styles.map}>
        <MapCanvas issues={shown} selectedId={selectedId} onSelect={openIssue} me={position} />

        <button
          type="button"
          className={styles.locateBtn}
          onClick={locate}
          disabled={locating}
          aria-label={locating ? 'Finding your location' : 'Show my location'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.94 3a9 9 0 0 0-7.94-7.94V1h-2v2.06A9 9 0 0 0 3.06 11H1v2h2.06A9 9 0 0 0 11 20.94V23h2v-2.06A9 9 0 0 0 20.94 13H23v-2h-2.06ZM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
          </svg>
        </button>

        {(locateError || !shown.length) && (
          <div className={styles.hint}>
            {locateError || 'No reports match this filter'}
          </div>
        )}
      </div>

      <div className={styles.body}>
        {tab === 'map' && (
          <MapScreen
            issues={shown}
            events={events}
            filter={filter}
            onFilter={setFilter}
            selectedId={selectedId}
            onSelect={openIssue}
          />
        )}

        {tab === 'board' && <BoardScreen events={events} onJoin={joinEvent} />}

        {tab === 'report' && (
          <ReportScreen
            coords={coords}
            onLocate={locate}
            locating={locating}
            locateError={locateError}
            onSubmit={addReport}
          />
        )}
      </div>

      <button
        type="button"
        className={`${styles.scrim} ${sheet ? styles.scrimOn : ''}`.trim()}
        onClick={closeSheets}
        tabIndex={-1}
        aria-hidden="true"
      />

      <IssueSheet
        open={sheet === 'issue'}
        issue={selected}
        canOrganize={Boolean(user) || !configured}
        onClose={closeSheets}
        onOrganize={startDraft}
      />

      <DraftSheet
        open={sheet === 'draft'}
        draft={draft}
        error={publishError}
        onChange={setDraft}
        onClose={closeSheets}
        onPublish={publish}
      />

      <PublishedSheet
        open={sheet === 'published'}
        event={published}
        onClose={closeSheets}
        onSeeBoard={() => {
          closeSheets()
          setTab('board')
        }}
      />

      <SignupSheet
        open={sheet === 'signup'}
        event={signupEvent}
        onClose={closeSheets}
        onSubmit={confirmSignup}
      />

      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}

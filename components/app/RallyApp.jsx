'use client'

import { useMemo, useState } from 'react'

import { SEED_EVENTS, draftFromIssue, publishDraft } from '@/lib/board'
import { config } from '@/lib/config'
import { formatCoord } from '@/lib/geo'
import { ISSUES, filterIssues } from '@/lib/issues'
import { useGeolocation } from '@/lib/useGeolocation'

import BoardScreen from './BoardScreen'
import DraftSheet from './DraftSheet'
import IssueSheet from './IssueSheet'
import MapScreen from './MapScreen'
import PublishedSheet from './PublishedSheet'
import ReportScreen from './ReportScreen'
import SignupSheet from './SignupSheet'
import TabBar from './TabBar'
import styles from './app.module.css'

/**
 * The whole community app: three tabs over one shared set of records.
 *
 * State lives here rather than in a store because every screen reads the same
 * two lists and the flows all cross between them — publishing an event from
 * the map has to mark the pin and push a board row in the same tick. Nothing
 * persists; a reload is a fresh start. See `data/README.md` for what a real
 * backend would need to own.
 */
export default function RallyApp() {
  const [tab, setTab] = useState('map')
  const [filter, setFilter] = useState('All')
  const [issues, setIssues] = useState(ISSUES)
  const [events, setEvents] = useState(SEED_EVENTS)

  const [selectedId, setSelectedId] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [draft, setDraft] = useState(null)
  const [published, setPublished] = useState(null)
  const [signupIndex, setSignupIndex] = useState(null)

  const { position, error: locateError, locating, locate } = useGeolocation()

  const shown = useMemo(() => filterIssues(issues, filter), [issues, filter])
  const selected = issues.find((issue) => issue.id === selectedId) || null

  const closeSheets = () => {
    setSheet(null)
    setSelectedId(null)
  }

  const openIssue = (id) => {
    setSelectedId(id)
    setSheet('issue')
  }

  const startDraft = () => {
    setDraft(draftFromIssue(selected))
    setSheet('draft')
  }

  const publish = () => {
    const event = publishDraft(draft)

    setEvents((prev) => [event, ...prev])
    setIssues((prev) =>
      prev.map((issue) => (issue.id === draft.issueId ? { ...issue, done: true } : issue)),
    )
    setPublished(event)
    setSheet('published')
  }

  /*
   * The board renders the filtered-down-to-nothing case too, so signups key
   * off the index in the live array rather than a snapshot taken at open.
   */
  const joinEvent = (index) => {
    setSignupIndex(index)
    setSheet('signup')
  }

  const confirmSignup = (party) => {
    setEvents((prev) =>
      prev.map((event, index) =>
        index === signupIndex ? { ...event, going: event.going + party, signed: true } : event,
      ),
    )
  }

  const addReport = ({ type, lat, lng, detail }) => {
    const id = `u${Date.now()}`

    setIssues((prev) => [
      ...prev,
      {
        id,
        lat,
        lng,
        type,
        waterSource: type === 'Standing water' ? 'Container' : 'Not applicable',
        /*
         * A fresh report has not been sampled, so the count stays null and the
         * scoring rule lands it at medium — never zero, which would claim the
         * reporter looked for larvae and found none.
         */
        larvaeCount: null,
        sev: 'med',
        loc: formatCoord(lat, lng),
        detail,
        when: 'just now',
        reports: 1,
        src: 'Resident report',
        why: 'New report with no confirmation yet. One more neighbor flagging the same spot moves it up the list.',
        event: `${type} cleanup`,
        bring: 'Gloves, trash bags',
      },
    ])

    setFilter('All')
    setTab('map')
  }

  const signupEvent = signupIndex == null ? null : events[signupIndex]
  const coords = position ? formatCoord(position.lat, position.lng) : ''

  return (
    <div className={styles.app}>
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
          <span className={styles.count}>{shown.length} open</span>
        </div>
        <div className={styles.where}>
          {config.defaultCity} · {position ? 'near you' : 'city wide'}
        </div>
      </header>

      <div className={styles.body}>
        {tab === 'map' && (
          <MapScreen
            issues={shown}
            events={events}
            filter={filter}
            onFilter={setFilter}
            selectedId={selectedId}
            onSelect={openIssue}
            me={position}
            onLocate={locate}
            locating={locating}
            locateError={locateError}
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
        onClose={closeSheets}
        onOrganize={startDraft}
      />

      <DraftSheet
        open={sheet === 'draft'}
        draft={draft}
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

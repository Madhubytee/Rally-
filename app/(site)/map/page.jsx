import Link from 'next/link'

import { config } from '@/lib/config'
import { ISSUES, LAYER_COUNTS } from '@/lib/issues'

import styles from '../routes.module.css'
import ReportDirectory from './ReportDirectory'
import mapStyles from './map.module.css'

export const metadata = {
  title: 'Reports — Rally',
  description:
    'Every open report near you, filterable by type, priority and source. NASA GLOBE Observer sites and resident reports in one directory.',
}

export default function MapPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>Every open report nearby</h1>
        <p>
          {config.defaultCity} and the surrounding area. {LAYER_COUNTS.globe} standing water
          sites come from NASA GLOBE Observer and {LAYER_COUNTS.resident} are reported by
          neighbors — {ISSUES.length} open in total.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <div className={mapStyles.mapCta}>
          <div className={mapStyles.mapCtaText}>
            <h2>Looking for the map itself?</h2>
            <p>
              The live map is in the app, where you can pan it, tap a pin, file a report or
              turn one into an event. This page is the same records as a browsable list.
            </p>
          </div>
          <Link href="/app" className="btn btn-accent btn-lg">
            Open the live map
          </Link>
        </div>

        <ReportDirectory issues={ISSUES} />
      </div>
    </main>
  )
}

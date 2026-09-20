import { config } from '@/lib/config'

import styles from './layout.module.css'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.footerInner}`}>
        <span>{config.appName} · Built at CityCamp Gainesville</span>
        <span>Site data from NASA GLOBE Observer Mosquito Habitat Mapper</span>
      </div>
    </footer>
  )
}

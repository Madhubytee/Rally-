import styles from './layout.module.css'

export default function AnnouncementRibbon() {
  return (
    <div className={styles.ribbon}>
      <div className={`wrap ${styles.ribbonInner}`}>
        <span className={styles.dotLive} />
        <span>
          <b>Florida is in an active dengue outbreak.</b> 152 local cases in 2026. Standing
          water is the thing you can actually remove.
        </span>
      </div>
    </div>
  )
}

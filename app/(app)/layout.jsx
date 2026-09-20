/*
 * The app runs without the marketing nav and footer. It owns the full
 * viewport height and supplies its own header and tab bar, so any chrome
 * wrapped around it here would push the tab bar off the bottom of a phone.
 */
export default function AppLayout({ children }) {
  return children
}

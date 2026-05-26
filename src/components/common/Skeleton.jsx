// src/components/common/Skeleton.jsx
// Re-export react-loading-skeleton with app-wide theme baked in.
// Usage: import Skeleton from '../../components/common/Skeleton'
//        Then use exactly like react-loading-skeleton's <Skeleton /> component.
import Sk, { SkeletonTheme } from 'react-loading-skeleton'

// App-level themed wrapper — wrap your page-level skeleton layout in this once.
export function SkeletonPage({ children }) {
  return (
    <SkeletonTheme
      baseColor="#ede9e3"
      highlightColor="#f7f4f0"
      borderRadius="12px"
      duration={1.5}
    >
      {children}
    </SkeletonTheme>
  )
}

// Default export is the raw Skeleton — same API as react-loading-skeleton.
// The SkeletonTheme values above are applied globally via main.jsx's SkeletonThemeProvider.
export default Sk

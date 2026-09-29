## 2024-03-29 - [React Layout Component Optimizations]
**Learning:** Found multiple layout elements (e.g. `BottomNav`, `Sidebar`, `DashboardProgressOverview`) defining static objects and arrays within component boundaries, which are then passed to children or mapped over. Since `AppShell` triggers updates frequently (e.g., from toasts or navigation), it caused heavy and unnecessary re-allocations on render.
**Action:** Lift static structures outside of React components and aggressively utilize `useMemo` or `React.memo` for layout-heavy dependencies to break render-chain re-calculations.

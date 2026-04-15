/**
 * Lightweight pub/sub for refreshing dashboard slices after Socket.IO notifications.
 * Uses a single microtask flush so multiple scopes from one event batch once.
 */

export type DashboardRefreshScope =
  | 'adminDashboardStats'
  | 'adminPendingRequests'
  | 'leaveRequestsPage'
  | 'employeeDashboard'
  | 'employeeLeavesPage'
  | 'employeePayslips'
  | 'payrollSummary';

type Listener = () => void;

const listeners = new Map<DashboardRefreshScope, Set<Listener>>();
let pendingScopes = new Set<DashboardRefreshScope>();
let flushScheduled = false;

function flush() {
  flushScheduled = false;
  const scopes = [...pendingScopes];
  pendingScopes = new Set();

  for (const scope of scopes) {
    const set = listeners.get(scope);
    if (!set) continue;
    for (const fn of [...set]) {
      try {
        fn();
      } catch (e) {
        console.error('[dashboardRealtime]', scope, e);
      }
    }
  }
}

/** Queue refresh handlers; dedupes repeated scopes before the next microtask. */
export function requestDashboardRefresh(scopes: DashboardRefreshScope[]) {
  if (!scopes.length) return;
  for (const s of scopes) pendingScopes.add(s);
  if (flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(flush);
}

export function subscribeDashboardRefresh(
  scope: DashboardRefreshScope,
  listener: Listener,
): () => void {
  let set = listeners.get(scope);
  if (!set) {
    set = new Set();
    listeners.set(scope, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set && set.size === 0) listeners.delete(scope);
  };
}

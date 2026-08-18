import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAccessToken } from '@/api';

/**
 * Centralized hook to manage organization-context transitions.
 * - Cancels in-flight queries from the previous organization.
 * - Updates the access token (triggering realtime socket reconnection).
 * - Purges cached query data so previous organization data is never rendered stale.
 * - Refetches all active queries using the new organization token context.
 */
export function useOrganizationTransition() {
  const queryClient = useQueryClient();

  return useCallback(
    async (newToken: string) => {
      // 1. Cancel in-flight queries so old responses don't resolve and pollute state
      await queryClient.cancelQueries();

      // 2. Set new access token (triggers 'auth:token-changed' for WebSocket reconnect)
      setAccessToken(newToken);

      // 3. Remove cached server queries to ensure old org data cannot remain visible
      queryClient.resetQueries();

      // 4. Refetch active queries using the new token context
      await queryClient.refetchQueries({ type: 'active' });
    },
    [queryClient],
  );
}

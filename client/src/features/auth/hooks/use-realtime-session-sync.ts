import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/api';
import { getSessionContext, reconcileSession } from '@/api/services/auth.api';
import { PRIVATE_ROUTES } from '@/router/constants/routes';
import type { IOrganization } from '@/features/organization/types';
import { ORGANIZATION_QUERY_KEYS } from '@/features/organization/constants/organization.constants';

function tokenOrganizationId(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { organizationId?: string | null };
    return payload.organizationId ?? null;
  } catch {
    return null;
  }
}

export function useRealtimeSessionSync() {
  const queryClient = useQueryClient();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [accessChanged, setAccessChanged] = useState(false);
  const [tokenVersion, setTokenVersion] = useState(0);
  const reconcilingRef = useRef(false);
  const originalOrganizationRef = useRef<string | null>(tokenOrganizationId(getAccessToken()));

  const reconcile = useCallback(async () => {
    if (reconcilingRef.current || !originalOrganizationRef.current) return;
    reconcilingRef.current = true;
    try {
      const result = await reconcileSession();
      queryClient.setQueryData(ORGANIZATION_QUERY_KEYS.all, result.organizations);
      clearAccessToken();
      setAccessToken(result.accessToken);
      setTokenVersion((version) => version + 1);
      queryClient.clear();
      originalOrganizationRef.current = null;

      if (result.removedFromActiveOrganization) {
        if (result.organizations.length > 0) {
          setOrganizations(result.organizations);
          setAccessChanged(true);
          toast.info('Your workspace access changed. Choose another workspace to continue.');
        } else {
          toast.info('You no longer belong to a workspace. Create one to continue.');
          window.location.replace(PRIVATE_ROUTES.CREATE_ORGANIZATION);
        }
      } else {
        queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      }
    } catch {
      // The normal Axios refresh interceptor handles an expired session.
    } finally {
      reconcilingRef.current = false;
    }
  }, [queryClient]);

  useEffect(() => {
    const handleTokenChange = () => setTokenVersion((v) => v + 1);
    window.addEventListener('auth:token-changed', handleTokenChange);
    return () => window.removeEventListener('auth:token-changed', handleTokenChange);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return undefined;
    const socketUrl = import.meta.env.VITE_API_URL ?? window.location.origin;
    const socket: Socket = io(`${socketUrl}/realtime`, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('organization.changed', () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.current });
    });

    socket.on('invitations.changed', () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    });

    socket.on('membership.changed', (payload?: { organizationId?: string; reason?: string }) => {
      const activeOrgId = tokenOrganizationId(getAccessToken());
      const affectedOrgId = payload?.organizationId;

      if (affectedOrgId && activeOrgId && affectedOrgId !== activeOrgId) {
        // Non-active org removal: update org switcher list silently without triggering access dialog
        queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      } else {
        // Active org removal/change: reconcile session and handle dialog or redirect
        void reconcile();
      }
    });

    return () => { socket.disconnect(); };
  }, [queryClient, reconcile, tokenVersion]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (!originalOrganizationRef.current || reconcilingRef.current) return;
      try {
        const context = await getSessionContext();
        if (Array.isArray(context.organizations)) {
          queryClient.setQueryData(ORGANIZATION_QUERY_KEYS.all, context.organizations);
        }
        if (!context.hasOrganization || !context.contextMatches) {
          void reconcile();
        }
      } catch {
        // Retry on the next four-second tick.
      }
    }, 4_000);
    return () => window.clearInterval(timer);
  }, [queryClient, reconcile]);

  return { accessChanged, organizations, closeAccessDialog: () => setAccessChanged(false) };
}

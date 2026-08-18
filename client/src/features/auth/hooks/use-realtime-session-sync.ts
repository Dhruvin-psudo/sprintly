import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/api';
import { getSessionContext, reconcileSession } from '@/api/services/auth.api';
import { PRIVATE_ROUTES } from '@/router/constants/routes';
import type { IOrganization } from '@/features/organization/types';

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
    });
    socket.on('invitations.changed', () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    });
    socket.on('membership.changed', () => {
      void reconcile();
    });

    return () => { socket.disconnect(); };
  }, [queryClient, reconcile, tokenVersion]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (!originalOrganizationRef.current || reconcilingRef.current) return;
      try {
        const context = await getSessionContext();
        if (!context.hasOrganization || !context.contextMatches) void reconcile();
      } catch {
        // Retry on the next four-second tick.
      }
    }, 4_000);
    return () => window.clearInterval(timer);
  }, [reconcile]);

  return { accessChanged, organizations, closeAccessDialog: () => setAccessChanged(false) };
}

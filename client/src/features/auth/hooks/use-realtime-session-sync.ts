import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/api';
import { getSessionContext, reconcileSession } from '@/api/services/auth.api';
import { PRIVATE_ROUTES } from '@/router/constants/routes';
import type { IOrganization } from '@/features/organization/types';
import { ORGANIZATION_QUERY_KEYS } from '@/features/organization/constants/organization.constants';

const ORGANIZATION_TABLE_QUERY_KEYS = [
  ['invitations'],
  ['workspace-members'],
] as const;

type OrganizationChangeSubject = 'members' | 'invitations' | 'members-and-invitations';

function tableQueryKeysForSubject(subject: OrganizationChangeSubject) {
  if (subject === 'members') return [['workspace-members']] as const;
  if (subject === 'invitations') return [['invitations']] as const;
  return ORGANIZATION_TABLE_QUERY_KEYS;
}

function tokenOrganizationId(token: string | null): string | null {
  if (!token) return null;
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;
    const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(base64Payload.length + ((4 - (base64Payload.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(paddedPayload)) as { organizationId?: string | null };
    return payload.organizationId ?? null;
  } catch {
    return null;
  }
}

function activeOrganizationId(queryClient: ReturnType<typeof useQueryClient>): string | null {
  return tokenOrganizationId(getAccessToken())
    ?? queryClient.getQueryData<IOrganization>(ORGANIZATION_QUERY_KEYS.current)?.id
    ?? null;
}

export function useRealtimeSessionSync() {
  const queryClient = useQueryClient();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [accessChanged, setAccessChanged] = useState(false);
  const [tokenVersion, setTokenVersion] = useState(0);
  const reconcilingRef = useRef(false);
  const originalOrganizationRef = useRef<string | null>(tokenOrganizationId(getAccessToken()));

  const refreshOrganizationTables = useCallback(async (
    subject: OrganizationChangeSubject = 'members-and-invitations',
  ) => {
    const queryKeys = tableQueryKeysForSubject(subject);
    await Promise.all(
      queryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey, refetchType: 'none' }),
      ),
    );
    await Promise.all(
      queryKeys.map((queryKey) =>
        queryClient.refetchQueries({ queryKey, type: 'active' }),
      ),
    );
  }, [queryClient]);

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

    socket.on('connect', () => {
      void refreshOrganizationTables();
    });

    socket.on('organization.changed', (payload?: {
      organizationId?: string;
      subject?: OrganizationChangeSubject;
    }) => {
      const currentOrganizationId = activeOrganizationId(queryClient);
      if (payload?.organizationId && currentOrganizationId && payload.organizationId !== currentOrganizationId) return;
      void refreshOrganizationTables(payload?.subject ?? 'members-and-invitations');
    });

    socket.on('invitations.changed', () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    });

    socket.on('membership.changed', (payload?: { organizationId?: string; reason?: string }) => {
      const activeOrgId = activeOrganizationId(queryClient);
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
  }, [queryClient, reconcile, refreshOrganizationTables, tokenVersion]);

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

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface PendingInvitationsModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setIsOpen: (open: boolean) => void;
}

const PendingInvitationsModalContext = createContext<PendingInvitationsModalContextType | undefined>(undefined);

export function PendingInvitationsModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal, setIsOpen }),
    [isOpen, openModal, closeModal]
  );

  return (
    <PendingInvitationsModalContext.Provider value={value}>
      {children}
    </PendingInvitationsModalContext.Provider>
  );
}

export function usePendingInvitationsModal() {
  const context = useContext(PendingInvitationsModalContext);
  if (!context) {
    throw new Error('usePendingInvitationsModal must be used within a PendingInvitationsModalProvider');
  }
  return context;
}

import React, { createContext, useContext, useState } from 'react';

interface PendingInvitationsModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setIsOpen: (open: boolean) => void;
}

const PendingInvitationsModalContext = createContext<PendingInvitationsModalContextType | undefined>(undefined);

export function PendingInvitationsModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <PendingInvitationsModalContext.Provider value={{ isOpen, openModal, closeModal, setIsOpen }}>
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

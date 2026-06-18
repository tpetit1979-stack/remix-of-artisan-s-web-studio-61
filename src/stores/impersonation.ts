import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ImpersonationState {
  tenantId: string | null;
  tenantName: string | null;
  startImpersonation: (tenantId: string, tenantName: string) => void;
  stopImpersonation: () => void;
}

export const useImpersonation = create<ImpersonationState>()(
  persist(
    (set) => ({
      tenantId: null,
      tenantName: null,
      startImpersonation: (tenantId, tenantName) => set({ tenantId, tenantName }),
      stopImpersonation: () => set({ tenantId: null, tenantName: null }),
    }),
    { name: "sa-impersonation" }
  )
);

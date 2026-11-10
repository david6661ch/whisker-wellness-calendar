import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const AccountContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export const useAccount = () => useContext(AccountContext);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });
  const router = useRouter(); const queryClient = useQueryClient();
  useEffect(() => {
    let live = true;
    supabase.auth.getUser().then(({ data }) => { if (live) setAccount({ user: data.user, ready: true }); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setAccount({ user: session?.user ?? null, ready: true });
      if (event === "SIGNED_OUT") queryClient.clear();
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => { live = false; data.subscription.unsubscribe(); };
  }, [router, queryClient]);
  return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}
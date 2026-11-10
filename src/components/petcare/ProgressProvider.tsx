import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "./AccountProvider";
import { getProgress } from "@/lib/progress.functions";
import type { CareEvent } from "@/lib/progress-rules";
const ProgressContext=createContext<{ events:CareEvent[]; loading:boolean; error:boolean; refresh:()=>Promise<unknown> }>({ events:[],loading:false,error:false,refresh:async()=>undefined });
export const useProgress=()=>useContext(ProgressContext);
export function ProgressProvider({children}:{children:ReactNode}) {
  const {user,ready}=useAccount(); const load=useServerFn(getProgress);
  const query=useQuery({queryKey:["progress",user?.id],queryFn:()=>load(),enabled:ready && !!user,retry:1});
  return <ProgressContext.Provider value={{events:query.data??[],loading:!!user && query.isPending,error:query.isError,refresh:query.refetch}}>{children}</ProgressContext.Provider>;
}
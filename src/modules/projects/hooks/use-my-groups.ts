import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getMyGroups } from "../api";

export function useMyGroups() {
  return useQuery({
    queryKey: [...queryKeys.groups.all, "student", "me"],
    queryFn: () => getMyGroups(),
  });
}

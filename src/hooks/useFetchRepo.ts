// import { useQuery } from "@tanstack/react-query";
// import { fetchRepo } from "../utils/fetchRepo";

// export const useFetchRepo = (repo: string) => {
//   return useQuery({
//     queryKey: ["repo", repo],
//     queryFn: () => fetchRepo(repo),
//     enabled: !!repo,
//   });
// };

// Below code is modified version of previous code to enable write fetched data to file
import { useQuery } from "@tanstack/react-query";
import { fetchRepo } from "../utils/fetchRepo";
import axios from "axios";

export const useFetchRepo = (repo: string) => {
  return useQuery({
    queryKey: ["repo", repo],
    queryFn: async () => {
      const data = await fetchRepo(repo);

      // Send data to the API to save it
      await axios.post("/api/saveRepo", data);

      return data;
    },
    enabled: !!repo,
  });
};

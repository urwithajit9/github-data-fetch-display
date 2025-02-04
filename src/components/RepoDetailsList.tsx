"use client";

import { useRepoStore } from "../store/useRepoStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchRepoDetails = async (repoName: string) => {
  const { data } = await axios.get(`https://api.github.com/repos/${repoName}`);
  return data;
};

export default function RepoDetails() {
  const { repos } = useRepoStore(); // Get all stored repos

  return (
    <div className="mt-4">
      {repos.length === 0 ? (
        <p>No repositories fetched yet.</p>
      ) : (
        repos.map((repoName, index) => (
          <RepoItem key={index} repoName={repoName} />
        ))
      )}
    </div>
  );
}

function RepoItem({ repoName }: { repoName: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["repo", repoName],
    queryFn: () => fetchRepoDetails(repoName),
  });

  if (isLoading) return <p>Loading {repoName}...</p>;
  if (error) return <p>Error fetching {repoName}</p>;

  return (
    <div className="border p-4 rounded-lg my-2">
      <h3 className="text-lg font-bold">{data.full_name}</h3>
      <p>
        ⭐ {data.stargazers_count} | 🍴 {data.forks_count}
      </p>
    </div>
  );
}

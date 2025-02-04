"use client";

import { useState, useEffect } from "react";
import { useFetchRepo } from "../hooks/useFetchRepo";
import axios from "axios";

interface Repo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

export default function RepoDetails({ repoName }: { repoName: string }) {
  const { data: newRepo, isLoading, error } = useFetchRepo(repoName);
  const [repos, setRepos] = useState<Repo[]>([]);

  // Function to load existing data from repoData.json
  const loadExistingRepos = async () => {
    try {
      const res = await axios.get("/repoData.json");
      setRepos(res.data.reverse()); // Reverse to show latest first
    } catch (err) {
      console.error("Error loading existing repo data:", err);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadExistingRepos();
  }, []);

  // Append newly fetched repo to the top when available
  useEffect(() => {
    if (newRepo) {
      setRepos((prevRepos) => [newRepo, ...prevRepos]);
    }
  }, [newRepo]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">GitHub Repositories</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error fetching repository.</p>}

      <ul className="mt-4 space-y-4">
        {repos.map((repo, index) => (
          <li key={index} className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold">
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                {repo.name}
              </a>
            </h3>
            <p>{repo.description}</p>
            <p>
              ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import { useRepoStore } from "../store/useRepoStore";
import { useFetchRepo } from "../hooks/useFetchRepo";
import { Card } from "@chakra-ui/react";

export default function RepoDetails() {
  const { repo } = useRepoStore();
  const { data, isLoading, error } = useFetchRepo(repo);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error fetching repo.</p>;
  if (!data) return null;

  return (
    <Card.Root className="mt-4 p-4">
      <Card.Header>{data.full_name}</Card.Header>
      <Card.Body>
        <p>⭐ Stars: {data.stargazers_count}</p>
        <p>🍴 Forks: {data.forks_count}</p>
        <p>📖 Description: {data.description}</p>
      </Card.Body>
    </Card.Root>
  );
}

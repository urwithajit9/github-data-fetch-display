import RepoDetails from "@/components/RepoDetails";
import RepoDetailsAdd from "@/components/RepoDetailsAdd";
import RepoDetailsList from "@/components/RepoDetailsList";
import RepoForm from "@/components/RepoForm";
import { Container } from "@chakra-ui/react";

export default function Home() {
  return (
    <div>
      <p>Home page</p>
      <Container className="p-8">
        <h1 className="text-2xl font-bold">GitHub Repo Fetcher</h1>
        <RepoForm />
        {/* <RepoDetails /> */}
        <RepoDetailsList />
        <RepoDetailsAdd />
      </Container>
    </div>
  );
}

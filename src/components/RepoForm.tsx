"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRepoStore } from "../store/useRepoStore";
import { Input, Button } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";

const schema = z.object({
  repo: z.string().min(3, "Repository name must be at least 3 characters long"),
});

export default function RepoForm() {
  const { toggleColorMode, colorMode } = useColorMode();
  const { addRepo } = useRepoStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ repo: string }>({ resolver: zodResolver(schema) });

  const onSubmit = (data: { repo: string }) => addRepo(data.repo);

  return (
    <div className="flex flex-col gap-2">
      {/* <Button variant="outline" onClick={toggleColorMode}>
        Toggle Mode
      </Button> */}
      <ClientOnly fallback={<Skeleton boxSize="8" />}>
        <IconButton onClick={toggleColorMode} variant="outline" size="sm">
          {colorMode === "light" ? <LuSun /> : <LuMoon />}
        </IconButton>
      </ClientOnly>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input placeholder="owner/repo-name" {...register("repo")} />
        {errors.repo && <p className="text-red-500">{errors.repo.message}</p>}
        <Button type="submit" colorScheme="blue">
          Fetch Repo
        </Button>
      </form>
    </div>
  );
}

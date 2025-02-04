import { Heading } from "@chakra-ui/react";
import fs from "node:fs";

export default async function Page() {
  const content = fs.readFileSync("public/docs/chatGPTResponse.md", "utf-8");
  return <Heading as="h1">{content}</Heading>;
}

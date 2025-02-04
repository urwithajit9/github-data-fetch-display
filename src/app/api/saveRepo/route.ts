import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "public", "repoData.json");

// Function to read existing data
async function readRepoData() {
  try {
    const data = await readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file does not exist
  }
}

// API Route to Save Repo Data
export async function POST(req: Request) {
  try {
    const newRepoData = await req.json();
    const existingData = await readRepoData();

    // Add the new data
    existingData.push(newRepoData);

    // Write updated data to file
    await writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ message: "Data saved successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

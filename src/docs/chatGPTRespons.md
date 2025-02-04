Here's how you can build a Next.js application to fetch and display GitHub repository details using the mentioned technologies:

---

## **Project Setup**

1. **Initialize Next.js Project**

   ```sh
   npx create-next-app@latest github-repo-fetcher
   cd github-repo-fetcher
   ```

2. **Install Dependencies**

   ```sh
   npm install axios @tanstack/react-query zustand zod @hookform/resolvers react-hook-form tailwindcss postcss autoprefixer @chakra-ui/react @emotion/react @emotion/styled framer-motion
   ```

3. **Setup TailwindCSS**
   ```sh
   npx tailwindcss init -p
   ```
   Configure `tailwind.config.js`:
   ```js
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: ["./src/**/*.{js,ts,jsx,tsx}"],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```
   Add Tailwind directives to `styles/globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

## **State Management (Zustand)**

Create a Zustand store in `src/store/useRepoStore.ts`:

```ts
import { create } from "zustand";

interface RepoState {
  repo: string;
  setRepo: (repo: string) => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repo: "",
  setRepo: (repo) => set({ repo }),
}));
```

---

## **Data Fetching with TanStack Query**

Create a function to fetch GitHub repo details in `src/utils/fetchRepo.ts`:

```ts
import axios from "axios";

export const fetchRepo = async (repo: string) => {
  const response = await axios.get(`https://api.github.com/repos/${repo}`);
  return response.data;
};
```

Create a hook for fetching data in `src/hooks/useFetchRepo.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { fetchRepo } from "../utils/fetchRepo";

export const useFetchRepo = (repo: string) => {
  return useQuery({
    queryKey: ["repo", repo],
    queryFn: () => fetchRepo(repo),
    enabled: !!repo,
  });
};
```

---

## **Form Validation with React Hook Form & Zod**

Create a form component in `src/components/RepoForm.tsx`:

```tsx
"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRepoStore } from "../store/useRepoStore";
import { Input, Button } from "@chakra-ui/react";

const schema = z.object({
  repo: z.string().min(3, "Repository name must be at least 3 characters long"),
});

export default function RepoForm() {
  const { setRepo } = useRepoStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ repo: string }>({ resolver: zodResolver(schema) });

  const onSubmit = (data: { repo: string }) => setRepo(data.repo);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Input placeholder="owner/repo-name" {...register("repo")} />
      {errors.repo && <p className="text-red-500">{errors.repo.message}</p>}
      <Button type="submit" colorScheme="blue">
        Fetch Repo
      </Button>
    </form>
  );
}
```

---

## **Displaying Repository Details**

Create `src/components/RepoDetails.tsx`:

```tsx
"use client";
import { useRepoStore } from "../store/useRepoStore";
import { useFetchRepo } from "../hooks/useFetchRepo";
import { Card, CardBody, CardHeader } from "@chakra-ui/react";

export default function RepoDetails() {
  const { repo } = useRepoStore();
  const { data, isLoading, error } = useFetchRepo(repo);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error fetching repo.</p>;
  if (!data) return null;

  return (
    <Card className="mt-4 p-4">
      <CardHeader>{data.full_name}</CardHeader>
      <CardBody>
        <p>⭐ Stars: {data.stargazers_count}</p>
        <p>🍴 Forks: {data.forks_count}</p>
        <p>📖 Description: {data.description}</p>
      </CardBody>
    </Card>
  );
}
```

---

## **Integrating Components in Pages**

Edit `src/app/page.tsx`:

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, Container } from "@chakra-ui/react";
import RepoForm from "../components/RepoForm";
import RepoDetails from "../components/RepoDetails";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Container className="p-8">
          <h1 className="text-2xl font-bold">GitHub Repo Fetcher</h1>
          <RepoForm />
          <RepoDetails />
        </Container>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
```

---

## **Run the Application**

Start the development server:

```sh
npm run dev
```

---

### **How the Application Works**

1. The user enters a GitHub repository name (e.g., `facebook/react`) in the form.
2. `RepoForm.tsx` validates the input using **Zod** and updates the Zustand store.
3. The **useFetchRepo** hook uses **TanStack Query** to fetch data from GitHub.
4. `RepoDetails.tsx` displays repo information like stars, forks, and description.
5. **TailwindCSS** and **Chakra UI** style the UI.
6. The app is **fully reactive**—state updates trigger data re-fetching.

---

This architecture follows the **Data Access Layer (DAL) principle** by separating concerns:

- **State Management (Zustand)**
- **Data Fetching (TanStack Query)**
- **Validation (Zod)**
- **UI (TailwindCSS & Chakra UI)**

Would you like any modifications or improvements? 🚀

To modify the previous code so that each fetched repository's data is written to a file, we need to:

1. Store the fetched repository data in a JSON file.
2. Implement this on the **server-side** (API route) because **Next.js runs in a browser environment by default**, and browsers can't write directly to files.
3. Use **Node.js' `fs` module** to handle file operations.

---

### **Step 1: Create an API Route to Save Repo Data**

Create a file `src/app/api/saveRepo/route.ts` for handling repo data storage.

```ts
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
```

---

### **Step 2: Modify `useFetchRepo` Hook to Save Data**

We modify `useFetchRepo.ts` to send fetched data to our API.

```ts
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
```

---

### **Step 3: Ensure Public Folder Exists**

- Ensure that the **`public`** folder exists in your project.
- The `repoData.json` file will be stored in `public/repoData.json`.

---

### **How it Works**

1. When a user enters a repository name in the form, it fetches the data from GitHub.
2. The data is **sent to the API (`/api/saveRepo`)**, which:
   - Reads existing `repoData.json`
   - Appends the new repo data
   - Writes the updated JSON back to the file
3. The updated file `repoData.json` is stored in `public/`.

---

### **Testing**

1. Start your Next.js app:
   ```sh
   npm run dev
   ```
2. Search for different repositories.
3. Check the `public/repoData.json` file; it should contain all fetched repositories.

Would you like additional features like **limiting duplicates** or **timestamping each entry**? 🚀

To modify the `<RepoDetails />` component so that it **loads data from `repoData.json`** and **appends newly fetched data to the top of the display**, follow these steps:

---

### **Steps to Modify `<RepoDetails />`**

1. **Load existing data from `repoData.json`** (using `useEffect`).
2. **Append newly fetched data to the top**.
3. **Update state properly to reflect changes**.

---

### **Updated `<RepoDetails />` Component**

```tsx
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
```

---

### **How It Works**

1. **Loads existing data from `repoData.json`** using `axios.get("/repoData.json")`.
2. **Stores it in state (`repos`) and reverses it** to show the latest first.
3. **Watches for new repo fetches (`newRepo`) and prepends them** to the list.
4. **Displays all repositories**, including previously stored ones.

---

### **Next Steps**

- Ensure `repoData.json` is in the `public/` folder.
- Start the Next.js app and enter different repositories.
- Check if new data is appended **at the top** after each fetch.

Would you like to add timestamps or other metadata? 🚀

To use the `<RepoDetails />` component in `page.tsx`, follow these steps:

---

### **Steps to Integrate `<RepoDetails />` in `page.tsx`**

1. **Create a form to input the GitHub repository name.**
2. **Pass the entered repo name to `<RepoDetails />`.**
3. **Ensure the component updates dynamically on form submission.**

---

### **Updated `page.tsx`**

```tsx
"use client";

import { useState } from "react";
import RepoDetails from "../components/RepoDetails";

export default function Home() {
  const [repoName, setRepoName] = useState<string>("");
  const [submittedRepo, setSubmittedRepo] = useState<string>("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoName.trim()) {
      setSubmittedRepo(repoName);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">GitHub Repo Fetcher</h1>

      {/* Form to Input GitHub Repo Name */}
      <form onSubmit={handleSubmit} className="flex space-x-2 mb-6">
        <input
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="Enter GitHub repo (e.g. facebook/react)"
          className="border p-2 rounded-lg"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Fetch Repo
        </button>
      </form>

      {/* Display RepoDetails only when a repo is submitted */}
      {submittedRepo && <RepoDetails repoName={submittedRepo} />}
    </div>
  );
}
```

---

### **How It Works**

1. **User enters a GitHub repository name** (e.g., `facebook/react`).
2. **On submit, `submittedRepo` updates**, which is passed to `<RepoDetails />`.
3. **`RepoDetails` fetches and displays the repo data**, including previously stored repos.
4. **Each new submission updates the list** with the latest repo on top.

---

### **Next Steps**

- **Run the Next.js app** and test by entering repo names.
- **Verify the list updates dynamically** with the latest repo on top.

Would you like to add **loading states or error messages**? 🚀

Got it! Since you already have a separate `RepoForm` component for handling the form input, we will update it to **pass the submitted repo name to `page.tsx`**.

---

### **Steps to Update**

1. **Modify `RepoForm` to accept a callback (`onSubmitRepo`)** for passing the entered repo name to `page.tsx`.
2. **Ensure `page.tsx` receives and passes this repo name to `RepoDetails`**.

---

### **Updated `RepoForm.tsx`**

```tsx
"use client";

import { useState } from "react";

interface RepoFormProps {
  onSubmitRepo: (repoName: string) => void;
}

export default function RepoForm({ onSubmitRepo }: RepoFormProps) {
  const [repoName, setRepoName] = useState<string>("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoName.trim()) {
      onSubmitRepo(repoName);
      setRepoName(""); // Clear input after submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-6">
      <input
        type="text"
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
        placeholder="Enter GitHub repo (e.g. facebook/react)"
        className="border p-2 rounded-lg"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Fetch Repo
      </button>
    </form>
  );
}
```

---

### **Updated `page.tsx`**

```tsx
"use client";

import { useState } from "react";
import RepoForm from "../components/RepoForm";
import RepoDetails from "../components/RepoDetails";

export default function Home() {
  const [submittedRepo, setSubmittedRepo] = useState<string>("");

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">GitHub Repo Fetcher</h1>

      {/* RepoForm Component for Input */}
      <RepoForm onSubmitRepo={setSubmittedRepo} />

      {/* Display RepoDetails only when a repo is submitted */}
      {submittedRepo && <RepoDetails repoName={submittedRepo} />}
    </div>
  );
}
```

---

### **How It Works**

1. **User enters a GitHub repository name** in `RepoForm`.
2. **On submit, `onSubmitRepo` is called**, updating `submittedRepo` in `page.tsx`.
3. **`RepoDetails` receives `submittedRepo` and fetches/display data**.
4. **Previously fetched data remains on screen** while the new repo is added to the top.

---

### **Next Steps**

✅ Test by entering multiple repositories.
✅ Ensure old data persists and new data appears at the top.
✅ Improve UI with **loading indicators & error messages** if needed.

Would you like me to add **persistent storage (saving JSON to file) as well?** 🚀

#### Mulitple Repos fetch and append to the list

Your `RepoForm` component is well-structured, but based on your previous request, you need to **modify it to append newly fetched data at the top of the displayed list** and persist the data to a JSON file.

---

## **Next Steps**

### **Modifications Needed:**

1. **Load stored repo data from a JSON file** when the app starts.
2. **Append new repo data to the JSON file** when a new repo is fetched.
3. **Update the UI to display the most recent fetches at the top**.

---

### **1️⃣ Modify `RepoForm.tsx` to Append New Data**

We'll **update Zustand store (`useRepoStore`)** to keep a list of repos instead of just one.

#### **Updated `RepoForm.tsx`**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRepoStore } from "../store/useRepoStore";
import { Input, Button } from "@chakra-ui/react";

const schema = z.object({
  repo: z.string().min(3, "Repository name must be at least 3 characters long"),
});

export default function RepoForm() {
  const { addRepo } = useRepoStore(); // Use `addRepo` instead of `setRepo`
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ repo: string }>({ resolver: zodResolver(schema) });

  const onSubmit = (data: { repo: string }) => addRepo(data.repo); // Append new repo

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Input placeholder="owner/repo-name" {...register("repo")} />
      {errors.repo && <p className="text-red-500">{errors.repo.message}</p>}
      <Button type="submit" colorScheme="blue">
        Fetch Repo
      </Button>
    </form>
  );
}
```

---

### **2️⃣ Modify `useRepoStore.ts` to Store a List**

Now, update `useRepoStore.ts` to store **multiple repos instead of just one**.

#### **Updated `useRepoStore.ts`**

```tsx
import { create } from "zustand";

interface RepoState {
  repos: string[];
  addRepo: (repo: string) => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repos: [],
  addRepo: (repo) =>
    set((state) => ({
      repos: [repo, ...state.repos], // Append new repo at the top
    })),
}));
```

---

### **3️⃣ Modify `RepoDetails.tsx` to Display All Stored Repos**

Since `useRepoStore` now holds a list of repos, we need to **map over them and display each one**.

#### **Updated `RepoDetails.tsx`**

```tsx
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
```

---

### **4️⃣ Modify `page.tsx` to Integrate Everything**

Finally, update `page.tsx` to include `RepoForm` and `RepoDetails`.

#### **Updated `page.tsx`**

```tsx
"use client";

import RepoForm from "../components/RepoForm";
import RepoDetails from "../components/RepoDetails";

export default function Home() {
  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">GitHub Repo Fetcher</h1>
      <RepoForm /> {/* Form to fetch repos */}
      <RepoDetails /> {/* Display fetched repos */}
    </div>
  );
}
```

---

### **How It Works Now**

1. **User enters a repo name** in `RepoForm.tsx`.
2. **Repo name is stored in `useRepoStore.ts`** (new repos go to the top).
3. **`RepoDetails.tsx` maps over stored repos and fetches their details**.
4. **Fetched repos persist in state** (Zustand handles state management).

---

### **Next Steps**

✅ **Persist data to a JSON file** so repos don’t disappear on refresh.
✅ **Show a "Clear History" button** to reset stored repos if needed.
✅ **Improve error handling** for better UI feedback.

Would you like me to **add JSON file persistence** next? 🚀

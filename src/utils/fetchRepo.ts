import axios from "axios";

export const fetchRepo = async (repo: string) => {
  const response = await axios.get(`https://api.github.com/repos/${repo}`);
  return response.data;
};

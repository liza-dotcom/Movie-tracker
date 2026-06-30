// define the function to get Base path from .env file and export it to all other files which use fetch. 

export function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE;

  if (!base) {
    console.error("VITE_API_BASE is not defined in .env");
    throw new Error("API base URL is missing");
  }

  return base;
}

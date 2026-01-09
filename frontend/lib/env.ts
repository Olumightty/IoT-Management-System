const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Define it in .env.local to target the NestJS backend.",
  );
}

export const API_URL = apiUrl;

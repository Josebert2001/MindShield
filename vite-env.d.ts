// Updated to remove dependency on vite/client which was missing
// and provide type definition for process.env.API_KEY
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

declare module '../config' {
  const BASE_URL: string;
  export default BASE_URL;
}

declare module '../../config' {
  const BASE_URL: string;
  export default BASE_URL;
}

declare module '*.js';

export {};

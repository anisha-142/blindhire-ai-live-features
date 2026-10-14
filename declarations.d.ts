// declarations.d.ts
// Shorthand ambient module declarations for CDN-loaded libraries

declare module 'react' {
  const React: any;
  export default React;
  export = React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom';
declare module 'lucide-react';
declare module 'recharts';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

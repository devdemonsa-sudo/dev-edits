import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "android/**",
      "tools/**",
      "src/components/local-demo-app.tsx",
      "src/components/pwa-register.tsx",
      "src/components/public-demo-showcase.tsx"
    ]
  },
  ...nextCoreWebVitals
];

export default config;

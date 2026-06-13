import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/spec_content.txt"
    ]
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off"
    }
  }
];

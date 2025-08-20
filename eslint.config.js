import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Ignorer le répertoire de build
  { ignores: ["dist"] },

  // Bloc pour le code front (React)
  {
    files: ["frontend/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Bloc pour le code Node
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // Active l’environnement Node
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    // Pas besoin des plugins React ici
    rules: {
      ...js.configs.recommended.rules,
      // Ajoutez des règles spécifiques Node si besoin
    },
  },
];

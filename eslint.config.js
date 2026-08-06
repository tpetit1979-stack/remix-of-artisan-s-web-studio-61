import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Lot 1 sécurité — garde-fou : ces fichiers ne servent que le site
    // public (anon), jamais l'Admin/Super Admin. Ils doivent lire les
    // tenants/services/zones/réglages via les vues public_* (colonnes et
    // lignes déjà restreintes), jamais les tables de base directement.
    // admin.*.tsx, super-admin.*.tsx, et le reste de src/lib/tenant.ts
    // (qui garde des accès table de base légitimes pour l'Admin partagé)
    // ne sont volontairement pas couverts par ce fichier.
    files: [
      "src/routes/index.tsx",
      "src/routes/$slug.tsx",
      "src/routes/contact.tsx",
      "src/routes/realisations.tsx",
      "src/routes/services.index.tsx",
      "src/routes/services.$serviceSlug.tsx",
      "src/routes/sitemap*.ts",
      "src/routes/robots*.ts",
      "src/routes/llms*.ts",
      "src/components/public/**/*.tsx",
      "src/lib/tenant-loader.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='from'][arguments.0.value=/^(tenants|services|service_areas|site_settings)$/]",
          message:
            "Route/composant public : utilisez la vue public_* correspondante (voir src/lib/tenant.ts), jamais la table de base.",
        },
      ],
    },
  },
  eslintPluginPrettier,
);

// Canonical BASE-component path — the only place raw styled/textual HTML + the full
// Tailwind/CSS skin live. Frozen here so every gate that needs the boundary (the ESLint
// lockdown override, dependency-cruiser tier rules, …) binds to ONE constant instead of
// duplicating the glob and drifting apart.
//
// CommonJS so .cjs tooling can `require` it and an ESM eslint.config.js can import its default.
module.exports = {
  BASE_COMPONENTS_DIR: 'src/components/ui',
  BASE_COMPONENTS_GLOB: 'src/components/ui/**',
}

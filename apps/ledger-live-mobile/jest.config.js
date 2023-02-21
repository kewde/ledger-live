const { defaults: tsjPreset } = require("ts-jest/presets");

const transformIncludePatterns = [
  "@react-native/polyfills",
  "(jest-)?react-native",
  "@react-native(-community)?",
  "rn-range-slider",
  "react-native-reanimated",
  "react-native-modal",
  "react-native-animatable",
  "@sentry/react-native",
  "react-native-startup-time",
];

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...tsjPreset,
  verbose: true,
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect", "./jest-setup.js"],
  globals: {
    "ts-jest": {
      babelConfig: true,
    },
  },
  testMatch: ["**/src/**/*.test.(ts|tsx)"],
  transform: {
    "^.+\\.js?$": "babel-jest",
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  transformIgnorePatterns: [
<<<<<<< HEAD
    `node_modules/(?!(.pnpm|${transformIncludePatterns.join("|")})/)`,
=======
    "node_modules/(?!(.pnpm|@react-native/polyfills|react-native)/)",
>>>>>>> 32b2f1cace (chore(llm): attempt to fix several jest issues)
    "\\.pnp\\.[^\\/]+$",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  moduleDirectories: ["node_modules"],
  coverageReporters: ["json"],
  coverageDirectory: "<rootDir>/coverage",
  moduleNameMapper: {
    uuid: require.resolve("uuid"),
    "^@ledgerhq/coin-framework(.*)$": "<rootDir>/../../libs/coin-framework/lib$1.js",
    "^@ledgerhq/icons-ui/native(.*)$": "<rootDir>/../../libs/ui/packages/icons/native/$1",
    "^@ledgerhq/crypto-icons-ui/native(.*)$":
      "<rootDir>/../../libs/ui/packages/crypto-icons/native/$1",
    "^@ledgerhq/native-ui(.*)$": "<rootDir>/../../libs/ui/packages/native/lib/$1",
    "^react-native/(.*)$": "<rootDir>/node_modules/react-native/$1",
    "^react-native$": "<rootDir>/node_modules/react-native",
    "^victory-native$": "victory",
    "styled-components":
      "<rootDir>/node_modules/styled-components/native/dist/styled-components.native.cjs.js",
  },
};

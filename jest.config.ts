import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          esModuleInterop: true,
        },
      },
    ],
  },
  clearMocks: true,
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/schemas/**/*.ts",
    "src/types/**/*.ts",
    "!src/**/*.d.ts",
  ],
};

export default config;

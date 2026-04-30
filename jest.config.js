/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Vortex Cart - Relatório de Testes',
        outputPath: './reports/test-report.html',
        includeFailureMsg: true,
        darkTheme: true
      }
    ]
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],

  coverageDirectory: 'reports/coverage',
  coverageReporters: ['text', 'html'],
};
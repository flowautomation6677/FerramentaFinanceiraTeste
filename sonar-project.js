const sonarqubeScanner = require('sonarqube-scanner');

// Handle module export differences (CJS vs ESM interop)
// If require returns an object with 'default', use that. Otherwise use the object itself.
// However, newer versions might export an object where .scanner is the function or similar.
// But usually .default is the suspect for "not a function".
const scanner = sonarqubeScanner.default || sonarqubeScanner;

scanner(
    {
        serverUrl: 'http://localhost:9000',
        token: "sqp_16d0b23737eca29776a686f3f6f5688e7130a0fa",
        options: {
            'sonar.login': "sqp_16d0b23737eca29776a686f3f6f5688e7130a0fa",
            'sonar.projectKey': 'ferramenta-financeira-teste',
            'sonar.projectName': 'Ferramenta Financeira',
            'sonar.projectVersion': '1.0.0',
            'sonar.sourceEncoding': 'UTF-8',
            'sonar.sources': 'src, web-dashboard/src',
            'sonar.tests': 'tests',
            'sonar.exclusions': '**/node_modules/**, **/.next/**, **/dist/**, **/coverage/**, **/*.spec.ts, **/*.test.js',
            'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
            'sonar.typescript.tsconfigPath': 'web-dashboard/tsconfig.json'
        }
    },
    () => process.exit()
);

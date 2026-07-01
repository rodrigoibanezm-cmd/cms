const path = require('path');

module.exports = {
  outputFileTracingRoot: path.join(__dirname, '../'),
  outputFileTracingIncludes: {
    '/api/process-report': [
      '../benchmark/prompts/**',
      '../benchmark/catalog/**',
    ],
  },
  serverExternalPackages: ['@google/genai', 'googleapis', 'exceljs'],
};

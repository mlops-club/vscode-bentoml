/**
 * Tests for the bentofileSchema.json
 */

import * as assert from 'assert';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { describe, it } from 'mocha';
import Ajv from 'ajv';
import * as fs from 'fs';

// TODO: this directory is not relative to this file. When 'npm test' is run, the tests are transpiled to JS and
// moved to <project_root>/out/. So this path must be relative to that location.
const BENTOFILE_JSON_SCHEMA_FPATH = path.resolve(
  __dirname,
  '../../../../../../src/resources/yamlSchemas/bentofileSchema.json'
);

const readBentoFileSchema = (): any => {
  const bentofileSchema = fs.readFileSync(BENTOFILE_JSON_SCHEMA_FPATH, 'utf8');
  return JSON.parse(bentofileSchema);
};

describe('BentoFile JSON Schema Tests', () => {
  const bentofileSchema: any = readBentoFileSchema();
  const ajv = new Ajv();

  it('should have a service name', async () => {
    const bentoFile = `
        # simulates ExampleService coming from service.py
        service: "service:ExampleService"
        `;
    const bentoFileJson = yaml.load(bentoFile);

    const validate = ajv.compile(bentofileSchema);
    const valid = validate(bentoFileJson);
    assert.strictEqual(valid, true);
  });
});

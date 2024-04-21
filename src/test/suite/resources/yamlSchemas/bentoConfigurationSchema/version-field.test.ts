/**
 * Test bentoConfigurationSchema.json's ability to validate the `version` field in a bento_config.yaml.
 */

import * as assert from 'assert';
import { describe, it } from 'mocha';
import { validateBentoConfigFile } from './utils';

describe('Bento Configuration JSON Schema: version', () => {
  it('should accept if version field is 1', async () => {
    const bentoConfig = `
        # valid version 1
        version: 1
        `;
    const valid = validateBentoConfigFile(bentoConfig);
    assert.strictEqual(valid, true);
  });
  it('should accept if version field is 2', async () => {
    const bentoConfig = `
        # valid version 2
        version: 2
        `;
    const valid = validateBentoConfigFile(bentoConfig);
    assert.strictEqual(valid, true);
  });
  it('should fail validation for an invalid version', async () => {
    const bentoConfig = `
        # invalid version
        version: "invalid"
        `;
    const valid = validateBentoConfigFile(bentoConfig);
    assert.strictEqual(valid, false);
  });
});
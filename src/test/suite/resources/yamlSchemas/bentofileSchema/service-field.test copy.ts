/**
 * Test bentofileSchema.json's ability to validate the `service` field in a bentofile.yaml.
 */

import * as assert from 'assert';
import { describe, it } from 'mocha';
import { validateBentofile } from './utils';


describe('BentoFile JSON Schema: service', () => {
  it('should have a service name', async () => {
    const bentoFile = `
        # simulates ExampleService coming from service.py
        service: "service:example_service"
        `;
    const valid = validateBentofile(bentoFile);
    assert.strictEqual(valid, true);
  });

  it('should have a service name with a colon', async () => {
    const bentoFile = `
        service: "no_colon_here"
        `;
    const valid = validateBentofile(bentoFile);
    assert.strictEqual(valid, false);
  })

  it('should have a valid module path before the colon', async () => {
    const bentoFile = `
        service: "3invalid.module.path:ExampleService"
        `;
    const valid = validateBentofile(bentoFile);
    assert.strictEqual(valid, false);
  })

  it('should have a valid Python identifier after the colon', async () => {
    const bentoFile = `
        service: "module.path:3invalid_identifier"
        `;
    const valid = validateBentofile(bentoFile);
    assert.strictEqual(valid, false);
  })

});

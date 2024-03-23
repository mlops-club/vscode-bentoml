import * as assert from 'assert';
import * as vscode from 'vscode';
import { tryParseJsonArrayFromString } from '../../../../common/bentoml/cli-client';
import { describe, it } from 'mocha';

const MOCK_BENTOML_LIST_OUTPUT_JSON = [
  {
    tag: 'linear_regression:gy36t3ximowm45wy',
    size: '16.14 KiB',
    model_size: '941.00 B',
    creation_time: '2024-03-22 09:45:39',
  },
  {
    tag: 'bentoml-poc:1836',
    size: '94.35 KiB',
    model_size: '11.06 KiB',
    creation_time: '2024-03-12 18:21:08',
  },
];

const MOCK_BENTOML_LIST_OUTPUT: string = `
Deprecated build option: 'docker.env' is used, please use 'envs' instead.
Deprecated build option: 'docker.env' is used, please use 'envs' instead.
${JSON.stringify(MOCK_BENTOML_LIST_OUTPUT_JSON)}`;

describe('tryParseJsonArrayFromString', () => {
  it('should parse JSON array substring from a string', () => {
    const result = tryParseJsonArrayFromString(MOCK_BENTOML_LIST_OUTPUT);
    assert.deepStrictEqual(result, MOCK_BENTOML_LIST_OUTPUT_JSON);
  });

  it('should throw an error if the input string does not contain a JSON array substring', () => {
    const inputString = 'This is a regular string without any JSON array substring';
    assert.throws(() => tryParseJsonArrayFromString(inputString));
  });
});

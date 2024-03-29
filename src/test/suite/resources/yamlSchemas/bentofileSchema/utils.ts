import * as path from 'path';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import Ajv from 'ajv';

// TODO: this directory is not relative to this file. When 'npm test' is run, the tests are transpiled to JS and
// moved to <project_root>/out/. So this path must be relative to that location.
export const BENTOFILE_JSON_SCHEMA_FPATH = path.resolve(
  __dirname,
  '../../../../../../src/resources/yamlSchemas/bentofileSchema.out.json'
);

export const readBentoFileSchema = (): any => {
  const bentofileSchema = fs.readFileSync(BENTOFILE_JSON_SCHEMA_FPATH, 'utf8');
  return JSON.parse(bentofileSchema);
};

export const validateBentofile = (bentoFile: string): boolean => {
  const bentofileSchema: any = readBentoFileSchema();
  const bentoFileJson = yaml.load(bentoFile);
  const ajv = new Ajv();
  const validate = ajv.compile(bentofileSchema);
  return validate(bentoFileJson) as boolean;
};

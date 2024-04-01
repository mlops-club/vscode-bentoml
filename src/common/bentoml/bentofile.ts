import { BentoFile } from '@/common/bentoml/models';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export const getBentoFiles = (directory: string): BentoFile[] => {
  const bentoFiles: BentoFile[] = [];
  const files = fs
    .readdirSync(directory, {
      recursive: true,
    })
    .map((file) => file.toString());

  const bentoFilesInRootPath = files
    .filter((file) => file.endsWith('bentofile.yaml') || file.endsWith('bentofile.yml'))
    .map((file) => {
      const absolutePath = `${directory}/${file}`;
      const fileContent = fs.readFileSync(absolutePath);
      const bentoFile = yaml.load(fileContent.toString()) as Partial<BentoFile>;
      return {
        absolutePath,
        ...bentoFile,
      } as BentoFile;
    });
  bentoFiles.push(...bentoFilesInRootPath);
  return bentoFiles;
};

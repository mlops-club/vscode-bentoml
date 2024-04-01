import { checkAndPromptToInstallPythonPackages } from '@/common/ui/install-python-libs-modal';
import {
  tryGetPathToActivePythonInterpreter,
  promptIfPythonInterpreterIsNotConfigured,
  promptToSelectPythonInterpreter,
} from '@/common/python';
import * as vscode from 'vscode';

export const ensureBentoMlCliIsAvailable = async () => {
  await promptIfPythonInterpreterIsNotConfigured();
  // check to see if the bentoml CLI is installed with pip, by running pip
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  await checkAndPromptToInstallPythonPackages(interpreterFpath, ['bentoml']);
};

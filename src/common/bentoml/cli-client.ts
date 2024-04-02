import * as vscode from 'vscode';
import * as consts from '@/common/constants';
import { Model, SimpleModel, Bento } from '@/common/bentoml/models';
import { runShellCommand } from '@/common/shell';
import { tryGetPathToActivePythonInterpreter } from '@/common/python';
import { traceVerbose } from '@/common/logging';

export async function listModels(): Promise<SimpleModel[]> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'list', '--output', 'json']);
  traceVerbose(`listModels() response: ${response}`);
  try {
    const models = tryParseJsonArrayFromString(response.logs) as SimpleModel[];
    return models;
  } catch (error) {
    vscode.window.showErrorMessage(
      `[${consts.EXTENSION_NAME}] Failed to list models\n\nError parsing JSON array: ${error}`
    );
    throw error;
  }
}

export async function listBentos(): Promise<Bento[]> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'list', '--output', 'json']);
  traceVerbose(`listBentos() response: ${response}`);
  try {
    const bentos = tryParseJsonArrayFromString(response.logs) as Bento[];
    return bentos;
  } catch (error) {
    vscode.window.showErrorMessage(
      `[${consts.EXTENSION_NAME}] Failed to list Bentos\n\nError parsing JSON array: ${error}`
    );
    throw error;
  }
}

export async function getBentoInfo(tag: string): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'get', tag]);
  traceVerbose(`getBentoInfo() response: ${response}`);
  return response.logs;
}

export async function getModelInfo(tag: string): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'get', tag]);
  traceVerbose(`getModelInfo() response: ${response}`);
  return response.logs;
}

export async function deleteModel(object: SimpleModel): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'delete', object.tag, '-y']);
  traceVerbose(response);
  return response.logs;
}

export async function deleteBento(object: Bento): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'delete', object.tag, '-y']);
  traceVerbose(response);
  return response.logs;
}

// TODO: this is a long-running, potentially immortal process. It may be a problem that it uses `await`
// before runShellCommand. The user should have more visibility and control over the ability immortal processes.
// For example, running this consumes CPU and binds a port, making the port unusable for other services.
// See the alternative function in serve-bento-in-terminal.ts for a better approach.
export async function serve(bentoDirectory: string): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'serve', bentoDirectory]);
  return response.logs;
}

export async function containerize(bentoDirectory: string): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  console.log(`command: ${interpreterFpath} -m bentoml containerize ${bentoDirectory}`);
  const response = await tryRunShellCommand(interpreterFpath, ['-m', 'bentoml', 'containerize', bentoDirectory]);
  return response.logs;
}

export const tryRunShellCommand = async (
  interpreterFpath: string,
  args: string[]
): Promise<{
  logs: string;
  exitCode: number;
}> => {
  const response = await runShellCommand(interpreterFpath, args);
  if (response.exitCode !== 0) {
    vscode.window.showErrorMessage(
      `[${consts.EXTENSION_NAME}] Command failed with exit code ${response.exitCode}:\n\n${response.logs}`
    );
    throw new Error(`Command failed with exit code ${response.exitCode}: ${response.logs}`);
  }
  return response;
};

/**
 * Return the list of missing packages from the provided list of packages or raise an error
 * if no such substring exists.
 *
 * Why? Sometimes `bentoml ... --output json` commands return additional messages besides the expected
 * JSON.
 *
 * E.g. `bentoml list` returned `Deprecated build option: 'docker.env' is used, please use 'envs' instead. [... the array]`.
 * This function is resilient to strings with additional messages.
 *
 * @param stringWithJsonArraySubstring string that possibly contains a substring that is a JSON array
 * @returns array parsed from the JSON array substring
 */
export const tryParseJsonArrayFromString = (stringWithJsonArraySubstring: string): any[] => {
  const match = stringWithJsonArraySubstring.match(/\[.*\]/s);
  if (!match) {
    throw new Error(`No JSON array found in the string: ${stringWithJsonArraySubstring}`);
  }
  return JSON.parse(match[0]);
};

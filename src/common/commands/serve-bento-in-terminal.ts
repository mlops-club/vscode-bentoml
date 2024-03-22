import * as vscode from 'vscode';
import { getPathToActivePythonInterpreter } from '../python';

/**
 * Display input boxes to the user and use the inputs to launch a new terminal with a served bento.
 *
 * Open an interactive terminal and execute `bentoml serve ...`.
 */
export const serveBentoInTerminalCommand = async (): Promise<void> => {
  const bentoTag: string = (await vscode.window.showInputBox({
    prompt: 'Enter Bento Tag:',
    placeHolder: 'e.g. example_service:qmrtzrhchk3ba5wy',
  })) as string;

  const port: string = (await vscode.window.showInputBox({
    prompt: 'Enter Server Port:',
    placeHolder: '3001',
    value: '3001', // Set a default value for port
  })) as string;

  // Validate and process the provided values
  // ... (Perform checks for valid Bento Tag and port number)

  serveBentoInTerminal(bentoTag, port);
};

/**
 * Open an interactive terminal and execute `bentoml serve ...`.
 *
 * @param bentoTag identifier of the form <name>:<version>
 * @param port http port
 */
export const serveBentoInTerminal = async (bentoTag: string, port: string | number): Promise<void> => {
  const interpreterFpath: string = (await getPathToActivePythonInterpreter()) as string;

  const [bentoName, bentoVersion] = bentoTag.split(':');
  const terminalDisplayName = `BentoML Serve: ${bentoVersion}`;
  const terminal = vscode.window.createTerminal(terminalDisplayName);

  // navigate the user to the terminal / set the terminal as active
  terminal.show();

  // execute the command
  terminal.sendText(`${interpreterFpath} -m bentoml serve ${bentoTag} --port ${port}`);
};

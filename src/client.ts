import * as vscode from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    Trace
} from "vscode-languageclient/node";
import { resolveServerBinary } from "./downloader";

export interface StartedClient {
    client: LanguageClient;
    serverPath: string;
}

export async function startClient(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
): Promise<StartedClient> {
    const serverPath = await resolveServerBinary(context, outputChannel);
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    outputChannel.appendLine(`Starting PHPantom language server: ${serverPath}`);

    const serverOptions: ServerOptions = {
        command: serverPath,
        args: [],
        options: {
            cwd: workspaceFolder
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            {
                scheme: "file",
                language: "php"
            }
        ],
        outputChannel,
        traceOutputChannel: outputChannel,
        synchronize: {
            configurationSection: "phpantom"
        }
    };

    const client = new LanguageClient(
        "phpantom",
        "PHPantom",
        serverOptions,
        clientOptions
    );

    applyConfiguredTrace(client);
    await client.start();
    outputChannel.appendLine("PHPantom language server started.");

    return {
        client,
        serverPath
    };
}

export function applyConfiguredTrace(client: LanguageClient): void {
    const traceSetting = vscode.workspace
        .getConfiguration("phpantom")
        .get<string>("trace.server", "off");

    client.setTrace(toTrace(traceSetting));
}

function toTrace(value: string): Trace {
    switch (value) {
        case "messages":
            return Trace.Messages;
        case "verbose":
            return Trace.Verbose;
        default:
            return Trace.Off;
    }
}

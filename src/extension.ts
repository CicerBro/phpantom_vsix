import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { applyConfiguredTrace, startClient } from "./client";
import {
    clearDownloadedServer,
    downloadServer
} from "./downloader";

let client: LanguageClient | undefined;
let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    outputChannel = vscode.window.createOutputChannel("PHPantom");
    context.subscriptions.push(outputChannel);

    context.subscriptions.push(
        vscode.commands.registerCommand("phpantom.restartServer", async () => {
            await restartServer(context);
        }),
        vscode.commands.registerCommand("phpantom.showOutput", () => {
            outputChannel.show();
        }),
        vscode.commands.registerCommand("phpantom.downloadServer", async () => {
            await runCommand("download PHPantom language server", async () => {
                const serverPath = await downloadServer(context, outputChannel, true);
                vscode.window.showInformationMessage(`PHPantom language server downloaded to ${serverPath}.`);
            });
        }),
        vscode.commands.registerCommand("phpantom.clearDownloadedServer", async () => {
            await runCommand("clear downloaded PHPantom language servers", async () => {
                await stopClient();
                await clearDownloadedServer(context);
                vscode.window.showInformationMessage("Downloaded PHPantom language servers were cleared.");
            });
        }),
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("phpantom.trace.server") && client) {
                applyConfiguredTrace(client);
            }
        })
    );

    await runCommand("start PHPantom language server", async () => {
        client = await startClient(context, outputChannel);
    });
}

export async function deactivate(): Promise<void> {
    await stopClient();
}

async function restartServer(context: vscode.ExtensionContext): Promise<void> {
    await runCommand("restart PHPantom language server", async () => {
        outputChannel.appendLine("Restarting PHPantom language server.");
        await stopClient();
        client = await startClient(context, outputChannel);
    });
}

async function stopClient(): Promise<void> {
    if (!client) {
        return;
    }

    const activeClient = client;
    client = undefined;
    await activeClient.stop();
    outputChannel.appendLine("PHPantom language server stopped.");
}

async function runCommand(description: string, task: () => Promise<void>): Promise<void> {
    try {
        await task();
    } catch (error) {
        const message = formatError(error);
        outputChannel.appendLine(`Failed to ${description}: ${message}`);
        outputChannel.appendLine("");
        outputChannel.appendLine("Set phpantom.serverPath to a local phpantom_lsp binary, install phpantom_lsp on PATH, or enable phpantom.autoDownload.");
        vscode.window.showErrorMessage(`PHPantom failed to ${description}: ${message}`);
    }
}

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}

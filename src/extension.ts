import * as vscode from 'vscode'
import * as cmnds from './Commands'
import * as utils from './utils'

export async function activate(context: vscode.ExtensionContext) {
    // context
    const existingRel = context.globalState.get(utils.PACKAGE_CONTEXT) as string || ''
    await utils.setContext(!!existingRel)

    context.subscriptions.push(
        // explorer: copy relative folder path
        vscode.commands.registerCommand(
            `${utils.PACKAGE_CMND_NAME}.copy_folder_hierarchy`,
            async(uri: vscode.Uri) => await cmnds.copyFolderHierarchy(uri || vscode.window.activeTextEditor?.document.uri, context),
        ),

        vscode.commands.registerCommand(
            `${utils.PACKAGE_CMND_NAME}.create_copied_hierarchy`,
            async(uri: vscode.Uri) => await cmnds.createFolderHierarchy(uri, context),
        ),
    )
}

export function deactivate() { }

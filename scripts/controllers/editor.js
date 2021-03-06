/**
 * Editor files controller: provides model with
 * available files from all connected editors. This model
 * is updated whenever user connects new editor or opens/closes
 * stylesheet files
 */
'use strict';

import Model from '../lib/model';
import {unique} from '../lib/utils';

// The `active` key tells if there are any connected editor
var editorFiles = new Model();
var connectedEditors = {};

export default editorFiles;

/**
 * Sync all connect editor files with underlying
 * editor files model
 */
function sync() {
	var allFiles = [];
	var ids = Object.keys(connectedEditors);
	ids.forEach(function(id) {
		allFiles = allFiles.concat(connectedEditors[id] || []);
	});
	
	allFiles = unique(allFiles);
	editorFiles.set('files', allFiles);
	editorFiles.set('active', ids.length > 0);
	return allFiles;
}

function onFileListReceived(payload) {
	connectedEditors[payload.id] = payload.files || [];
	sync();
}

function onEditorDisconnect(payload) {
	if (payload.id in connectedEditors) {
		delete connectedEditors[payload.id];
		sync();
	}
}

function onConnectionClosed() {
	connectedEditors = {};
	sync();
}

/**
 * Connects model with given LiveStyle client:
 * model now tracks all editor file-related changes and
 * notifies all listener on update
 * @param  {LiveStyleClient} client
 */
editorFiles.connect = function(client) {
	client
	.on('editor-files', onFileListReceived)
	.on('editor-disconnect', onEditorDisconnect)
	.on('close', onConnectionClosed);
};

/**
 * Disconnects model from given client: it no longer
 * listens to editor files update
 * @param  {LiveStyleClient} client
 */
editorFiles.disconnect = function(client) {
	client
	.off('editor-files', onFileListReceived)
	.off('editor-disconnect', onEditorDisconnect)
	.off('close', onConnectionClosed);
};

sync();
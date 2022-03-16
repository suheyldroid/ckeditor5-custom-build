import Command from "@ckeditor/ckeditor5-core/src/command";

export default class InsertFileCommand extends Command {
	execute (options) {
		const fileUrl = options.url;
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createFile(writer, fileUrl));
		});
	}

	refresh () {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "file");

		this.isEnabled = allowedIn !== null;
	}
}

function createFile (writer, url) {
	const file = writer.createElement("file");
	const fileName = writer.createElement("fileName", { fileName: url });
	const downloadButton = writer.createElement("downloadButton", { url });

	writer.append(fileName, file);
	writer.append(downloadButton, file);

	return file;
}

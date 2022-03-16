import Command from "@ckeditor/ckeditor5-core/src/command";

export default class InsertVideoCommand extends Command {
	execute (options) {
		const videoUrl = options.url;
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createVideo(writer, videoUrl));
		});
	}

	refresh () {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "file");

		this.isEnabled = allowedIn !== null;
	}
}

function createVideo (writer, url) {
	const file = writer.createElement("file");
	const fileName = writer.createElement("video", { source: url });

	writer.append(fileName, file);
	return file;
}

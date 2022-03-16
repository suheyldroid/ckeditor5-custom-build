import { Command } from "ckeditor5/src/core";
import { toArray } from "ckeditor5/src/utils";
import { FileRepository } from "ckeditor5/src/upload";

export default class UploadFileCommand extends Command {

	refresh () {
		const editor = this.editor;
		this.isEnabled = true;
	}

	execute (options) {
		const files = toArray(options.file);
		files.forEach((file, index) => {
			this._uploadFile(file);
		});
	}

	async _uploadFile (file) {
		const editor = this.editor;
		const fileRepository = editor.plugins.get(FileRepository);
		const loader = fileRepository.createLoader(file);
		const fileUtils = editor.plugins.get("FileUtils");
		if (!loader) {
			return;
		}

		const uploadResponse = await loader.upload();
		const fileType = fileUtils.isValidFileType(file);
		const downloadURL = editor.config.get("fileUpload.downloadURL");
		if (fileType === "file") {
			editor.execute("insertFile", { url: downloadURL + uploadResponse.uploaded_url });
		} else if (fileType === "image") {
			editor.execute("uploadImage", { file: file });
		} else if (fileType === "video") {
			editor.execute("insertVideo", { url: downloadURL + uploadResponse.uploaded_url });

		}

		fileRepository.destroyLoader(loader);
	}


}



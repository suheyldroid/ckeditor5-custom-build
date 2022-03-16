import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileEditing from "./FileEditing";
import { FileUploadAdapter } from "./FileUploadAdapter";

export default class FileUpload extends Plugin {
	static get requires () {
		return [FileEditing];
	}

	init () {
		const editor = this.editor;

		editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
			const uploadURL = editor.config.get("fileUpload.uploadURL");
			return new FileUploadAdapter(loader, uploadURL);
		};

	}
}

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export class FileUtils extends Plugin {

	static get pluginName () {
		return "FileUtils";
	}

	fileTypes = ["application/pdf"];
	videoTypes = ["video/mp4"]
	imageTypes = ["image/jpeg","image/tiff"]

	isValidFileType (file) {
		if (!file.type) return false;
		const fileType = file.type;

		if(this.fileTypes.includes(fileType)){
			return "file"
		}
		if(this.videoTypes.includes(fileType)){
			return "video"
		}
		if(this.imageTypes.includes(fileType)){
			return "image"
		}
		return false
	}
}

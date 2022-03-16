import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { toWidget } from "ckeditor5/src/widget";
import InsertFileCommand from "./InsertFileCommand";
import UploadFileCommand from "./UploadFileCommand";
import { isHtmlIncluded } from "@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting";
import { FileUtils } from "./FileUtils";
import InsertVideoCommand from "./InsertVideoCommand";

export default class FileEditing extends Plugin {
	init () {
		const editor = this.editor;

		this._defineSchema();
		this._defineConverters();
		editor.config.define("fileUpload", {
			uploadURL: "",
			downloadURL: "",
		});

		editor.commands.add("insertFile", new InsertFileCommand(editor));
		editor.commands.add("insertVideo", new InsertVideoCommand(editor));
		editor.commands.add("uploadFile", new UploadFileCommand(editor));

		this.listenTo(editor.editing.view.document, "clipboardInput", (evt, data) => {
			if (isHtmlIncluded(data.dataTransfer)) {
				return;
			}

			const files = Array.from(data.dataTransfer.files).filter(file => !!file);

			if (!files.length) {
				return;
			}

			evt.stop();

			editor.model.change(writer => {
				// Set selection to paste target.
				if (data.targetRanges) {
					writer.setSelection(data.targetRanges.map(viewRange => editor.editing.mapper.toModelRange(viewRange)));
				}

				editor.model.enqueueChange(() => {
					editor.execute("uploadFile", { file: files });
				});
			});
		});
		editor.editing.view.document.on("dragover", (evt, data) => {
			data.preventDefault();
		});
	}

	static get requires () {
		return [Widget, FileUtils];
	}

	_defineSchema () {
		const schema = this.editor.model.schema;

		schema.register("file", {
			isObject: true,
			allowWhere: "$block"
		});
		schema.register("fileName", {
			isLimit: true,
			allowIn: "file",
			allowContentOf: "$block",
			allowAttributes: ["fileName"]
		});
		schema.register("video", {
			isLimit: true,
			allowIn: "file",
			allowContentOf: "$block",
			allowAttributes: ["source"]
		});
		schema.register("image", {
			isLimit: true,
			allowIn: "file",
			allowContentOf: "$block",
			allowAttributes: ["source"]
		});
		schema.register("downloadButton", {
			isLimit: true,
			allowIn: "file",
			allowContentOf: "$root",
			allowAttributes: ["url"]
		});

	}

	_defineConverters () {
		const conversion = this.editor.conversion;

		conversion.for("upcast").elementToElement({
			model: "file",
			view: {
				name: "section",
				classes: "file"
			}
		});
		conversion.for("dataDowncast").elementToElement({
			model: "file",
			view: {
				name: "section",
				classes: "file"
			}
		});
		conversion.for("editingDowncast").elementToElement({
			model: "file",
			view: (modelElement, { writer: viewWriter }) => {
				const section = viewWriter.createContainerElement("section", { class: "file" });

				return toWidget(section, viewWriter, { label: "File" });
			}
		});

		conversion.for("upcast").elementToElement({
			model: (viewElement, { writer }) => {
				const fileName = viewElement.getChild(0);
				return writer.createElement("fileName", { fileName });
			},
			view: {
				name: "h1",
				classes: "fileName"
			}
		});
		conversion.for("downcast").elementToElement({
			model: {
				name: "fileName",
				attributes: ["fileName"]
			},
			view: (modelElement, { writer }) => {
				const filePath = modelElement.getAttribute("fileName");
				const fileName = filePath.split("/").pop();
				return writer.createContainerElement("h1", {
						class: "fileName"
					},
					writer.createText(fileName));

			}
		});

		conversion.for("upcast").elementToElement({
			model: (viewElement, { writer }) => {
				const source = viewElement.getAttribute("src");
				return writer.createElement("video", { source });
			},
			view: {
				name: "video",
				classes: "video",
				attributes: ["src"]
			}
		});
		conversion.for("downcast").elementToElement({
			model: {
				name: "video",
				attributes: ["source"]
			},
			view: (modelElement, { writer }) => {
				const source = modelElement.getAttribute("source");
				return writer.createContainerElement("video", {
					class: "video",
					controls: true,
					src: source
				});
			}
		});

		conversion.for("upcast").elementToElement({
			model: (viewElement, { writer }) => {
				const url = viewElement.getAttribute("href");
				return writer.createElement("downloadButton", { url });
			},
			view: {
				name: "div",
				classes: "fileContent"
			}
		});
		conversion.for("downcast").elementToElement({
			model: {
				name: "downloadButton",
				attributes: ["url"]
			},
			view: (modelElement, { writer }) => {
				const buttonText = writer.createText("Download");
				const button = writer.createContainerElement("a", {
					download: true,
					href: modelElement.getAttribute("url"),
					class: "downloadButton"
				}, buttonText);
				return button;

			}
		});
	}
}

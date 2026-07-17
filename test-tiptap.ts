import { generateHTML } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";

const doc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }]
};

console.log(generateHTML(doc, [StarterKit, Link.configure({ openOnClick: false }), Image]));

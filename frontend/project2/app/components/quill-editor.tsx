"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export interface QuillEditorRef {
  getContent: () => string;
}

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  (
    { value, onChange, placeholder = "내용을 입력하세요...", readOnly = false },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getContent: () => {
        return quillRef.current?.root.innerHTML || "";
      },
    }));

    useEffect(() => {
      if (typeof window !== "undefined") {
        // Load Quill CSS
        const link = document.createElement("link");
        link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        // Load Quill script
        import("quill").then((Quill) => {
          if (!editorRef.current || quillRef.current) return;

          const quill = new Quill.default(editorRef.current, {
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["blockquote", "code-block"],
                ["link", "image"],
                ["clean"],
              ],
            },
            placeholder: placeholder,
            theme: "snow",
            readOnly: readOnly,
          });

          // Set initial content
          quill.root.innerHTML = value;

          // Handle content change
          quill.on("text-change", () => {
            onChange(quill.root.innerHTML);
          });

          quillRef.current = quill;
        });

        return () => {
          // Clean up
          document.head.removeChild(link);
          quillRef.current = null;
        };
      }
    }, []);

    // Update content when value prop changes
    useEffect(() => {
      if (quillRef.current && value !== quillRef.current.root.innerHTML) {
        quillRef.current.root.innerHTML = value;
      }
    }, [value]);

    return (
      <div className="quill-editor-container">
        <div ref={editorRef} className="quill-editor"></div>
      </div>
    );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Quote, Code, Image as ImageIcon, Youtube as YoutubeIcon, 
  Undo, Redo, Link as LinkIcon, Upload
} from "lucide-react";
import { useState, useRef } from "react";
import { uploadImageAction } from "@/app/actions/blogActions";

const Toolbar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!editor) return null;

  const addImageUrl = () => {
    const url = window.prompt('Enter Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageAction(formData);
    if (res.success && res.url) {
      editor.chain().focus().setImage({ src: res.url }).run();
    } else {
      alert(res.error || "Upload failed");
    }
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('Enter YouTube URL');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg mr-2">
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('underline') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>
      
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg mr-2">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button 
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()} 
            className={`p-1.5 px-2.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('heading', { level }) ? 'text-primary bg-primary/10' : 'text-white/40'}`}
            title={`Heading ${level}`}
          >
            <span className="text-xs font-black">H{level}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg mr-2">
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('bulletList') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('orderedList') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg mr-2">
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('blockquote') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('codeBlock') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Code Block"
        >
          <Code size={16} />
        </button>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg mr-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded hover:bg-white/10 text-white/40 transition-colors" title="Upload Image">
          <Upload size={16} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <button type="button" onClick={addImageUrl} className="p-1.5 rounded hover:bg-white/10 text-white/40 transition-colors" title="Image URL">
          <ImageIcon size={16} />
        </button>
        <button type="button" onClick={addYoutubeVideo} className="p-1.5 rounded hover:bg-white/10 text-white/40 transition-colors" title="YouTube Video">
          <YoutubeIcon size={16} />
        </button>
        <button 
          type="button"
          onClick={setLink} 
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive('link') ? 'text-primary bg-primary/10' : 'text-white/40'}`}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded hover:bg-white/10 text-white/40 transition-colors"><Undo size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded hover:bg-white/10 text-white/40 transition-colors"><Redo size={16} /></button>
      </div>
    </div>
  );
};

export default function BlogEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to use custom one
        bulletList: false,
        orderedList: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      BulletList,
      OrderedList,
      Underline,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl border border-white/10 max-w-full h-auto my-12 mx-auto shadow-2xl block',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-2xl aspect-video w-full my-12 shadow-2xl',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline cursor-pointer font-bold',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing story...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-primary max-w-none min-h-[600px] p-8 md:p-12 focus:outline-none prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h1:font-black prose-h2:font-black prose-h3:font-bold prose-img:mx-auto',
      },
    },
  });

  return (
    <div className="glass-card border-white/10 overflow-hidden min-h-[700px] bg-white/[0.01] flex flex-col relative group/editor shadow-2xl">
      <Toolbar editor={editor} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.1);
          pointer-events: none;
          height: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        /* Ensure headings and lists look correct in editor */
        .ProseMirror h1 { font-size: 2.25rem; font-weight: 900; margin: 1.5rem 0; }
        .ProseMirror h2 { font-size: 1.875rem; font-weight: 900; margin: 1.25rem 0; }
        .ProseMirror h3 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
      `}} />
    </div>
  );
}

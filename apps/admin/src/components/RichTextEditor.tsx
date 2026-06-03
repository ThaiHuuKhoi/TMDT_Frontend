"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Heading3, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    value: string;
    onChange: (html: string) => void;
}

function cmd(command: string, value?: string) {
    document.execCommand(command, false, value ?? undefined);
}

export default function RichTextEditor({ value, onChange }: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isComposing = useRef(false);

    useEffect(() => {
        const el = editorRef.current;
        if (el && el.innerHTML !== value) {
            el.innerHTML = value ?? "";
        }
    }, [value]);

    function handleInput() {
        if (!isComposing.current && editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }

    function insertLink() {
        const url = window.prompt("Nhập URL:");
        if (url) cmd("createLink", url);
    }

    const tools = [
        { icon: Heading2, title: "Tiêu đề 2", action: () => cmd("formatBlock", "H2") },
        { icon: Heading3, title: "Tiêu đề 3", action: () => cmd("formatBlock", "H3") },
        { icon: Bold, title: "In đậm", action: () => cmd("bold") },
        { icon: Italic, title: "In nghiêng", action: () => cmd("italic") },
        { icon: Underline, title: "Gạch dưới", action: () => cmd("underline") },
        { icon: List, title: "Danh sách chấm", action: () => cmd("insertUnorderedList") },
        { icon: ListOrdered, title: "Danh sách số", action: () => cmd("insertOrderedList") },
        { icon: Link, title: "Chèn link", action: insertLink },
    ];

    return (
        <div className="border border-zinc-200 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-zinc-50 border-b border-zinc-200">
                {tools.map(({ icon: Icon, title, action }) => (
                    <Button
                        key={title}
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-600 hover:bg-zinc-200"
                        title={title}
                        onMouseDown={(e) => { e.preventDefault(); action(); }}
                    >
                        <Icon size={16} />
                    </Button>
                ))}
                <div className="w-px bg-zinc-200 mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-zinc-500 hover:bg-zinc-200"
                    title="Đoạn văn thường"
                    onMouseDown={(e) => { e.preventDefault(); cmd("formatBlock", "P"); }}
                >
                    Thường
                </Button>
            </div>

            {/* Editor area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onCompositionStart={() => { isComposing.current = true; }}
                onCompositionEnd={() => {
                    isComposing.current = false;
                    handleInput();
                }}
                className={[
                    "min-h-[400px] p-4 focus:outline-none",
                    "prose prose-zinc max-w-none",
                    "prose-h2:text-red-600 prose-h2:text-xl prose-h3:text-base",
                    "prose-ul:list-disc prose-ol:list-decimal",
                    "prose-a:text-blue-600 prose-a:underline",
                ].join(" ")}
            />
        </div>
    );
}

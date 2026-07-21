'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string | null>
}

// Custom toolbar with image upload
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image'
]

export function RichTextEditor({ value, onChange, placeholder, onImageUpload }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)
  const quillRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle image upload
  useEffect(() => {
    if (!mounted || !onImageUpload) return

    const Quill = (window as any).Quill
    if (!Quill) return

    const toolbar = Quill.import('modules/toolbar')
    const originalImageHandler = toolbar.DEFAULTS.handlers?.image

    const imageHandler = function(this: any) {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()

      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return

        const imageUrl = await onImageUpload(file)
        if (imageUrl && this.quill) {
          const range = this.quill.getSelection(true)
          this.quill.insertEmbed(range.index, 'image', imageUrl)
          this.quill.setSelection(range.index + 1)
        }
      }
    }

    // Override image handler
    const quillInstance = quillRef.current?.getEditor?.()
    if (quillInstance) {
      const toolbar = quillInstance.getModule('toolbar')
      toolbar.addHandler('image', imageHandler)
    }
  }, [mounted, onImageUpload])

  if (!mounted) {
    return (
      <div className="min-h-[200px] border rounded-md p-4 bg-gray-50 animate-pulse">
        Chargement de l'éditeur...
      </div>
    )
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight: '200px' }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 16px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  )
}

// Display HTML content safely
export function RichTextDisplay({ content }: { content: string }) {
  return (
    <div 
      className="prose prose-lg max-w-none dark:prose-invert
        prose-headings:text-[#008751] prose-headings:font-bold
        prose-a:text-[#008751] prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-lg prose-img:shadow-md
        prose-ul:list-disc prose-ol:list-decimal
        prose-blockquote:border-l-[#008751] prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
      "
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

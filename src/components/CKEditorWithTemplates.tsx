import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Variable } from './VariableExtension';
import { convertVariablesToHtml } from './variableHelpers';
import './CKEditorWithTemplates.css';

export type Template = {
  id: string;
  name: string;
  content: string;
};

export type Variable = {
  key: string;
  label: string;
  defaultValue?: string;
};

interface CKEditorWithTemplatesProps {
  data?: string;
  onChange?: (data: string) => void;
  templates?: Template[];
  variables?: Variable[];
}

// Default templates
const defaultTemplates: Template[] = [
  {
    id: 'email-template',
    name: 'Email Template',
    content: '<p>Dear {{name}},</p><p>Thank you for your interest. Your order ID is: {{orderId}}.</p><p>Best regards,<br>Team</p>'
  },
  {
    id: 'invoice-template',
    name: 'Invoice Template',
    content: '<h2>Invoice</h2><p>Invoice Number: {{invoiceNumber}}</p><p>Date: {{date}}</p><p>Amount: {{amount}}</p><p>Thank you for your business!</p>'
  }
];

// Default variables
const defaultVariables: Variable[] = [
  { key: 'name', label: 'Name', defaultValue: 'John Doe' },
  { key: 'orderId', label: 'Order ID', defaultValue: 'ORD-12345' },
  { key: 'invoiceNumber', label: 'Invoice Number', defaultValue: 'INV-001' },
  { key: 'date', label: 'Date', defaultValue: new Date().toLocaleDateString() },
  { key: 'amount', label: 'Amount', defaultValue: '$0.00' }
];

export default function CKEditorWithTemplates({
  data = '',
  onChange,
  templates = defaultTemplates,
  variables = defaultVariables
}: CKEditorWithTemplatesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Variable],
    content: data ? convertVariablesToHtml(data) : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when data prop changes
  useEffect(() => {
    if (editor && data !== editor.getHTML()) {
      const convertedHtml = convertVariablesToHtml(data);
      editor.commands.setContent(convertedHtml, false);
    }
  }, [data, editor]);

  // Insert template into editor
  const insertTemplate = (template: Template) => {
    if (editor) {
      const convertedHtml = convertVariablesToHtml(template.content);
      editor.commands.setContent(convertedHtml);
      setShowTemplates(false);
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    }
  };

  // Insert variable placeholder into editor
  const insertVariable = (variable: Variable) => {
    if (editor) {
      editor.commands.insertVariable({
        key: variable.key,
        label: variable.label,
      });
      setShowVariables(false);
    }
  };

  // Get variable values from user and replace Variable nodes with text
  const fillVariables = () => {
    if (!editor) return;
    
    const { state } = editor;
    const { doc } = state;
    const variableValues: Record<string, string> = {};
    
    // Extract variables from the document and collect their values
    doc.descendants((node: any) => {
      if (node.type.name === 'variable') {
        const key = node.attrs.key;
        const variable = variables.find(v => v.key === key);
        if (variable) {
          variableValues[key] = variable.defaultValue || '';
        }
      }
    });

    // Replace Variable nodes with their values
    let newContent = editor.getHTML();
    Object.entries(variableValues).forEach(([key, value]) => {
      // Replace variable span elements with the value
      const regex = new RegExp(`<span data-type="variable" data-key="${key}"[^>]*>\\{\\{${key}\\}\\}<\\/span>`, 'g');
      newContent = newContent.replace(regex, value);
    });

    editor.commands.setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
        setShowVariables(false);
      }
    };

    if (showTemplates || showVariables) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTemplates, showVariables]);

  if (!editor) {
    return null;
  }

  return (
    <div className="ckeditor-with-templates" ref={containerRef}>
      <div className="toolbar-actions">
        <div className="toolbar-group">
          <div className="dropdown-container">
            <button
              type="button"
              onClick={() => {
                setShowTemplates(!showTemplates);
                setShowVariables(false);
              }}
              className="toolbar-btn"
            >
              📄 Templates
            </button>
            {showTemplates && (
              <div className="dropdown-menu templates-dropdown">
                <div className="dropdown-header">Select a Template</div>
                {templates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => insertTemplate(template)}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="dropdown-container">
            <button
              type="button"
              onClick={() => {
                setShowVariables(!showVariables);
                setShowTemplates(false);
              }}
              className="toolbar-btn"
            >
              🔤 Variables
            </button>
            {showVariables && (
              <div className="dropdown-menu variables-dropdown">
                <div className="dropdown-header">Insert Variable</div>
                {variables.map(variable => (
                  <button
                    key={variable.key}
                    type="button"
                    className="dropdown-item"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable.label} ({`{{${variable.key}}}`})
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={fillVariables}
            className="toolbar-btn"
          >
            ✨ Fill Variables
          </button>
        </div>

        {/* Tiptap Toolbar */}
        <div className="tiptap-toolbar">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
          >
            <s>S</s>
          </button>
          <div className="toolbar-separator"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
          >
            H3
          </button>
          <div className="toolbar-separator"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          >
            "
          </button>
          <div className="toolbar-separator"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-btn"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-btn"
          >
            ↷
          </button>
        </div>
      </div>

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

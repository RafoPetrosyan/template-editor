import { useState } from 'react'
import CKEditorWithTemplates from './components/CKEditorWithTemplates'
import type { Template, Variable } from './components/CKEditorWithTemplates'
import './App.css'

function App() {
  const [editorContent, setEditorContent] = useState('')

  // Custom templates
  const customTemplates: Template[] = [
    {
      id: 'welcome-email',
      name: 'Welcome Email',
      content: '<h2>Welcome {{name}}!</h2><p>Thank you for joining us. Your account has been created successfully.</p><p>Your username is: <strong>{{username}}</strong></p><p>Best regards,<br>{{companyName}}</p>'
    },
    {
      id: 'invoice',
      name: 'Invoice',
      content: '<h2>Invoice #{{invoiceNumber}}</h2><p><strong>Date:</strong> {{date}}</p><p><strong>Bill To:</strong> {{customerName}}</p><p><strong>Amount Due:</strong> {{amount}}</p><p>Thank you for your business!</p>'
    },
    {
      id: 'notification',
      name: 'Notification',
      content: '<p>Hello {{name}},</p><p>This is a notification regarding: {{subject}}</p><p>{{message}}</p><p>Thank you,<br>{{senderName}}</p>'
    }
  ]

  // Custom variables
  const customVariables: Variable[] = [
    { key: 'name', label: 'Name', defaultValue: 'John Doe' },
    { key: 'username', label: 'Username', defaultValue: 'johndoe' },
    { key: 'companyName', label: 'Company Name', defaultValue: 'Your Company' },
    { key: 'invoiceNumber', label: 'Invoice Number', defaultValue: 'INV-001' },
    { key: 'date', label: 'Date', defaultValue: new Date().toLocaleDateString() },
    { key: 'customerName', label: 'Customer Name', defaultValue: 'Customer Name' },
    { key: 'amount', label: 'Amount', defaultValue: '$0.00' },
    { key: 'subject', label: 'Subject', defaultValue: 'Important Notice' },
    { key: 'message', label: 'Message', defaultValue: 'Your message here' },
    { key: 'senderName', label: 'Sender Name', defaultValue: 'Admin' }
  ]

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Rich Text Editor with Templates & Variables</h1>
        <p>Free template and variable system powered by Tiptap</p>
      </header>
      
      <main className="app-main">
        <div className="editor-wrapper">
          <CKEditorWithTemplates
            data={editorContent}
            onChange={(data) => {
              setEditorContent(data)
              console.log('Editor content:', data)
            }}
            templates={customTemplates}
            variables={customVariables}
          />
        </div>

        <div className="info-panel">
          <h3>How to use:</h3>
          <ol>
            <li><strong>Templates:</strong> Click "Templates" to insert a predefined template</li>
            <li><strong>Variables:</strong> Click "Variables" to insert variable placeholders like <code>{'{{name}}'}</code></li>
            <li><strong>Fill Variables:</strong> Click "Fill Variables" to replace placeholders with default values</li>
          </ol>
          
          <h3>Variable Format:</h3>
          <p>Variables use the format: <code>{'{{variableKey}}'}</code></p>
          
          <h3>Current Content Preview:</h3>
          <div className="content-preview" dangerouslySetInnerHTML={{ __html: editorContent || '<p>No content yet...</p>' }} />
        </div>
      </main>
    </div>
  )
}

export default App

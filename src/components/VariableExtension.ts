import { Node, mergeAttributes } from '@tiptap/core';

export interface VariableOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      /**
       * Insert a variable
       */
      insertVariable: (options: { key: string; label: string }) => ReturnType;
    };
  }
}

export const Variable = Node.create<VariableOptions>({
  name: 'variable',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  inline: true,

  atom: true, // Makes it atomic - can't edit individual characters

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-key'),
        renderHTML: (attributes) => {
          if (!attributes.key) {
            return {};
          }
          return {
            'data-key': attributes.key,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }
          return {
            'data-label': attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ];
  },


  renderHTML({ node, HTMLAttributes }) {
    const key = node.attrs.key || 'variable';
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'variable',
        class: 'variable-node',
        style: 'font-weight: bold; color: #0066cc; background-color: #e6f2ff; padding: 2px 4px; border-radius: 3px;',
      }),
      `{{${key}}}`,
    ];
  },

  addCommands() {
    return {
      insertVariable:
        (options: { key: string; label: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state } = this.editor;
        const { selection, tr } = state;
        const { $from } = selection;

        if (!$from.parentOffset) {
          const nodeBefore = $from.nodeBefore;
          if (nodeBefore && nodeBefore.type.name === 'variable') {
            const pos = $from.pos - nodeBefore.nodeSize;
            tr.delete(pos, $from.pos);
            this.editor.view.dispatch(tr);
            return true;
          }
        }

        return false;
      },
      Delete: () => {
        const { state } = this.editor;
        const { selection, tr } = state;
        const { $from } = selection;

        const nodeAfter = $from.nodeAfter;
        if (nodeAfter && nodeAfter.type.name === 'variable') {
          tr.delete($from.pos, $from.pos + nodeAfter.nodeSize);
          this.editor.view.dispatch(tr);
          return true;
        }

        return false;
      },
    };
  },
});


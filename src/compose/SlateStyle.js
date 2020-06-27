import React, {useState, useRef} from 'react';
import isUrl from 'is-url';
import {Transforms, Editor, Range} from 'slate';
import {useSlate, ReactEditor, useReadOnly, useSelected} from 'slate-react';

const LIST_TYPES = ['numbered-list', 'bulleted-list']

class selection {
    constructor() {
        this._editor = useSlate()
        this.currentSelection = this._editor.selection;
        this.freezeSelection = false;
    }

    getSelection() {
        return this.freezeSelection ? this.currentSelection : this._editor.selection;
    };

    freezeSelection(selection) {
        this.freezeSelection = true;
        this.currentSelection = selection;
    }
}

export const StylePanel = (props) => {
    const editor = useSlate()
    const selection = editor.selection
    console.log(selection);
    const {currentSelection, setSelection} = (selection)
    console.log(currentSelection);

    if (props.display) {

        if (
            !currentSelection  ||
      //      !ReactEditor.isFocused(editor) ||
            Range.isCollapsed(currentSelection) //||
         //   Editor.string(editor, selection) === ''
        ) {
            return null;
        } else {
            return (
            <div className='stylePanel'>
                    <MarkButton format="bold" icon="fas fa-bold" />
                    <MarkButton format="italic" icon="fas fa-italic" />
                    <MarkButton format="underline" icon="fas fa-underline" />
                    <MarkButton format="strikethrough" icon="fas fa-strikethrough" />
                    <MarkButton format="code" icon="fas fa-strikethrough" />
                    <BlockButton format="heading-one" icon="fas fa-heading" />
                    <BlockButton format="block-quote" icon="fas fa-quote-left" />
                    <BlockButton format="numbered-list" icon="fas fa-list-ol" />
                    <BlockButton format="bulleted-list" icon="fas fa-list-ul" />
                    <BlockButton format="align-center" icon="fas fa-align-center" />
                    <LinkButton icon="fas fa-link" selector={setSelection}/>
                   {/* <LinkButton onOpen={onOpenSubmenu} onClose={onCloseSubmenu} />
                    <ConceptButton onOpen={onOpenSubmenu} onClose={onCloseSubmenu} />
                    <DelinkButton icon="fas fa-unlink"/> */}
            </div>
            )
        }
    } else {
        return null;
    }
}

/*
    constructor() {
        super();
        this.onToggle = () => {
            this.props.onToggle(this.props.style);
            if (this.props.click) {
                this.props.click();
            };
        };
    }
*/
const StyleInput = ({showURL, setSelection}) => {
    

    const editor = useSlate()
    const setSelect = (e) => {
        e.preventDefault()
        ReactEditor.focus();
        const currentSelection = editor.selection;
        setSelection(currentSelection);
        ReactEditor.blur();
     //   Transforms.setSelection(currentSelection)
    }

    return (
        <div style={{visibility: showURL ? 'visible' : 'hidden'}}>
            <input
                onFocus={setSelect}
              //  onMouseDown={setSelect()}
             //   onKeyDown={setSelect()}
             //   onBlur={setSelect()}
                //onInput={setSelect()}
                // ref="url"
                type="text"
                value=""
            />
            <button> 
                Confirm
            </button>
        </div>
    )
}; 




export const Element = ({ attributes, children, element }) => {
    switch (element.type) {
    case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
    case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
    case 'list-item':
        return <li {...attributes}>{children}</li>
    case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
    case 'align-center':
        return <p style={{textAlign: 'center'}} {...attributes}>{children}</p>
    case 'link':
        return (
            <a {...attributes} href={element.url}>
            {children}
            </a>
        )
    default:
        return <p {...attributes}>{children}</p>
    }
}
  
export const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.code) {
        children = <code>{children}</code>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }

    if (leaf.strikethrough) {
        children = <span style={{textDecoration: 'line-through'}}>{children}</span>
    }
    return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
    <span
        active={isBlockActive(editor, format)}
        onMouseDown={event => {
            event.preventDefault()
            toggleBlock(editor, format)
        }}
    >
        <i className={icon}/>
    </span>
    )
}
  
const MarkButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <span
        active={isMarkActive(editor, format)}
        onMouseDown={event => {
            event.preventDefault()
            toggleMark(editor, format)
        }}
        >
        <i className={icon} />
        </span>
    )
}


const LinkButton = ({icon}) => {
    const editor = useSlate()
    const [showURL, setURL] = useState(false);

    return (
        <div>
            <span
                active={isLinkActive(editor)}
                onMouseDown={event => {
                    event.preventDefault()
                    setURL(!showURL)
                    //const url = window.prompt('Enter the URL of the link:')
                    //if (!url) return
                    //insertLink(editor, url)
                }}
            >
                <i className={icon} />
            </span>
            <StyleInput showURL={showURL}/>
        </div>
    )
}
/*
const LinkButton = ({onOpen, onClose}) => {
    const editor = useSlate()
    const [linkButtonOpen, setLinkButtonOpen] = useState(false)
    const [url, setUrl] = useState(null)
    const [selection, setSelection] = useState(undefined)
    const ref = useRef()
    const onClosePopover = () => {
      setLinkButtonOpen(false)
      onClose()
    }
    const insertAndClose = () => {
      Transforms.select(editor, selection)
      insertLink(editor, url)
      onClosePopover()
    }
    return (
      <>
        <span
          ref={ref}
          title="Insert Link"
          size="small"
          active={isLinkActive(editor)}
          onClick={() => {
            onOpen()
            setSelection(editor.selection)
            setLinkButtonOpen(!linkButtonOpen)
          }}
        >
          insertlink
        </span>
        <div
          open={linkButtonOpen}
          onClose={onClosePopover}
          anchorEl={ref.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <input autoFocus placeholder="Paste your link here..."
                     size="small" variant="outlined"
                     value={url || ""}
                     onKeyDown={e => {
                       if (e.keyCode === 13) {
                         e.preventDefault()
                         insertAndClose()
                       }
                     }}
                     onChange={e => {
                       setUrl(e.target.value)
                     }}/>
          <button onClick={() => {
            insertAndClose()
          }}>
            Link
          </button>
        </div>
      </>
    )
  }
  */
const DelinkButton = ({icon}) => {
    const editor = useSlate();

    return (
        <span
            onMouseDown={event => {
                event.preventDefault()
                unwrapLink(editor)
            }}
        >
            <i className={icon}/>
        </span>
    )
}
  
const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format)
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n => LIST_TYPES.includes(n.type),
        split: true,
    })

    Transforms.setNodes(editor, {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    })

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}

const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n => n.type === format,
    })
    return !!match
}

export const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format)
  
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
}
  
  
const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

export const withLinks = editor => {
    const { insertData, insertText, isInline } = editor

    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.insertText = text => {
        if (text && isUrl(text)) {
            wrapLink(editor, text)
        } else {
            insertText(text)
        }
    }

    editor.insertData = data => {
        const text = data.getData('text/plain')

        if (text && isUrl(text)) {
            wrapLink(editor, text)
        } else {
            insertData(data)
        }
    }

    return editor
}
  
const insertLink = (editor, url) => {
    if (editor.selection) {
        wrapLink(editor, url)
    }
}
  
const isLinkActive = editor => {
    const [link] = Editor.nodes(editor, { match: n => n.type === 'link' })
    return !!link
}
  
const unwrapLink = editor => {
    Transforms.unwrapNodes(editor, { match: n => n.type === 'link' })
}
  
const wrapLink = (editor, url) => {
    if (isLinkActive(editor)) {
        unwrapLink(editor)
    }

    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)
    const link = {
        type: 'link',
        url,
        children: isCollapsed ? [{ text: url }] : [],
    }

    if (isCollapsed) {
        Transforms.insertNodes(editor, link)
    } else {
        Transforms.wrapNodes(editor, link, { split: true })
        Transforms.collapse(editor, { edge: 'end' })
    }
}
  
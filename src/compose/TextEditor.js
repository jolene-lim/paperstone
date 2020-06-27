import React from 'react';
import {Editor, EditorState, Modifier, CompositeDecorator} from 'draft-js';
import {STYLEMAP, COLOR, HIGHLIGHT} from './STYLES.js';
import {StylePanel, StyleInput} from './StylePanel'
import ExtendedRichUtils, {ALIGNMENT_DATA_KEY} from './ExtendedRichUtils'

export default class TextEdit extends React.Component {
    constructor(props) {
        super(props);

        const decorator = new CompositeDecorator([
            {
              strategy: findLinkEntities,
              component: Link,
            },
          ]);

          this.state = {
            editorState: EditorState.createEmpty(decorator),
            urlValue: '',
            stylePopup: false
        };

        this.onChange = this.onChange.bind(this);
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleAlignment = (alignment) => this._toggleAlignment(alignment);
        this.toggleColor = (color) => this._toggleColor(color);
        this.toggleHighlight = (highlight) => this._toggleHighlight(highlight);
      //  this.blockStyler = this.blockStyler.bind(this);

        this.promptForLink = this._promptForLink.bind(this);
        this.onURLChange = (e) => this.setState({urlValue: e.target.value});
        this.confirmLink = this._confirmLink.bind(this);
        this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
        this.removeLink = this._removeLink.bind(this);  
    };

    onChange(editorState) {
        this._toggleStylePanel(editorState);
        this.setState({editorState});
    };

    handleKeyCommand(command) {
        const newState = ExtendedRichUtils.handleKeyCommand(
          this.state.editorState,
          command
        );
        if (newState) {
          this.onChange(newState);
          return "handled";
        }
        return "not-handled";
      };
        
    _toggleStylePanel(editorState) {
        const currentContentState = this.state.editorState.getCurrentContent();
        const newContentState = editorState.getCurrentContent();
        const newSelection = editorState.getSelection();
        const {focusOffset, anchorOffset, hasFocus} = newSelection;
        const offset = focusOffset - anchorOffset;
        const changeType = editorState.getLastChangeType();

        if (this.props.stylePopup) {
        
            /* NEED INTEGRATION WITH OUTSIDE FUNCTION TO CAPTURE REASON FOR FOCUS/SET 'FOCUS' APPROPRIATELY
            if (!hasFocus) {
                this.setState({stylePopup: false});
            } 
            */
            
            if (currentContentState === newContentState && offset !== 0) { // selected
                this.setState({stylePopup: true});
            } else if ((changeType === 'change-block-type' || changeType === 'change-inline-style')
                        && offset !== 0) { // content not the same due to change in block type
                this.setState({stylePopup: true});
            } else {
                this.setState({stylePopup: false});
            }
        }
    };

    _onClick = (event) => {
      this.setState({mouseX: event.clientX - 100, mouseY: event.clientY + 15}) // HARDCODED OFFSET, SET TO VARIABLE (GET WIDTH OF PANEL)
    }

    blockStyleFn = (contentBlock) => {
        const textAlignStyle = contentBlock.getData().get(ALIGNMENT_DATA_KEY);
        switch (textAlignStyle) {
            case 'RIGHT':
                return `align-right`;
            case 'CENTER':
                return `align-center`;
            case 'LEFT':
                return `align-left`;
            case 'JUSTIFY':
                return `align-justify`;
            default:
                return `align-left`;
        }
    }
    
    _toggleInlineStyle(inlineStyle) {
        this.onChange(ExtendedRichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
    }

    _toggleBlockType(blockType) {
        this.onChange(ExtendedRichUtils.toggleBlockType(this.state.editorState, blockType));
    }

    _toggleAlignment(alignment) {
        this.onChange(ExtendedRichUtils.toggleAlignment(this.state.editorState, alignment));
    }
    
    _toggleColor(toggledColor) {
      const {editorState} = this.state;
      const selection = editorState.getSelection();

      // Let's just allow one color at a time. Turn off all active colors.
      const nextContentState = COLOR.map((color) => color.style)
        .reduce((contentState, color) => {
          return Modifier.removeInlineStyle(contentState, selection, color)
        }, editorState.getCurrentContent());

      let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
      );

      const currentStyle = editorState.getCurrentInlineStyle();

      // Unset style override for current color.
      if (selection.isCollapsed()) {
        nextEditorState = currentStyle.reduce((state, color) => {
          return ExtendedRichUtils.toggleInlineStyle(state, color);
        }, nextEditorState);
      }

      // If the color is being toggled on, apply it.
      if (!currentStyle.has(toggledColor)) {
        nextEditorState = ExtendedRichUtils.toggleInlineStyle(
          nextEditorState,
          toggledColor
        );
      }

      this.onChange(nextEditorState);
    }

    _toggleHighlight(toggledHighlight) {
      const {editorState} = this.state;
      const selection = editorState.getSelection();

      // Let's just allow one color at a time. Turn off all active colors.
      const nextContentState = HIGHLIGHT.map((color) => color.style)
        .reduce((contentState, color) => {
          return Modifier.removeInlineStyle(contentState, selection, color)
        }, editorState.getCurrentContent());

      let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
      );

      const currentStyle = editorState.getCurrentInlineStyle();

      // Unset style override for current color.
      if (selection.isCollapsed()) {
        nextEditorState = currentStyle.reduce((state, color) => {
          return ExtendedRichUtils.toggleInlineStyle(state, color);
        }, nextEditorState);
      }

      // If the color is being toggled on, apply it.
      if (!currentStyle.has(toggledHighlight)) {
        nextEditorState = ExtendedRichUtils.toggleInlineStyle(
          nextEditorState,
          toggledHighlight
        );
      }

      this.onChange(nextEditorState);
    }

    _promptForLink() {
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
          const contentState = editorState.getCurrentContent();
          const startKey = editorState.getSelection().getStartKey();
          const startOffset = editorState.getSelection().getStartOffset();
          const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
          const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
  
          let url = '';
          if (linkKey) {
            const linkInstance = contentState.getEntity(linkKey);
            url = linkInstance.getData().url;
          }
  
          this.setState({
            urlValue: url,
          });
        }
      }
  
      _confirmLink() {
        const {editorState, urlValue} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          'LINK',
          'MUTABLE',
          {url: urlValue}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        this.setState({
          editorState: ExtendedRichUtils.toggleLink(
            newEditorState,
            newEditorState.getSelection(),
            entityKey
          ),
          urlValue: '',
        });
      }
  
      _onLinkInputKeyDown(e) {
        if (e.which === 13) {
          this._confirmLink(e);
        }
      }
  
      _removeLink() {
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
          this.setState({
            editorState: ExtendedRichUtils.toggleLink(editorState, selection, null),
          });
        }
      }
  
    render() {
        let urlInput =
            <StyleInput
                key='add-link'
                onChange={this.onURLChange}
                ref="url"
                type="text"
                value={this.state.urlValue}
                onKeyDown={this.onLinkInputKeyDown}
                onToggle={this.confirmLink}
            />

        return (
            <>
              <div onClick={this._onClick}>
                <Editor
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    onChange={this.onChange}
                    placeholder={this.props.placeholder}
                    customStyleMap={STYLEMAP}
                    blockStyleFn={this.blockStyleFn}
                />    
              </div>                
              <StylePanel 
                  display={this.state.stylePopup} 
                  style={{left: this.state.mouseX, top: this.state.mouseY, visibility: this.state.stylePopup? 'visible' : 'hidden'}}
                  editorState={this.state.editorState}
                  onToggleStyle={this.toggleInlineStyle}
                  onToggleBlock={this.toggleBlockType}
                  onToggleColor={this.toggleColor}
                  onToggleHighlight={this.toggleHighlight}
                  onToggleAlignment={this.toggleAlignment}
                  onAddLink={this.promptForLink}
                  onRemoveLink={this.removeLink}
                  urlInput={urlInput}
              />
          </>
        );
    }
};


function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
        (character) => {
        const entityKey = character.getEntity();
        return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'LINK'
        );
        },
        callback
    );
}

const Link = (props) => {
    const {url} = props.contentState.getEntity(props.entityKey).getData();
    return (
        <a href={url}>
        {props.children}
        </a>
    );
};
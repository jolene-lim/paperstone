import React from 'react';
import ReactDOM from 'react-dom';
import {STYLES, BLOCK, LIST, ALIGN, COLOR, HIGHLIGHT, STYLEMAP} from './STYLES.js';

export class StylePanel extends React.Component {
    constructor() {
        super();
        this.state = {
            'fas fa-link': false,
            'fas fa-list': false,
            'fas fa-img': false,
            'fas fa-font': false,
            'fas fa-highlighter': false
        }
        this.onclick = this.onClick.bind(this);
    }

    onClick = (e) => {
        let buttonClicked = e.target.id;
        let closeButtons = Object.keys(this.state);
        closeButtons = closeButtons.filter(button => button !== buttonClicked)
        this.setState((state) => ({
            [buttonClicked]: !state[buttonClicked],
            [closeButtons[0]]: false,
            [closeButtons[1]]: false,
            [closeButtons[2]]: false,
            [closeButtons[3]]: false
        }))
    };

    componentDidUpdate() {
        let hasTrue = Object.values(this.state).reduce((x, y) => (x + y))
        if (hasTrue > 0 & !this.props.display) {
            this.setState((state) => ({
                'fas fa-link': false,
                'fas fa-list': false,
                'fas fa-img': false,
                'fas fa-font': false,
                'fas fa-highlighter': false
            }))
        }
    }

    render(){
        
        const currentStyle = this.props.editorState.getCurrentInlineStyle();
        const {editorState} = this.props;
        const selection = editorState.getSelection();
        const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();  
        let color, highlight;

        for (let style of COLOR.map(color => color.style)) {
            if (currentStyle.has(style)) {
                color = style;
            }
        };

        for (let style of HIGHLIGHT.map(color => color.style)) {
            if (currentStyle.has(style)) {
                highlight = style;
            }
        };

        return (
            <div className='stylePanel' style={this.props.style} id={this.props.display? 'stylePanel': null}>
                {STYLES.map(
                    type => <StyleButton
                    onClick={this.onClick}
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={this.props.onToggleStyle}
                    style={type.style}
                    />)
                }
                {BLOCK.map(
                    (type) => <StyleButton
                    onClick={this.onClick}
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={this.props.onToggleBlock}
                    style={type.style}
                    />)
                }
                <StyleCollapse
                    display={this.props.display}
                    label = 'fas fa-font'
                    show={this.state['fas fa-font']}
                    style={color}
                    onClick={this.onClick}
                    onMouseDown={this.props.onAddLink}
                    buttons = {
                        COLOR.map(
                            (type, idx) => <StyleButton
                            key={type.label+idx}
                            active={currentStyle.has(type.style)}
                            label={type.label}
                            onToggle={this.props.onToggleColor}
                            style={type.style}
                            />
                        )
                    }
                />
                <StyleCollapse
                    display={this.props.display}
                    label = 'fas fa-highlighter'
                    show={this.state['fas fa-highlighter']}
                    onClick={this.onClick}
                    style={highlight}
                    buttons = {
                        HIGHLIGHT.map(
                            (type, idx) => <StyleButton
                            key={type.label+idx}
                            active={currentStyle.has(type.style)}
                            label={type.label}
                            onToggle={this.props.onToggleHighlight}
                            style={type.style}
                            />
                        )
                    }
                />
                <StyleCollapse
                    display={this.props.display}
                    label = 'fas fa-link'
                    show={this.state['fas fa-link']}
                    onClick={this.onClick}
                    buttons = {[
                        this.props.urlInput,
                        <StyleButton 
                            key='remove link'
                            active={false}
                            label='fas fa-unlink'
                            onToggle={this.props.onRemoveLink}
                        />
                    ]}
                />
                <StyleCollapse 
                    display={this.props.display}
                    label = 'fas fa-list'
                    show={this.state['fas fa-list']}
                    onClick={this.onClick}
                    buttons = {
                        LIST.map(
                            (type) => <StyleButton
                            key={type.label}
                            active={type.style === blockType}
                            label={type.label}
                            onToggle={this.props.onToggleBlock}
                            style={type.style}
                        />)
                    }
                />
                {/*<StyleCollapse
                    label = 'fas fa-align-left'
                    buttons = {
                        ALIGN.map(
                            (alignment) => <StyleButton
                            key={alignment.label}
                            active={alignment.style === blockType}
                            label={alignment.label}
                            onToggle={props.onToggleAlignment}
                            style={alignment.style}
                        />)
                    }
                />
                */}
            </div>
        )
    }
};

class StyleCollapse extends React.Component {
    constructor() {
        super();
        this.onMouseDown = this.onMouseDown.bind(this);
    };

    onMouseDown() {
        if (this.props.onMouseDown) {
            this.props.onMouseDown();
        }
    };

    render() {
        return(
            <>
            <StyleButton id={this.props.label} onToggle={this.onMouseDown} label={this.props.label} active={this.props.show} style={this.props.style} onClick={this.props.onClick}/>
            <StyleMenu show={this.props.show} display={this.props.display} buttons={this.props.buttons} label={this.props.label}/>
            </>
        )
    }
};

const StyleMenu = (props) => {
    let button = document.getElementById(props.label);
    let stylepanel = document.getElementById('stylePanel');
    
    if (props.show & props.display & stylepanel != null) {

        let x = stylepanel.offsetLeft + button.offsetLeft;
        let y = stylepanel.offsetTop + stylepanel.offsetHeight;
    
        return ReactDOM.createPortal( // add x and y
            <div className='style-menu stylePanel' style={{top: y, left: x}}>
                {props.buttons}
            </div>,
            document.getElementById('textEditor')
        );
        
    } else {
        return null;
    }
};

class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = () => {
            this.props.onToggle(this.props.style);            
        };

        this.onClick = () => {
            if (this.props.onClick) {
                this.props.onClick();
            };
        }
    }

    render() {
        let className = 'styleButton'; // NOTE TO SELF: use this to change CSS of active
        let color;

        if (this.props.active) {
            className += ' active';
        }

        if (this.props.style) {
            if (COLOR.map((color) => color.style).includes(this.props.style)) { // button is a COLOR button
                color = STYLEMAP[this.props.style]['color']
            } else if (HIGHLIGHT.map((color) => color.style).includes(this.props.style)) { // button is a HIGHLIGHT button
                color = STYLEMAP[this.props.style]['backgroundColor']
            }
        }

        return (
            <div 
                id={this.props.label}
                className={className}
                style={{color: color}}
                onMouseDown={this.onToggle} 
                onClick={this.props.onClick}
                //dangerouslySetInnerHTML={{__html: feather.icons[this.props.label].toSvg({height: 15})}}
            >
                <i className={this.props.label} id={this.props.label}></i>
            </div>
        );
    }
};

export class StyleInput extends React.Component {
    constructor() {
        super();
        this.onToggle = () => {
            this.props.onToggle(this.props.style);
            if (this.props.click) {
                this.props.click();
            };
        };
    }

    render() {
        return (
            <div>
              <input
                onChange={this.props.onURLChange}
                ref="url"
                type="text"
                value={this.props.urlValue}
                onKeyDown={this.props.onLinkInputKeyDown}
              />
              <button onMouseDown={this.onToggle}>
                Confirm
              </button>
            </div>
        )
    }
};
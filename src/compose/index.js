import React from 'react';
import TextEditor from './TextEditor';
import 'draft-js/dist/Draft.css';
import './compose.scss';
import RichTextExample from './SlateEditor';

export default class Compose extends React.Component {
    render() {
        return (
            <div className='container'>
                <div className='content'>
                    <div className='title'>
                        {<TextEditor placeholder='Title' />}
                        {/*<RichTextExample placeholder='Title' class='TextEditor'/>*/}
                        {/*<textarea/>*/}
                    </div>
                    <div className='textEditor' id='textEditor'>
                        <TextEditor placeholder='Write Something...' stylePopup={true} />
                        {/*<RichTextExample placeholder='Write Something' display={true}/>*/}
                    </div>
                </div>
            </div>
        )
    }
};


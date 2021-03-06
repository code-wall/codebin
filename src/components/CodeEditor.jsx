import React from "react"

import {MAX_NUMBER_LINES} from "../constants/config.js";
import * as log from "../log.js"
import Shortcuts from '../util/shortcuts';

class CodeEditor extends React.Component{

    componentDidMount() {
        CodeMirror.modeURL = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/mode/%N/%N.min.js";

        const {snippet} = this.props;
        this.currentLanguage = snippet.language.toLowerCase();
        log.debug("Snippet: ", snippet);
        const textareaNode = this.refs.textarea;
        let options = {
            lineNumbers: true,
            readOnly   : false,
            mode       : snippet.language.toLowerCase(),
            theme      : "solarized dark"
        };
        log.debug("Codemirror Options: ");
        log.debug(options);
        this.codeMirror = CodeMirror.fromTextArea(textareaNode, options);
        this.loadLanguage(snippet.language.toLowerCase());
        this.codeMirror.on("blur", this.editorBlurred.bind(this));
        this.codeMirror.on("focus", this.editorFocused.bind(this));
        this.codeMirror.on("beforeChange", this.editorBeforeChange.bind(this));
        Shortcuts.save(() => { this.editorSave() });        
    }

    editorBlurred(codemirrorObj) {
        log.debug("Editor Blurred");
        let codemirrorVal = this.codeMirror.getValue();
        if (this.props.snippet.code != codemirrorVal) {
            this.props.setCode(codemirrorVal);
        }
    }

    editorFocused(codemirrorObj) {
        log.debug("Editor focussed");
        log.debug(this.props.snippet.clearOnFocus);
        if (this.props.snippet.clearOnFocus) {
            log.debug("Setting code");
            this.props.setCode("");
            this.props.setClearOnFocus(false);
        }
    }

    editorSave() {
        let codemirrorVal = this.codeMirror.getValue();
        if (this.props.snippet.code != codemirrorVal) {
            this.props.setCode(codemirrorVal);
        }
        this.props.saveSnippet();
    }

    /**
     * Event Handler fired just before change, allows us to cancel the change
     * @param cmObj
     * @param change
     */
    editorBeforeChange(cmObj, change) {
        if (cmObj.lineCount() === MAX_NUMBER_LINES && change.text.length > 1) {
            // @todo: We should show a notification telling the user they have entered too many lines
            change.cancel();
            log.debug("Entering too many lines - ")
        }
    }

    loadLanguage(language) {
        // We need to load this new language
        let langInfo = CodeMirror.findModeByName(language);
        let mode = langInfo.mode;
        this.codeMirror.setOption("mode", langInfo.mime);
        CodeMirror.autoLoadMode(this.codeMirror, langInfo.mode);
        this.currentLanguage = language;
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(property) {
        log.debug("Components receiving props");
        let newLang = property.snippet.language.toLowerCase();
        let newCode = property.snippet.code;
        if (this.currentLanguage && this.currentLanguage != newLang) {
            this.loadLanguage(newLang);
        }
        if (this.codeMirror.getValue() !== newCode) {
            this.codeMirror.setValue(newCode);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render() {
        return (
            <div className="editorContainer">
                <textarea ref="textarea" defaultValue={this.props.snippet.code}/>
            </div>
        );
    }

    
}

CodeEditor.propTypes = {
    snippet        : React.PropTypes.object.isRequired,
    setCode        : React.PropTypes.func.isRequired,
    setClearOnFocus: React.PropTypes.func.isRequired,
    saveSnippet    : React.PropTypes.func.isRequired,    
};

export default CodeEditor;
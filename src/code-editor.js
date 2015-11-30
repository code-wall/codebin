"use strict";

import * as config from "./config";


/**
 * Class wrap the CodeMirror library
 * and provides all the logic for saving
 * and getting a new code editor
 */
export default class CodeEditor {

    /**
     * Creates a new code editor from a text area
     * @param {DOMElement} textArea
     */
    constructor(textArea) {
        this.options = {
            mode       : config.DEFAULT_LANG,
            lineNumbers: true,
            theme      : "solarized dark"
        };

        this.codeMirror = CodeMirror.fromTextArea(textArea, this.options);
        this.lastValue = "";
    }

    /**
     * Return the current value of the code editor
     * @returns {string}
     */
    getValue() {
        return this.codeMirror.getValue();
    }

    setLanguage(language) {
        this.options.mode = language;
        this.codeMirror.setOption("mode", language);
        let lang = this.codeMirror.getOption("mode");
    }

    /**
     * Checks that the value has changed since the last save
     * and if so will make a post request to backend to save snippet
     * and create a new unique url that can be used to share snippet
     * @returns {Promise}
     */
    saveAndGetLink() {
        let snippet = this.codeMirror.getValue();
        let language = this.options.mode;
        if (this.lastValue === snippet) {
            return Promise.resolve();
        }
        else {
            this.lastValue = snippet;
            return new Promise(function(resolve, reject) {
                CodeEditor.xmlReq(
                    "/save-snippet",
                    "POST",
                    {language: language, snippet: snippet})
                    .then(function(resp) {
                        let snippetId = resp.id;
                        let shareLink = window.location.protocol + "//"
                                        + window.location.host
                                        + "?" + config.SNIPPET_QUERY_PARAM + "="
                                        + snippetId;
                        resolve(shareLink);
                    })
                    .catch(function(err) {
                        console.error("No post response");
                        reject("Error", err);
                    });
            });
        }

    }

    /**
     * Static method that wraps XMLHttpRequest in a promise
     * @param {string} url - url to make the request to
     * @param {'POST'|'GET'} type
     * @param {object} params - optional params to pass
     * @returns {Promise}
     */
    static xmlReq(url, type, params={}) {
        return new Promise(function(resolve, reject) {
            let xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    let response = JSON.parse(xhttp.responseText);
                    if (response.status == config.RESPONSE_SUCCESS_STATUS) {
                        resolve(response.response);
                    } else {
                        // Reject entire response. Calling method can deal with error
                        reject(response);
                    }
                }
            };
            xhttp.onerror = function(err) {
                reject(err);
            };
            xhttp.open(type, url, true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            let queryStr = Object.keys(params).reduce(function(a, k) {
                a.push(k + "=" + encodeURIComponent(params[k]));
                return a;
            }, []).join("&");

            xhttp.send(queryStr);
        });
    }
}
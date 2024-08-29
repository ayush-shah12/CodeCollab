import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useContext } from 'react';

import { UserContext } from '../UserContext/UserContext';

import CodeMirror, { highlightActiveLine, lineNumbers, placeholder } from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { copilot } from '@uiw/codemirror-theme-copilot';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';
import { consoleDark } from '@uiw/codemirror-theme-console'
import { EditorState } from '@uiw/react-codemirror';
import { EditorView } from '@uiw/react-codemirror';
import { basicSetup, minimalSetup } from '@uiw/codemirror-extensions-basic-setup';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { Container } from 'react-bootstrap';

import { getProblem } from '../api/action';
import { compileCode } from '../api/action';

import * as Y from 'yjs'
import { yCollab } from 'y-codemirror.next'
import { WebrtcProvider } from 'y-webrtc'

import * as random from 'lib0/random';

import { keymap } from "@codemirror/view";
import { indentLess, indentMore } from "@codemirror/commands";

import { insertTab } from '@codemirror/commands';

const CollabCode = () => {


    const { userInfo } = useContext(UserContext);
    const username = userInfo?.username;

    const [lang, setLang] = useState('C++');
    const [codeValue, setCodeValue] = useState("");
    const [problemValue, setProblemValue] = useState("");
    const [difficulty, setDifficulty] = useState('Easy');
    const [problem, setProblem] = useState(null);
    const [output, setOutput] = useState("");

    const langDict = {
        "C++": langs.cpp,
        "python3": langs.python,
        "java": langs.java,
        "JavaScript": langs.javascript,
        "C#": langs.csharp
    };

    const commentDict = {
        "C++": "//",
        "python3": "#",
        "java": "//",
        "JavaScript": "//",
        "C#": "//"
    };

    const startingCode = {
        "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n\tstd::cout << "CodeCollab";\n\treturn 0;\n}`,
        "python3": `print("CodeCollab")`,
        "java": `import java.util.*; \npublic class Main {\n\tpublic static void main(String[] args) {\n\t\t System.out.println("CodeCollab");\n\t}\n}`,
        "JavaScript": `console.log("CodeCollab");`,
        "C#": `using System;\n\npublic class HelloWorld {\n\n   public static void Main(string[] args){ \n      Console.WriteLine ("CodeCollab");\n   }\n} `
    };


    useEffect(() => {
        setCodeValue("");
        setOutput("");
        const commentSyntax = commentDict[lang];
    }, [lang]);

    //fetches the problem from the database, when difficulty is changed (initial = "Easy")
    useEffect(() => {
        async function fetchData() {
            const response = await getProblem(difficulty);
            const responseBody = await response.json();
            const title = responseBody[0].problem_title.replace(" ", "-");
            if (responseBody) {
                const problem = await fetch('https://alfa-leetcode-api.onrender.com/select?titleSlug=' + title);
                const problemData = await problem.json();
                setProblem(problemData);
                const commentSyntax = commentDict[lang];
                var html = problemData.question;
                var div = document.createElement("div");
                div.innerHTML = html;
                var text = div.textContent || div.innerText || "";
                var problemText = splitTextOnExample(text, "Example")[0];
                problemText = wrapText(problemText, 55); //only want to wrap the description
                var exampleText = splitTextOnExample(text, "Example")[1];
                setProblemValue('Current Difficulty: ' + difficulty + `\nQuestion Title: ${problemData.questionTitle} \n \n${problemText}\n \n\n${exampleText}`);
            }
        }
        fetchData();
    }, [difficulty]);

    // helper functions for formatting
    function splitTextOnExample(text, keyword) {
        const index = text.indexOf(keyword);

        if (index === -1) {
            return [text, ''];
        }

        const beforeExample = text.slice(0, index).trim();
        const afterExample = text.slice(index).trim(); // Includes the keyword and everything after

        return [beforeExample, afterExample];
    }
    function wrapText(text, maxLength) {
        const lines = [];


        while (text.length > maxLength) {
            // Find the last space within the maxLength limit
            let breakPoint = text.lastIndexOf(' ', maxLength);
            if (breakPoint === -1) {  // If no space found, break at maxLength
                breakPoint = maxLength;
            }
            lines.push(text.slice(0, breakPoint));
            text = text.slice(breakPoint).trim();
        }
        lines.push(text);

        return lines.join('\n');
    }

    //compiles the code
    async function handleCodeCompile() {
        const currentCode = editorView.current.state.doc.toString();
        setCodeValue(currentCode);
        const prev = output;
        setOutput(prev + "\nCompiling...");
        const result = await compileCode(currentCode, lang);
        const outputResults = await result.json();
        setOutput(prev + "\n\nCPU Time: " + outputResults.cpuTime + " seconds; Memory: " + outputResults.memory + " kilobyte(s)" + "\n\n" + outputResults.output + "\n\n");
    }

    const editorRef = useRef(null); 
    const editorView = useRef(null);

    // Initialize Yjs and WebRTC provider
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider('demo', ydoc);
    const ytext = ydoc.getText('codemirror');
    const undoManager = new Y.UndoManager(ytext);


    //runs once ONLY
    useEffect(() => {

        const usercolors = [
            { color: '#30bced', light: '#30bced33' },
            { color: '#6eeb83', light: '#6eeb8333' },
            { color: '#ffbc42', light: '#ffbc4233' },
            { color: '#ecd444', light: '#ecd44433' },
            { color: '#ee6352', light: '#ee635233' },
            { color: '#9ac2c9', light: '#9ac2c933' },
            { color: '#8acb88', light: '#8acb8833' },
            { color: '#1be7ff', light: '#1be7ff33' },
        ];

        // Select a random color for this user
        const userColor = usercolors[random.uint32() % usercolors.length];

        // Set user awareness
        provider.awareness.setLocalStateField('user', {
            name: username,
            color: userColor.color,
            colorLight: userColor.light,
        });
    }, []);

    //runs every time lang is changed
    useEffect(() => {

        if (editorView.current) { editorView.current.destroy(); }


        const state = EditorState.create({
            doc: ytext.toString(),
            extensions: [

                basicSetup({
                    defaultKeymap: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: true,
                    tabSize: 4
                }),
                keymap.of([
                    { key: "Tab", run: insertTab },
                    { key: "Shift-Tab", run: indentLess }
                ]),
                langDict[lang](),
                yCollab(ytext, provider.awareness, { undoManager }),
                copilot,
                lineNumbers(),
                EditorView.lineWrapping,
                highlightActiveLine(),
                EditorView.theme({
                    "&": { height: "100%" },  // Make sure the editor itself takes full height
                    ".cm-scroller": { overflow: "auto" },  // Enable scrolling inside the editor
                }),
            ],
        });

        editorView.current = new EditorView({
            state,
            parent: editorRef.current,
        });

        const setInitialCode = () => {
            const commentSyntax = commentDict[lang];
            const transaction = editorView.current.state.update({
                changes: {
                    from: 0,
                    to: editorView.current.state.doc.length,
                    insert: `${commentSyntax} Choose a Language From Above:\n${commentSyntax} Current Language Selected: ${lang} \n\n${startingCode[lang]}`
                }
            });
            editorView.current.dispatch(transaction);
            setCodeValue(editorView.current.state.doc.toString());
        };

        // Set the initial code after the editor view is initialized
        setInitialCode();

    }, [lang]);

    return (
        <div>
            <div style={{ height: "95vh", width: "85vw", "backgroundColor": "#282c34" }}>

                <Container className='d-flex flex-column' style={{ "position": "absolute", width: "85vw", height: "100%" }}>
                    <div className='d-flex menu-bar' style={{ height: '5vh', width: '85vw' }}>
                        <ButtonGroup aria-label="Basic example" className="d-flex justify-content-between" style={{ width: '100%' }}>
                            <Button className="rounded-0" variant="secondary" onClick={() => setLang("C++")}>C++</Button>
                            <Button variant="secondary" onClick={() => setLang("python3")}>Python 3</Button>
                            <Button variant="secondary" onClick={() => setLang("java")}>Java</Button>
                            <Button variant="secondary" onClick={() => setLang("JavaScript")}>JavaScript</Button>
                            <Button variant="secondary" onClick={() => setLang("C#")}>C#</Button>
                            <Dropdown>
                                <Dropdown.Toggle className="rounded-0" id="dropdown-basic" style={{ height: "100%" }}>
                                    Choose Difficulty
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setDifficulty("Easy")}>Easy</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setDifficulty("Medium")}>Medium</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setDifficulty("Hard")}>Hard</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Button onClick={handleCodeCompile} className="rounded-0" variant="success">Run</Button>
                        </ButtonGroup>
                    </div>
                    <div className="d-flex flex-row" style={{ height: "100%", width: "100%", flex: 1 }}>
                        <div ref={editorRef} style={{ height: "90vh", width: "45vw", backgroundColor: "#1e1e1e" }} />

                        {/* <CodeMirror
                          
                            value={codeValue}
                            height="90vh"
                            width="45vw"
                            extensions={langDict[lang]()}
                            onChange={onChange}
                            theme={copilot}
                        /> */}
                        <div className="d-flex flex-column" style={{ height: "50%" }}>
                            <CodeMirror
                                style={{ cursor: 'default', userSelect: 'none' }}
                                value={problemValue}
                                height="55vh"
                                width='40vw'
                                readOnly={true}
                                theme={consoleDark}
                            />
                            <CodeMirror
                                style={{ cursor: 'default', userSelect: 'none' }}
                                height="35vh"
                                width='40vw'
                                value={`C:\\Users\\CodeCollab\\${username}\\${problem?.questionTitle.replaceAll(' ', '-')}\\${lang}\n${output}`}
                                theme={consoleDark}
                                readOnly={true}
                            />

                        </div>

                    </div>
                </Container>
            </div>
        </div>
    );
};



export default CollabCode;
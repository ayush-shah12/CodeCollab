import React, { useEffect, useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { copilot } from '@uiw/codemirror-theme-copilot';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';
import { consoleDark } from '@uiw/codemirror-theme-console'

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import { getProblem } from '../api/action';
import { compileCode } from '../api/action';

import { useContext } from 'react';
import { UserContext } from '../UserContext/UserContext';

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
        const commentSyntax = commentDict[lang];
        setCodeValue(codeValue => codeValue + `${commentSyntax} Choose a Language From Above:\n${commentSyntax} Current Language Selected: ${lang} \n\n${startingCode[lang]}`);
    }, [lang]);

    //contains the code that the user writes
    const onChange = useCallback((val, viewUpdate) => {
        setCodeValue(val);
    }, []);


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
        setOutput("Compiling...");
        const result = await compileCode(codeValue, lang);
        const output = await result.json();
        setOutput("\nCPU Time: " + output.cpuTime + " seconds; Memory: " + output.memory + " kilobyte(s)" + "\n\n" + output.output);
    }

    return (
        <div>
            <div className='menu-bar' style={{ height: '5vh', width: '78vw' }}>
                <ButtonGroup aria-label="Basic example" className="d-flex justify-content-between">
                    <Button className="rounded-0" variant="secondary" onClick={() => setLang("C++")}>C++</Button>
                    <Button variant="secondary" onClick={() => setLang("python3")}>Python 3</Button>
                    <Button variant="secondary" onClick={() => setLang("java")}>Java</Button>
                    <Button variant="secondary" onClick={() => setLang("JavaScript")}>JavaScript</Button>
                    <Button variant="secondary" onClick={() => setLang("C#")}>C#</Button>
                    <Dropdown>
                        <Dropdown.Toggle className="rounded-0" id="dropdown-basic">
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 {/* CodeMirror component for the code editor */}
                <CodeMirror
                    value={codeValue}
                    height="88vh"
                    width="39vw"
                    extensions={langDict[lang]()}
                    onChange={onChange}
                    theme={copilot}
                />
                <div style={{ width: '39vw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* CodeMirror component for the problem statement
                    needs to be a CodeMirror component because the 
                    problem statement is shared between the two users
                    */}
                    <CodeMirror
                        style={{ cursor: 'default', userSelect: 'none' }}
                        value={problemValue}
                        height="44vh"
                        readOnly={true}
                        theme={consoleDark}
                    />
                    {/* TERMINAL */}
                    <div style={{ height: '44vh', backgroundColor: '#000', color: '#fff', padding: '10px', overflowY: 'auto' }}>
                    <CodeMirror
                        style={{ cursor: 'default', userSelect: 'none' }}
                        value={`C:\\Users\\CodeCollab\\${username}\\${problem?.questionTitle.replaceAll(' ', '-')}\\${lang}\n${output}`}
                        height="44vh"
                        theme={consoleDark}
                        readOnly={true}
                    />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollabCode;
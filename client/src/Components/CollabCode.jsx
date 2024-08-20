import React, { useEffect, useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { copilot } from '@uiw/codemirror-theme-copilot';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { getProblem } from '../api/auth';


const CollabCode = () => {
    const [lang, setLang] = useState('C++');
    const [codeValue, setCodeValue] = useState("");
    const [problemValue, setProblemValue] = useState("");
    const [difficulty, setDifficulty] = useState('Easy');
    const [problem, setProblem] = useState(null);

    const langDict = {
        "C++": langs.cpp,
        "Python3": langs.python,
        "Java": langs.java,
        "JavaScript": langs.javascript,
        "C#": langs.csharp
    };

    const commentDict = {
        "C++": "//",
        "Python3": "#",
        "Java": "//",
        "JavaScript": "//",
        "C#": "//"
    };

    const startingCode = {
        "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n\tstd::cout << "CodeCollab";\n\treturn 0;\n}`,
        "Python3": `print("CodeCollab)`,
        "Java": `import java.util.*; \npublic class Main {\n\tpublic static void main(String[] args) {\n\t\t System.out.println("CodeCollab");\n\t}\n}`,
        "JavaScript": `console.log("CodeCollab");`,
        "C#": `using System;\n\npublic class HelloWorld {\n\n   public static void Main(string[] args){ \n      Console.WriteLine ("CodeCollab");\n   }\n} `
    };

    useEffect(() => {
        setCodeValue("");
        const commentSyntax = commentDict[lang];
        setCodeValue(codeValue => codeValue + `${commentSyntax} Choose a Language From Above:\n${commentSyntax} Current Language Selected: ${lang} \n\n${startingCode[lang]}`);
    }, [lang]);

    const onChange = useCallback((val, viewUpdate) => {
        setCodeValue(val);
    }, []);


    useEffect(() => {
        async function fetchData() {
            const response = await getProblem(difficulty);
            const responseBody = await response.json();
            const title = responseBody[0].problem_title.replace(" ", "-");
            if (responseBody) {
                const problem = await fetch('https://alfa-leetcode-api.onrender.com/select?titleSlug=' + responseBody[0].problem_title);
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
    


    return (
        <div>
            <div className='menu-bar' style={{ height: '5vh', width: '78vw' }}>
                <ButtonGroup aria-label="Basic example" className="d-flex justify-content-between">
                    <Button className="rounded-0" variant="secondary" onClick={() => setLang("C++")}>C++</Button>
                    <Button variant="secondary" onClick={() => setLang("Python3")}>Python 3</Button>
                    <Button variant="secondary" onClick={() => setLang("Java")}>Java</Button>
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
                    <Button className="rounded-0" variant="success">Run</Button>
                </ButtonGroup>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <CodeMirror
                    value={codeValue}
                    height="88vh"
                    width="39vw"
                    extensions={langDict[lang]()}
                    onChange={onChange}
                    theme={copilot}
                />
                <CodeMirror
                    value={problemValue}
                    height="88vh"
                    width="39vw"
                    theme={copilot}

                />
            </div>
        </div>
    );
}

export default CollabCode;

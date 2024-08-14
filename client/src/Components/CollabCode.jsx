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
    const [value, setValue] = useState("");
    const [difficulty, setDifficulty] = useState('Easy');
    const [problem, setProblem] = useState('');
    const [htmlContent, setHtmlContent] = useState('');

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
        "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n\tstd::cout << "Omegle4Coders";\n\treturn 0;\n}`,
        "Python3": `print("Omegele4Coders)`,
        "Java": `public class Main {\n\tpublic static void main(String[] args) {\n\t\t System.out.println("Omegle4Coders");\n\t}\n}`,
        "JavaScript": `console.log("Omegle4Coders");`,
        "C#": `using System;\n\npublic class HelloWorld {\n\n   public static void Main(string[] args){ \n      Console.WriteLine ("Omegle4Coders");\n   }\n} `
    };

    useEffect(() => {
        const commentSyntax = commentDict[lang];
        setValue(val => val + `${commentSyntax} Choose a Language From Above:\n${commentSyntax} Current Language Selected: ${lang} \n${commentSyntax} Current Difficulty: ${difficulty} \n\n${startingCode[lang]}`);
    }, [lang, difficulty]);

    const onChange = useCallback((val, viewUpdate) => {
        setValue(val);
    }, []);


    useEffect(() => {
        async function fetchData() {
            const response = await getProblem(difficulty);
            const responseBody = await response.json();
            const title = responseBody[0].problem_title.replace(" ", "-");
            if (responseBody) {
                const problem = await fetch('https://alfa-leetcode-api.onrender.com/select?titleSlug=' + responseBody[0].problem_title);
                const problemData = await problem.json();
                const commentSyntax = commentDict[lang];

                setHtmlContent(problemData.question);
                var html = problemData.question;
                var div = document.createElement("div");
                div.innerHTML = html;
                var text = div.textContent || div.innerText || "";
                setValue(val => `${val}\n${commentSyntax} ${problemData.questionTitle}  ${problemData.difficulty} \n${commentSyntax} \n${text}`);
            }
        }
        fetchData();
    }, [difficulty]);


    return (
        <div>
            <div className='menu-bar' style={{ height: '5vh' }}>
                <ButtonGroup aria-label="Basic example" className="d-flex justify-content-between">
                    <Button className="rounded-0" variant="secondary" onClick={() => setLang("C++")}>C++</Button>
                    <Button variant="secondary" onClick={() => setLang("Python3")}>Python 3</Button>
                    <Button variant="secondary" onClick={() => setLang("Java")}>Java</Button>
                    <Button variant="secondary" onClick={() => setLang("JavaScript")}>JavaScript</Button>
                    <Button variant="secondary" onClick={() => setLang("C#")}>C#</Button>
                    <Dropdown>
                        <Dropdown.Toggle className="rounded-0" id="dropdown-basic">
                            Leetcode Difficulty
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setDifficulty("Easy")}>Easy</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDifficulty("Medium")}>Medium</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDifficulty("Hard")}>Hard</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Button className="rounded-0" variant="success"> Run </Button>
                </ButtonGroup>
            </div>
            <div>
                <CodeMirror
                    value={value}
                    height="88vh"
                    width= "auto"
                    extensions={langDict[lang]()}
                    onChange={onChange}
                    theme={copilot}
                />
            </div>
        </div>
    );
};

export default CollabCode;

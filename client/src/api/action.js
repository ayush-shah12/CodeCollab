export async function compileCode(code, lang) {
    try {
        const response = await fetch("http://localhost:4000/compile", {
            method: "POST",
            body: JSON.stringify({ code, lang }),
            headers: { "Content-Type": "application/json" }
        });
        return response;
    }
    catch (e) {
        return;
    }
}

export async function getProblem(difficulty) {
    try {
        const response = await fetch("http://localhost:4000/problem", {
            method: "POST",
            body: JSON.stringify({ difficulty }),
            headers: { "Content-Type": "application/json" }
        })
        return response;
    }
    catch (e) {
        return;
    }
}
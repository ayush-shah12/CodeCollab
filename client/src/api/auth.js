//SignUpside.jsx - registration
export async function signUp(username, password, email) {
    try {
        const response = await fetch("http://localhost:4000/register", {
            method: "POST",
            body: JSON.stringify({ username, password, email }),
            headers: { "Content-Type": "application/json" }
        });

        return response;
    }
    catch (e) {
        return;
    }
}


//SignInSide.jsx - login
export async function signIn(email, password) {
    try {
        const response = await fetch("http://localhost:4000/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        })
        return response;
    }
    catch (e) {
        return;
    }
}

export async function verifyToken() {
    const response = await fetch(`http://localhost:4000/verify`, {
        method: "GET",
        credentials: "include"
    })

    return response;
}

export async function logout() {
    const response = await fetch("http://localhost:4000/logout", {
        method: "POST",
        credentials: "include"
    }
    )
    return response;
}
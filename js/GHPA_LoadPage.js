const GHPA_existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));

if (GHPA_SSO_Flag && GHPA_existingAuth && GHPA_Retreive(GHPA_existingAuth)) {
    fetch("/loginform.html").then(function (response) {
        return response.text();
    }).then(function (data) {
        document.getElementById("GHPA_loginForm").innerHTML = data;
    });
    
    //document.getElementById("GHPA_prompt").style.display = "block";
}

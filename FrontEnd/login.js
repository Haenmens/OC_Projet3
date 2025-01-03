const formulaire = document.getElementById("formulaire");

async function connexion(evenement)
{
    evenement.preventDefault();

    const donneesFormulaire = new FormData(formulaire);

    informationsUtilisateur = JSON.stringify({ 
        "email" : donneesFormulaire.get("email"), 
        "password" : donneesFormulaire.get("mot-de-passe")
    });

    try {
        const reponse = await fetch("http://localhost:5678/api/users/login",
            {
                method: "POST",
                headers: {"Content-Type" : "Application/json"},
                body: informationsUtilisateur
            }
        );

        if (reponse.ok) 
        {
            const data = await reponse.json();
            sessionStorage.setItem("token", data.token);
            window.location.assign("index.html");
        } 
        else
        {
            document.getElementById("message-erreur").textContent = `“Erreur dans l'identifiant ou le mot de passe”`;
        }
    }
    catch (erreur) {
        console.log("Erreur dans la connexion : ", erreur);
    }
}

formulaire.addEventListener("submit", connexion);
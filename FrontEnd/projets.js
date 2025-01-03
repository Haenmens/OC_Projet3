categorieAffichee = "tous";
travaux = null;
categories = null;

async function chargerTravaux(categorie) {
    try 
    {
        const reponse = await fetch('http://localhost:5678/api/works');
        if (!reponse.ok) 
        {
            throw new Error(`Erreur travaux, status : ${reponse.status}`);
        }
        travaux = await reponse.json();
        afficherTravaux(categorie);
    }
    catch (erreur)
    {
        console.error("Erreur dans la récupération des travaux : ", erreur);
    }
}

async function chargerFiltres() {
    try 
    {
        const reponse = await fetch('http://localhost:5678/api/categories');
        if (!reponse.ok) 
        {
            throw new Error(`Erreur Categories, status : ${reponse.status}`);
        }
        categories = await reponse.json();
        afficherCategories();
    }
    catch (erreur)
    {
        console.error("Erreur dans la récupération des catégories : ", erreur);
    }
}

function afficherTravaux(categorie)
{
    const divGallerie = document.querySelector(".gallery");

    divGallerie.innerHTML = "";

    for (let i = 0; i < travaux.length; i++)
    {
        const travail = travaux[i];

        if (travail.category.name == categorie || categorie == "tous")

        {   
            const elementFigure = document.createElement("figure");
            const elementImage = document.createElement("img");
            const elementCaption = document.createElement("figcaption");

            elementImage.src = travail.imageUrl;
            elementCaption.textContent = travail.title;

            divGallerie.appendChild(elementFigure);
            elementFigure.appendChild(elementImage);
            elementFigure.appendChild(elementCaption);
        }
    }
}

function afficherCategories()
{
    for (let i = 0; i < categories.length; i++)
        {
            const categorie = categories[i];
    
            const ulFiltres = document.querySelector(".filtres");
            
            const elementListe = document.createElement("li");
            const elementInput = document.createElement("input");
            const elementLabel = document.createElement("label");
    
            elementInput.id = categorie.name;
            elementInput.value = categorie.name;
            elementInput.type = "radio";
            elementInput.name = "filtre";
            elementInput.onclick = function () {changerCategorieAffichee(this)};
            
            elementLabel.textContent = categorie.name;
            elementLabel.htmlFor = categorie.name;

            ulFiltres.appendChild(elementListe);
            elementListe.appendChild(elementInput);
            elementListe.appendChild(elementLabel);
        }
}

function afficherModale()
{
    modale = document.getElementById("modale");
    photos = document.getElementById("photos");

    for (let i = 0; i < travaux.length; i++)
    {
        travail = travaux[i];
        
        const elementImage = document.createElement("img");

        elementImage.src = travail.imageUrl;

        photos.appendChild(elementImage);
    }

    modale.classList.remove("cachee");
    modale.classList.add("modale")
}

function changerCategorieAffichee(input)
{
    if (input.id == categorieAffichee) return;

    if (input.id == "tous")
    {
        categorieAffichee = "tous";
    }
    else
    {
        categorieAffichee = input.id;
    }

    afficherTravaux(categorieAffichee);
}

function verifierConnexion()
{
    if (sessionStorage.token == null) return;

    document.getElementById("login").classList.add("cachee");

    logoutLien = document.getElementById("logout");
    bandeauEdition = document.getElementById("bandeau-edition");
    boutonModifier = document.getElementById("bouton-modifier");

    boutonModifier.classList.remove("cachee");
    boutonModifier.classList.add("bouton-modifier");
    boutonModifier.addEventListener("click", afficherModale);

    bandeauEdition.classList.remove("cachee");
    bandeauEdition.classList.add("bandeau-edition");

    logoutLien.classList.remove("cachee");
    logoutLien.addEventListener("click", function() {
        sessionStorage.removeItem("token");
        window.location.assign("index.html");
    });
}

chargerTravaux("tous");
chargerFiltres();
verifierConnexion();
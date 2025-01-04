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

function verifierPhoto(photo)
{
    if (photo)
    {
        if (photo.type != "image/jpeg" && photo.type != "image/png")
        {
            alert("Veuillez sélectionner un fichier de type jpg ou png.")
        }

        const lecteur = new FileReader();
        imagePhoto = document.getElementById("formulaire-ajout-image-photo");

        lecteur.addEventListener("load", function () {
            imagePhoto.setAttribute("src", this.result);
            imagePhoto.style.width = "auto";
            imagePhoto.style.height = "150px";
            document.getElementById("formulaire-ajout-bouton-photo").classList.add("cachee");
            document.getElementById("formulaire-ajout-prerequis-photo").classList.add("cachee");
        });
        lecteur.readAsDataURL(photo);
    }
}

function afficherModale()
{
    modale = document.getElementById("modale");
    photos = document.getElementById("photos");
    croixImg = document.getElementById("croix-fermeture");
    boutonPhoto = document.getElementById("input-photo");
    boutonModifVersAjout = document.getElementById("bouton-modif-vers-ajout");
    boutonAjoutVersModif = document.getElementById("bouton-ajout-vers-modif");

    modale.addEventListener("click", (event) => {
        if (event.target == modale)
        {
            modale.classList.remove("modale");
            modale.classList.add("cachee");
        }
    });

    croixImg.addEventListener("click", () => {
        modale.classList.remove("modale");
        modale.classList.add("cachee");
    });

    boutonModifVersAjout.addEventListener("click", () => {
        document.getElementById("fenetre-modale-modif").classList.add("cachee");
        document.getElementById("fenetre-modale-ajout").classList.remove("cachee");
        document.getElementById("fenetre-modale-ajout").classList.add("fenetre-modale-ajout");
    });

    boutonAjoutVersModif.addEventListener("click", () => {
        document.getElementById("fenetre-modale-modif").classList.remove("cachee");
        document.getElementById("fenetre-modale-ajout").classList.add("cachee");
    });

    boutonPhoto.addEventListener("change", () => { verifierPhoto(boutonPhoto.files[0]); });

    photos.addEventListener("wheel", function (event) {
        const scrollTop = photos.scrollTop;
        const scrollHauteur = photos.scrollHeight;
        const clientHauteur = photos.clientHeight;
        const delta = event.deltaY;

        if ((delta > 0 && scrollTop + clientHauteur >= scrollHauteur) ||
            (delta < 0 && scrollTop <= 0))
            {
                event.preventDefault();
            }
    });

    photos.innerHTML = "";

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
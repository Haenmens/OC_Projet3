categorieAffichee = "tous";
travaux = null;
categories = null;
premierAffichageModale = true;
typeFilePhoto = false;

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
    const divGallerie = document.getElementById("galerie");

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
    
            const ulFiltres = document.getElementById("filtres");
            
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
        popup = document.getElementById("popup");
        popup.classList.remove("bg-ok");
        popup.classList.add("bg-erreur");

        if (photo.type != "image/jpeg" && photo.type != "image/png")
        {
            popup.innerHTML = `<p class="flex mgn-auto">L'image doit être au format jpeg ou png</p>`
            popup.classList.add("anim");
            document.getElementById("input-photo").value = "";
            typeFilePhoto = false;
            return;
        }

        else if (photo.size > 4194304)
        {
            popup.innerHTML = `<p class="flex mgn-auto">L'image doit faire moins de 4mo</p>`
            popup.classList.add("anim");
            document.getElementById("input-photo").value = "";
            typeFilePhoto = false;
            return;
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
        typeFilePhoto = true;
    }
}

function verifierValiditeFormulaire(formulaire)
{
    const donneesFormulaire = new FormData(formulaire);

    if (formulaire.checkValidity() && donneesFormulaire.get("image").size > 0 && typeFilePhoto && donneesFormulaire.get("title") != "" && donneesFormulaire.get("category") != "")
    {
        document.getElementById("bouton-formulaire-ajout").classList.add("bouton-ajouter-autorise");
    }
    else
    {
        document.getElementById("bouton-formulaire-ajout").classList.remove("bouton-ajouter-autorise");
    }
}

async function ajouterPhotoBaseDeDonnee(formulaire)
{
    const donneesFormulaire = new FormData(formulaire);
    popup = document.getElementById("popup");
    popup.classList.remove("bg-ok");
    popup.classList.add("bg-erreur");

    if (donneesFormulaire.get("image").size == 0)
    {
        popup.innerHTML = '<p class="flex mgn-auto">Une image valide doit être selectionnée</p>'
        popup.classList.add("anim");
        return;
    }

    else if (donneesFormulaire.get("image").size > 4194304)
    {
        popup.innerHTML = `<p class="flex mgn-auto">L'image selectionnée fait plus de 4mo</p>`
        popup.classList.add("anim");
        resetPhotoFormulaire(formulaire);
        return;
    }

    else if (donneesFormulaire.get("title") == "" || donneesFormulaire.get("category") == "")
    {
        popup.innerHTML = `<p class="flex mgn-auto">Vous devez renseigner un titre et une catégorie</p>`
        popup.classList.add("anim");
        return;
    }

    try {
        const reponse = await fetch("http://localhost:5678/api/works",
            {
                method: "POST",
                headers: {"Authorization" : `Bearer ${ sessionStorage.getItem("token") }`},
                body: donneesFormulaire
            }
        );

        if (reponse.ok)
        {
            const data = await reponse.json();
            chargerTravaux(categorieAffichee);
            popup = document.getElementById("popup");
            popup.classList.remove("bg-erreur");
            popup.classList.add("bg-ok");
            popup.innerHTML = `<p class="flex mgn-auto">La photo a bien été ajoutée !</p>`
            popup.classList.add("anim");
            resetFormulaire(formulaire);
        } 
        else
        {
            const data = await reponse.json();
            console.log(data)
        }
    }
    catch (erreur) {
        console.log("Erreur dans l'envoi' : ", erreur);
    }
}

async function supprimerPhotoBaseDeDonnee(id) 
{
    try {
        const reponse = await fetch(`http://localhost:5678/api/works/${id}`,
            {
                method: "DELETE",
                headers: {"Authorization" : `Bearer ${ sessionStorage.getItem("token") }`}
            }
        );

        if (reponse.ok)
        {
            popup.innerHTML = `<p class="flex mgn-auto">La photo a bien été supprimée</p>`
            popup.classList.add("bg-ok");
            popup.classList.add("anim");
            await chargerTravaux(categorieAffichee);
            afficherPhotosModale();
        } 
        else
        {
            const data = await reponse.json();
            console.log(data)
        }
    }
    catch (erreur) {
        console.log("Erreur dans la suppression' : ", erreur);
    }
}

function resetPhotoFormulaire(formulaire)
{
    imagePhoto = document.getElementById("formulaire-ajout-image-photo");

    imagePhoto.setAttribute("src", "assets/icons/image.png");
    imagePhoto.style.width = "68px";
    imagePhoto.style.height = "60px";
    document.getElementById("formulaire-ajout-bouton-photo").classList.remove("cachee");
    document.getElementById("formulaire-ajout-prerequis-photo").classList.remove("cachee");
    document.getElementById("bouton-formulaire-ajout").classList.remove("bouton-ajouter-autorise");
}

function resetFormulaire(formulaire)
{
    imagePhoto = document.getElementById("formulaire-ajout-image-photo");

    imagePhoto.setAttribute("src", "assets/icons/image.png");
    imagePhoto.style.width = "68px";
    imagePhoto.style.height = "60px";
    document.getElementById("formulaire-ajout-bouton-photo").classList.remove("cachee");
    document.getElementById("formulaire-ajout-prerequis-photo").classList.remove("cachee");
    document.getElementById("bouton-formulaire-ajout").classList.remove("bouton-ajouter-autorise");

    formulaire.reset();
}

function fermerModale(modale, formulaireAjout)
{
    modale.classList.remove("modale");
    modale.classList.add("cachee");
    document.getElementById("fenetre-modale-modif").classList.remove("cachee");
    document.getElementById("fenetre-modale-ajout").classList.add("cachee");
    document.getElementById("popup").classList.remove("anim");
    resetFormulaire(formulaireAjout);
}

function afficherFormulaireAjout()
{
    document.getElementById("fenetre-modale-modif").classList.add("cachee");
    document.getElementById("fenetre-modale-ajout").classList.remove("cachee");

    formulaireAjoutCategories = document.getElementById("formulaire-ajout-categorie");
    formulaireAjoutCategories.innerHTML = '<option value="" hidden selected></option>';

    for (let i = 0; i < categories.length; i++)
    {
        const categorie = categories[i];

        const elementOption = document.createElement("option");
        elementOption.innerHTML = categorie.name;
        elementOption.value = categorie.id;

        formulaireAjoutCategories.appendChild(elementOption);
    }
}

function afficherPhotosModale()
{
    photos = document.getElementById("photos");
    photos.innerHTML = "";

    for (let i = 0; i < travaux.length; i++)
    {
        const travail = travaux[i];
        const id = travail.id;

        const elementDiv = document.createElement("div");
        const elementImage = document.createElement("img");
        const elementIconeSupprimer = document.createElement("img");

        elementDiv.style = "position: relative;";

        elementImage.src = travail.imageUrl;
        elementImage.classList.add("photo-modale");

        elementIconeSupprimer.src = "assets/icons/poubelle.png";
        elementIconeSupprimer.classList.add("icone-supprimer");
        elementIconeSupprimer.addEventListener("click", () => {
            supprimerPhotoBaseDeDonnee(id);
        });

        photos.appendChild(elementDiv);
        elementDiv.appendChild(elementImage);
        elementDiv.appendChild(elementIconeSupprimer);
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
    formulaireAjout = document.getElementById("formulaire-ajout");

    if (premierAffichageModale)
    {
        modale.addEventListener("click", (event) => {
            if (event.target == modale)
            {
                fermerModale(modale, formulaireAjout);
            }
        });
        
        modale.addEventListener("wheel", (event) => {
            event.preventDefault();
        });

        croixImg.addEventListener("click", () => {
            fermerModale(modale, formulaireAjout);
        });

        document.getElementById("popup").addEventListener("animationend", () => {
            popup.classList.remove("anim");
        });

        boutonModifVersAjout.addEventListener("click", () => {
            afficherFormulaireAjout();
        });

        boutonAjoutVersModif.addEventListener("click", () => {
            document.getElementById("fenetre-modale-modif").classList.remove("cachee");
            document.getElementById("fenetre-modale-ajout").classList.add("cachee");
            resetFormulaire(formulaireAjout);
            afficherPhotosModale();
        });

        boutonPhoto.addEventListener("change", () => { 
            verifierPhoto(boutonPhoto.files[0]);
            verifierValiditeFormulaire(formulaireAjout);
        });

        formulaireAjout.addEventListener("input", () => { verifierValiditeFormulaire(formulaireAjout); });
        formulaireAjout.addEventListener("submit", (event) => { 
            event.preventDefault();
            ajouterPhotoBaseDeDonnee(formulaireAjout);
        });

        photos.addEventListener("wheel", (event) => {
            const scrollTop = photos.scrollTop;
            const scrollHauteur = photos.scrollHeight;
            const clientHauteur = photos.clientHeight;
            const delta = event.deltaY;
            event.stopPropagation();

            if ((delta > 0 && scrollTop + clientHauteur >= scrollHauteur) ||
                (delta < 0 && scrollTop <= 0))
                {
                    event.preventDefault();
                }
        });

        premierAffichageModale = false;
    }

    afficherPhotosModale();

    modale.classList.remove("cachee");
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

    bandeauEdition.classList.remove("cachee");

    logoutLien.classList.remove("cachee");

    logoutLien.addEventListener("click", function() {
        sessionStorage.removeItem("token");
        window.location.assign("index.html");
    });
    
    boutonModifier.addEventListener("click", afficherModale);
}

chargerTravaux("tous");
chargerFiltres();
verifierConnexion();
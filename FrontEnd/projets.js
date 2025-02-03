categorieAffichee = "tous";
travaux = null;
categories = null;

//Récupère et stocke tous les travaux dans la variable travaux en appelant l'API
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

//Récupère et stocke toutes les catégories dans la variable categorie en appelant l'API
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

//Boucle dans la variable travaux et ajoute ceux dont la catégorie correspond à la variable catégorie affichée comme enfant de l'élément galerie
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

//Boucle dans la variable catégorie et les ajoute comme enfants à l'éléments filtres
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

//Appelée lors du clique sur un filtre, change la valeur de la variable categorieAffichee pour correspondre au filtre sélectionné
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

//Lors de l'ajout d'une photo, vérifie que son type et sa taille sont bons avant de la charger
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
            return;
        }

        else if (photo.size > 4194304)
        {
            popup.innerHTML = `<p class="flex mgn-auto">L'image doit faire moins de 4mo</p>`
            popup.classList.add("anim");
            document.getElementById("input-photo").value = "";
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
    }
}

//Vérifie la validité de tous les éléments du formulaire d'ajout d'images et change la couleur du bouton ajouter
function verifierValiditeFormulaire(formulaire)
{
    const donneesFormulaire = new FormData(formulaire);

    if (formulaire.checkValidity() && donneesFormulaire.get("image").size > 0 && donneesFormulaire.get("title") != "" && donneesFormulaire.get("category") != "")
    {
        document.getElementById("bouton-formulaire-ajout").classList.add("bouton-ajouter-autorise");
    }
    else
    {
        document.getElementById("bouton-formulaire-ajout").classList.remove("bouton-ajouter-autorise");
    }
}

//Effectue une dernière vérification de tous les éléments du formulaire avant d'appeler l'API pour ajouter la photo dans la base de donnée
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

//Appelle l'API en lui donnant l'id de la photo à supprimer
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

//Enlève l'affichage de la dernière photo ajouter et le réinitialise à son état de départ
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

//Réinitialise le formulaire à son état initial
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

//Ferme la modale, réinitialise le formulaire et l'animation du popup
function fermerModale(modale, formulaireAjout)
{
    modale.classList.remove("modale");
    modale.classList.add("cachee");
    document.getElementById("fenetre-modale-modif").classList.remove("cachee");
    document.getElementById("fenetre-modale-ajout").classList.add("cachee");
    document.getElementById("popup").classList.remove("anim");
    resetFormulaire(formulaireAjout);
}

//Affiche la page d'ajout de photo dans la modale et rempli dynamiquement le sélecteur de catégories
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

//Boucle dans travaux pour afficher tous les travaux dans la modale, ajoute également une icone supprimer à chacun
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

//Affiche la modale
function afficherModale()
{
    modale = document.getElementById("modale");
    afficherPhotosModale();
    modale.classList.remove("cachee");
}

//Initialise tous les eventListener liés à la modale
function initGestionEvenements()
{
    modale = document.getElementById("modale");
    photos = document.getElementById("photos");
    croixImg = document.getElementById("croix-fermeture");
    boutonPhoto = document.getElementById("input-photo");
    boutonModifVersAjout = document.getElementById("bouton-modif-vers-ajout");
    boutonAjoutVersModif = document.getElementById("bouton-ajout-vers-modif");
    formulaireAjout = document.getElementById("formulaire-ajout");

    //Vérifie que le clic a bien été effectué autour de la modale et si oui, la ferme
    modale.addEventListener("click", (event) => {
        if (event.target == modale)
        {
            fermerModale(modale, formulaireAjout);
        }
    });
    
    //Empêche l'utilisation de la molette dans la modale
    modale.addEventListener("wheel", (event) => {
        event.preventDefault();
    });

    //Ferme la modale au clique sur la croix
    croixImg.addEventListener("click", () => {
        fermerModale(modale, formulaireAjout);
    });

    //Retire la classe anim du popup lorsque son animation est finie
    document.getElementById("popup").addEventListener("animationend", () => {
        popup.classList.remove("anim");
    });

    //Affiche le formulaire d'ajout au clic sur ajouter une photo
    boutonModifVersAjout.addEventListener("click", () => {
        afficherFormulaireAjout();
    });

    //Repasse à l'affichage de la liste des photos au clic sur la flèche vers la gauche
    boutonAjoutVersModif.addEventListener("click", () => {
        document.getElementById("fenetre-modale-modif").classList.remove("cachee");
        document.getElementById("fenetre-modale-ajout").classList.add("cachee");
        resetFormulaire(formulaireAjout);
        afficherPhotosModale();
    });

    //Vérifie les photos et le formulaire à l'ajout d'un élément dans le champs photo
    boutonPhoto.addEventListener("change", () => { 
        verifierPhoto(boutonPhoto.files[0]);
        verifierValiditeFormulaire(formulaireAjout);
    });

    //Vérifie la validité du formulaire au changement des inputs
    formulaireAjout.addEventListener("input", () => { verifierValiditeFormulaire(formulaireAjout); });

    //Appelle la fonction d'ajout de photo au clic sur le bouton de submit du formulaire
    formulaireAjout.addEventListener("submit", (event) => { 
        event.preventDefault();
        ajouterPhotoBaseDeDonnee(formulaireAjout);
    });

    //Permet le scroll uniquement au sein de la liste des photos en vérifiant que le scroll n'excède pas sa taille et empêche la propagation de l'événement pour éviter qu'il
    //soit annulé par l'eventListener plus haut
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
}

//Vérifie si un utilisateur est connecté ou non et affiche les informations supplémentaires si l'utilisateur est bien connecté
function verifierConnexion()
{
    if (sessionStorage.token == null) return;

    document.getElementById("login").classList.add("cachee");

    logoutLien = document.getElementById("logout");
    bandeauEdition = document.getElementById("bandeau-edition");
    boutonModifier = document.getElementById("bouton-modifier");
    filtres = document.querySelector("#filtres");
    titre_portfolio = document.querySelector("#portfolio h2");

    filtres.classList.add("cachee");
    titre_portfolio.classList.add("mgn-b100");

    boutonModifier.classList.remove("cachee");

    bandeauEdition.classList.remove("cachee");

    logoutLien.classList.remove("cachee");

    logoutLien.addEventListener("click", function() {
        sessionStorage.removeItem("token");
        window.location.assign("index.html");
    });
    
    boutonModifier.addEventListener("click", afficherModale);

    initGestionEvenements();
}

chargerTravaux("tous");
chargerFiltres();
verifierConnexion();
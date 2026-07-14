# Carnets — Valérie

Site statique, zéro build step.

## Installer en local

Dézipper, ouvrir un terminal dans le dossier, lancer :

```bash
python3 -m http.server 8000
```

Ouvrir `http://localhost:8000`. Ne pas ouvrir `index.html` en double-clic — `fetch()` a besoin d'un vrai serveur.

## Déployer

1. Créer un compte GitHub (gratuit) et un repo (ex. `carnets`)
2. Installer [GitHub Desktop](https://desktop.github.com)
3. Cloner le repo, copier ce dossier dedans, commit, push
4. Sur Netlify : *New site from Git* → connecter le repo → déployer

Ensuite, chaque push republiera le site automatiquement.

## Les 3 gestes au quotidien

Tout se fait dans GitHub Desktop (pas de terminal requis) :

1. **Modifier** : ouvrir un fichier `.md` dans n'importe quel éditeur
   de texte, sauvegarder
2. **Commit** : dans GitHub Desktop, écrire une phrase décrivant le
   changement (ex. "nouvel article sur les heatmaps") → bouton *Commit*
3. **Push** : bouton *Push origin* → c'est en ligne

## Ajouter un article

Un seul fichier à créer, un seul endroit à mettre à jour.

1. Créer `articles/mon-slug.md` :

```markdown
---
title: Le titre
category: contre-jour
date: 2026-08-15
tags: mot-un, mot-deux
teaser: Une phrase d'accroche.
---

Le corps de l'article, en markdown.
```

2. Ajouter le slug dans `articles/index.json` :

```json
[
  "mon-slug",
  "a-quoi-sert-encore-une-heatmap",
  ...
]
```

C'est tout. Le titre, la date, la catégorie, les tags et le teaser
sont lus directement depuis le `.md` — pas de doublon à synchroniser.

## Modifier un article existant

Ouvrir le `.md` correspondant, changer le texte ou le front matter,
sauvegarder. Commit + push. Rien d'autre.

## Modifier la structure (avec mon aide)

Si tu me demandes un changement de structure (nouveau pilier, redesign)
pendant que tu as déjà ajouté du contenu :

- Dans GitHub Desktop, tu verras exactement quels fichiers ont changé
  avant d'accepter ma mise à jour
- Si `articles/` n'apparaît pas dans la liste → ton contenu est intact
- Si quelque chose casse → bouton *Undo last commit* ou *Revert*

## Catégories

`category` dans le front matter doit être exactement :

| Mot | Couleur CSS | Pilier |
|-----|------------|--------|
| `contre-jour` | bleu ardoise | Ce que personne ne regarde encore |
| `hors-piste` | bronze | Construire ce qui manque |
| `contrebande` | vert profond | Faire passer ce qui ne passerait pas |

Ajouter une catégorie = ajouter une variable `--nom` et `--nom-soft`
dans `style.css`, plus les classes `.pillar.nom`, `.entry.tag-nom`.

## Structure des fichiers

```
carnets/
├── index.html          ← page d'accueil
├── article.html        ← template article
├── style.css           ← design tokens + mise en page
├── script.js           ← logique (feed, filtres, rendu markdown)
├── img/
│   └── arbre.png       ← illustration hero
├── articles/
│   ├── index.json      ← liste de slugs (source unique)
│   ├── a-quoi-sert-encore-une-heatmap.md
│   ├── la-monetisation-de-lombre.md
│   ├── construire-ce-qui-manque.md
│   └── soigner-ou-gouverner.md
└── README.md
```

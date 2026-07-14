# Carnets — Valérie

Site statique, zéro framework, déploiement automatique sur Netlify.

## Le geste au quotidien (en 30 secondes)

Pour ajouter un article :

1. **Créer un fichier** dans `articles/mon-slug.md` (n'importe quel éditeur de texte)
2. **Commit + push** dans le terminal :
   ```bash
   cd ~/Projects/carnets
   git add articles/mon-slug.md
   git commit -m "Nouvel article : mon titre"
   git push
   ```
3. **C'est en ligne en 1-2 minutes.** Netlify redéploie automatiquement.

**`articles/index.json` n'est plus à toucher.** Le script `build.sh` le regénère tout seul à chaque déploiement en scannant tous les fichiers `.md` du dossier `articles/`.

## Tester en local

```bash
cd ~/Projects/carnets
python3 -m http.server 8000
```

Ouvrir `http://localhost:8000`. Ne pas ouvrir `index.html` en double-clic, `fetch()` a besoin d'un vrai serveur.

## Format d'un article

Créer `articles/mon-slug.md` :

```markdown
---
title: Le titre de l'article
category: contre-jour
date: 2026-08-15
tags: mot-un, mot-deux
teaser: Une phrase d'accroche (sinon le premier paragraphe est utilisé).
---

Corps de l'article en markdown.

## Sous-titre possible

- Liste à puces
- Deuxième item

> Citation en blockquote
```

**Champs du front matter** (tous obligatoires sauf `tags` et `teaser`) :
- `title` — titre affiché
- `category` — `contre-jour` | `hors-piste` | `contrebande`
- `date` — format ISO `YYYY-MM-DD`
- `tags` — mots-clés séparés par des virgules (optionnel)
- `teaser` — phrase d'accroche affichée dans le feed (optionnel, auto-généré sinon)

## Modifier un article existant

Ouvrir le `.md`, changer le texte ou le front matter, sauvegarder, commit, push. Rien d'autre.

## Modifier le design

Moi (Hedda) ou toi, en éditant `style.css`. Les couleurs et polices sont dans les variables CSS en haut du fichier. Une modification + push redéploie en 1-2 minutes.

## Structure des fichiers

```
carnets/
├── index.html              ← page d'accueil
├── article.html            ← template article
├── 404.html                ← page d'erreur dans le ton du site
├── style.css               ← design tokens + mise en page
├── script.js               ← logique (feed, filtres, rendu markdown)
├── favicon.svg             ← favicon
├── build.sh                ← regénère articles/index.json à chaque deploy
├── netlify.toml            ← dit à Netlify d'exécuter build.sh
├── img/
│   ├── arbre.webp          ← illustration hero (43 Ko)
│   ├── arbre.png           ← fallback (961 Ko)
│   └── og-image.jpg        ← image partage social (92 Ko)
├── articles/
│   ├── index.json          ← liste de slugs (auto-généré, ne pas éditer)
│   ├── a-quoi-sert-encore-une-heatmap.md
│   ├── la-monetisation-de-lombre.md
│   ├── construire-ce-qui-manque.md
│   └── soigner-ou-gouverner.md
├── robots.txt
├── sitemap.xml             ← à régénérer si on ajoute beaucoup d'articles
├── rss.xml                 ← à régénérer si on ajoute beaucoup d'articles
└── README.md
```

## Catégories

`category` dans le front matter doit être exactement :

| Mot | Couleur CSS | Pilier |
|-----|------------|--------|
| `contre-jour` | bleu ardoise | Ce que personne ne regarde encore |
| `hors-piste` | bronze | Construire ce qui manque |
| `contrebande` | vert profond | Faire passer ce qui ne passerait pas |

Ajouter une catégorie = ajouter une variable `--nom` et `--nom-soft` dans `style.css`, plus les classes `.pillar.nom`, `.entry.tag-nom`.

## Déploiement

GitHub connecté à Netlify. Chaque push sur la branche `main` déclenche un build :
1. Netlify exécute `build.sh` (regénère `articles/index.json`)
2. Netlify sert le dossier à `https://valerie-carnets.netlify.app/`

Site déployé automatiquement. Pas de touche manuelle.

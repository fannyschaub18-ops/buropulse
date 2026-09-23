# BuroPulse — Kit de migration vers Base44 natif

Ce document spécifie tout ce qu'il faut pour reconstruire BuroPulse comme une **app native Base44**, en gardant les fonctionnalités et le design actuels (avec améliorations).

---

## 1. Vue d'ensemble

**BuroPulse** est un site vitrine pour une entreprise d'assistance administrative et commerciale (Fanny SCHALL, Bas-Rhin). Le site comprend :

- **Page d'accueil** single-page avec sections ancrées (Accueil, À propos, Services, Tarifs, Contact)
- **5 services** avec descriptions et prestations
- **3 forfaits mensuels** (Essentiel, Confort, Sérénité)
- **Wizard interactif** en 3 étapes (besoins → rythme → offre conseillée)
- **Formulaire de contact** avec validation et anti-spam (honeypot)
- **FAQ** en accordéon (4 questions)
- **Modales** pour mentions légales, CGV, politique de confidentialité, prestations détaillées
- **Navigation sticky** avec scroll-spy
- **Responsive** mobile avec menu hamburger

---

## 2. Design System

### Palette de couleurs
| Token | Hex | Usage |
|---|---|---|
| `--green` | `#183A35` | Fond principal, texte, boutons |
| `--ivory` | `#F7F3EC` | Fond clair, cartes |
| `--beige` | `#D8C8B8` | Accents, bordures, texte secondaire sur fond foncé |
| `--gold` | `#B49A6C` | Accents, liens, em, icônes |
| `--ink` | `#252525` | Texte de corps |
| `--white` | `#FFFFFF` | Boutons, cartes |

### Typographie
| Token | Police | Usage |
|---|---|---|
| `--serif` | Playfair Display | Titres (h1, h2, h3), prix, signatures |
| `--sans` | Montserrat | Corps, boutons, labels, navigation |
| `--script` | Allura | Signatures manuscrites |

### Tailles de police (desktop)
- h1: `clamp(42px, 4.3vw, 62px)`
- h2: `clamp(32px, 3.05vw, 43px)`
- h3: 25px
- Corps: 15px / line-height 1.75
- Eyebrow: 12px, weight 600, letter-spacing 2.4px
- Boutons: 12px, weight 600

### Layout
- `.wrap`: `max-width: 1240px`, margin auto, padding inline 44px
- `.block`: padding block 94px
- Border radius: 7px (boutons), 13px (cartes), 18px (advisor)
- Ombres: `0 8px 25px #183A3504` (cartes), `0 16px 32px #183A3517` (plan featured)

### Icônes (SVG inline)
arrow, folder, mail, phone, calendar, document, target, clock, check, leaf, shield, social, chart — toutes en stroke 1.5, 24×24 viewBox

### Logo
- Monogramme circulaire: `https://static.wixstatic.com/media/cc90c4_a5b2967a415e48468bd688de464373c7~mv2.png`
- Wordmark: `BURO` (green) + `PULSE` (gold), Playfair Display 26px
- Brand stamp: `https://static.wixstatic.com/media/cc90c4_03094153bbbc4a5f8e6208d289dc70eb~mv2.png`

### Photo fondatrice
- `https://static.wixstatic.com/media/cc90c4_9a8a5522275b4a5fa13952f050fb5074~mv2.webp`
- Fanny SCHALL, fondatrice, dans son bureau

---

## 3. Structure des sections (ordre du DOM)

1. **Header** — sticky, blur, logo + nav (Accueil, À propos, Services, Tarifs, Contact) + CTA
2. **Hero** — fond vert, titre + description + CTA + note papier décorative
3. **Services** — 5 cartes en grille 3 colonnes + section "Qu'aimeriez-vous déléguer?" (3 personas)
4. **Tarifs** — 3 forfaits en grille + offre sur mesure
5. **Wizard / Parcours** — 3 étapes (besoins → rythme → offre conseillée), fond vert, carte ivoire
6. **Modalités (FAQ)** — 4 accordéons
7. **À propos (Derrière BuroPulse)** — photo + texte + ligne dorée
8. **Pourquoi BuroPulse** — 4 bénéfices (Flexible, Sans embauche, Sur mesure, À distance)
9. **Comment ça fonctionne** — 4 étapes numérotées (01-04)
10. **Contact** — fond vert, texte à gauche + formulaire à droite
11. **Footer** — logo, slogan, email, mentions/CGV/confidentialité
12. **Bouton contact mobile** — fixe en bas sur mobile
13. **Dialog modale** — pour prestations, mentions, CGV, confidentialité

---

## 4. Contenu complet

Voir `migration/content.json` pour tout le contenu textuel structuré.

---

## 5. Modèles de données (entités Base44)

### Entity: `ContactRequest`
Stocke les demandes soumises via le formulaire de contact.

| Champ | Type | Requis | Max | Notes |
|---|---|---|---|---|
| `name` | string | ✅ | 100 | Nom du contact |
| `company` | string | ❌ | 120 | Nom de l'entreprise |
| `email` | string (email) | ✅ | 200 | Email validé |
| `phone` | string | ❌ | 40 | Téléphone facultatif |
| `need` | string | ✅ | 100 | Catégorie de besoin (enum) |
| `message` | string (text) | ✅ | 3500 | Description du besoin |
| `selection` | string | ❌ | 350 | Forfait sélectionné via le wizard |
| `summary` | string (text) | ❌ | 5000 | Résumé du parcours wizard |
| `reference` | string | auto | 20 | Format: `BP-XXXXXXXXXXXX` |
| `status` | string | auto | 20 | `new`, `contacted`, `closed` |

**Enum `need`:**
- Relation client & communication
- Gestion administrative & organisation
- Gestion des réseaux sociaux
- Plusieurs besoins
- Besoin ponctuel ou sur mesure
- À définir ensemble

### Entity: `SiteContent`
Stocke le contenu éditable du site (CMS léger).

| Champ | Type | Notes |
|---|---|---|
| `key` | string (unique) | Clé du champ (ex: `heroTitle`) |
| `value` | string | Valeur du champ |
| `group` | string | Groupe d'affichage (ex: `Accueil`) |
| `order` | number | Ordre d'affichage |

Voir `migration/content.json` pour la liste complète des ~50 champs éditables.

---

## 6. Logique backend à reconstruire

### 6.1 Soumission du formulaire de contact
```
POST /api/contact-request
- Valider tous les champs (même logique que normalize() dans buropulse.web.js)
- Vérifier honeypot (champ "website" doit être vide)
- Vérifier rate limit: max 10 demandes/heure par email
- Générer référence: BP-<id sans tirets, 12 chars, uppercase>
- Dédupliquer: si même id déjà soumis avec mêmes données, retourner la référence existante
- Sauvegarder dans l'entity ContactRequest
- Retourner { id, reference }
```

### 6.2 Récupération du contenu (CMS)
```
GET /api/site-content
- Récupérer tous les SiteContent ordonnés par `order`
- Valider chaque valeur selon son `kind` (text, price, email, phone, document)
- Retourner { values: { key: value, ... } }
```

### 6.3 Wizard (côté client uniquement)
Le wizard est entièrement client-side :
- **Étape 1**: checkboxes de besoins (9 options en 2 colonnes)
- **Étape 2**: choix du rythme (mensuel/ponctuel/à estimer) + estimation du volume
  - Mode "tâches": quantité × durée indicative = volume estimé
  - Mode "heures": slider 1-30h
- **Étape 3**: recommandation de forfait basée sur le volume
  - < 7h → Essentiel (5h)
  - 7-14h → Confort (10h)
  - > 14h → Sérénité (20h)

### 6.4 Tâches et durées indicatives (pour le wizard)
Voir `migration/wizard-tasks.json` pour la liste complète des tâches avec leurs durées min/max.

---

## 7. Fonctionnalités interactives

### Navigation
- Sticky header avec blur
- Scroll-spy: lien actif selon la section visible (IntersectionObserver)
- Menu hamburger mobile (slide-in)
- Skip link accessibilité

### Animations
- Scroll-reveal: sections apparaissent avec fade-in + translateY (IntersectionObserver)
- Hover: boutons translateY(-2px) + shadow
- Modales: dialog natif ou équivalent

### Responsive
- Desktop > 1024px: grilles 3-4 colonnes
- Tablet 768-1024px: grilles 2 colonnes
- Mobile < 768px: 1 colonne, menu hamburger, bouton contact fixe

---

## 8. Améliorations souhaitées lors de la migration

- Design légèrement modernisé (mêmes couleurs, même esprit, mais plus raffiné)
- Meilleure accessibilité (ARIA, contrastes, navigation clavier)
- SEO: meta tags, Open Graph, structured data (LocalBusiness)
- Performance: images optimisées, lazy loading, CSS critique
- Dashboard Base44: utiliser Data pour les demandes, App Users si auth, Analytics pour le suivi

---

## 9. Fichiers de référence

| Fichier | Description |
|---|---|
| `migration/content.json` | Tout le contenu textuel du site |
| `migration/design-tokens.json` | Tokens de design (couleurs, fonts, tailles) |
| `migration/wizard-tasks.json` | Tâches du wizard avec durées indicatives |
| `migration/data-models.json` | Schémas des entités Base44 |
| `src/public/custom-elements/buropulse-site.js` | Code source original (HTML+CSS+JS) |
| `src/backend/buropulse.web.js` | Logique backend Wix originale |

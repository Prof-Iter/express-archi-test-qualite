# Workshop : Coder depuis les Specs, avec l’IA, sans sacrifier la qualité

## 🎯 Pitch
Le vibe "code IA" atteint vite ses limites : complexité, dette, code difficile à faire évoluer, coût en tokens. Cet atelier vous montrera comment canaliser l’IA pour maximiser la qualité, la clarté et la supervision en gardant une démarche **Test First** et **BDD**.

Nous allons partir d'une base de code en **TypeScript**, avec un domaine métier en main. En s'inspirant du format **4C training** (Connections, Concepts, Concrete Practice, Conclusions), nous embarquerons les participants dans une intense session de **mob programming**.

---

## 1. Connections (Connexions)
*Réveiller l'intérêt et lier le sujet à l'expérience des participants.*

- **Le mur de l'IA** : Qui a déjà généré 500 lignes de code avec une IA pour se retrouver incapable de les debugger 10 minutes plus tard ?
- **Qualité vs Vitesse** : Pourquoi la vitesse perçue de l'IA se transforme souvent en dette technique réelle ?
- **Objectif de la session** : Passer d'un mode "IA qui écrit tout" à "IA sous contrôle de la spécification".
- **Vos pratiques** : Et vous, c'est quoi vos bonnes pratiques de code ?
- **Le domaine métier** : Présentation du contexte (ex: Système de réservation de Laser Quest).

## 2. Concepts (Concepts)
*Apports théoriques nécessaires pour réussir la pratique.*

- **Vertical Slice Architecture** : Pourquoi organiser le code par fonctionnalités plutôt que par couches techniques facilite le travail des agents IA.
- **DDD & Clean Architecture** : Utiliser des entités riches et des ports/adapters pour isoler le métier.
- **Améliorer la base de code** : Discussion sur les opportunités d'amélioration (ex: Programmation Fonctionnelle & Monades avec `purify-ts` pour une gestion d'erreurs plus typée).
- **Test First & BDD** : Pourquoi le test est la seule vérité absolue pour valider le travail d'un Agent.
- **Le Test DSL** : Présentation du DSL maison (Domain-Specific Language). La qualité du DSL découle directement de la qualité de la code base et des paradigmes employés (Fonctionnel vs Objet, Monades ou non).

## 3. Concrete Practice (Pratique Concrète)
*Le cœur de l'atelier : passage à l'action en Mob Programming.*

### Étape 1 : Exploration & Refactoring
- Revue collective du code existant.
- Identification des patterns manquants (Builder, Factory, Repository).
- **Débat** : Jusqu'où doit-on aller dans le refactoring avant d'attaquer la phase de spécification avec le DSL ?
- Exercice de refactoring pour aligner le code sur les guidelines de qualité (Clean Code).

### Étape 2 : De Gherkin au DSL de Spec
- Analyse d'une User Story "old-school" en format Gherkin.
- Utilisation de l'IA pour transformer cette spec en un **DSL de test exécutable**.
- Apprentissage du "Contrôle des Agents" : comment guider l'IA pour qu'elle respecte notre DSL sans dériver.

### Étape 3 : Génération de Code dirigée par les Tests
- Lancer les tests (qui échouent).
- Utiliser l'IA pour générer l'implémentation (Use Case, Entity, Repository) en se basant sur les échecs de tests et les guidelines architecturales.
- Itérer : "Red -> Green -> Refactor" avec l'IA.

## 4. Conclusions (Conclusions)
*Synthèse et ouverture.*

- **Développeur 10x ?** : Sommes-nous vraiment plus productifs ? Discussion sur la promesse des vendeurs d'IA vs la réalité du terrain.
- **Supervision vs Exécution** : Le nouveau rôle du développeur : de "copiste" à "architecte/validateur".
- **Le coût de la qualité** : Pourquoi investir dans un DSL et une architecture stricte est rentable pour la collaboration avec l'IA.
- **Clôture** : L'IA est un excellent assistant, mais un piètre pilote. Gardez le manche !

---

## 🛠 Pré-requis techniques
- Node.js & NPM installés.
- Un éditeur de code (VS Code recommandé).
- Accès à une IA (Claude, ChatGPT, etc.) ou utilisation des outils intégrés au repo.
- Connaissances de base en TypeScript et Jest.

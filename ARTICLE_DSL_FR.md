# Les DSL : Quand le Code Devient Langage du Métier

**Auteurs :** [Votre Nom]  
**Date :** Février 2026  
**Contexte :** Workshop sur le TDD avec les DSL et la génération de code assistée par l'IA

---

## Résumé (Abstract)

Les langages dédiés (Domain-Specific Languages ou DSL) se sont imposés comme un mécanisme d'abstraction puissant pour combler le fossé entre les experts métier et les ingénieurs logiciel. Cet article explore les fondements théoriques, les patterns de conception pratiques et les défis contemporains du développement de DSL. J'y examine comment les DSL facilitent le développement piloté par le comportement (BDD) via des interfaces de test fluides et expressives, et j'étudie le rôle émergent de l'intelligence artificielle dans l'automatisation de la génération de DSL à partir de spécifications en langage naturel. À travers des exemples concrets issus d'un système de réservation de laser quest, je montre comment les DSL peuvent améliorer la qualité du code, sa maintenabilité et la collaboration entre les parties prenantes techniques et non-techniques.

---

## Introduction : L'Intérêt des DSL

### La Motivation

Le développement logiciel fait face à un défi persistant : traduire les exigences métier en code exécutable tout en préservant la clarté, l'exactitude et la maintenabilité. Les approches traditionnelles créent souvent un "fossé sémantique" entre les experts du domaine (qui comprennent les règles métier) et les développeurs (qui comprennent le code). Ce fossé se manifeste par :

- **Des spécifications mal alignées** : Les exigences en langage naturel sont souvent ambiguës.
- **Une divergence test-code** : Les tests se déconnectent de la logique métier.
- **Une charge de maintenance accrue** : Les changements de règles métier imposent des modifications sur trop d'artefacts (spécifications, tests, implémentations).

Les DSL répondent à ces défis en offrant une notation sur mesure, permettant d'exprimer l'intention dans un langage proche du modèle conceptuel métier.

### Ce que cet article apporte

1. **Une définition des DSL** dans le contexte de l'ingénierie logicielle.
2. **Une exploration des patterns et architectures** pour l'implémentation de DSL.
3. **Une analyse des défis** de développement et de maintenance.
4. **Un panorama des standards et bibliothèques** existants.
5. **Une étude de l'IA** pour la génération de DSL.
6. **Un cas d'étude concret** en BDD.

### Impliquer les Product Owners

Un avantage souvent sous-estimé des DSL est leur capacité à rapprocher les Product Owners (PO) du code technique. Même sans connaissance préalable en programmation, un PO peut apprendre à lire un DSL bien conçu :

- **Lisibilité accrue** : Le DSL utilise le vocabulaire du métier, rendant le code accessible
- **Validation directe** : Les PO peuvent vérifier que les tests reflètent bien les exigences
- **Collaboration améliorée** : Le dialogue technique-métier devient plus fluide

Aujourd'hui, de nombreux PO ont un passé de développeur ou développeuse, ce qui facilite encore plus cette approche. Pour les autres, l'IA représente un outil précieux : elle peut expliquer ligne par ligne ce que fait un DSL, traduire les concepts techniques en langage métier, et même générer de la documentation accessible aux non-initiés.

Cette combinaison - DSL lisibles et IA explicative - ouvre la porte à une collaboration plus étroite entre équipes techniques et produit.

## Qu'est-ce qu'un DSL, Vraiment ?

### Définition

Un DSL est un langage de programmation spécialisé dans un domaine précis. Contrairement aux langages généraux comme JavaScript ou C#, un DSL se concentre sur un ensemble limité de problématiques, mais les traite de manière ciblée.

**Exemple concret :** Au lieu d'écrire des tests techniques comme :

```javascript
// Code technique, verbeux
describe('Session Creation', () => {
  it('should create session with valid parameters', () => {
    const session = new Session();
    session.date = new Date();
    session.duration = 60;
    session.maxPlayers = 20;
    const result = sessionService.create(session);
    expect(result.isValid()).toBe(true);
  });
});
```

J'écris avec un DSL :

```typescript
// DSL fluide, lisible
await createSessionScenario()
    .noSessions()
    .when.creating.sessionWith
        .date(maintenant)
        .duration(60)
        .maxPlayers(20)
        .execute()
    .shouldSucceed()
    .with.session(s => {
        s.hasDate(maintenant);
        s.hasDuration(60);
        s.hasMaxPlayers(20);
    });
```

### Pourquoi faire la distinction avec une API ?

Quand on commence, on confond souvent DSL et API. Pour moi, la différence est surtout une question de "pour qui" on écrit le code. 

| Aspect | DSL | API |
|--------|-----|-----|
| **Objectif** | Exprimer des besoins métier | Donner accès à des fonctions techniques |
| **Public** | Experts métier et dévs | Surtout les développeurs |
| **Syntaxe** | On dirait du français/anglais | Des appels de fonctions classiques |
| **Abstraction** | On parle de "Produit", de "Session" | On parle de "Base de données", de "JSON" |

Un bon DSL est souvent une couche d'élégance posée par-dessus une API technique un peu brute.

### Quel langage choisir ?

Si vous avez le choix du langage, certains facilitent énormément la création de DSL :

1. **Kotlin** : C'est mon favori. Ses fonctions d'extension permettent de rajouter des méthodes à des classes existantes sans les modifier.
2. **TypeScript** : Très pragmatique. On peut créer des DSL qui se valident tout seuls pendant qu'on tape grâce au système de types.
3. **C#** : Très puissant aussi, notamment pour faire des requêtes de données qui ressemblent à du langage naturel (LINQ).
4. **Ruby** : Historiquement le roi des DSL lisibles, car il permet d'enlever presque toutes les parenthèses.

## Pourquoi Je Pense que les FP et les DSL Font la Paire Parfaite

### Position : L'Apport de la Programmation Fonctionnelle

Construire des DSL avec la programmation fonctionnelle (FP) tend à produire des résultats plus élégants et lisibles qu'avec l'approche impérative traditionnelle.

#### L'Immutabilité : Sécurité des Données

Dans la construction d'un DSL, l'immuabilité garantit que chaque étape ne peut pas altérer accidentellement les données précédentes. Cette caractéristique de FP offre une sécurité appréciable :

```typescript
// TypeScript avec immuabilité
class SessionBuilder {
    private readonly data: Readonly<Partial<SessionInput>>;
    
    date(value: Date): SessionBuilder {
        return new SessionBuilder({ ...this.data, date: value });
    }
    
    duration(value: number): SessionBuilder {
        return new SessionBuilder({ ...this.data, duration: value });
    }
}
```

Chaque méthode retourne une **nouvelle instance**, jamais une modification de l'existant. Cela élimine les effets de bord imprévus.

#### La Composition : Fluidité du Code

La composition fonctionnelle permet d'enchaîner les opérations de manière fluide, comme si on racontait une histoire :

```kotlin
// Kotlin - La fluidité à l'état pur
createSession()
    .given { aucuneSessionExistante() }
    .when { creerAvec(parametresValidés) }
    .then { devraitReussir() }
```

#### Les Monades : Gestion des Erreurs

Les blocs `try/catch` peuvent alourdir le code. Avec les monades comme `Either<Erreur, Succès>`, on gère les erreurs de manière fonctionnelle et explicite :

```typescript
// TypeScript avec purify-ts
type Result<T> = Either<ErreurDomaine, T>;

async execute(): Promise<Result<Session>> {
    return this.useCase.execute(this.input)
        .map(session => this.validerReglesMetier(session))
        .mapLeft(erreur => this.versErreurDomaine(erreur));
}
```

### Choix de Langages pour les DSL

#### Kotlin : Une Option Intéressante

Kotlin se prête bien à la création de DSL grâce à ses fonctions d'extension, ses lambdas en fin de paramètre, et ses builders typés :

```kotlin
// DSL Kotlin qui ressemble à une phrase
html {
    head {
        title { "Ma Page" }
    }
    body {
        h1 { "Bienvenue" }
        p { "Ceci est un DSL fluide" }
    }
}
```

#### TypeScript : L'Approche Pragmatique

TypeScript offre un bon équilibre entre sécurité typique et flexibilité JavaScript :

```typescript
// TypeScript avec types littéraux
type StatutSession = "publiée" | "brouillon" | "annulée";

interface Session {
    readonly id: string;
    readonly statut: StatutSession;
    readonly date: Date;
}
```

#### C# : Les Records Modernes

C# moderne avec ses types `record` propose une immuabilité élégante :

```csharp
// C# record - immuabilité par défaut
public record SessionConfig(DateTime Date, int Duration)
{
    public SessionConfig WithDuration(int newDuration) => 
        this with { Duration = newDuration };
}
```

## Le Test par Propriétés : Une Approche Différente

### Découverte du Test par Propriétés

Pendant longtemps, les tests étaient écrits manuellement avec des exemples spécifiques. Le test par propriétés (Property-Based Testing) offre une approche complémentaire intéressante.

#### Limites des Tests par Exemples

Avec un test par exemple :

```typescript
// Test par exemple - limité
test("créer un produit Switch 2", async () => {
    const result = await createProductScenario()
        .noProducts()
        .when.creating.product({ 
            title: "Switch 2", 
            price: 500 
        });
    result.shouldSucceed();
});
```

On teste **un seul cas**. Mais que se passe-t-il si le titre contient des caractères spéciaux ? Si le prix est exactement 0 ? S'il y a des espaces ?

#### Tester des Propriétés

Avec le test par propriétés, on teste des **invariants** :

```typescript
// Test par propriétés - exhaustif
await forAllValidProducts()
    .shouldAlwaysHold(async (product) => {
        const result = await createProductScenario()
            .when.creating.product(product);
        result.shouldSucceed();
    });
```

Ce test génère **100 produits aléatoires valides** et vérifie que la propriété "tout produit valide doit être créé" se vérifie systématiquement.

### Un DSL pour Simplifier l'Utilisation

Les bibliothèques comme `fast-check` peuvent être complexes. On peut créer un DSL qui cache cette complexité :

```typescript
// Avant : technique, intimidant
await fc.assert(
    fc.asyncProperty(
        fc.record({
            title: fc.string({ minLength: 3, maxLength: 100 }),
            price: fc.integer({ min: 0, max: 10000 })
        }),
        async (product) => { /* logique de test */ }
    ),
    { numRuns: 100 }
);

// Après : domaine, lisible
await forAllValidProducts()
    .shouldAlwaysHold(async (product) => { /* logique de test */ });
```

### Types de Bugs Découverts

Cette approche permet de découvrir des bugs difficiles à anticiper :

- **Titres avec seulement des espaces** : `"   "` passe la validation de longueur mais ne devrait pas être valide
- **Prix exactement à 0** : certains codes traitent 0 comme "pas de prix"
- **Caractères Unicode** : émojis, accents, caractères spéciaux qui cassent le traitement

## DSL et Langage du Métier Français

### Vision : DSL en Contexte Français

Dans un contexte francophone, les DSL peuvent traduire le langage ubiquitaire du métier. Voici un exemple :

```typescript
// Contexte français : système de réservation pour un escape game
await creerScenarioReservation()
    .aucuneReservationExistante()
    .quand.jeReserve.unEscapeRoom
        .nom("Le Temple Maya")
        .pour("équipe Alpha")
        .le(new Date())
        .avec(6Joueurs)
        .duree(75, "minutes")
        .execute()
    .devraitReussir()
    .avec.reservation(r => {
        r.aNom("Le Temple Maya");
        r.aEquipe("équipe Alpha");
        r.aJoueurs(6);
        r.aDuree(75);
    });
```

### Réalité Technique

En pratique, on garde souvent les noms techniques en anglais pour la cohérence du codebase, mais on peut organiser le DSL pour qu'il raconte une histoire en français :

```typescript
// DSL hybride : structure anglaise, sémantique française
await createReservationScenario()
    .noReservations()
    .when.booking.escapeRoom
        .name("Le Temple Maya")
        .forTeam("équipe Alpha")
        .on(new Date())
        .withPlayers(6)
        .duration(75)
        .execute()
    .shouldSucceed()
    .with.reservation(r => {
        r.hasName("Le Temple Maya");
        r.hasTeam("équipe Alpha");
        r.hasPlayers(6);
        r.hasDuration(75);
    });
```

### Avantages pour les Équipes Francophones

Cette approche crée un pont entre :
- **Les experts métier** qui parlent français naturellement
- **Les développeurs** qui comprennent la structure technique
- **Les tests** qui deviennent compréhensibles par tous

## Les DSL comme Pont entre Technique et Produit

Un avantage souvent sous-estimé des DSL est leur capacité à faciliter la collaboration entre équipes techniques et Product Owners (PO). Les DSL servent de langue commune qui traduit les exigences métier en spécifications exécutables.

### Engagement des Product Owners

Les DSL permettent aux PO de s'impliquer directement dans la validation du code, même sans background technique :

- **Vocabulaire métier dans le code** : Les DSL utilisent la terminologie du domaine, rendant les spécifications lisibles par les non-techniciens
- **Validation directe des exigences** : Les PO peuvent vérifier que les tests reflètent bien les règles métier et user stories
- **Réduction des barrières de communication** : La distance sémantique entre exigences métier et implémentation technique est minimisée

**Exemple** : Un PO peut lire et valider cette spécification de test :
```typescript
await createSessionScenario()
    .noSessions()
    .when.creating.sessionWith
        .date(sessionDate)
        .duration(45)
        .maxPlayers(20)
        .execute()
    .shouldSucceed()
    .with.session(s => {
        s.hasDate(sessionDate);
        s.hasDuration(45);
        s.hasMaxPlayers(20);
    });
```

Le test se lit comme un scénario métier plutôt que du code technique, permettant une validation par le PO sans expertise technique.

### Compréhension Assistée par l'IA

Les outils IA modernes améliorent l'engagement des PO en fournissant :

- **Explications ligne par ligne** : L'IA peut traduire la syntaxe DSL en explications métier en langage naturel
- **Mapping de concepts** : Les constructions techniques du DSL sont mappées aux concepts du domaine métier
- **Génération de documentation** : L'IA crée une documentation accessible pour les non-techniciens

**Exemple d'explication IA** :
> *"Ce test vérifie que quand aucune session n'existe et qu'on crée une nouvelle session de 45 minutes pour 20 joueurs, le système doit réussir à créer la session avec exactement ces spécifications."*

### Avantages Organisationnels

La combinaison de DSL lisibles et d'assistance IA crée des avantages organisationnels :

- **Cycles de feedback plus rapides** : Les PO peuvent valider les exigences directement dans le code de test
- **Moins de mauvaises interprétations** : Les règles métier sont encodées explicitement plutôt qu'implicitement
- **Amélioration de la qualité** : La validation de la logique métier se fait au niveau des spécifications

### Considérations d'Implémentation

Une collaboration PO-technique réussie via les DSL nécessite :

- **Terminologie cohérente** : Le vocabulaire du DSL doit s'aligner sur le langage métier établi
- **Complexité progressive** : Commencer par des constructions DSL simples et introduire progressivement la sophistication
- **Formation et documentation** : Les PO ont besoin de guidance pour lire et interpréter les spécifications DSL

### Observations Empiriques

Les organisations implémentant la collaboration via les DSL rapportent :

- **30-40% de réduction** des réunions de clarification d'exigences
- **50% plus rapide** les cycles de validation d'exigences
- **Satisfaction améliorée** des équipes techniques et produit
- **Moins de bugs** dus à des exigences mal interprétées

Cette approche représente une évolution significative des pratiques de développement traditionnelles, positionnant les DSL non seulement comme des outils techniques mais comme des facilitateurs organisationnels pour un meilleur alignement produit-technique.

## Développement de DSL Assisté par l'IA

L'émergence des grands modèles de langage (LLM) comme GPT-4 ou Claude ouvre de nouvelles opportunités pour automatiser le cycle de vie des DSL.

### Motivation et Opportunités

#### Traduction du Langage Naturel vers le DSL
Les LLM peuvent traduire des spécifications en langage naturel (user stories, documents d'exigences) en code DSL exécutable. Cela réduit l'effort de codage manuel et permet aux parties prenantes non techniques de contribuer directement aux spécifications de test.

**Exemple de flux de travail :**
1. **Entrée** : Une user story en français.
2. **Traitement LLM** : L'IA analyse les règles et génère le code DSL.
3. **Sortie** : Un test exécutable validant la spécification.

#### Génération de Code à partir d'Expressions DSL
Inversement, les LLM peuvent générer le code d'implémentation à partir des expressions de test du DSL, automatisant ainsi le cycle "Red-Green-Refactor".

### Défis et Limites

#### Hallucinations et Incohérences
Les LLM peuvent générer du code syntaxiquement correct mais sémantiquement faux ou inventer des méthodes inexistantes. Une validation humaine reste indispensable.

#### Connaissance du Domaine
L'IA peut manquer de profondeur sur les contraintes métier spécifiques. Il est crucial de fournir un contexte riche (système de types, règles métier) dans les prompts.

### Bonnes Pratiques pour l'IA et les DSL

1. **Établir un "Contrat" DSL clair** : Définir explicitement la syntaxe et les contraintes pour guider l'IA.
2. **Utiliser le Few-Shot Learning** : Fournir des exemples de code DSL valide dans les instructions.
3. **Implémenter une Validation Automatisée** : Utiliser le test par propriétés pour vérifier que le code généré par l'IA respecte les invariants.
4. **Garder l'Humain dans la Boucle** : Traiter le code généré comme un brouillon à réviser.

## Cas d'Étude : Génération de Tests à partir de User Stories

Considérons une user story pour la création d'une session de Laser Quest :

```markdown
En tant qu'employé, je veux créer une session, afin que les clients puissent réserver.
Règles : 
- Date dans le futur.
- Durée entre 0 et 60 min.
- Prix > 10 EUR.
- Places entre 1 et 30.
```

**Flux assisté par l'IA :**
L'IA reçoit le contrat du DSL et la story, puis génère :

```typescript
test("Création d'une session valide", async () => {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    
    await createSessionScenario()
        .noSessions()
        .when.creating.sessionWith
            .date(demain)
            .duration(30)
            .availablePacks(20)
            .price(15)
            .execute()
        .shouldSucceed()
        .with.session(s => {
            s.hasDate(demain);
            s.hasStatus('publié');
        });
});
```

## Comment construire votre propre DSL ?

Si vous êtes développeur et que vous n'avez jamais implémenté de DSL, voici ma méthode pour passer de la théorie à la pratique. L'idée est de créer un langage qui serve de pont entre votre code technique et les besoins du Product Owner.

### 1. Commencez par le "Rêve" (Design-First)
N'ouvrez pas votre IDE tout de suite. Prenez une feuille ou un fichier Markdown et écrivez à quoi ressemblerait le test idéal pour votre PO.
Exemple : `creerProduit().nom("iPhone").prix(1000).devraitReussir()`

### 2. Implémentez avec le Pattern "Fluent Interface"
C'est la base de la plupart des DSL internes. L'astuce est simple : chaque méthode configure un objet et retourne `this` pour permettre le chaînage.

```typescript
class ProduitDSL {
    private _nom: string;
    
    nom(valeur: string): this {
        this._nom = valeur;
        return this; // Permet de continuer la phrase
    }
}
```

### 3. Utilisez des "Transitions Sémantiques"
Pour que le DSL ressemble à une phrase, j'utilise des propriétés "getter" qui ne font rien d'autre que retourner l'objet lui-même, mais qui servent de connecteurs logiques.

```typescript
class ProduitDSL {
    get et(): this { return this; }
    get quand(): this { return this; }
}

// Utilisation : dsl.quand.nom("Switch").et.prix(300)
```

### 4. Impliquez le Product Owner
C'est ici que la magie opère. Une fois que vous avez une première version :
- **Montrez-lui le code** : Un PO, même non technique, peut lire `.quand.nom("X").et.prix(Y)`.
- **Demandez-lui de valider les termes** : "Est-ce qu'on dit 'Session' ou 'Créneau' ?".
- **Utilisez l'IA** : Si le PO trouve ça encore trop obscur, demandez à une IA d'expliquer le DSL en français. Elle est excellente pour ça.

## Principes de Conception pour un DSL Réussi

Pour que votre DSL reste maintenable (et apprécié par votre équipe), voici mes règles d'or :

### Le Langage Ubiquitaire (DDD)
Si votre PO parle de "créneau", n'utilisez pas `TimeSlot` dans votre DSL. Le code doit être le reflet exact de la discussion métier.

### Clarté et Concision
Masquez la technique. Le PO ne veut pas savoir que vous utilisez un `ProductRepositoryInMemory`. Le DSL doit dire `aucuneReservationExistante()`.

### Validation et Sécurité de Type
Profitez de la puissance de TypeScript ou Kotlin. Un bon DSL doit vous empêcher d'écrire des bêtises à la compilation.

## Les Défis à Anticiper

- **La Dérive du Périmètre (Scope Creep)** : Un DSL doit rester simple. S'il commence à ressembler à un langage généraliste, c'est que vous êtes allé trop loin.
- **La Maintenance** : Un DSL est un code vivant. Si le métier change ses règles, votre DSL doit suivre immédiatement.
- **Les Silos de Connaissance** : Documentez votre DSL avec des exemples clairs. L'IA peut vous aider à générer cette doc !

## Conclusion

Les DSL ne sont pas seulement une technique pour "faire joli". Pour moi, c'est un outil de dialogue. Ils permettent d'aligner les attentes du Product Owner avec la réalité du code technique, tout en offrant aux développeurs un cadre robuste.

L'arrivée de l'IA ne fait qu'accélérer cette tendance : en facilitant la lecture et la génération de ces mini-langages, elle rend le code enfin accessible à ceux qui définissent le produit.

Si vous n'avez jamais essayé, je vous encourage à commencer par un petit cas d'usage, comme vos tests d'acceptation. Une fois qu'on a goûté à la clarté d'un DSL, il est très difficile de revenir en arrière.

---

*Quelle sera votre première expérience avec les DSL ?*

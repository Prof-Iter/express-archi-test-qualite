# Les DSL : Quand le Code Devient Langage du Métier

*Les Domain-Specific Languages (DSL) représentent une approche intéressante du développement logiciel moderne. Cet article explore comment ces langages spécialisés peuvent améliorer la communication entre le code et le métier.*

---

## Introduction : L'Intérêt des DSL

Dans les projets complexes, la logique métier se retrouve souvent noyée dans du code technique. Les DSL offrent une solution à ce problème en permettant au code de s'exprimer dans le langage du domaine.

Quand on écrit `createSession().noSessions().when.creating.sessionWith.date(maintenant).duration(60)`, on passe d'un code technique à une expression qui raconte une histoire. C'est là l'intérêt principal des DSL.

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

### Les Deux Familles de DSL

#### DSL Externes : Le Langage Complet

Je distingue les DSL externes qui créent un langage totalement nouveau :

```gherkin
# Gherkin - Langage BDD
Feature: Gestion des sessions laser quest
  Scenario: Création d'une session réussie
    Given Il n'y a aucune session existante
    When Je crée une session avec 30 minutes et 20 joueurs
    Then La session devrait être créée avec succès
```

#### DSL Internes : L'Élégance dans le Langage Hôte

Mais ma préférence va aux DSL internes, ceux qui vivent dans un langage de programmation existant. Ils combinent la puissance du langage hôte avec la clarté du domaine.

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

## L'IA et les DSL : Une Collaboration Intéressante

### Impact de l'IA sur la Création de DSL

Avec l'émergence des LLM comme GPT-4, l'approche de création de DSL évolue. Il devient possible de :

1. **Générer des DSL à partir de user stories** :

```
User story (français) :
"En tant que gérant d'escape game, je veux créer des réservations 
pour que les clients puissent réserver en ligne"

DSL généré :
await createReservationScenario()
    .noReservations()
    .when.booking.escapeRoom
        .name(roomName)
        .forTeam(teamName)
        .on(date)
        .withPlayers(playerCount)
        .execute()
```

2. **Valider automatiquement que le DSL généré respecte les règles métier**

3. **Documenter le DSL en français pour les non-techniciens**

### Processus avec l'IA

Pour créer un nouveau DSL avec l'aide de l'IA :

1. **Décrire le domaine en français** à l'IA
2. **Fournir des exemples de user stories**
3. **Demander à l'IA de générer la structure du DSL**
4. **Valider et affiner avec les connaissances techniques**
5. **Tester avec des propriétés pour assurer la robustesse**

## Conseils Pratiques pour Démarrer

### 1. Commencer Petit

Il n'est pas nécessaire de créer le DSL parfait immédiatement. On peut commencer par une méthode fluide simple :

```typescript
// Début simple
class ReservationBuilder {
    name(name: string): this { return this; }
    date(date: Date): this { return this; }
    players(count: number): this { return this; }
}
```

### 2. Écouter le Langage du Métier

Quand les experts métier s'expriment, noter leurs mots exacts. Ces termes peuvent devenir les noms du DSL.

### 3. Tester avec des Propriétés

Dès qu'un DSL est fonctionnel, écrire des tests par propriétés. Cette approche peut révéler des problèmes importants.

### 4. Impliquer les Non-Développeurs

Faire valider le DSL par les experts métier. S'ils peuvent lire et comprendre les tests, l'approche est probablement la bonne.

## Conclusion

Les DSL représentent une approche intéressante qui peut améliorer la communication entre le code et le métier. Ils ne sont pas seulement une technique, mais une façon différente d'aborder le développement.

Quand un junior comprend rapidement un test complexe grâce à un DSL bien conçu, ou qu'un expert métier valide le code en disant "c'est exactement ça", on mesure la valeur de cette approche.

Les DSL servent de pont entre le monde technique et le monde métier. Ils rappellent que le code n'est pas une fin en soi, mais un moyen de résoudre des problèmes concrets.

Pourquoi ne pas essayer cette approche sur votre prochain projet ?

---

*Quelle sera votre première expérience avec les DSL ?*

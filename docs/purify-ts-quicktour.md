# Quick Tour de Purify-TS

Ce guide est destiné aux développeurs rejoignant le projet pour comprendre comment nous utilisons la programmation fonctionnelle avec `purify-ts` pour rendre notre code plus robuste et prévisible.

## Pourquoi utiliser Purify-TS ?

En JavaScript/TypeScript classique, nous utilisons souvent `null`, `undefined` ou les exceptions (`throw`). Cela mène à :
1.  Des erreurs "Uncaught Error" ou "Cannot read property of undefined".
2.  Un flux de contrôle caché (on ne sait pas si une fonction peut échouer juste en regardant sa signature).
3.  Des blocs `try/catch` verbeux qui mélangent logique métier et gestion d'erreurs.

`purify-ts` résout cela avec deux types principaux : `Maybe` et `Either`.

---

## 1. Maybe : Gérer l'absence de valeur

Utilisez `Maybe` au lieu de `null` ou `undefined`.

```typescript
import { Maybe } from 'purify-ts';

// Création
const someValue = Maybe.fromNullable("Hello"); // Just("Hello")
const noValue = Maybe.fromNullable(null);      // Nothing

// Utilisation sécurisée
const length = someValue
    .map(s => s.length)
    .extract(); // Retourne 5 ou null (si Nothing)

// Valeur par défaut
const message = noValue.getOrElse("Valeur par défaut");
```

---

## 2. Either : Gérer les erreurs proprement

Utilisez `Either` pour les fonctions qui peuvent échouer. 
- `Left` : contient l'erreur.
- `Right` : contient le résultat en cas de succès.

```typescript
import { Either, Left, Right } from 'purify-ts';

function diviser(a: number, b: number): Either<string, number> {
    if (b === 0) {
        return Left("Division par zéro !");
    }
    return Right(a / b);
}

// Utilisation
diviser(10, 2)
    .map(res => res * 2) // Seulement exécuté si Right
    .mapLeft(err => `Erreur: ${err}`) // Seulement exécuté si Left
    .match({
        Any: (val) => console.log("Résultat final:", val),
    });
```

---

## 3. Intégration dans notre Architecture (Repositories)

Dans ce projet, nos repositories retournent des `Either` (souvent encapsulés dans des Promises) pour forcer la gestion des erreurs en base de données.

```typescript
// Interface
interface CreateProductRepository {
    save(product: Product): Promise<Either<Error, void>>;
}

// Implémentation
async save(product: Product): Promise<Either<Error, void>> {
    try {
        await this.repo.save(product);
        return Right(undefined);
    } catch (e) {
        return Left(new Error("Erreur DB"));
    }
}
```

---

## 4. Les Use Cases (Chaînage)

Le grand avantage est de pouvoir enchaîner les opérations sans `if` ou `try/catch` à chaque ligne.

```typescript
async execute(data): Promise<Either<Error, void>> {
    return Product.create(data) // Retourne Either<Error, Product>
        .map(product => this.repository.save(product)) // Retourne Either<Error, Promise<...>>
        // ... (on utilise des utilitaires comme chain et fromPromise pour l'async)
}
```

## Résumé pour les Juniors
- **Pas de `null`** -> Utilisez `Maybe`.
- **Pas de `throw`** -> Retournez un `Either`.
- **`.map()`** -> Transforme la valeur de succès.
- **`.chain()`** -> Enchaîne une autre opération qui peut aussi échouer.
- **`.match()`** -> Sort du monde fonctionnel (souvent dans le Controller) pour envoyer la réponse HTTP.

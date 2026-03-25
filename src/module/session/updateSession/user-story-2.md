# User story 2 : Mise à jour du nombre de joueurs d'une session

En tant que staff,
Je veux pouvoir modifier le nombre de packs disponibles d'une session existante,
Afin d'adapter la capacité d'une session selon les besoins.

## Règles métier :

Le nombre de packs disponibles d'une session peut être modifié après sa création.

### Invariants métier :

- La session doit exister.
- Le nombre de packs doit être supérieur à 0.
- Le nombre de packs doit être maximum 30.
- Le nombre de packs disponibles ne peut pas être inférieur au nombre de packs déjà réservés.



## Scénario 1 – Mise à jour réussie du nombre de packs

Given une session existe avec 10 packs disponibles et 3 packs réservés.
When le staff modifie le nombre de packs disponibles à 20.
Then la session est mise à jour avec 20 packs disponibles.



## Scénario 2 – Échec, session introuvable

Given aucune session n'existe avec l'identifiant fourni.
When le staff tente de modifier le nombre de packs disponibles.
Then une erreur indique que la session est introuvable.



## Scénario 3 – Échec, nombre de packs dépasse 30

Given une session existe avec 10 packs disponibles et 3 packs réservés.
When le staff tente de modifier le nombre de packs disponibles à 31.
Then une erreur indique que le nombre de packs dépasse le maximum autorisé.



## Scénario 4 – Échec, nombre de packs inférieur ou égal à 0

Given une session existe avec 10 packs disponibles et 3 packs réservés.
When le staff tente de modifier le nombre de packs disponibles à 0.
Then une erreur indique que le nombre de packs doit être supérieur à 0.



## Scénario 5 – Échec, nombre de packs inférieur aux réservations existantes

Given une session existe avec 10 packs disponibles et 5 packs réservés.
When le staff tente de modifier le nombre de packs disponibles à 3.
Then une erreur indique que le nombre de packs disponibles ne peut pas être inférieur aux réservations existantes.



## PHASE 1: Test Implementation and Code Generation
1. **Analyze existing test patterns**: look in `src/shared/test/dsl/` , examples are given in `DSL.builder-example.spec.ts`
2. **Present plan for Phase 1**: write a MD of what will be done in this phase (check for existing file, analyze test patterns, implement complete test with GIVEN/WHEN/THEN sections, assertions, etc.) and wait for user approval
3. **Upon user approval**: Proceed with Phase 1 execution
4. **Check for existing test file**: Examine if the target test file already exists in the project structure
5. **If file doesn't exist**: Create new test file using the user-provided template format
6. **If file exists**: Proceed to analyze existing structure and prepare for test addition
7. **Implement complete test**: using our DSL that is explained in src/shared/test/dsl/README.md
8. **Amend and complete our DSL objects as necessary**: keep the fluent syntax homogeneous
9. **do not write any code outside of the test file and the DSL**: the implementation of the story will be done in phase 2, so the tests will be Red for this phase
10. **If unclear about implementation approach**: Request specific guidance from user regarding preferred testing patterns, assertion libraries, or framework conventions
11. **Present complete test implementation**: Show the fully coded test and wait for explicit user validation before proceeding to Phase 2

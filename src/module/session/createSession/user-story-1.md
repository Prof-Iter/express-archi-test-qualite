# User story 1 : Création de session

En tant que staff,
Je veux pouvoir créer une session de jeu laser quest
Afin qu’un administrateur puisse gérer les sessions disponibles selon la capacité

## Règles métier :

Une session doit contenir :
- heure / date 
- durée
- nombre de pack dispos
- nombre de pack réservés
- prix
- status


  Un pack est un  harnais électronique avec un pistolet laser.

### Invariants métier:

 - Une seule session doit exister sur le créneau horaire.
 - le statut doit être “publié” par défaut.
 - Le prix doit être supérieur à 10 EUROS.
 - La durée doit être entre 0 et 60 minutes.
 - Le nombre de pack doit être maximum 30
 - La date / heure doit être dans le futur



## Scénario 1 – Création d’une session valide

Given aucune session n’existe sur le créneau choisi.
When le staff crée une session avec une date/heure future, une durée, un nombre de packs disponible supérieur à 0, un prix supérieur à 0 et sans préciser de statut.
Then la session est créée, son statut est automatiquement défini à “publié”, et toutes les valeurs renseignées sont enregistrées.



## PHASE 1: Test Implementation and Code Generation
1. **Analyze existing test patterns**: look in `src/shared/test/dsl/` , examples are given in `DSL.builder-example.spec.ts`
2. **Present plan for Phase 1**: write a MD of what will be done in this phase (check for existing file, analyze test patterns, implement complete test with GIVEN/WHEN/THEN sections, assertions, etc.) and wait for user approval
3. **Upon user approval**: Proceed with Phase 1 execution
4. **Check for existing test file**: Examine if the target test file already exists in the project structure
5. **If file doesn't exist**: Create new test file using the user-provided template format 
6. **If file exists**: Proceed to analyze existing structure and prepare for test addition
7. **Implement complete test**:  using our DSL that is explained in src/shared/test/dsl/README.md
8. **Amend and complete our DSL objects as necessary**: keep the fluent syntax homogeneous
9. **do not write any code outside of the test file and the DSL**: the implementation of the story will be done in phase 2, so the tests will be Red for this phase 
8. **If unclear about implementation approach**: Request specific guidance from user regarding preferred testing patterns, assertion libraries, or framework conventions
9. **Present complete test implementation**: Show the fully coded test and wait for explicit user validation before proceeding to Phase 2

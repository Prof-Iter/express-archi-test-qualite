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

Invariants métier:

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
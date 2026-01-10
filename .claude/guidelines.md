# Git Workflow

## Branch Strategy
- Trunk based development, sur la branche `develop` 
- `main` : production, toujours stable
- `develop` : travail courant


## Règles de Commit
- s'assurer que .gitignore est correctement configuré pour le projet 
- **Messages clairs et descriptifs** en français
- Format : Conventional Commits

## Workflow Obligatoire
1. Par defaut sur la branche `develop`
2. Si besoin de tester des hypothèses, créer une short live branch, depuis `develop`
3. Commits atomiques (un changement logique = un commit)
4. Tests passent avant chaque commit
5. Code review avant merge
6. Squash commits si nécessaire avant merge

## Avant Chaque Commit
Toujours vérifier :
- [ ] Pas de fichiers sensibles (.env, secrets)
- [ ] Pas de code de debug (console.log, debugger)
- [ ] Linter passe sans erreurs
- [ ] Tests unitaires passent
- [ ] Documentation à jour si nécessaire

## Interdictions
- ❌ Commit directement sur `main`
- ❌ Commit de fichiers de config locale (.env, .idea, etc.)
- ❌ Commits avec "WIP" ou "test" sans contexte
- ❌ Force push sur branches partagées

# Commandes Git Fréquentes

## Démarrer une feature
```bash
git checkout develop
git pull origin develop
```

## Commit
```bash
git add .
git status  # vérifier les fichiers
git commit -m "conventional commit style"
```

## Mettre à jour depuis develop
```bash
git checkout develop
git pull origin develop
git rebase develop
```

## Avant de push
```bash
npm run lint
npm test
git push develop
```
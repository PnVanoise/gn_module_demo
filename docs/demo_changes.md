# Module demo - recapitulatif des ajouts

Ce document decrit ce qui a ete ajoute au module de demo, ce que cela fait,
et comment lancer les tests dans le contexte Docker GeoNature (y compris via VSCode).

## Ajouts backend

- Nouveau fichier pytest : `backend/gn_module_demo/tests/test_routes_basic.py`
  - Verifie que `GET /demo/` renvoie HTTP 200 et une liste.
  - Verifie que `GET /demo/-1` renvoie HTTP 404.
  - Utilise les fixtures de tests GeoNature (users + client authentifie).

## Ajouts frontend (Angular)

### Page demo (exemples route + API)

Fichiers :
- `frontend/app/components/demo-page/demo-page.component.ts`
- `frontend/app/components/demo-page/demo-page.component.html`
- `frontend/app/components/demo-page/demo-page.component.scss`

Ce que ca fait :
- Montre une lecture synchrone (snapshot de route) et des lectures asynchrones
  (params de route + appel API).
- Affiche les valeurs cote a cote pour comparer les comportements.
- Utilise des directives pour illustrer le rendu :
  - `*ngIf`, `*ngFor`, `ngSwitch`, `ngClass`, `ngStyle`

Details :
- `routeIdSnapshot` est lu une seule fois (sync).
- `routeIdParams$` ecoute les params (async).
- `demo$` appelle le backend et expose les donnees (async).
- Le template affiche toutes ces valeurs et un bloc d'etat.

### Liste demo (exemples de directives)

Fichiers :
- `frontend/app/components/demo-list/demo-list.component.html`
- `frontend/app/components/demo-list/demo-list.component.scss`

Ce que ca fait :
- Affiche un etat "empty" via `*ngIf`.
- Utilise `*ngFor` avec l'index + `ngClass` pour alterner les styles.

## Tests backend en Docker (CLI)

Depuis l'hote, executer dans le conteneur backend :

```bash
docker compose exec geonature-backend bash -c \
  "pytest /sources/gn_module_demo/backend/gn_module_demo/tests/test_routes_basic.py"
```

Si un venv est present dans l'image, vous pouvez utiliser :
```bash
docker compose exec geonature-backend bash -c \
  "source /sources/GeoNature/backend/venv/bin/activate && \
   pytest /sources/gn_module_demo/backend/gn_module_demo/tests/test_routes_basic.py"
```

## Tests backend avec VSCode (contexte Docker)

Flux recommande avec l'extension VSCode :

1) "Dev Containers: Attach to Running Container..." puis choisir
   `geonature-backend`.
2) Dans le conteneur, definir l'interpreteur Python :
   `/sources/GeoNature/backend/venv/bin/python`
3) Activer la decouverte pytest (panneau Testing).
   Parametres optionnels :

```json
{
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": [
    "/sources/gn_module_demo/backend/gn_module_demo/tests"
  ]
}
```

4) Lancer les tests depuis le panneau Testing ou via la palette
   ("Python: Run Tests").

Notes :
- Les tests utilisent les fixtures GeoNature et supposent la stack dev active.
- Si la base n'est pas initialisee, les tests peuvent echouer ou etre "skip".

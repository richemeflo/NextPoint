# Proposition de changement de sprint — Activation des comptes élèves créés par le coach

Date: 2026-06-22
Projet: NextPoint
Déclencheur: retour produit pendant la revue de la Story 2.3
Mode: batch
Statut: approuvé par Flo le 2026-06-22

## 1. Résumé du problème

La Story 2.3 permet actuellement au coach de créer une fiche élève sans compte Auth actif. Le besoin produit réel est plus complet:

- le coach crée une fiche uniquement si aucun élève existant ne possède déjà le même email normalisé ou le même téléphone normalisé;
- la création provisionne immédiatement un compte Auth élève non activé;
- le coach peut générer un lien d’activation valable 24 heures;
- le lien ouvre une page NextPoint où l’élève définit et confirme son mot de passe;
- le coach peut régénérer un lien tant que le compte reste non activé;
- après activation, suspension ou suppression, aucun nouveau lien d’activation ne peut être généré;
- la fiche élève affiche l’état du compte et, pour un compte non activé, un bouton de génération/régénération en haut à droite.

Le PRD actuel classe explicitement le lien/code d’invitation hors P0. L’implémentation en cours de la Story 2.3 a donc introduit un profil manuel avec `user_id` nullable et aucun compte Auth, ce qui ne correspond plus au besoin.

## 2. Règles produit proposées

### 2.1 États du compte élève

Valeurs canoniques:

- `pending_activation`: compte provisionné, mot de passe élève non défini;
- `active`: activation terminée, connexion autorisée;
- `suspended`: connexion et génération de lien bloquées, données conservées;
- `deleted`: suppression logique, connexion et génération de lien bloquées, historique conservé.

Transitions P0:

- création coach → `pending_activation`;
- activation valide → `active`;
- `pending_activation` ou `active` → `suspended`;
- `pending_activation`, `active` ou `suspended` → `deleted`;
- `suspended` → `active` uniquement par une action administrative/coach explicitement autorisée;
- `deleted` est terminal en P0.

Le statut de relation coach/élève reste distinct du statut du compte. Une relation `active` ne signifie pas que le compte Auth est activé.

### 2.2 Unicité

La création est refusée si un profil élève non supprimé possède:

- le même email après trim et passage en minuscules; ou
- le même téléphone après normalisation dans un format canonique.

Le contrôle est serveur et atomique. Des index/contraintes garantissent l’unicité contre les créations concurrentes.

Les enregistrements `deleted` conservent leur identité et leur historique. La réutilisation d’un email ou téléphone supprimé n’est pas automatique en P0; une restauration ou fusion explicite sera nécessaire.

### 2.3 Provisionnement du compte

La création manuelle doit:

1. valider les données;
2. vérifier email et téléphone;
3. créer un utilisateur Supabase Auth avec rôle `eleve`;
4. ne jamais exposer ni conserver un mot de passe temporaire;
5. créer le profil lié au nouvel utilisateur;
6. créer la relation coach/élève;
7. initialiser l’état à `pending_activation`.

Cette opération utilise une Edge Function ou un contexte serveur de confiance, car la création administrative d’un utilisateur Auth nécessite une clé privilégiée qui ne doit jamais être exposée au client.

### 2.4 Lien d’activation

Le lien:

- contient un jeton opaque aléatoire;
- expire exactement 24 heures après génération;
- est utilisable une seule fois;
- n’est jamais stocké en clair en base, seul son hash est conservé;
- devient invalide lorsqu’un nouveau lien est généré;
- devient invalide après activation, suspension ou suppression;
- dirige vers une route publique NextPoint dédiée, par exemple `/activate-student`;
- permet uniquement de définir et confirmer un nouveau mot de passe;
- active le compte seulement après mise à jour réussie du mot de passe.

La génération et la consommation sont des commandes serveur. La consommation met à jour le mot de passe via l’API Admin Supabase puis fait passer le compte à `active` dans la même opération métier contrôlée.

Cette approche est recommandée plutôt qu’un simple lien client de récupération: elle garantit l’expiration métier de 24 h, l’invalidation des anciens liens et l’interdiction après changement d’état. Supabase supporte aussi les liens d’invitation/récupération et une expiration OTP maximale de 86 400 secondes, mais cette configuration seule ne porte pas tout le cycle d’état NextPoint.

### 2.5 Expérience coach

Sur la fiche élève:

- afficher un badge d’état traduit;
- si `pending_activation`, afficher en haut à droite:
  - `Générer le lien d’activation` si aucun lien valide n’existe;
  - `Régénérer le lien` si un lien a déjà été généré;
- après génération, afficher une action de copie/partage du lien et sa date d’expiration;
- si `active`, `suspended` ou `deleted`, masquer l’action de génération;
- ne jamais afficher ni permettre de définir le mot de passe de l’élève.

### 2.6 Expérience élève

La page publique d’activation:

- accepte le jeton depuis le lien;
- affiche nouveau mot de passe et confirmation;
- applique les règles de robustesse existantes;
- distingue lien invalide, expiré, déjà utilisé et compte non activable;
- redirige vers la connexion après succès;
- ne révèle aucune information de compte lorsque le jeton est invalide.

Si un élève tente une inscription classique avec un email déjà provisionné, l’application ne crée pas de doublon et lui indique d’utiliser le lien d’activation fourni par le coach.

## 3. Analyse d’impact

### 3.1 Epic 2

L’Epic 2 reste viable mais son périmètre doit inclure l’onboarding d’un élève provisionné par le coach.

- Story 2.3: reprise nécessaire avant code review final.
- Story 2.4: ajout de l’état de compte et du bouton de génération/régénération sur la fiche.
- Stories 2.5 à 2.7: pas de changement fonctionnel direct, mais les accès élève doivent respecter `account_status = active`.

Aucun nouvel epic n’est nécessaire. Le changement reste dans Identity & Access et Student Management.

### 3.2 Epic 1

La Story 1.4 reste valide pour l’inscription classique, mais l’authentification doit reconnaître:

- un compte `pending_activation` qui ne peut pas utiliser les parcours privés;
- un compte `suspended` ou `deleted` dont la connexion est refusée;
- la route publique de définition du mot de passe.

Ces compléments seront implémentés dans la reprise 2.3 afin d’éviter de rouvrir artificiellement une story déjà terminée.

### 3.3 Epics futurs

- Réservations, packs, notifications, messagerie et statistiques doivent référencer le profil élève provisionné, même avant activation.
- Toute surface élève nécessite un compte `active`.
- Les données historiques restent accessibles au coach pour un compte suspendu ou supprimé selon les règles métier.
- Les notifications destinées à un compte non activé devront être traitées ultérieurement sans supposer une session ou un jeton push.

### 3.4 Impact technique

Le modèle en cours de Story 2.3 doit être corrigé avant commit:

- abandonner `student_profiles.user_id nullable` pour les nouvelles fiches coach;
- chaque fiche créée par le coach possède un `auth.users.id`;
- ajouter un état de compte métier;
- ajouter une table de jetons d’activation ou équivalent avec hash, expiration, consommation et révocation;
- créer des commandes serveur privilégiées:
  - `create-manual-student`;
  - `generate-student-activation-link`;
  - `activate-student-account`;
- ajouter la route publique d’activation et les contrats Zod;
- ajouter les contrôles d’état aux guards et politiques d’accès;
- mettre à jour tests SQL, Auth, intégration et E2E.

### 3.5 Risques

- Élevé: exposition d’une clé service-role si la création Auth est faite côté client.
- Élevé: anciens liens encore valides après régénération si aucun registre métier n’est utilisé.
- Élevé: confusion entre relation active et compte actif.
- Moyen: doublons dus à une normalisation téléphone incohérente.
- Moyen: conservation de données et références lors d’une suppression logique.
- Moyen: rate limiting et partage du lien si plusieurs régénérations sont demandées.

## 4. Chemin recommandé

Approche: ajustement direct avec reprise de Story 2.3.

Effort: moyen à élevé.
Risque: moyen après adoption des commandes serveur et jetons hashés.
Impact planning: Story 2.3 reste en `in-progress`; Story 2.4 ne doit pas démarrer avant stabilisation du contrat de compte.

Le rollback Git n’est pas recommandé. Les changements 2.3 ne sont pas commités: il est moins risqué de remodeler maintenant les migrations et services que de conserver un modèle temporaire `user_id nullable`.

## 5. Propositions d’édition

### 5.1 PRD — Hypothèse H22

Ancien:

> En P1/futur, le coach pourra donner un lien d’invitation ou un code pour que l’élève l’ajoute dans l’application.

Nouveau:

> En P0, lorsqu’un coach crée manuellement une fiche élève, le système provisionne un compte élève non activé. Le coach peut générer ou régénérer un lien d’activation valable 24 heures jusqu’à l’activation du compte. Le lien permet à l’élève de définir son mot de passe. Après activation, suspension ou suppression, aucun lien ne peut être généré.

### 5.2 PRD — Exigences comptes et relation

Remplacer FR-014 et FR-034, puis ajouter:

- FR-014 — Le coach doit pouvoir créer une fiche et un compte élève non activé.
- FR-014a — La création doit être refusée si l’email ou le téléphone normalisé existe déjà pour un élève non supprimé.
- FR-014b — Le compte élève doit avoir un état parmi `pending_activation`, `active`, `suspended`, `deleted`.
- FR-034 — Le coach doit pouvoir générer et régénérer un lien d’activation de 24 heures tant que le compte est `pending_activation`.
- FR-034a — Un nouveau lien doit invalider le précédent et chaque lien ne doit être utilisable qu’une fois.
- FR-034b — Le lien doit ouvrir une page permettant à l’élève de définir son mot de passe.
- FR-034c — La définition réussie du mot de passe doit faire passer le compte à `active`.
- FR-034d — Aucun lien ne doit être générable pour un compte `active`, `suspended` ou `deleted`.
- FR-034e — Les comptes non actifs ne doivent pas accéder aux surfaces privées élève.

### 5.3 Story 2.3 — Story

Ancien:

> Créer une fiche élève sans compte élève préalable.

Nouveau:

> Créer une fiche élève et provisionner son compte non activé afin de préparer son accès sans lui demander une inscription séparée.

### 5.4 Story 2.3 — Acceptance Criteria

Remplacer les critères actuels par:

1. Le coach renseigne nom, téléphone, email, niveau, âge et sexe.
2. Email et téléphone sont normalisés; si l’un existe déjà pour un élève non supprimé, aucune fiche ni compte n’est créé et une erreur traduite est affichée.
3. Une création valide provisionne atomiquement un utilisateur Auth `eleve`, un profil, une relation coach/élève et un état `pending_activation`.
4. Aucun mot de passe temporaire, secret admin ou lien d’activation n’est exposé par la création.
5. Le compte provisionné ne peut pas se connecter ni accéder aux routes élève avant activation.
6. Le modèle supporte `pending_activation`, `active`, `suspended`, `deleted` avec des transitions contrôlées.
7. Un utilisateur non coach ne peut pas provisionner un compte élève.
8. Les erreurs partielles provoquent un rollback logique: aucun profil orphelin, relation orpheline ou compte exploitable incohérent.
9. Une route publique d’activation accepte un jeton valide, permet de définir et confirmer le mot de passe, active le compte puis redirige vers la connexion.
10. Un jeton invalide, expiré, consommé ou lié à un compte non activable ne modifie rien et affiche une erreur traduite.

### 5.5 Story 2.4 — Acceptance Criteria

Ajouter:

6. La fiche affiche l’état du compte élève avec un badge traduit.
7. Pour `pending_activation`, un bouton en haut à droite permet de générer ou régénérer un lien.
8. Le lien expire après 24 heures, est copiable/partageable et la date d’expiration est affichée.
9. Régénérer invalide le lien précédent.
10. Pour `active`, `suspended` ou `deleted`, le bouton n’est pas affiché et la commande serveur refuse aussi l’action.
11. Seul le coach associé peut générer le lien; un élève ou utilisateur non autorisé ne reçoit ni lien ni information sensible.

### 5.6 Architecture

Ajouter aux opérations sensibles:

- provisionnement administratif d’un compte élève;
- génération/révocation d’un jeton d’activation;
- activation et définition initiale du mot de passe;
- suspension et suppression logique.

Ajouter aux patterns:

- aucune API Admin Auth depuis le client;
- jetons d’activation opaques, hashés, à usage unique, expiration 24 h;
- état de compte distinct du statut de relation;
- contrôle d’état dans les guards, commandes et RLS;
- audit minimal des générations, activations et refus.

### 5.7 UX

Modifier E-COACH-005:

- badge d’état du compte;
- bouton supérieur droit conditionnel;
- action copier/partager;
- expiration visible;
- confirmation après régénération indiquant que l’ancien lien ne fonctionne plus.

Ajouter E-STUDENT-002b — Activation du compte:

- nouveau mot de passe;
- confirmation;
- succès puis accès à la connexion;
- états lien expiré/invalide/utilisé;
- aucun autre champ profil.

Modifier l’inscription:

- si l’email appartient à un compte provisionné, ne pas créer un doublon;
- afficher un message invitant à demander ou utiliser le lien d’activation.

## 6. Critères de succès

- aucune création si email ou téléphone existe;
- aucune clé privilégiée côté client;
- compte Auth et profil toujours cohérents;
- compte créé avec état `pending_activation`;
- lien valable 24 h et une seule fois;
- régénération invalide l’ancien lien;
- activation uniquement après définition réussie du mot de passe;
- bouton absent et commande refusée après activation/suspension/suppression;
- accès privé refusé aux comptes non actifs;
- historique conservé pour suspension et suppression logique;
- tests mobile et web pour le parcours complet.

## 7. Handoff

Classification: changement modéré.

Responsabilités:

- Product Owner / PM: approuver les règles d’unicité, d’état et de suppression logique.
- Architecte: valider le choix jeton d’activation métier + API Admin Supabase.
- Developer: corriger la Story 2.3 non commitée, les migrations, les commandes, la route publique et les tests.
- UX: intégrer l’état, le bouton et la page d’activation dans les spécifications.

Ordre:

1. approuver cette proposition;
2. mettre à jour PRD, decision log, epics, architecture et UX;
3. réouvrir Story 2.3 en `in-progress`;
4. remplacer le modèle `user_id nullable` par le provisionnement Auth;
5. implémenter les commandes et la page d’activation;
6. mettre à jour Story 2.4 avant son développement;
7. exécuter une revue de code sécurité avec un autre modèle.

## 8. Checklist de changement

- [x] Déclencheur identifié: Story 2.3.
- [x] Problème classé: exigence produit omise.
- [x] Preuve: description explicite du parcours par Flo.
- [x] Epic 2 analysé et toujours viable.
- [x] Epics futurs analysés.
- [x] Conflits PRD, architecture et UX identifiés.
- [x] Ajustement direct évalué comme viable.
- [x] Rollback Git évalué comme non nécessaire.
- [x] Impact MVP accepté comme extension fonctionnelle P0.
- [x] Proposition et handoff rédigés.
- [x] Proposition approuvée explicitement par Flo le 2026-06-22.

## 9. Décisions à approuver explicitement

L’approbation de la proposition valide aussi les décisions suivantes:

1. un doublon est détecté si email **ou** téléphone correspond;
2. une identité soft-deleted reste réservée en P0;
3. la régénération invalide immédiatement tout ancien lien;
4. le lien est copié/partagé par le coach, sans envoi email automatique obligatoire;
5. `deleted` est une suppression logique et terminale en P0;
6. l’élève définit son mot de passe sur une page publique NextPoint;
7. l’activation utilise un jeton métier hashé et une commande serveur, plutôt qu’un simple reset client non suivi.

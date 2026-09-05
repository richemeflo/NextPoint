# Déploiement des notifications par email

La migration `0051_email_notification_preferences.sql` est additive. Elle ne
supprime ni ne remplace aucune donnée existante. Faites néanmoins une sauvegarde
Supabase avant toute migration de production.

## 1. Configurer l'expéditeur

1. Dans Resend, ajoutez de préférence un sous-domaine dédié, par exemple
   `mail.equationpadel.fr`.
2. Ajoutez chez OVH les enregistrements SPF et DKIM indiqués par Resend.
3. Attendez que le domaine soit marqué comme vérifié.
4. Créez une clé API limitée à l'envoi d'emails.

## 2. Appliquer la base et déployer le worker

Depuis la racine du dépôt lié au projet Supabase :

```bash
npx supabase db push
npx supabase secrets set RESEND_API_KEY="re_xxx"
npx supabase secrets set EMAIL_FROM="Equation Padel <notifications@mail.equationpadel.fr>"
npx supabase secrets set APP_URL="https://equationpadel.fr"
npx supabase secrets set EMAIL_WORKER_SECRET="sb_secret_xxx"
npx supabase functions deploy send-pending-email-notifications
npx supabase functions deploy manage-account-data
```

Ne placez jamais `RESEND_API_KEY` ou la clé `service_role` dans `EXPO_PUBLIC_*`,
dans le dépôt ou dans le code client.

## 3. Planifier le worker

Dans Supabase, ouvrez `Integrations > Cron`. Créez un job exécuté chaque minute
qui appelle la fonction Edge `send-pending-email-notifications` en `POST`.

Si vous configurez le job en SQL, stockez d'abord l'URL du projet et la clé
`service_role` dans Vault, puis utilisez-les depuis le job :

```sql
select vault.create_secret(
  'https://PROJECT_REF.supabase.co',
  'email_worker_project_url'
);

select vault.create_secret(
  'SERVICE_ROLE_KEY',
  'email_worker_service_role_key'
);

select cron.schedule(
  'send-pending-email-notifications',
  '* * * * *',
  $$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'email_worker_project_url'
    ) || '/functions/v1/send-pending-email-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'email_worker_service_role_key'
      ),
      'apikey', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'email_worker_service_role_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
```

Utilisez une clé Supabase secrète dédiée au job Cron et stockez la même valeur
dans `EMAIL_WORKER_SECRET`. Le worker refuse toute requête dont l'en-tête
`apikey` ne correspond pas exactement à ce secret. Le job
alimente aussi les rappels hebdomadaires arrivés à échéance avant de traiter la
file. Les rappels utilisent le fuseau `Europe/Paris`.

## 4. Vérifier

1. Activez une préférence depuis un profil de test.
2. Confirmez ou annulez un cours de test.
3. Vérifiez `notification_email_deliveries` dans le Table Editor. Le statut doit
   passer de `pending` à `sent`.
4. Consultez les exécutions dans `Integrations > Cron` et les logs de la fonction
   Edge en cas d'échec.

La file est privée : les clients authentifiés ne peuvent ni la lire ni la
modifier. Un même événement possède une clé de déduplication en base et une clé
d'idempotence chez le fournisseur.

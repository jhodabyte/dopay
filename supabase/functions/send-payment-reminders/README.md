# send-payment-reminders

Supabase Edge Function that runs daily to send payment reminders and overdue alerts.

## What it does

1. **Upcoming reminders**: For each owner's `notification_settings.days_before` value, finds payments whose `due_date = today + days_before` with `status = 'pending'` and sends notifications via the configured channels.

2. **Overdue alerts**: When `overdue_alert_enabled = true`, finds payments where `due_date < today` and `status = 'pending'`, and sends alerts to tenants and the owner (if configured).

## Deploy

```bash
supabase functions deploy send-payment-reminders
```

## Schedule with pg_cron

Run this SQL in your Supabase SQL editor to trigger the function daily at 08:00 Bogotá time (UTC-5, so 13:00 UTC):

```sql
select cron.schedule(
  'send-payment-reminders-daily',
  '0 13 * * *',
  $$
  select net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-payment-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

To remove the schedule:
```sql
select cron.unschedule('send-payment-reminders-daily');
```

## Required environment variables

Set these in your Supabase project dashboard under Project Settings > Edge Functions > Secrets:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) — used for email delivery |
| `SENDGRID_API_KEY` | Alternative to Resend — update `sendEmail()` in index.ts to use SendGrid |

## Local testing

```bash
supabase functions serve send-payment-reminders --no-verify-jwt
curl -X POST http://localhost:54321/functions/v1/send-payment-reminders
```

## Notes

- Without `RESEND_API_KEY`, the function stubs email sending with `console.log` — safe for development.
- SMS sending is stubbed; integrate with your provider (e.g., Twilio, MessageBird) by implementing `sendSMS()` in index.ts.
- The function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and query across all owners.

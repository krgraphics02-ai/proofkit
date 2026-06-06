<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into ProofKit — a React + Vite SPA for restaurant proof-of-delivery management. PostHog is initialized in `src/main.jsx` using environment variables, and event tracking plus user identification have been added throughout `src/App.jsx`. Users are identified on login and registration via `posthog.identify()`, and `posthog.reset()` is called on logout to unlink future events. Error tracking via `posthog.captureException()` has been added around the AI analysis call, which is the most critical failure point in the app.

| Event | Description | File |
|---|---|---|
| `user_logged_in` | User (restaurant staff) successfully logs in | `src/App.jsx` |
| `login_failed` | Login attempt fails due to incorrect credentials | `src/App.jsx` |
| `restaurant_registered` | New restaurant account created — top of conversion funnel | `src/App.jsx` |
| `proof_submitted` | Proof photo successfully uploaded and AI-analyzed — core product action | `src/App.jsx` |
| `proof_anomaly_detected` | Analyzed proof has a warning or alert status | `src/App.jsx` |
| `subscription_checkout_started` | Manager clicks subscribe and is redirected to Stripe | `src/App.jsx` |
| `subscription_cancelled` | Manager cancels their subscription — churn signal | `src/App.jsx` |
| `record_deleted` | Manager deletes a proof record | `src/App.jsx` |
| `team_member_added` | Manager adds a new employee account | `src/App.jsx` |
| `restaurant_subscription_toggled` | Superadmin activates or deactivates a restaurant subscription | `src/App.jsx` |
| `proof_downloaded` | User downloads a proof image | `src/App.jsx` |

## Next steps

We've built a dashboard and five insights for you to monitor key business metrics:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/195192/dashboard/729336)
- [New Restaurant Registrations](https://eu.posthog.com/project/195192/insights/VesDydQe) — daily sign-up trend
- [Registration → Subscription Checkout Funnel](https://eu.posthog.com/project/195192/insights/yBurLgkS) — 4-step conversion funnel from registration to Stripe checkout
- [Proofs Submitted vs Anomalies Detected](https://eu.posthog.com/project/195192/insights/zk5ICbde) — product usage and alert volume over time
- [Subscription Checkouts Started](https://eu.posthog.com/project/195192/insights/mHxQhpgA) — daily revenue intent signal
- [Subscription Cancellations](https://eu.posthog.com/project/195192/insights/qvahFy6Q) — churn tracking

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_web/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

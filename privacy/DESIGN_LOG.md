# Privacy Policy Revision Log - April 2026

## Objective
Rewrite the privacy policy copy to align with professional, traditional legal standards while maintaining the technical accuracy of the company's data processing practices.

## Changes Made

### General Tone & Style
- Shifted from conversational/informal language to a formal, "traditional policy" register.
- Standardized terminology (e.g., "Data Points" instead of "Data collected", "Processing Activity" instead of "Purpose").
- Improved clarity on legal bases (Art. 6(1)(f) GDPR etc.).

### Content Refinement
- **Removed Product Names:** References to specific internal tools like "n8n" were removed from the public-facing copy to avoid unnecessary technical exposure and "infinite cans of worms" (as per user instructions). These are now covered under "Internal Data Management" and "workflow automation".
- **Professionalized Tables:** Updated table headers and descriptions to be more concise and legally standard.
- **Clarified Data Transfers:** Formalized the description of international data transfers (SCCs, UK IDTA, UK-US Data Bridge).
- **AI Processing:** Refined the description of AI inference and Zero Data Retention (ZDR) to sound more authoritative and less like a technical explanation.

### Structural Integrity
- Maintained the existing HTML structure, CSS theme, and tab functionality.
- Ensured all links and contact information remained functional.

## Codebase Review Findings
- The codebase confirms the use of self-hosted services (n8n, ERPNext) and external AI routing (OpenRouter).
- The "Internal Data Management" section accurately reflects the use of local pre-filtering and private infrastructure as seen in the `docker/business` configuration.
- No changes to the *meaning* of the data processing were required, only the *expression* of those facts.

# Revision — July 2026

## Objective
Audit the processor list for completeness against the current codebase (`services/email-handler`, `services/sharepoint-embeddings`, `services/core/erpnext`) and clarify the scope split between the two tabs.

## Codebase Review Findings
- **Microsoft entry expanded**: confirmed active use of SharePoint (via `services/sharepoint-embeddings`, Microsoft Graph) for document storage/search, not just email/calendar. Updated the Microsoft row and "Internal Data Management" copy to name SharePoint explicitly.
- **Brave Search API added**: `services/email-handler/tools/web_search.py` calls the Brave Search API to identify unfamiliar senders' companies during enquiry triage. This sends limited identifiers (name/company) externally and was previously undisclosed — added as a new processor row.
- **Revolut Business added**: `services/email-handler/pipeline/banking/` integrates with Revolut's Business API for bank transaction sync, invoice reconciliation, and webhooks. This is a materially significant processor (financial/counterparty data) that was missing from the policy — added as a new processor row with a 7-year retention basis (UK statutory accounting).
- **Confirmed NOT third-party processors** (self-hosted, private infra, correctly excluded): the local OMLX inference server (`192.168.1.95`), the `sanitiser` pre-filtering service, Qdrant vector store, and the collab-editor document tool — all run on private infrastructure and don't send personal data to an external company.
- **No evidence found** of Stripe, analytics/tracking pixels, or other CRM/marketing SaaS in the live codebase (Stripe references exist only in email-classifier *test fixtures*, not real integrations) — not added, per the "don't invent processors" principle.
- Added a short scope-clarifying paragraph to the top of each tab (Website visitors vs Clients & enquiries) so the split between the two is explicit rather than implied.

# PULSE OS — Pilot Demo Script (10–15 min)

**Audience:** Prospective pilot partners  
**Environment:** https://pulse-os-steel.vercel.app  
**Login:** Farmstead Hospitality owner account

---

## 1. Opening (1 min)

> "PULSE OS is an Opportunity Intelligence Network. Its core question is: should this business participate in this opportunity, under what conditions, and what outcome followed? I'll show you the full workflow from a live operator — Farmstead Hospitality in the Southern Drakensberg."

Open the public homepage: https://pulse-os-steel.vercel.app  
Point out: capability register (Live / Manual Evidence Only / Planned). "We're honest about what works today."

---

## 2. Sign In + Organisation Context (1 min)

Click **Owner Login →**. Sign in.  
Show sidebar: organisation name, PULSE CORE navigation.  
> "The first thing you see is the real organisation name pulled from the database — not a hardcoded label."

---

## 3. Dashboard (1 min)

Show Dashboard.  
Point to: property count, onboarding progress panel, real metrics (zero is fine).  
> "Every number here comes from the database. If it's zero, we show zero — we don't fabricate activity."

---

## 4. Properties (1 min)

Click **Properties**.  
Show the four Farmstead properties or create one live: "Woody's Self Catering Cottage", Draft status.  
> "Operators add properties, units and rates here. The system tracks missing information and links operations to opportunity intelligence."

---

## 5. Reservations + Overlap Protection (1 min)

Click **Reservations**. Show the calendar.  
Create a test reservation. Then attempt to create an overlapping one.  
> "The system detects the conflict and rejects it. This is enforced at the query layer, not just the UI."

---

## 6. Housekeeping + Maintenance (1 min)

Click **Housekeeping** → **+ New Task** → create "Clean and prepare Woody's Cottage" → Complete it.  
Click **Maintenance** → **+ Log Issue** → create "Geyser check needed" → In Progress.  
> "Operational tasks are tracked from creation to completion, linked to the property."

---

## 7. Business Connect + Evidence (2 min)

Click **Businesses** → **+ Add Business**.  
Fill: "Farmstead Hospitality", category "Accommodation / Self-Catering", district "Southern Drakensberg", evidence state "Self-entered".  
> "Evidence state matters. Self-entered means confidence will stay Low until a human reviews it or we connect Google ownership. We don't inflate confidence."

Show the Google notice: "Google integration: Manual Evidence Only."

---

## 8. Opportunity Engine (1 min)

Click **Opportunities** → **+ Create Opportunity**.  
Title: "PILOT TEST — Southern Drakensberg Stay & Experience Partnership"  
Type: Seasonal Activation, District: Southern Drakensberg, Status: Draft.  
> "The opportunity is the atomic object. Any business, destination, university or investor can create one."

---

## 9. Viability Assessment (2 min)

Click **Viability**. Select Farmstead Hospitality + the pilot opportunity.  
Click **Run Assessment**.  
Walk through: score, confidence band (Low — because self-entered), 8 factor breakdown, next best actions.  
> "This is a deterministic rules engine — every input, weight and evidence item is shown. No black box. No AI API required. Confidence is Low because evidence is self-entered. If Kyle submits documents for human review, confidence climbs."

Click **Save Assessment**.

---

## 10. Participation Decision (1 min)

Click **Record decision →** on the saved assessment.  
Select: "Join with Conditions", add condition "Submit evidence package before activation", add milestone "Evidence submitted by [date]".  
> "The JV disclaimer is displayed on every record: this is not a signed agreement unless one has been uploaded and verified."

---

## 11. Outcomes (1 min)

Click **Outcomes**. Find the participation record → **+ Outcome**.  
Enter: "First enquiry received from Southern Drakensberg tourism board." Mark: Self-reported.  
> "Self-reported outcomes are labelled clearly. Upload supporting evidence to confirm. Verified outcomes create the dataset for future recommendation improvements."

---

## 12. Participation Graph (1 min)

Click **Participation Graph**. Expand the record.  
Show: Business → Opportunity → Assessment → Decision → Milestones → Outcome.  
> "This is derived from four real database tables. Every relationship is persisted. This is the proprietary long-term data asset."

---

## 13. Reports + Settings (1 min)

Click **Reports** → Download "Controlled Pilot Report". Open HTML.  
Click **Settings** → show System Status: Database Connected, AI Rules Engine Active, Google = Not Connected.  
> "Honest about what's connected. No fabricated values."

---

## 14. Closing (1 min)

Navigate to the public page footer: `https://pulse-os-steel.vercel.app`  
> "The pilot is controlled — a small number of founding participants. We're not doing mass sign-ups. If this is a fit for your context, submit your interest on the public page and we'll be in touch."

Point to the pilot interest form.

---

**Total: 10–15 min**

**Follow-up questions to expect:**
- What happens when Google ownership is connected? → Confidence rises to 95%, human review becomes eligible
- Can multiple businesses match to one opportunity? → Yes, participation is many-to-many
- Is the viability score the same as a credit score? → No, it reflects operational readiness and evidence quality, not financial creditworthiness

# AI-Assisted Sourcing Methodology

*This document outlines a process I use for AI-assisted candidate sourcing, it describes methodology, not a measured case study. Outcome-based results with real metrics are tracked separately under Case Studies as they're gathered.*

## Overview

Artificial intelligence can help recruiters turn sourcing from a manual, trial-and-error search activity into a structured, repeatable workflow. This document walks through how I use AI to support requirement analysis, keyword discovery, Boolean search creation, candidate evaluation, and personalized outreach, with recruiter judgment applied at every stage where a hiring-relevant decision actually gets made.

## Problem Statement

Sourcing without a structured approach typically runs into a few recurring issues:

- Manually re-reading job descriptions to extract skills, every time, even for similar roles
- Building Boolean searches through trial and error, adjusting after each round of poor results
- Spending significant time sifting through profiles with no consistent evaluation framework
- Repeating near-identical sourcing groundwork across multiple open requisitions

AI-assisted sourcing reduces this repetitive effort while keeping search quality and consistency high.

---

## Workflow

```
Hiring Requirement
        ↓
Job Description Analysis
        ↓
Skill & Keyword Extraction
        ↓
Boolean Search Strategy
        ↓
Candidate Profile Evaluation
        ↓
Personalized Outreach
```

---

## 1. Hiring Requirement Analysis

Before sourcing starts, I use AI to break a JD into what actually matters for the search, separating must-haves from nice-to-haves and surfacing terminology I might not think to search for manually.

**Example Input:**
"Looking for a Java Backend Developer with 5+ years of experience building scalable applications using Java, Spring Boot, REST APIs, Microservices, and AWS."

**AI-Assisted Output:**

Must-Have Skills: Java, Spring Boot, REST APIs, Microservices, AWS  
Experience Requirement: 5+ years backend development  
Related Search Terms: Java Engineer, Backend Engineer, API Developer, Spring Developer

This becomes the foundation for the search strategy — reviewed and adjusted by me before use, since AI sometimes over-includes generic titles that don't fit the seniority bar.

---

## 2. Skill and Keyword Extraction

AI helps surface alternate ways candidates describe the same experience — language I might not naturally search for.

For example, a requirement for "Microservices architecture" can surface adjacent terms candidates might use instead:

- Distributed systems
- Service-oriented architecture
- REST-based services
- API-driven development

This widens search coverage without diluting relevance, since each term is still tied back to the original requirement.

---

## 3. Boolean Search Creation

AI combines required skills, alternative keywords, job titles, and technology variations into a starting Boolean string, rather than me building one from scratch.

**Example Prompt:**

```
Create a LinkedIn Boolean search string for a Java Backend Developer role
requiring Java, Spring Boot, Microservices, REST APIs, and AWS.
Include alternative job titles and related technical keywords.
```

**Example AI Output:**

```
("Java Developer" OR "Java Engineer" OR "Backend Developer")
AND
(Java OR J2EE)
AND
("Spring Boot" OR Spring)
AND
(Microservices OR "Distributed Systems")
AND
("REST API" OR RESTful)
AND
(AWS OR "Amazon Web Services")
```

**Where this needed correction:** on one search, the AI's inclusion of "J2EE" pulled in a wave of legacy-stack candidates well below the seniority and modern-stack bar the role needed. I removed it from later variants of this search. AI-generated Boolean strings are a starting draft, every string is reviewed against platform limitations and actual market availability before running it live.

---

## 4. Candidate Profile Evaluation Support

AI performs an initial comparison between a candidate's profile and the role requirements, which I then verify manually.

**Candidate Profile:**
Java Developer, 6 years of experience in Spring Boot, REST APIs, Microservices, and AWS.

**AI-Assisted Assessment:**

- Match Strength: High
- Relevant Experience: Java backend development, cloud-based applications, microservices architecture
- Gap: No visible Kubernetes experience

I treat this as a first-pass filter, not a final read, the "gap" flag doesn't disqualify a candidate on its own; it tells me what to specifically probe for in screening.

---

## 5. Personalized Candidate Outreach

AI drafts outreach messages based on a candidate's background, current role, and relevant experience, which I then edit for tone and accuracy before sending.

**Example Prompt:**

```
Create a personalized LinkedIn outreach message for a Java Backend Developer
with experience in Spring Boot, Microservices, and AWS. Keep it professional and concise.
```

AI-generated drafts save the "blank page" time on outreach, but every message is customized to the specific candidate, generic AI phrasing gets rewritten before it goes out.

---

## AI Tools Used

**ChatGPT** — Job description analysis, keyword extraction, Boolean search generation, outreach message drafting, workflow documentation.

**Claude** — Reviewing and tightening recruitment documents, refining prompt structures, stress-testing sourcing workflow logic before I finalize it.

**LinkedIn Recruiter** — Executing generated Boolean strings; using its built-in "spotlight" filters (open to work, recently active) alongside AI-suggested keywords to further narrow passive candidate pools.

---

## Recruiter Judgment Throughout

AI shortens the sourcing funnel — it doesn't make the hiring call. Across every stage above, the final decision stays with me: which Boolean terms actually make it into a live search, which candidates are worth a first conversation, what an outreach message actually says before it's sent. AI's role is to remove repetitive groundwork, not to replace the judgment that determines whether a candidate is actually right for the role.

---

## Benefits

- Faster JD-to-search turnaround, since extraction no longer starts from a blank page
- Broader, more consistent keyword coverage across similar roles
- A repeatable evaluation framework instead of ad hoc profile review
- More time available for actual candidate engagement rather than search construction

---

## Limitations and Responsible Usage

AI-assisted sourcing needs guardrails:

- AI-generated Boolean strings can over-include outdated or irrelevant terms (see the J2EE example above), always review before running live
- Keyword matching alone will miss strong candidates who describe their experience differently than expected — this is a filter, not a verdict
- Candidate evaluation from AI should inform, not replace, a fair and consistent manual review
- Human oversight stays constant throughout the hiring process — AI enhances recruiter capability, it doesn't substitute for it
```

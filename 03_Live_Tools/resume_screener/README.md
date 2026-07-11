# Resume Screener

A recruiter-facing tool for comparing multiple candidates against one job description at once.
Paste a JD, add up to 10 resumes, click **Analyze Candidates**, and get a ranked, explainable
comparison — not a black-box pass/fail score.

**[Open the live tool →](https://anuskasidharth-a11y.github.io/AI-for-Talent-Acquisition/03_Live_Tools/resume-screener/index.html)**

## Purpose

Early-stage screening across a large candidate pool is repetitive and time-consuming. This tool
gives a first-pass comparison across candidates so a recruiter can prioritize who to review first
— it does not decide who gets rejected. Every output ends with the same message: validate before
you shortlist.

## How recruiters can use it

1. Paste the job title and full job description.
2. Add each candidate: paste resume text directly, or upload a `.txt`, `.pdf`, or `.docx` file
   (the tool extracts the text automatically). Up to 10 candidates per run.
3. Click **Analyze Candidates**.
4. Review the ranked list, then open each candidate's detail card to see *why* they scored the
   way they did before making any shortlisting decision.

## How scoring works

The JD is parsed automatically — no manual keyword entry required. The tool separates
**responsibility/duty lines** ("manage stakeholder relationships") from **skill and qualification
lines** ("Python, SQL, AWS"), and tags skill lines as **mandatory** or **preferred** based on
section headers and inline cues like "nice to have" or "preferred."

Each candidate is scored against that parsed JD using four weighted categories:

| Category | Weight | What it measures |
|---|---|---|
| Technical Skill Match | 40% | Mandatory skills found in the resume |
| Relevant Experience | 30% | Years of experience vs. the JD's stated requirement, or seniority language when years aren't stated |
| Role Responsibility Alignment | 20% | Overlap between the JD's actual duties and resume content |
| Additional / Differentiators | 10% | Preferred (non-mandatory) skills and certifications found |

**This is context-based matching, not exact keyword counting.** Every skill is evaluated as one of
three states:

- **Matched** — the term (or a known synonym, e.g. K8s / Kubernetes, AWS / Amazon Web Services)
  appears directly. Full credit.
- **Related** — a different phrasing for the same underlying capability appears instead (e.g. the
  JD asks for "Microservices" and the resume says "designed distributed backend services," or the
  JD asks for "AWS" and the resume says "cloud infrastructure experience"). Partial credit, and the
  candidate detail view flags it explicitly: *"Related experience found, direct match not
  confirmed — validate in screening."*
- **Missing** — no direct or related evidence found. Flagged as a gap to check, not a
  disqualifier.

A candidate with a lower overall score can still be worth a conversation if the gaps are around
phrasing rather than actual missing capability — that's exactly what the "Validate in screening"
column is for.

## Why it does not replace recruiter judgment

This tool runs entirely in the browser using pattern-matching and a curated set of skill/concept
relationships — it is not a semantic language model, and it cannot read tone, verify claims, or
judge depth of experience. It cannot tell you if three years of "Python" experience was substantial
or superficial. It's a first-pass filter to help prioritize a stack of resumes, and every score
comes with an explicit reminder: **AI-generated scores are recommendations, not final hiring
decisions.**

## Example workflow

1. A recruiter has 8 resumes for a Senior Data Engineer opening and needs to shortlist 3 for phone
   screens.
2. They paste the JD and all 8 resumes into the tool and click Analyze.
3. The ranked table shows scores from 88 down to 41. The top 4 are clustered closely (88, 85, 79,
   77) — worth a closer look at the detail cards before deciding between them.
4. Candidate #3 has a lower Technical Skill Match than #2, but the detail view shows two "related"
   flags for Spark/Databricks and Airflow/orchestration tools — phrasing differences, not gaps.
   That moves #3 up the recruiter's actual priority list.
5. The recruiter phone-screens the top 4, using the "Validate in screening" list as the starting
   point for their questions.

## Limitations to know about

- Text extraction from `.pdf` and `.docx` files depends on the document's formatting; if a resume
  uses heavy graphic design or scanned images, extraction may fail — pasting the text directly is
  the reliable fallback.
- Concept-cluster matching covers a broad but finite set of common tech, business, and TA/HR
  skills. A very niche or new tool/skill without an entry may show as "missing" even if the resume
  clearly demonstrates it — always spot-check anything the score seems to underrate.
- Responsibility alignment is a semantic approximation, not a true language-understanding model.

## Future enhancements

- Expand the concept-cluster library based on real screening feedback (which "related" flags
  turned out to be right vs. wrong)
- Let recruiters exclude or re-weight a specific skill/responsibility per role, the way the
  standalone [single-resume screener](../resume-screener-legacy) allows tag-level exclusion
- Export the ranked comparison as a shareable PDF or CSV for hiring manager reviews
- Support side-by-side comparison view for the top 2–3 candidates

# Resume to Shortlist Pipeline

*This document outlines a process I use for AI-assisted resume evaluation and shortlisting. It describes methodology, not a measured case study. AI supports structured resume analysis, while recruiter judgment determines final shortlist decisions.*

## Overview

Resume screening is one of the most time-intensive stages of recruitment, especially when recruiters manage multiple applications for the same role.

AI can support this process by helping recruiters organize resume information, compare candidate experience against role requirements, identify relevant strengths and gaps, and apply a consistent evaluation framework.

AI should be treated as a screening assistant, not a decision-maker. A candidate should not be shortlisted or rejected only because of an AI-generated assessment.

---

## Workflow

```
Resume Screening Requirement
        ↓
Resume Information Extraction
        ↓
JD and Resume Comparison
        ↓
Structured Match Evaluation
        ↓
Recruiter Validation
        ↓
Shortlist Decision
```

---

## 1. Resume Information Extraction

Instead of manually reviewing every resume from scratch, AI can help organize relevant candidate information into a structured format.

AI-assisted extraction can identify:

- Technical skills
- Functional experience
- Years of experience
- Previous roles
- Industry exposure
- Certifications
- Project responsibilities

### Example Resume Input

"Data Engineer with 5 years of experience building ETL pipelines using Python, SQL, Apache Spark, and AWS. Experienced in designing scalable data processing solutions."

### AI-Assisted Extraction

**Technical Skills:**

- Python
- SQL
- Apache Spark
- AWS
- ETL Development

**Experience:**

- 5 years of Data Engineering experience

**Relevant Background:**

- Data pipeline development
- Data processing systems
- Cloud-based solutions

This creates a structured candidate profile for comparison against the role requirements.

---

## 2. JD and Resume Comparison

AI can compare extracted resume information against job requirements to identify areas of alignment and potential gaps.

### Example Prompt

```
Compare this resume against the given Data Engineer job description.

Identify:
1. Matching skills
2. Relevant experience
3. Missing requirements
4. Areas to validate during recruiter screening

Do not make a final hiring decision.
```

### Example AI Output

**Strong Matches:**

- Python development
- SQL expertise
- ETL pipeline experience
- AWS exposure

**Potential Gaps:**

- No visible Kubernetes experience
- Limited information on data warehouse tools

**Recruiter Validation Areas:**

- Depth of cloud experience
- Ownership of data engineering projects
- Scale and complexity of previous solutions

The output helps structure review, but recruiter assessment determines the next step.

---

## 3. Structured Candidate Evaluation Framework

To avoid relying only on keywords or AI-generated scores, I use a weighted evaluation approach where role-critical requirements receive higher importance.

This is a recruiter-defined framework created to bring consistency to initial resume evaluation.

### Evaluation Weighting

| Evaluation Area | Weight | Reason |
|---|---:|---|
| Required Technical Skills | 40% | Core capabilities needed to perform the role |
| Relevant Experience | 30% | Alignment of responsibilities and seniority |
| Domain Alignment | 20% | Industry or functional relevance |
| Additional Skills | 10% | Supporting skills and differentiators |

Technical skills receive the highest weight because missing core capabilities usually create the largest gap during technical hiring. However, the weighting can be adjusted depending on role requirements.

---

## Example Match Calculation

**Candidate Assessment:**

| Evaluation Area | Score |
|---|---:|
| Required Technical Skills | 35/40 |
| Relevant Experience | 28/30 |
| Domain Alignment | 15/20 |
| Additional Skills | 8/10 |

**Overall Match Score: 86/100**

The score indicates strong alignment, but it does not automatically determine shortlist status.

The recruiter still validates:

- Quality of project experience
- Career progression
- Role motivation
- Communication ability
- Information accuracy

---

## 4. When AI Gets It Wrong

AI-assisted screening can create incorrect conclusions if context is not reviewed.

### Example Scenario

A candidate resume states:

"Built automated data workflows using Python and SQL. Worked with cloud-based data processing environments."

AI Assessment:

**Potential Gap:**
"No AWS experience mentioned."

Recruiter Review:

The candidate's project description indicates cloud exposure, but the specific platform was not listed.

Recruiter Action:

- Do not reject based only on the missing keyword.
- Validate cloud platform experience during screening.
- Consider transferable experience.

This demonstrates why AI output should guide review, not replace recruiter evaluation.

---

## 5. Recruiter Validation

AI-generated resume assessments require human review before any shortlist decision.

Recruiter validation includes:

- Reviewing actual project responsibilities
- Understanding career progression
- Evaluating relevance beyond keywords
- Assessing communication and motivation
- Confirming information during screening discussions

The recruiter remains accountable for the final shortlist decision.

---

## 6. Responsible AI Usage in Resume Screening

Resume screening requires careful handling because AI systems can introduce additional risks.

Potential risks include:

- Historical hiring data may contain existing biases that AI can replicate
- Keyword-based evaluation may disadvantage candidates who describe experience differently
- Automated scoring may overlook transferable skills or non-traditional career paths

Responsible usage requires:

- Human review before rejection or advancement decisions
- Consistent evaluation criteria across candidates
- Reviewing candidates beyond keyword matches
- Using AI outputs as supporting information, not final decisions

---

## Benefits

- Reduces manual resume review effort
- Creates a structured screening approach
- Improves consistency across candidate evaluations
- Helps identify relevant experience faster
- Allows recruiters to spend more time on candidate conversations

---

## Limitations and Responsible Usage

AI-assisted resume screening should always include recruiter oversight.

Key considerations:

- AI may misinterpret resume context
- Match scores should not be treated as final hiring decisions
- Strong candidates may be missed through keyword-only evaluation
- Fair and consistent human review remains essential

AI improves screening efficiency. Recruiter judgment determines candidate suitability.

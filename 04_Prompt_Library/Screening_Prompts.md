# Screening Prompts

Prompts for evaluating resumes and shortlisting candidates against a JD.

## Resume to JD match score

```
Compare this resume: [paste resume]
Against this JD: [paste JD]

Score the match from 0 to 100 based on must-have skills, years of
experience, and seniority level. List which must-haves are met,
which are missing, and which nice-to-haves are present. Do not
assume skills that are not explicitly stated or clearly implied.
```

## Multi-candidate ranked comparison

```
I have [number] candidates for [role]. Here are their resumes:
[paste each, labeled Candidate A, B, C...]

Rank them against this JD: [paste JD]
For each candidate, give a match score, top 2 strengths, top 1 gap,
and a one-line recommendation (advance, hold, reject).
```

## Red flag scan

```
Review this resume: [paste resume]
Flag anything worth clarifying in a screening call: employment gaps,
short tenures under 12 months, unclear job titles, or inconsistent
dates. Do not flag things that have a common, reasonable explanation
(e.g. a single gap during a widely known market downturn).
```

## Shortlist summary for hiring manager

```
Summarize these [number] shortlisted candidates for a hiring manager
who has limited time: [paste candidate summaries or resumes]

For each candidate, give: 2 line summary, strongest relevant experience,
one open question to raise in the interview. Keep the total summary
under 200 words per candidate.
```

## JD gap check before sourcing

```
Review this JD: [paste JD]
Flag anything that is vague, unrealistic for the stated seniority level,
or likely to narrow the candidate pool unnecessarily (e.g. requiring a
specific tool when equivalent tools would work). Suggest specific edits.
```

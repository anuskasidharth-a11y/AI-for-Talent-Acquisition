# Sourcing Prompts

Prompts for finding and qualifying candidates before outreach.

## Boolean string builder

```
Build a Boolean search string for LinkedIn Recruiter.
Job title: [title]
Alternative titles: [list 2 to 3]
Must-have skills: [list]
Nice-to-have skills: [list]
Experience level: [years or seniority]
Location: [city or region]
Exclude: [terms to filter out, e.g. "intern", "manager"]

Group alternative titles with OR, join must-have skills with AND,
group nice-to-haves as a supporting OR clause, and add a NOT clause
for exclusions. Expand experience into common phrasing variants
(e.g. "5+ years" also as "5 years" and "5 yrs").
```

## X-ray search for a specific platform

```
Build a Google X-ray search string to find [job title] profiles on
[site:linkedin.com or site:github.com or another platform].
Include these must-have skills: [list].
Include this location: [city/region].
Exclude: [terms].
```

## Passive candidate identification

```
I'm looking for passive candidates for a [role] at [company type/industry].
Given this JD: [paste JD], suggest 5 adjacent job titles candidates might
currently hold that would still qualify, and 3 industries outside the
obvious one where this skill set commonly exists.
```

## Market mapping

```
I need to map the talent market for [role] in [location/industry].
List the top 8 to 10 companies likely to employ people in this role,
grouped by company size (startup, mid-size, enterprise). For each
company, note one likely reason someone there might be open to moving.
```

## Diversity sourcing check

```
Review this sourcing plan for [role]: [paste plan or channels used].
Suggest 3 additional channels, communities, or search adjustments
that would help reach a more diverse candidate pool, without changing
the core skill requirements.
```

## Niche skill translation

```
A candidate has this background: [paste raw experience].
The role requires: [paste requirement].
Explain, in plain terms, whether this candidate's experience is a
reasonable stretch fit, a strong fit, or not a fit, and why.
```

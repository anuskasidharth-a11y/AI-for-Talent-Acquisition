# Boolean Search Cheat Sheet

A quick reference for the search fundamentals that still sit underneath AI-assisted sourcing.

## Operators

| Operator | Function | Example |
|---|---|---|
| AND | narrows results, both terms must appear | "product manager" AND fintech |
| OR | broadens results, either term can appear | recruiter OR "talent acquisition" |
| NOT | excludes a term | developer NOT junior |
| ( ) | groups terms for correct logic order | ("data engineer" OR "data scientist") AND python |
| " " | searches an exact phrase | "machine learning engineer" |
| * | wildcard for variations of a word | develop* matches developer, developing, development |
| site: | restricts search to a specific website | site:linkedin.com/in |
| intitle: | requires the term in the page title | intitle:"talent acquisition" |

## Examples by Function

**Engineering**
site:linkedin.com/in ("backend engineer" OR "software engineer") AND (python OR golang) NOT intern

**Sales**
site:linkedin.com/in ("account executive" OR "sales manager") AND ("SaaS" OR "software") AND quota

**Marketing**
site:linkedin.com/in ("growth marketing" OR "performance marketing") AND (paid OR "paid acquisition")

**Healthcare**
site:linkedin.com/in ("registered nurse" OR "RN") AND ("ICU" OR "critical care") NOT student

**Finance**
site:linkedin.com/in ("financial analyst" OR "FP&A") AND (excel OR modeling) NOT intern

These are starting points, not final strings. I always adjust based on the actual intake call rather than using a saved template as is.

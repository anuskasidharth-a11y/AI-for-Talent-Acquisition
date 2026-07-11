# Boolean Generator

A working, interactive tool. Not a description of a workflow, an actual tool you can open and use.

**[Open the live tool →](https://anuskasidharth-a11y.github.io/AI-for-Talent-Acquisition/03_Live_Tools/boolean-generator/index.html)**

## What it does

Enter a job title, alternative titles, experience level, location, must-have skills, nice-to-have
skills, and any terms to exclude. The tool builds a structured Boolean search string using those
inputs, applying the same logic covered in `01_AI_Workflows/JD_to_Boolean_Pipeline.md`: title
variations grouped with OR, experience expanded into common phrasing variants (for example,
"5+ years" also generates "5 years" and "5 yrs"), must-have skills joined with AND, nice-to-haves
grouped as a supporting OR clause, location added as a direct term, and an optional NOT clause
for exclusions.

A quick note on location: most sourcing platforms (LinkedIn Recruiter, Naukri) have a dedicated
location filter separate from the keyword search. Add location into the Boolean string itself
only when you specifically need it embedded in the search text, for example when searching a
general web engine rather than a platform with its own location filter.

## How to use it

1. Click the live tool link above, it opens directly in your browser, no download needed.
2. Fill in the job title and at least one must-have skill.
3. Click **Generate Boolean string**.
4. Click **Copy** to copy the result directly into LinkedIn Recruiter, a job board, or your ATS.
5. Click **Load an example** to see it populated with a sample Cloud DevOps search.

## Why this exists

Every other document in this repository explains a process. This is the one thing you can
actually click and run. It is intentionally simple, no AI API call, no external dependency,
just the same logical structure a recruiter would apply manually, automated into a small form.

## What it is not

This does not call an AI model. It applies fixed logical rules (grouping, AND/OR/NOT) to
whatever you type in. The judgment on which skills are must-have versus nice-to-have, which
alternative titles are realistic, and whether the resulting search is actually usable, still
sits with the recruiter. This tool removes the blank-page problem. It does not replace the
review step described in the workflow documentation.

## Next steps for this tool

- Add a second mode that calls an AI API directly to suggest alternative titles and keyword
  synonyms automatically, rather than requiring them to be typed in manually
- Save and reload past searches
- Export directly to a `.txt` file for record-keeping

# Outreach Messages

A working, interactive tool. Not a description of a workflow, an actual tool you can open and use.

[Open the live tool →](https://anuskasidharth-a11y.github.io/AI-for-Talent-Acquisition/03_Live_Tools/outreach-message-generator/)

## What it does

Enter a candidate's background and the role you're hiring for. The tool extracts concrete signals from both, skills, years of experience, seniority level, likely company names, and finds the actual overlap between the two. It then writes three outreach message variants (Professional, Friendly, Highly personalized) grounded in that overlap. Optional fields (platform, tone, length, company, candidate name) refine the output but are never required.

If no overlap is found between the candidate and the role, the tool says so rather than generating a generic message dressed up as a personalized one.

## How to use it

1. Click the live tool link above, it opens directly in your browser, no download needed.
2. Paste the candidate's background into the first field, and the role details into the second.
3. Click **Generate outreach**.
4. Review the three variants, check the character count against the platform's limit, and click **Copy** on the one you want.
5. Optionally save the candidate to your library, or click **Download all as .txt** to keep a record.

## Why this exists

Most outreach generators ask for 8 to 10 fields before producing anything, and the result is a dropdown-driven template that reads as formulaic after the second use. This tool only requires two things: what the candidate wrote about themselves, and what the role needs. Everything else is inferred or optional.

## What it is not

This does not call an AI model. It applies pattern matching, a skill lexicon, regex, and keyword overlap, to whatever text you paste in. The judgment on tone, final wording, and whether a message is ready to send still sits with the recruiter. This tool removes the blank-page problem and the multi-field form problem. It does not replace a human read-through before sending.

## Next steps for this tool

- Expand the skill lexicon by industry vertical (currently strongest for tech and TA roles)
- Add a bulk mode: one role, multiple candidate blocks, generated as a batch
- Optional PDF export of a single selected variant

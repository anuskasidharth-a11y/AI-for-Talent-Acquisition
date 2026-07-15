# Prompt Engineering Notes

This is not a prompt library. It is how I think about writing prompts, built from actual recruiting work rather than a generic online framework.

## Why This Matters

A vague prompt gives me a generic answer that could apply to any candidate for any role. A well-structured prompt gives me something I can actually use in a real submission or a real client update. The difference between the two is almost never the tool. It is how I asked.

## My Framework

**Context** — what is actually happening. The role, the client, the stage of the process.
**Role** — who the AI should act as. A sourcer, a screener, a hiring manager reviewing a resume.
**Objective** — the specific outcome I need, not the general topic.
**Constraints** — tone, length, what must be excluded, format restrictions.
**Output format** — bullet points, a table, a message ready to send, a boolean string only.

## Good Prompt vs Bad Prompt

**Bad:** "Write an outreach message for a software engineer role."

This produces something generic that sounds like it was sent to a thousand engineers, because it was written for a thousand engineers.

**Good:** "You are a technical recruiter reaching out to a backend engineer with 4 years of experience in distributed systems, currently at a Series B fintech startup. The role is a senior backend position at a larger fintech with better equity terms and less on-call burden. Write a 3-sentence LinkedIn message that references their specific experience with distributed systems, does not mention salary, and ends with a low-pressure question rather than a hard ask for a call."

The second version produces a message I can send with light edits instead of a message I have to rewrite from scratch.

## Common Mistakes

The mistake I made most often early on was assuming the AI knew what I meant by shorthand. I would write "senior dev, fintech, good culture fit" and expect a nuanced outreach message. What I got back was bland because I had given it nothing specific to work with. The AI cannot infer the parts of the role I only have in my head. If I do not write it down, it does not exist for the prompt.

The second mistake was not specifying what to exclude. Without telling it not to mention compensation, it will sometimes guess a number or invent a range, which is a fast way to damage a client relationship if that message goes out unedited.

## Reusable Prompt Formula

"You are a [role] working on [context]. The objective is [specific outcome]. The tone should be [tone]. Do not include [exclusion]. Format the output as [format]."

I rebuild this formula every time rather than reusing static prompts, because the context changes with every role and every candidate.

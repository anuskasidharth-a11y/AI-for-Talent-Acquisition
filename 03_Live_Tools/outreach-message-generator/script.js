/* ==========================================================
   Outreach Message Generator
   No backend, no API calls, no external requests of any kind.
   Everything below runs client-side in the browser.

   The "personalization" here is honest pattern matching, not
   a live model: it extracts concrete signals from the two
   text boxes (skills, years of experience, seniority words,
   a likely name and company) and only writes a message once
   it has found real overlap between candidate and role.
   ========================================================== */

(function () {
  "use strict";

  /* ---------------- Skill & signal dictionaries ---------------- */
  // Deliberately recruiter-flavoured, not just a generic tech list ,
  // covers TA-adjacent tools too, since this tool isn't only for eng roles.
  const SKILL_LEXICON = [
    "java","python","javascript","typescript","react","node","node.js","spring boot",
    "aws","azure","gcp","kubernetes","docker","microservices","distributed systems",
    "sql","postgres","mongodb","redis","kafka","graphql","rest api","ci/cd","terraform",
    "machine learning","data science","tensorflow","pytorch","nlp","llm","genai",
    "product management","product strategy","roadmapping","ux research","figma",
    "salesforce","hubspot","sap","workday","successfactors","icims","greenhouse","lever",
    "talent acquisition","full life cycle recruiting","boolean search","sourcing",
    "stakeholder management","vendor management","campus hiring","diversity hiring",
    "linkedin recruiter","ats","interview panel","offer negotiation","onboarding",
    "business development","account management","sales","b2b sales","saas sales",
    "financial modeling","fp&a","accounting","audit","risk management",
    "supply chain","logistics","operations","project management","agile","scrum",
    "content marketing","seo","brand strategy","growth marketing","performance marketing",
    "customer success","technical support","devops","site reliability","security",
    "cybersecurity","penetration testing","cloud architecture","data engineering",
    "power bi","tableau","excel","python scripting","automation","rpa"
  ];

  const SENIORITY_WORDS = ["intern","entry level","associate","mid level","senior","staff","principal","lead","manager","director","vp","head of","executive","chief"];

  /* ---------------- Small text-mining helpers ---------------- */

  function normalize(text) {
    return (text || "").toLowerCase();
  }

  function findSkills(text) {
    const norm = normalize(text);
    const found = new Set();
    SKILL_LEXICON.forEach(skill => {
      if (norm.includes(skill)) found.add(titleCaseSkill(skill));
    });
    return Array.from(found);
  }

  function titleCaseSkill(skill) {
    const smallExceptions = { "aws":"AWS","gcp":"GCP","sql":"SQL","ux":"UX","ats":"ATS","seo":"SEO","nlp":"NLP","llm":"LLM","fp&a":"FP&A","sap":"SAP","b2b sales":"B2B Sales","rest api":"REST API","ci/cd":"CI/CD" };
    if (smallExceptions[skill]) return smallExceptions[skill];
    return skill.replace(/\b\w/g, c => c.toUpperCase());
  }

  function findYearsExperience(text) {
    const match = (text || "").match(/(\d{1,2})\+?\s*(?:years|yrs)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  function findSeniority(text) {
    const norm = normalize(text);
    for (const word of SENIORITY_WORDS) {
      if (norm.includes(word)) return word;
    }
    return null;
  }

  // Heuristic name grab: first capitalized "Firstname Lastname"-looking
  // token near the start of the candidate text, ignored if it looks like
  // a common sentence opener.
  function guessCandidateName(text) {
    if (!text) return null;
    const firstLine = text.trim().split(/\n|\.|,|-/)[0];
    const match = firstLine.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
    if (!match) return null;
    const candidate = match[1];
    const stopWords = ["I","The","This","My","Currently","Worked","Working"];
    if (stopWords.includes(candidate.split(" ")[0])) return null;
    return candidate.split(" ")[0]; // first name only, for a natural greeting
  }

  function guessCompanyFromRole(text) {
    if (!text) return null;
    const match = text.match(/\bat\s+([A-Z][A-Za-z0-9&.\-]+(?:\s[A-Z][A-Za-z0-9&.\-]+)?)/);
    return match ? match[1] : null;
  }

  function guessRoleTitle(text) {
    if (!text) return null;
    const firstLine = text.trim().split(/\n|\./)[0];
    // strip a trailing "at Company" if present, keep the title part
    return firstLine.replace(/\s+at\s+[A-Z].*/, "").trim().slice(0, 60);
  }

  function guessCandidateEmployer(text) {
    if (!text) return null;
    const match = text.match(/\bat\s+([A-Z][A-Za-z0-9&.\-]+(?:\s[A-Z][A-Za-z0-9&.\-]+)?)/);
    return match ? match[1] : null;
  }

  /* ---------------- Parsing orchestration ---------------- */

  function parseCandidate(text) {
    return {
      name: guessCandidateName(text),
      employer: guessCandidateEmployer(text),
      years: findYearsExperience(text),
      seniority: findSeniority(text),
      skills: findSkills(text),
      raw: text || ""
    };
  }

  function parseRole(text) {
    return {
      title: guessRoleTitle(text),
      company: guessCompanyFromRole(text),
      seniority: findSeniority(text),
      skills: findSkills(text),
      raw: text || ""
    };
  }

  function overlap(candidateSkills, roleSkills) {
    const roleSet = new Set(roleSkills.map(s => s.toLowerCase()));
    return candidateSkills.filter(s => roleSet.has(s.toLowerCase()));
  }

  /* ---------------- Message construction ---------------- */

  const OPENERS = {
    professional: n => `Hi ${n},`,
    friendly: n => `Hey ${n}!`,
    conversational: n => `Hi ${n},`,
    formal: n => `Dear ${n},`,
    enthusiastic: n => `Hi ${n}!!`
  };

  const SIGNOFFS = {
    professional: "Best regards,",
    friendly: "Cheers,",
    conversational: "Talk soon,",
    formal: "Kind regards,",
    enthusiastic: "Excited to hear from you!"
  };

  // Framing is collegial, not a pitch. It reads as "we're working on
  // similar things," not "we have a job opening for you."
  function buildHook(cand, role, overlaps) {
    if (overlaps.length >= 2) {
      return `I noticed you've worked directly with ${overlaps[0]} and ${overlaps[1]}. We're working on very similar problems on our team right now.`;
    }
    if (overlaps.length === 1) {
      return `Your experience with ${overlaps[0]} caught my eye. It lines up closely with what our team is working on.`;
    }
    if (cand.years && cand.employer) {
      return `${cand.years} years in the field, including your time at ${cand.employer}, is exactly the kind of background that made me want to reach out.`;
    }
    if (cand.employer) {
      return `Your experience at ${cand.employer} is exactly the kind of background that made me want to reach out.`;
    }
    if (cand.years) {
      return `${cand.years} years of relevant experience is exactly the kind of background that made me want to reach out.`;
    }
    return `Your background caught my attention while I was looking into this space.`;
  }

  function buildBody(cand, role, overlaps, length) {
    const roleTitle = role.title || "a role on our team";
    const roleCompany = role.company ? ` at ${role.company}` : "";
    let core = `We're building out ${roleTitle}${roleCompany}`;
    if (overlaps.length) {
      core += `, and your work on ${overlaps.slice(0,2).join(" and ")} is directly relevant to it.`;
    } else {
      core += `, and I think there could be a strong fit worth exploring.`;
    }

    if (length === "short") return core;

    let extra = "";
    if (role.seniority) {
      extra = ` It's a ${role.seniority} level position, which felt worth mentioning given where you're at.`;
    }
    if (length === "medium") return core + extra;

    let detail = extra + ` Happy to share more about the team and the scope of the work whenever suits you, no pressure either way.`;
    return core + detail;
  }

  function buildCTA(platform) {
    const soft = {
      linkedin: "Are you free for a quick 10 minute call this week?",
      inmail: "Are you free for a quick 10 minute call this week?",
      email: "Would you be free for a quick 10 minute call this week?",
      whatsapp: "Are you free for a quick call sometime this week?"
    };
    return soft[platform] || soft.email;
  }

  function assembleMessage({ tone, platform, length, cand, role, overlaps, candidateName, companyName }) {
    const name = candidateName || cand.name || "there";
    const opener = (OPENERS[tone] || OPENERS.professional)(name);
    const hook = buildHook(cand, role, overlaps);
    const body = buildBody(cand, { ...role, company: companyName || role.company }, overlaps, length);
    const cta = buildCTA(platform);
    const signoff = SIGNOFFS[tone] || SIGNOFFS.professional;

    return `${opener}\n\n${hook} ${body}\n\n${cta}\n\n${signoff}`;
  }

  // Three variants: professional, friendly, highly personalized.
  // The third leads with the strongest concrete overlap found.
  function generateVariants(inputs) {
    const { cand, role, overlaps } = inputs;

    const professional = assembleMessage({ ...inputs, tone: "professional" });
    const friendly = assembleMessage({ ...inputs, tone: "friendly" });

    let personalizedOpen;
    const name = inputs.candidateName || cand.name || "there";
    if (overlaps.length) {
      personalizedOpen = `Hi ${name}, I came across your work with ${overlaps.join(", ")}. Our team is working on very similar problems right now.`;
    } else if (cand.employer) {
      personalizedOpen = `Hi ${name}, your time at ${cand.employer} is exactly the kind of background that made me want to reach out directly.`;
    } else {
      personalizedOpen = `Hi ${name}, your background made me want to reach out directly instead of sending a generic message.`;
    }
    const roleTitle = role.title || "a role on our team";
    const roleCompany = (inputs.companyName || role.company) ? ` at ${inputs.companyName || role.company}` : "";
    const personalizedBody = `We're building out ${roleTitle}${roleCompany}. Are you free for a quick 10 minute call this week to see if it's a fit?`;
    const personalized = `${personalizedOpen}\n\n${personalizedBody}\n\n${SIGNOFFS.conversational}`;

    return [
      { tag: "Professional", text: professional },
      { tag: "Friendly", text: friendly },
      { tag: "Highly personalized", text: personalized }
    ];
  }

  /* ---------------- Icebreaker (grounded, not random) ---------------- */

  function buildIcebreaker(cand, role, overlaps) {
    if (overlaps.length) {
      return `Noticed your direct experience with ${overlaps[0]}. That's rare enough to be worth a message on its own.`;
    }
    if (cand.years && cand.seniority) {
      return `${cand.years} years and clearly ${cand.seniority} level work. That combination doesn't come up often.`;
    }
    if (cand.employer) {
      return `Your time at ${cand.employer} is exactly the kind of background worth reaching out about.`;
    }
    return `Your background stood out enough that I wanted to reach out directly instead of sending a template.`;
  }

  /* ---------------- DOM wiring ---------------- */

  const els = {
    candidateInput: document.getElementById("candidateInput"),
    roleInput: document.getElementById("roleInput"),
    toneSelect: document.getElementById("toneSelect"),
    platformSelect: document.getElementById("platformSelect"),
    lengthSelect: document.getElementById("lengthSelect"),
    companyInput: document.getElementById("companyInput"),
    candidateNameInput: document.getElementById("candidateNameInput"),
    advancedToggle: document.getElementById("advancedToggle"),
    advancedPanel: document.getElementById("advancedPanel"),
    generateBtn: document.getElementById("generateBtn"),
    clearBtn: document.getElementById("clearBtn"),
    signalCandidate: document.getElementById("signalCandidate"),
    signalRole: document.getElementById("signalRole"),
    signalOverlap: document.getElementById("signalOverlap"),
    resultsSection: document.getElementById("resultsSection"),
    resultsGrid: document.getElementById("resultsGrid"),
    downloadAllBtn: document.getElementById("downloadAllBtn"),
    libraryGrid: document.getElementById("libraryGrid"),
    libraryEmpty: document.getElementById("libraryEmpty"),
    librarySearch: document.getElementById("librarySearch"),
    toast: document.getElementById("toast"),
    themeToggle: document.getElementById("themeToggle"),
    iconSun: document.getElementById("iconSun"),
    iconMoon: document.getElementById("iconMoon")
  };

  let lastResult = null; // { variants, cand, role, meta }

  /* ---- Theme ---- */
  function initTheme() {
    const saved = localStorage.getItem("outreach-theme");
    const theme = saved || "light";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
  }
  function updateThemeIcon(theme) {
    els.iconSun.style.display = theme === "dark" ? "block" : "none";
    els.iconMoon.style.display = theme === "dark" ? "none" : "block";
  }
  els.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("outreach-theme", next);
    updateThemeIcon(next);
  });

  /* ---- Advanced panel ---- */
  els.advancedToggle.addEventListener("click", () => {
    const isHidden = els.advancedPanel.hasAttribute("hidden");
    if (isHidden) { els.advancedPanel.removeAttribute("hidden"); }
    else { els.advancedPanel.setAttribute("hidden", ""); }
    els.advancedToggle.setAttribute("aria-expanded", String(isHidden));
  });

  /* ---- Live signal panel ---- */
  function renderChips(container, items, emptyText) {
    container.innerHTML = "";
    if (!items || !items.length) {
      container.classList.add("empty");
      container.textContent = emptyText;
      return;
    }
    container.classList.remove("empty");
    items.forEach(item => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = item;
      container.appendChild(chip);
    });
  }

  function updateSignals() {
    const cand = parseCandidate(els.candidateInput.value);
    const role = parseRole(els.roleInput.value);
    const overlaps = overlap(cand.skills, role.skills);

    const candChips = [...cand.skills];
    if (cand.years) candChips.unshift(`${cand.years} yrs experience`);
    if (cand.seniority) candChips.unshift(cand.seniority);

    const roleChips = [...role.skills];
    if (role.seniority) roleChips.unshift(role.seniority);

    renderChips(els.signalCandidate, candChips, "Paste candidate background to see this fill in");
    renderChips(els.signalRole, roleChips, "Paste the role details to see this fill in");
    renderChips(els.signalOverlap, overlaps, "This is what makes the message feel specific, not generic");

    return { cand, role, overlaps };
  }

  els.candidateInput.addEventListener("input", updateSignals);
  els.roleInput.addEventListener("input", updateSignals);

  /* ---- Generate ---- */
  function countWords(str) { return (str.trim().match(/\S+/g) || []).length; }

  function renderResults(variants, platform) {
    els.resultsGrid.innerHTML = "";
    variants.forEach((variant, idx) => {
      const card = document.createElement("div");
      card.className = "result-card";

      const tag = document.createElement("span");
      tag.className = "result-tag";
      tag.textContent = variant.tag;
      card.appendChild(tag);

      const body = document.createElement("div");
      body.className = "result-body";
      body.textContent = variant.text;
      card.appendChild(body);

      const meta = document.createElement("div");
      meta.className = "result-meta";
      const charCount = variant.text.length;
      const wordCount = countWords(variant.text);
      const isLong = platform === "linkedin" && charCount > 300;
      meta.innerHTML = `<span>${wordCount} words · ${charCount} chars${isLong ? ' <span class="length-warn">· over LinkedIn preview limit</span>' : ""}</span>`;
      card.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "result-actions";

      const copyBtn = document.createElement("button");
      copyBtn.className = "chip-btn primary";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(variant.text).then(() => showToast("Copied to clipboard"));
      });

      const iceBtn = document.createElement("button");
      iceBtn.className = "chip-btn";
      iceBtn.textContent = "✨ Icebreaker";
      iceBtn.addEventListener("click", () => {
        const { cand, role, overlaps } = updateSignals();
        const ice = buildIcebreaker(cand, role, overlaps);
        variant.text = `${ice}\n\n${variant.text}`;
        renderResults(lastResult.variants, platform);
      });

      actions.appendChild(copyBtn);
      actions.appendChild(iceBtn);
      card.appendChild(actions);

      els.resultsGrid.appendChild(card);
    });
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  els.generateBtn.addEventListener("click", () => {
    const candidateText = els.candidateInput.value.trim();
    const roleText = els.roleInput.value.trim();

    if (!candidateText || !roleText) {
      showToast("Add both the candidate background and the role details first");
      return;
    }

    const cand = parseCandidate(candidateText);
    const role = parseRole(roleText);
    const overlaps = overlap(cand.skills, role.skills);
    const platform = els.platformSelect.value;
    const length = els.lengthSelect.value;
    const companyName = els.companyInput.value.trim();
    const candidateName = els.candidateNameInput.value.trim();

    const variants = generateVariants({ cand, role, overlaps, platform, length, companyName, candidateName });

    lastResult = { variants, cand, role, overlaps, platform, meta: { companyName, candidateName, roleText, candidateText } };

    els.resultsSection.hidden = false;
    renderResults(variants, platform);
    els.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // offer a save-to-library affordance via toast-triggered action
    saveToLibraryPrompt();
  });

  function saveToLibraryPrompt() {
    if (!lastResult) return;
    const { cand, meta } = lastResult;
    const name = meta.candidateName || cand.name || "Unnamed candidate";
    addLibraryEntry({
      id: Date.now().toString(36),
      name,
      role: lastResult.role.title || "Untitled role",
      company: meta.companyName || lastResult.role.company || "",
      savedAt: new Date().toISOString(),
      variants: lastResult.variants
    });
  }

  els.clearBtn.addEventListener("click", () => {
    els.candidateInput.value = "";
    els.roleInput.value = "";
    els.companyInput.value = "";
    els.candidateNameInput.value = "";
    els.resultsSection.hidden = true;
    updateSignals();
    showToast("Cleared");
  });

  els.downloadAllBtn.addEventListener("click", () => {
    if (!lastResult) return;
    const content = lastResult.variants.map(v => `--- ${v.tag} ---\n\n${v.text}`).join("\n\n\n");
    downloadTextFile(content, "outreach-messages.txt");
  });

  function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------------- Candidate library (localStorage) ---------------- */

  const LIB_KEY = "outreach-library-v1";

  function loadLibrary() {
    try { return JSON.parse(localStorage.getItem(LIB_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLibrary(list) {
    localStorage.setItem(LIB_KEY, JSON.stringify(list));
  }
  function addLibraryEntry(entry) {
    const list = loadLibrary();
    list.unshift(entry);
    saveLibrary(list.slice(0, 100));
    renderLibrary();
  }
  function removeLibraryEntry(id) {
    const list = loadLibrary().filter(e => e.id !== id);
    saveLibrary(list);
    renderLibrary();
  }

  function renderLibrary(filter) {
    const list = loadLibrary();
    const q = (filter || "").toLowerCase();
    const filtered = q ? list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.role || "").toLowerCase().includes(q) ||
      (e.company || "").toLowerCase().includes(q)
    ) : list;

    els.libraryGrid.innerHTML = "";
    els.libraryEmpty.style.display = filtered.length ? "none" : "block";

    filtered.forEach(entry => {
      const card = document.createElement("div");
      card.className = "library-card";

      const remove = document.createElement("button");
      remove.className = "library-remove";
      remove.setAttribute("aria-label", "Remove saved candidate");
      remove.textContent = "×";
      remove.addEventListener("click", () => removeLibraryEntry(entry.id));
      card.appendChild(remove);

      const h3 = document.createElement("h3");
      h3.textContent = entry.name;
      card.appendChild(h3);

      const p = document.createElement("p");
      const companyStr = entry.company ? ` · ${entry.company}` : "";
      p.textContent = `${entry.role}${companyStr}`;
      card.appendChild(p);

      const actions = document.createElement("div");
      actions.className = "library-actions";
      const copyBtn = document.createElement("button");
      copyBtn.className = "chip-btn small";
      copyBtn.textContent = "Copy best version";
      copyBtn.addEventListener("click", () => {
        const best = entry.variants[2] || entry.variants[0];
        navigator.clipboard.writeText(best.text).then(() => showToast("Copied"));
      });
      actions.appendChild(copyBtn);
      card.appendChild(actions);

      els.libraryGrid.appendChild(card);
    });
  }

  els.librarySearch.addEventListener("input", (e) => renderLibrary(e.target.value));

  /* ---------------- Init ---------------- */
  initTheme();
  updateSignals();
  renderLibrary();

  // Preload sample data so the tool demonstrates value on first load,
  // without overwriting anything the person already typed.
  if (!els.candidateInput.value && !els.roleInput.value) {
    els.candidateInput.value = "Priya Nair, 6 years as a backend engineer at Flipkart, currently leads a team of 4 building payment infrastructure on Java and Spring Boot, migrated a monolith to microservices on AWS last year.";
    els.roleInput.value = "Senior Backend Engineer at Razorpay. Own payment reliability systems, deep Java and Spring Boot experience required, AWS, exposure to microservices migrations. Senior IC role.";
    updateSignals();
  }

})();

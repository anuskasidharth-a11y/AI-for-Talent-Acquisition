/* ============================================================
   Resume Screener — scoring engine
   This is a heuristic assistant, not a semantic AI model. It uses
   section-aware parsing, synonym expansion, and concept clusters
   to approximate context-based matching without needing a backend.
   ============================================================ */

// ---------- Shared text helpers ----------

const STOPWORDS = new Set(['the','and','or','with','of','to','in','for','a','an','is','are','will',
  'must','should','this','that','role','our','we','you','your','as','on','at','by','be','have',
  'has','who','which','from','including','etc','into','across','using','use','strong','good',
  'excellent','ability','skills','experience','years','year','required','requirement','requirements',
  'preferred','plus','such','like','all','any','other','their','they','it','its',
  'can','able','well','also','minimum','least','team','teams','work','working']);

const LEAD_IN_PATTERNS = [
  /^strong experience (with|in)\s+/i,
  /^experience (with|in)\s+/i,
  /^knowledge of\s+/i,
  /^proficiency (with|in)\s+/i,
  /^proficient (with|in)\s+/i,
  /^familiarity with\s+/i,
  /^strong (knowledge|understanding) of\s+/i,
  /^working knowledge of\s+/i,
  /^hands[- ]on experience (with|in)\s+/i,
  /^ability to\s+/i,
  /^exposure to\s+/i,
  /^understanding of\s+/i,
  /^proven\s+/i,
  /^demonstrated\s+/i,
  /^solid\s+/i,
  /^good\s+/i,
  /^excellent\s+/i,
  /^strong\s+/i
];

const TRAILING_DESCRIPTOR_RE = /\s*\b(preferred|nice to have|good to have|bonus|desirable|advantageous|is a plus|optional|desired|exposure)\b\.?\s*$/i;

const DUTY_VERB_RE = /^(manage|managing|lead|leading|drive|driving|own|owning|oversee|overseeing|collaborate|collaborating|partner|partnering|coordinate|coordinating|execute|executing|develop|developing|design|designing|implement|implementing|mentor|mentoring|communicate|communicating|present|presenting|build|building|create|creating|ensure|ensuring|support|supporting|facilitate|facilitating|work|working|run|running|handle|handling|deliver|delivering|maintain|maintaining|perform|performing|conduct|conducting|participate|participating|report|reporting|plan|planning|define|defining|analyze|analyse|analyzing|assist|assisting|help|helping|contribute|contributing|spearhead|spearheading|champion|championing|act|serve|serving|provide|providing|identify|identifying|source|sourcing|screen|screening|track|tracking|attend|attending|liaise|liaising|prepare|preparing|review|reviewing|onboard|onboarding|engage|engaging)\b/i;

const DUTY_SECTION_RE = /^(key\s+)?(responsibilit(y|ies)|duties|what you.?ll do|the role|role\s*(and|&)\s*responsibilit(y|ies)|day.to.day|about the role|key initiatives|job summary|overview|about us|about the (team|company))\s*:?\s*$/i;

const REQ_SECTION_RE = /^(requirements?|qualifications?|skills?|must.have|nice.to.have|good.to.have|tech\s*stack|preferred\s*qualifications?|what (we're|we are) looking for|about you|desired skills|technical skills)\s*:?\s*$/i;

const PREFERRED_MARKER_RE = /preferred|nice.to.have|good.to.have|bonus|desirable|advantageous|is a plus\b/i;

function normalize(s){ return s.toLowerCase().trim(); }

function splitIntoSections(text){
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = {type: 'unknown', header: '', lines: []};
  lines.forEach(rawLine => {
    const line = rawLine.replace(/^[\s•\-\*\u2022\u25CF\u2023]+/, '').trim();
    if(DUTY_SECTION_RE.test(line)){
      if(current.lines.length) sections.push(current);
      current = {type: 'duty', header: line, lines: []};
      return;
    }
    if(REQ_SECTION_RE.test(line)){
      if(current.lines.length) sections.push(current);
      current = {type: 'requirement', header: line, lines: []};
      return;
    }
    current.lines.push(rawLine);
  });
  if(current.lines.length) sections.push(current);
  return sections;
}

function extractYears(text, mode){
  const matches = [...text.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/gi)].map(m => parseInt(m[1], 10));
  if(matches.length === 0) return null;
  return mode === 'min' ? Math.min(...matches) : Math.max(...matches);
}

// ---------- Synonym groups (exact-credit equivalence) ----------

const SYNONYM_GROUPS = [
  ['kubernetes','k8s'],
  ['javascript','js'],
  ['machine learning','ml'],
  ['artificial intelligence','ai'],
  ['user interface','ui'],
  ['user experience','ux'],
  ['natural language processing','nlp'],
  ['continuous integration','ci','ci/cd','cicd'],
  ['amazon web services','aws'],
  ['google cloud platform','gcp','google cloud'],
  ['microsoft azure','azure'],
  ['object oriented programming','oop'],
  ['database','db'],
  ['project management','pm'],
  ['talent acquisition','ta'],
  ['human resources','hr'],
  ['search engine optimization','seo'],
  ['customer relationship management','crm'],
  ['applicant tracking system','ats'],
  ['full stack','fullstack','full-stack'],
  ['front end','frontend','front-end'],
  ['back end','backend','back-end'],
  ['power bi','powerbi'],
  ['node.js','nodejs','node'],
  ['react.js','reactjs','react'],
  ['job description','jd'],
  ['key performance indicator','kpi'],
  ['return on investment','roi'],
  ['stakeholder management','stakeholder engagement'],
  ['full cycle recruitment','full-cycle recruiting','end to end recruitment','end-to-end recruitment']
];

function getVariants(term){
  const norm = normalize(term);
  const variants = new Set([norm]);
  if(norm.endsWith('s') && norm.length > 3) variants.add(norm.slice(0, -1));
  SYNONYM_GROUPS.forEach(group => {
    if(group.includes(norm)) group.forEach(g => variants.add(g));
  });
  return [...variants];
}

function exactMatch(term, resumeLower){
  return getVariants(term).some(v => resumeLower.includes(v));
}

// ---------- Concept clusters (context / transferable-skill credit) ----------
// "exact" = direct synonyms (already covered above, listed again here so cluster
// lookup works both directions). "related" = different phrasing that suggests the
// same underlying capability without literally naming it — partial credit only.

const CONCEPT_CLUSTERS = [
  { name:'microservices', exact:['microservices','microservice'], related:['distributed backend services','distributed systems','service oriented architecture','soa','service-oriented architecture','api-driven services'] },
  { name:'cloud (aws)', exact:['aws','amazon web services'], related:['cloud infrastructure','cloud platform','cloud computing','cloud services','cloud environment'] },
  { name:'cloud (azure)', exact:['azure','microsoft azure'], related:['cloud infrastructure','cloud platform','cloud computing'] },
  { name:'cloud (gcp)', exact:['gcp','google cloud'], related:['cloud infrastructure','cloud platform','cloud computing'] },
  { name:'kubernetes', exact:['kubernetes','k8s'], related:['container orchestration','container management','orchestration platform'] },
  { name:'containers', exact:['docker','containerization','containers'], related:['containerized deployment','containerized applications'] },
  { name:'ci/cd', exact:['ci/cd','continuous integration','continuous deployment','cicd'], related:['automated deployment pipeline','build automation','release automation','deployment pipeline'] },
  { name:'machine learning', exact:['machine learning','ml'], related:['predictive modeling','model training','statistical modeling'] },
  { name:'data engineering', exact:['etl','data pipeline','data pipelines'], related:['data ingestion','data processing pipeline','data workflow'] },
  { name:'sql/databases', exact:['sql','database'], related:['relational database','data querying','query optimization'] },
  { name:'python', exact:['python'], related:[] },
  { name:'java', exact:['java'], related:[] },
  { name:'frontend', exact:['react','angular','vue','frontend','front-end'], related:['user interface development','client-side development','ui development'] },
  { name:'backend', exact:['backend','back-end','node.js','spring boot'], related:['server-side development','api development'] },
  { name:'leadership', exact:['team lead','leadership','managed a team'], related:['led a team','supervised','mentored','managed direct reports','people management'] },
  { name:'stakeholder management', exact:['stakeholder management','stakeholder engagement'], related:['client relationship management','cross-functional collaboration','client-facing','relationship management'] },
  { name:'project management', exact:['project management','pmp'], related:['program management','delivery management','project coordination'] },
  { name:'agile', exact:['agile','scrum'], related:['sprint planning','iterative delivery','kanban'] },
  { name:'communication', exact:['communication skills'], related:['presentation skills','written and verbal communication','cross-team communication'] },
  { name:'sourcing', exact:['sourcing','candidate sourcing'], related:['talent sourcing','boolean search','passive candidate outreach'] },
  { name:'boolean search', exact:['boolean search','boolean strings'], related:['advanced search techniques','x-ray search'] },
  { name:'ats', exact:['ats','applicant tracking system'], related:['recruitment software','hiring platform','recruitment crm'] },
  { name:'diversity hiring', exact:['diversity hiring','diversity recruiting'], related:['inclusive hiring','dei initiatives','diversity and inclusion'] },
  { name:'vendor management', exact:['vendor management'], related:['vendor relations','third-party management','agency management'] },
  { name:'negotiation', exact:['negotiation'], related:['offer negotiation','salary negotiation','contract negotiation'] },
  { name:'analytics/reporting', exact:['analytics','reporting','power bi','tableau'], related:['data visualization','dashboarding','business intelligence','data-driven decision making'] },
  { name:'security', exact:['cybersecurity','security'], related:['information security','application security','infosec'] },
  { name:'devops', exact:['devops'], related:['infrastructure automation','site reliability'] },
  { name:'qa/testing', exact:['qa','quality assurance','testing'], related:['test automation','manual testing','quality control'] },
  { name:'ux/ui design', exact:['ux design','ui design','product design'], related:['user research','wireframing','interaction design'] },
  { name:'sales', exact:['sales'], related:['business development','revenue generation','account growth'] },
  { name:'customer success', exact:['customer success'], related:['client retention','account management','customer support'] },
  { name:'finance/accounting', exact:['accounting','financial analysis'], related:['financial reporting','budgeting','forecasting'] },
  { name:'marketing/seo', exact:['seo','digital marketing'], related:['content strategy','search visibility','organic growth'] },
  { name:'hr/people ops', exact:['hris','people operations','workday'], related:['hr systems','employee lifecycle management'] }
];

function findClustersForTerm(term){
  const t = normalize(term);
  return CONCEPT_CLUSTERS.filter(c =>
    c.exact.some(e => t.includes(e) || e.includes(t)) ||
    c.related.some(r => t.includes(r) || r.includes(t))
  );
}

function findClustersInText(text){
  const t = normalize(text);
  return CONCEPT_CLUSTERS.filter(c =>
    c.exact.some(e => t.includes(e)) || c.related.some(r => t.includes(r))
  );
}

// status: 'matched' (1.0), 'related' (0.6), 'missing' (0)
function evaluateTermAgainstResume(term, resumeLower){
  if(exactMatch(term, resumeLower)){
    return {status:'matched', score:1.0};
  }
  const clusters = findClustersForTerm(term);
  for(const c of clusters){
    if(c.exact.some(e => resumeLower.includes(e)) || c.related.some(r => resumeLower.includes(r))){
      return {status:'related', score:0.6, note: relatedNote(term, c)};
    }
  }
  return {status:'missing', score:0};
}

function relatedNote(term, cluster){
  return `Related experience found under "${cluster.name}" phrasing — direct match for "${term}" not confirmed, validate in screening.`;
}

// ---------- JD parsing ----------

function extractSkillTerms(jdText){
  const sections = splitIntoSections(jdText);
  const usableSections = sections.filter(s => s.type !== 'duty');
  const items = [];

  usableSections.forEach(section => {
    section.lines.forEach(rawLine => {
      let line = rawLine.replace(/^[\s•\-\*\u2022\u25CF\u2023]+/, '').replace(/^\d+[\.\)]\s*/, '');
      if(!line.trim()) return;
      if(DUTY_SECTION_RE.test(line.trim()) || REQ_SECTION_RE.test(line.trim())) return;

      const isPreferred = PREFERRED_MARKER_RE.test(line) || PREFERRED_MARKER_RE.test(section.header);

      let parts = line.split(/[,;]/);
      parts.forEach(part => {
        let p = part.trim();
        p = p.replace(/^(and|or)\s+/i, '');
        LEAD_IN_PATTERNS.forEach(pat => { p = p.replace(pat, ''); });
        p = p.trim().replace(/[.:]+$/, '');
        let prevP;
        do { prevP = p; p = p.replace(TRAILING_DESCRIPTOR_RE, '').trim(); } while(p !== prevP && p.length > 0);
        if(p.length < 2 || p.length > 40) return;
        if(DUTY_VERB_RE.test(p)) return;
        if(/^(we|you|i|us|our|this role|the role|join|looking for a|seeking a)\b/i.test(p)) return;
        if(/'re\b|'ll\b/i.test(p)) return;

        const wordCount = p.split(/\s+/).length;
        if(wordCount > 6) return;

        const words = p.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const nonStop = words.filter(w => !STOPWORDS.has(w));
        if(nonStop.length === 0) return;
        if(/^\d+$/.test(p)) return;

        items.push({term: p, weight: isPreferred ? 'preferred' : 'mandatory'});
      });
    });
  });

  const seen = new Set();
  const deduped = [];
  items.forEach(it => {
    const key = it.term.toLowerCase();
    if(!seen.has(key)){
      seen.add(key);
      deduped.push(it);
    }
  });

  return deduped.slice(0, 40);
}

function extractResponsibilities(jdText){
  const sections = splitIntoSections(jdText);
  const items = [];

  sections.forEach(section => {
    if(section.type === 'requirement') return;
    section.lines.forEach(rawLine => {
      let line = rawLine.replace(/^[\s•\-\*\u2022\u25CF\u2023]+/, '').replace(/^\d+[\.\)]\s*/, '').trim();
      if(!line) return;
      if(DUTY_SECTION_RE.test(line) || REQ_SECTION_RE.test(line)) return;
      if(line.length < 8 || line.length > 160) return;
      if(!DUTY_VERB_RE.test(line) && section.type !== 'duty') return;
      if(/^(we|you're|this role|the role)\b/i.test(line)) return;
      items.push(line.replace(/[.:]+$/, ''));
    });
  });

  const seen = new Set();
  const deduped = [];
  items.forEach(it => {
    const key = it.toLowerCase();
    if(!seen.has(key)){
      seen.add(key);
      deduped.push(it);
    }
  });

  return deduped.slice(0, 15);
}

const SENIORITY_RANKS = [
  {key:'intern', rank:1}, {key:'entry level', rank:2}, {key:'entry-level', rank:2}, {key:'junior', rank:2},
  {key:'associate', rank:2}, {key:'mid-level', rank:3}, {key:'mid level', rank:3},
  {key:'senior', rank:4}, {key:'lead', rank:5}, {key:'staff', rank:5}, {key:'principal', rank:6},
  {key:'manager', rank:6}, {key:'director', rank:7}, {key:'vice president', rank:8}, {key:'vp', rank:8},
  {key:'head of', rank:8}, {key:'chief', rank:9}
];

function detectSeniority(text){
  const t = normalize(text);
  let best = null;
  SENIORITY_RANKS.forEach(s => {
    if(t.includes(s.key)){
      if(!best || s.rank > best.rank) best = s;
    }
  });
  return best;
}

function wordOverlapScore(a, b){
  const wordsA = normalize(a).split(/\s+/).filter(w => w.length > 3 && !STOPWORDS.has(w));
  if(wordsA.length === 0) return 0;
  const bLower = normalize(b);
  const hits = wordsA.filter(w => bLower.includes(w));
  return hits.length / wordsA.length;
}

function scoreResponsibilityLine(line, resumeLower){
  const lineClusters = findClustersInText(line);
  let best = 0;
  lineClusters.forEach(c => {
    if(c.exact.some(e => resumeLower.includes(e))) best = Math.max(best, 1.0);
    else if(c.related.some(r => resumeLower.includes(r))) best = Math.max(best, 0.6);
  });
  const overlap = Math.min(wordOverlapScore(line, resumeLower), 1) * 0.5;
  return Math.max(best, overlap);
}

// ---------- Candidate scoring ----------

function scoreCandidate(jd, candidate){
  const resumeLower = candidate.text.toLowerCase();

  const mandatoryTerms = jd.skillTerms.filter(t => t.weight === 'mandatory');
  const preferredTerms = jd.skillTerms.filter(t => t.weight === 'preferred');
  const termsForTech = mandatoryTerms.length > 0 ? mandatoryTerms : jd.skillTerms;

  const techEvals = termsForTech.map(t => ({term: t.term, ...evaluateTermAgainstResume(t.term, resumeLower)}));
  const techRatio = techEvals.length > 0
    ? techEvals.reduce((sum, e) => sum + e.score, 0) / techEvals.length
    : 0.75;
  const techScore = techRatio * 40;

  const prefEvals = preferredTerms.map(t => ({term: t.term, ...evaluateTermAgainstResume(t.term, resumeLower)}));
  const prefRatio = prefEvals.length > 0
    ? prefEvals.reduce((sum, e) => sum + e.score, 0) / prefEvals.length
    : 0.75;
  const additionalScore = prefRatio * 10;

  const candidateYears = extractYears(candidate.text, 'max');
  let expScore, expNote;
  if(jd.requiredYears !== null){
    if(candidateYears !== null){
      const ratio = Math.min(candidateYears / jd.requiredYears, 1);
      expScore = ratio * 30;
      expNote = `${jd.requiredYears}+ yrs required, ${candidateYears} yrs found on resume.`;
    } else {
      const jdSeniority = detectSeniority(jd.titleAndText);
      const candSeniority = detectSeniority(candidate.text);
      if(jdSeniority && candSeniority && candSeniority.rank >= jdSeniority.rank){
        expScore = 0.75 * 30;
        expNote = `Years not explicitly stated; seniority language ("${candSeniority.key}") suggests alignment with the required level. Validate directly.`;
      } else {
        expScore = 0.35 * 30;
        expNote = `${jd.requiredYears}+ yrs required; years of experience not clearly stated on resume. Validate directly.`;
      }
    }
  } else {
    expScore = candidateYears !== null ? 30 : 0.7 * 30;
    expNote = candidateYears !== null
      ? `No explicit years requirement in JD; candidate states ${candidateYears} yrs experience.`
      : `No explicit years requirement in JD, and none clearly stated on resume.`;
  }

  const respLines = jd.responsibilities;
  const respEvals = respLines.map(line => ({line, score: scoreResponsibilityLine(line, resumeLower)}));
  const respRatio = respEvals.length > 0
    ? respEvals.reduce((sum, e) => sum + e.score, 0) / respEvals.length
    : 0.75;
  const respScore = respRatio * 20;

  const total = Math.round(techScore + expScore + respScore + additionalScore);

  let recommendation = 'Limited Alignment — Review Directly';
  if(total >= 80) recommendation = 'Strong Match';
  else if(total >= 60) recommendation = 'Potential Match';
  else if(total >= 40) recommendation = 'Developing Match';

  const positiveFactors = [];
  const potentialGaps = [];
  const validationNotes = [];

  techEvals.forEach(e => {
    if(e.status === 'matched') positiveFactors.push(`Skill match: ${e.term}`);
    else if(e.status === 'related') validationNotes.push(e.note);
    else potentialGaps.push(`No match found for "${e.term}"`);
  });
  prefEvals.forEach(e => {
    if(e.status === 'matched') positiveFactors.push(`Additional strength: ${e.term}`);
  });
  respEvals.forEach(e => {
    if(e.score >= 0.8) positiveFactors.push(`Responsibility alignment: "${e.line}"`);
    else if(e.score < 0.3) potentialGaps.push(`Limited evidence for: "${e.line}"`);
  });
  positiveFactors.push(expNote.startsWith('No explicit') ? null : expNote);

  return {
    name: candidate.name,
    total,
    recommendation,
    breakdown: {
      technical: {score: techScore, max: 40},
      experience: {score: expScore, max: 30, note: expNote},
      responsibilities: {score: respScore, max: 20},
      additional: {score: additionalScore, max: 10}
    },
    positiveFactors: positiveFactors.filter(Boolean).slice(0, 8),
    potentialGaps: potentialGaps.slice(0, 8),
    validationNotes: validationNotes.slice(0, 8),
    techEvals, prefEvals, respEvals
  };
}

// ---------- JD assembly ----------

function parseJD(title, jdText){
  return {
    title,
    titleAndText: title + '\n' + jdText,
    skillTerms: extractSkillTerms(jdText),
    responsibilities: extractResponsibilities(jdText),
    requiredYears: extractYears(jdText, 'min'),
    seniority: detectSeniority(title + ' ' + jdText)
  };
}

// ---------- File extraction ----------

async function extractTextFromFile(file){
  const name = file.name.toLowerCase();
  try{
    if(name.endsWith('.txt')){
      return await file.text();
    }
    if(name.endsWith('.pdf')){
      if(typeof pdfjsLib === 'undefined') throw new Error('PDF reader unavailable');
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: buf}).promise;
      let text = '';
      for(let i = 1; i <= pdf.numPages; i++){
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(' ') + '\n';
      }
      return text;
    }
    if(name.endsWith('.docx')){
      if(typeof mammoth === 'undefined') throw new Error('DOCX reader unavailable');
      const buf = await file.arrayBuffer();
      const result = await mammoth.extractRawText({arrayBuffer: buf});
      return result.value;
    }
    throw new Error('Unsupported file type');
  } catch(err){
    console.error('File extraction failed:', err);
    return null;
  }
}

// ---------- UI wiring ----------

let candidateCount = 0;
const MAX_CANDIDATES = 10;

function candidateTemplate(index){
  return `
    <div class="candidate-card" id="candidate-${index}">
      <div class="candidate-card-head">
        <input type="text" class="candidate-name" id="name-${index}" placeholder="Candidate name or ID (e.g. Candidate A)">
        <button class="btn-remove" onclick="removeCandidate(${index})" title="Remove this candidate">&times;</button>
      </div>
      <div class="upload-row">
        <label class="file-label">
          Upload resume (.txt, .pdf, .docx)
          <input type="file" accept=".txt,.pdf,.docx" onchange="handleFileUpload(${index}, this)">
        </label>
        <span class="upload-status" id="upload-status-${index}"></span>
      </div>
      <textarea id="resume-${index}" rows="6" placeholder="...or paste resume text directly here"></textarea>
    </div>
  `;
}

function addCandidate(){
  if(candidateCount >= MAX_CANDIDATES){
    alert('This tool supports up to ' + MAX_CANDIDATES + ' candidates per analysis.');
    return;
  }
  candidateCount++;
  const container = document.getElementById('candidatesContainer');
  const div = document.createElement('div');
  div.innerHTML = candidateTemplate(candidateCount);
  container.appendChild(div.firstElementChild);
  updateAddButtonState();
}

function removeCandidate(index){
  const el = document.getElementById('candidate-' + index);
  if(el) el.remove();
  updateAddButtonState();
}

function updateAddButtonState(){
  const remaining = document.querySelectorAll('.candidate-card').length;
  const btn = document.getElementById('addCandidateBtn');
  btn.disabled = remaining >= MAX_CANDIDATES;
  btn.textContent = remaining >= MAX_CANDIDATES ? 'Maximum 10 candidates reached' : '+ Add another candidate';
}

async function handleFileUpload(index, input){
  const statusEl = document.getElementById('upload-status-' + index);
  const file = input.files[0];
  if(!file) return;
  statusEl.textContent = 'Reading file...';
  const text = await extractTextFromFile(file);
  if(text === null){
    statusEl.textContent = 'Could not read this file — please paste the resume text instead.';
    statusEl.classList.add('upload-error');
    return;
  }
  document.getElementById('resume-' + index).value = text.trim();
  statusEl.textContent = 'Loaded: ' + file.name;
  statusEl.classList.remove('upload-error');
}

function collectCandidates(){
  const cards = document.querySelectorAll('.candidate-card');
  const candidates = [];
  cards.forEach(card => {
    const idx = card.id.split('-')[1];
    const name = document.getElementById('name-' + idx).value.trim();
    const text = document.getElementById('resume-' + idx).value.trim();
    if(text.length > 0){
      candidates.push({name: name || ('Candidate ' + (candidates.length + 1)), text});
    }
  });
  return candidates;
}

function analyzeCandidates(){
  const jobTitle = document.getElementById('jobTitle').value.trim();
  const jdText = document.getElementById('jdText').value.trim();
  const candidates = collectCandidates();

  const emptyMsg = document.getElementById('emptyMsg');
  const resultsSection = document.getElementById('resultsSection');

  if(!jdText || candidates.length === 0){
    resultsSection.classList.remove('visible');
    emptyMsg.classList.add('visible');
    return;
  }
  emptyMsg.classList.remove('visible');

  const jd = parseJD(jobTitle, jdText);
  const results = candidates.map(c => scoreCandidate(jd, c));
  results.sort((a, b) => b.total - a.total);

  renderResults(jd, results);
  resultsSection.classList.add('visible');
  resultsSection.scrollIntoView({behavior: 'smooth', block: 'start'});
}

function recBadgeClass(rec){
  if(rec === 'Strong Match') return 'badge-strong';
  if(rec === 'Potential Match') return 'badge-potential';
  if(rec === 'Developing Match') return 'badge-developing';
  return 'badge-limited';
}

function renderResults(jd, results){
  const jdSummary = document.getElementById('jdSummary');
  jdSummary.innerHTML = `
    <div class="jd-summary-grid">
      <div><strong>Mandatory skills identified:</strong> ${jd.skillTerms.filter(t=>t.weight==='mandatory').length}</div>
      <div><strong>Preferred skills identified:</strong> ${jd.skillTerms.filter(t=>t.weight==='preferred').length}</div>
      <div><strong>Responsibilities identified:</strong> ${jd.responsibilities.length}</div>
      <div><strong>Required experience:</strong> ${jd.requiredYears !== null ? jd.requiredYears + '+ years' : 'Not specified'}</div>
      <div><strong>Seniority signal:</strong> ${jd.seniority ? jd.seniority.key : 'Not specified'}</div>
    </div>
  `;

  const rankingBody = document.getElementById('rankingBody');
  rankingBody.innerHTML = '';
  results.forEach((r, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(r.name)}</td>
      <td class="score-cell">${r.total}/100</td>
      <td><span class="badge ${recBadgeClass(r.recommendation)}">${r.recommendation}</span></td>
      <td><a href="#detail-${i}" class="jump-link">View details ↓</a></td>
    `;
    rankingBody.appendChild(row);
  });

  const detailContainer = document.getElementById('detailContainer');
  detailContainer.innerHTML = '';
  results.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'detail-card';
    card.id = 'detail-' + i;
    card.innerHTML = `
      <div class="detail-head">
        <div>
          <span class="detail-rank">#${i + 1}</span>
          <span class="detail-name">${escapeHtml(r.name)}</span>
        </div>
        <div>
          <span class="detail-score">${r.total}/100</span>
          <span class="badge ${recBadgeClass(r.recommendation)}">${r.recommendation}</span>
        </div>
      </div>
      <div class="detail-breakdown">
        ${breakdownRow('Technical Skill Match', r.breakdown.technical.score, r.breakdown.technical.max)}
        ${breakdownRow('Relevant Experience', r.breakdown.experience.score, r.breakdown.experience.max)}
        ${breakdownRow('Role Responsibility Alignment', r.breakdown.responsibilities.score, r.breakdown.responsibilities.max)}
        ${breakdownRow('Additional / Differentiators', r.breakdown.additional.score, r.breakdown.additional.max)}
      </div>
      <div class="explain-grid">
        <div class="explain-col">
          <h4>Positive factors</h4>
          ${listOrEmpty(r.positiveFactors, 'No standout factors identified from the text provided.')}
        </div>
        <div class="explain-col">
          <h4>Potential gaps</h4>
          ${listOrEmpty(r.potentialGaps, 'No clear gaps identified.')}
        </div>
        <div class="explain-col">
          <h4>Validate in screening</h4>
          ${listOrEmpty(r.validationNotes, 'Nothing flagged for validation.')}
        </div>
      </div>
    `;
    detailContainer.appendChild(card);
  });
}

function breakdownRow(label, score, max){
  const pct = max > 0 ? (score / max) * 100 : 0;
  return `
    <div class="bar-row">
      <div class="bar-row-head">
        <span>${label}</span>
        <strong>${score.toFixed(1)} / ${max}</strong>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    </div>
  `;
}

function listOrEmpty(items, emptyText){
  if(!items || items.length === 0){
    return `<p class="hint">${emptyText}</p>`;
  }
  return '<ul>' + items.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function loadExample(){
  document.getElementById('jobTitle').value = 'Senior Backend Engineer';
  document.getElementById('jdText').value =
`We're hiring a Senior Backend Engineer to join our platform team.

Responsibilities:
- Design and build scalable backend services
- Collaborate with cross-functional product and infra teams
- Own the reliability of production systems
- Mentor junior engineers

Requirements:
- 5+ years of backend engineering experience
- Strong experience with Java and Spring Boot
- Experience with microservices architecture
- Experience with AWS
- Kubernetes exposure preferred
- Bachelor's degree in Computer Science or related field`;

  // Reset to two example candidates
  document.getElementById('candidatesContainer').innerHTML = '';
  candidateCount = 0;
  addCandidate();
  addCandidate();

  document.getElementById('name-1').value = 'Candidate A';
  document.getElementById('resume-1').value =
`Backend Engineer with 6 years of experience building distributed backend services in Java and Spring Boot. Designed and deployed cloud infrastructure on AWS. Mentored two junior engineers and led architecture reviews for production systems.`;

  document.getElementById('name-2').value = 'Candidate B';
  document.getElementById('resume-2').value =
`Software developer with 3 years of experience in Java. Worked on internal tools and some cloud-based projects. Familiar with agile ceremonies and cross-team collaboration.`;
}

function clearAll(){
  document.getElementById('jobTitle').value = '';
  document.getElementById('jdText').value = '';
  document.getElementById('candidatesContainer').innerHTML = '';
  candidateCount = 0;
  addCandidate();
  addCandidate();
  addCandidate();
  document.getElementById('resultsSection').classList.remove('visible');
  document.getElementById('emptyMsg').classList.remove('visible');
}

window.addEventListener('DOMContentLoaded', () => {
  if(typeof pdfjsLib !== 'undefined'){
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  addCandidate();
  addCandidate();
  addCandidate();
});

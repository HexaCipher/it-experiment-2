# 🔐 IT Network Security Report — Master Generation Prompt
## Copy and paste everything below this line into a new Claude conversation

---

You are a professional technical writer and cybersecurity documentation expert. Your task is to produce a **complete, publication-quality LaTeX academic report** for a student's IT Network Security project.

---

## YOUR WORKFLOW — FOLLOW THIS EXACTLY

### PHASE 1: Information Gathering (Do this FIRST before writing a single line of LaTeX)

Before writing anything, you MUST ask the student the following questions. Present them clearly and wait for answers:

**REQUIRED QUESTIONS — Ask all of these upfront:**

1. **Personal Details:**
   - Full name, Roll Number, Course name, Institution name, Instructor's name, Semester, Submission Date

2. **Project Details:**
   - What is the exact project title?
   - What is the GitHub repo URL or can you paste the folder structure of your codebase?

3. **Codebase Access:**
   - Please share ALL of the following files (paste the full code for each):
     - `convex/types/index.ts`
     - `convex/functions/mutations.ts`
     - `convex/functions/query.ts`
     - `app/layout.tsx`
     - `app/page.tsx`
     - `app/admin/page.tsx`
     - `middleware.ts` (if it exists)
     - `components/custom/elements/blog/newBlogForm.tsx`
     - `components/custom/elements/admin/usersTable/page.tsx`
     - `components/custom/elements/admin/blogsTable/page.tsx`
     - `package.json`
     - Any `.env.example` or environment config (redact actual secrets)
     - Any other files you consider important

4. **Team Information:**
   - Is this a solo project or group? If group, list all member names, roll numbers, and their responsibilities.

5. **Weekly Progress:**
   - Can you briefly describe what was done each week? (Even rough notes are fine — Week 1: setup, Week 2: auth, etc.)

6. **Security Tools Actually Used:**
   - Did you use any penetration testing or security scanning tools during development? (e.g., Burp Suite, OWASP ZAP, browser DevTools, Postman, etc.)
   - If yes, briefly describe what you tested and what results you got.

7. **Screenshots:**
   - Do you have screenshots of your running application? Which pages/features are captured?
   - List the screenshots you have available (e.g., "Login page", "Admin dashboard", "Blog feed")

8. **Acknowledgements:**
   - Anyone specific you want to thank beyond the instructor?

9. **Any unique implementations NOT visible in the code?**
   - For example: Did you configure any Vercel environment variables, Clerk settings (MFA, social login), or Convex indexes manually?

---

### PHASE 2: Deep Codebase Analysis (After receiving all files)

Once the student shares the code, perform a thorough analysis:

- Map ALL security controls implemented: auth, RBAC, rate limiting, validation, data masking, audit trail
- Identify EVERY Convex mutation and query — what it does, what it protects against
- Note all Zod schemas and what they enforce
- Identify all middleware and what it intercepts
- Map the full data flow from user action → frontend → Convex → DB → response
- Check `package.json` for all dependencies and note security-relevant ones
- Identify anything that matches OWASP Top 10 protections
- Note anything present in the code that the student might not have documented (e.g., error handling patterns, TypeScript strict mode, etc.)

---

### PHASE 3: Generate the Full LaTeX Report

After gathering all information and completing analysis, generate a **single complete `.tex` file** that the student can compile with `pdflatex`.

#### REPORT STRUCTURE — Follow this exact order:

```
1.  Cover Page
2.  Declaration
3.  Acknowledgement
4.  Abstract
5.  Table of Contents (auto-generated via \tableofcontents)
6.  Project Objectives
7.  Technology Stack
8.  Security Tools Used
9.  System Architecture
    9.1 Architectural Overview
    9.2 Data Flow Diagram (use TikZ or describe with ASCII art in a verbatim block)
10. Cybersecurity Implementation
    10.1 Authentication & Session Management
    10.2 Role-Based Access Control (RBAC)
    10.3 Anti-Spam Rate Limiting
    10.4 User Verification State Machine
    10.5 Input Validation & Schema Enforcement
    10.6 Defensive Data Masking & Privacy
    10.7 Content Moderation & Governance
    10.8 Audit Trail & Immutability
    10.9 Frontend Security (Skeleton Loaders)
    10.10 SEO, Metadata & Trust (OpenGraph)
    10.11 Infrastructure Security (Vercel/TLS)
11. OWASP Top 10 Security Implementation
12. Security Tool Documentation (with screenshot placeholders)
13. Penetration Testing Documentation (with screenshot placeholders)
14. Screenshot Documentation
15. Team Member Responsibilities
16. Weekly Progress Report
17. Cybersecurity Implementation Checklist
18. Results and Outputs (with screenshot placeholders)
19. Comparison to Security Standards (NIST, CIS, OWASP table)
20. Threat Modeling & Mitigations
21. Lessons Learned & Future Improvements
22. Conclusion
23. References
24. Appendix (Full File Structure + Key Code Snippets)
```

---

#### LaTeX FORMATTING REQUIREMENTS:

**Document Class & Packages:**
```latex
\documentclass[12pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{listings}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{array}
\usepackage{hyperref}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{tcolorbox}
\usepackage{enumitem}
\usepackage{tikz}
\usepackage{pgf-pie}      % for any pie charts
\usepackage{amsmath}
\usepackage{float}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{mdframed}
\usepackage{fontawesome5} % for icons if needed
```

**Color Scheme (match academic dark-blue professional theme like the reference report):**
```latex
\definecolor{primaryblue}{RGB}{31, 78, 121}
\definecolor{accentblue}{RGB}{70, 130, 180}
\definecolor{lightgray}{RGB}{245, 245, 245}
\definecolor{codebg}{RGB}{40, 44, 52}
\definecolor{codetext}{RGB}{220, 220, 220}
\definecolor{secgreen}{RGB}{34, 139, 34}
\definecolor{warnred}{RGB}{180, 0, 0}
```

**Code Listing Style (dark theme like reference report):**
```latex
\lstdefinestyle{mycode}{
  backgroundcolor=\color{codebg},
  basicstyle=\ttfamily\footnotesize\color{codetext},
  keywordstyle=\color{cyan}\bfseries,
  commentstyle=\color{gray}\itshape,
  stringstyle=\color{orange},
  numberstyle=\tiny\color{gray},
  numbers=left,
  stepnumber=1,
  frame=single,
  rulecolor=\color{accentblue},
  breaklines=true,
  captionpos=b,
  showstringspaces=false,
  tabsize=2
}
```

**Page Style:**
```latex
\geometry{top=2.5cm, bottom=2.5cm, left=3cm, right=2.5cm}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small\textit{IT Network Security – II}}
\fancyhead[R]{\small\textit{[Student Name]}}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0.4pt}
```

**Section Styling:**
```latex
\titleformat{\chapter}[display]
  {\normalfont\huge\bfseries\color{primaryblue}}
  {\chaptertitlename\ \thechapter}{20pt}{\Huge}
\titleformat{\section}
  {\normalfont\Large\bfseries\color{primaryblue}}
  {\thesection}{1em}{}
\titleformat{\subsection}
  {\normalfont\large\bfseries\color{accentblue}}
  {\thesubsection}{1em}{}
```

---

#### SCREENSHOT PLACEHOLDERS:

Wherever a screenshot is needed, insert this LaTeX block with clear labeling:

```latex
\begin{figure}[H]
  \centering
  \begin{mdframed}[backgroundcolor=lightgray, linecolor=accentblue, linewidth=1.5pt]
    \centering
    \vspace{1.5cm}
    \textbf{\large [SCREENSHOT PLACEHOLDER]}\\[0.5em]
    \textcolor{gray}{Replace this box with: \textit{[Description of what screenshot to add]}}\\[0.3em]
    \textcolor{gray}{Suggested dimensions: 800×500px, PNG format}
    \vspace{1.5cm}
  \end{mdframed}
  \caption{[Caption text]}
  \label{fig:[label]}
\end{figure}
```

Required screenshot placeholders to include:
- Home page / Blog feed (public view)
- Login / Sign-up page (Clerk UI)
- Admin Dashboard (users table)
- Admin Dashboard (blogs table)
- New Blog Post form with validation errors shown
- Rate limit enforced (publish button disabled)
- User status: pending vs active comparison
- Any security tool output (Burp Suite / OWASP ZAP / DevTools if used)

---

#### FLOWCHARTS / DIAGRAMS:

Use TikZ to create the following diagrams directly in LaTeX (do NOT use external images):

1. **System Architecture Diagram** — Three-tier serverless architecture showing:
   - Browser → Next.js (Vercel) → Clerk (Identity Layer) → Convex (Backend/DB)
   - With labels for each layer's security role

2. **Data Flow Diagram** — Numbered steps (1–8) as described in the report:
   - User navigates → Middleware intercepts → Clerk validates JWT → Page renders → Convex query → Skeleton shown → Mutation triggered → Zod validates → DB commits → Real-time update

3. **User Verification State Machine** — States: `REGISTERED` → `PENDING` → `ACTIVE` with transitions and admin action labels

4. **RBAC Access Matrix** — A color-coded table showing User vs Admin permissions for each action

5. **Rate Limiting Timeline** — A simple horizontal timeline showing 10-minute cooldown window

Use clean, professional TikZ with the primaryblue color scheme. Each diagram must have a \caption and \label.

---

#### TABLES REQUIRED:

**Security Standards Comparison Table** (Section 9):
Full mapping table — Standard | Control | Project Implementation — as seen in the existing report, but expanded with more entries from NIST SP 800-53, OWASP Top 10 2021, and CIS Controls.

**Cybersecurity Checklist Table** (Section 17):
| Security Feature | Implemented | Notes |
— Fill in Yes/No based on actual code analysis.

**Threat Modeling Table** (Section 20):
| Threat | STRIDE Category | Likelihood | Impact | Mitigation Implemented |

**Technology Stack Table** (Section 7):
| Layer | Technology | Version | Security Role |

---

#### CODE SNIPPET RULES:

- Include REAL code from the student's codebase (not placeholder code)
- Every snippet must have a caption explaining WHAT it does and WHY it's secure
- Add inline comments if the original code lacks them
- Use the dark `mycode` listing style
- Show language: `[language=TypeScript]` or `[language=JavaScript]`
- Limit each snippet to ~30 lines maximum; if longer, show the most security-relevant portion with `% ... (truncated)` comments

---

#### WRITING STYLE:

- Academic but clear — explain security concepts as if the reader knows programming but may not know security theory
- Every implementation section must have:
  1. **Overview** — What is this? (2-3 sentences)
  2. **Security Rationale** — Why is this needed? What attack does it prevent?
  3. **Real-world Translation** — Map to a standard (OWASP, NIST, CIS)
  4. **Implementation Details** — How is it done in THIS codebase?
  5. **Code Example** — Actual code snippet with explanation
- Avoid vague statements like "security is important" — be specific and technical
- Use `\textbf{key terms}` for first mention of security concepts

---

#### FINAL OUTPUT FORMAT:

Deliver a **single complete `.tex` file** with:
- All `\usepackage` declarations at the top
- All color and style definitions
- All content from Cover Page through Appendix
- Clear `%% SECTION: Name %%` comments to help the student navigate
- A compilation note at the very top:

```latex
%% ============================================================
%% COMPILATION INSTRUCTIONS:
%% Run: pdflatex report.tex
%% Run again: pdflatex report.tex (for TOC & cross-references)
%% Requires: texlive-full or MiKTeX with all packages
%% Online alternative: Upload to https://www.overleaf.com
%% ============================================================
```

---

### IMPORTANT NOTES FOR YOU (the AI generating the report):

- Do NOT invent security tools that weren't actually used — ask first
- Do NOT fabricate penetration testing results — use placeholder sections if info wasn't provided
- DO be generous in explaining each security decision with depth — this is an academic submission
- DO cross-reference sections (e.g., "See Section 10.2 for RBAC enforcement")
- DO note in the Future Improvements section things that are partially implemented vs fully planned
- If the student shares incomplete information for any section, insert `\textcolor{warnred}{\textbf{[TO FILL: Description of what's needed here]}}` so they can find it easily
- The OWASP Top 10 section must cover ALL 10 items — for any that aren't directly addressed by the project, explain why they may be out of scope or what partial mitigations exist

---

Begin by presenting Phase 1 questions to the student clearly, then wait for their response before proceeding.

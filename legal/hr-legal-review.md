# HR Legal Review — Offer Letter Templates & Payroll Infrastructure
## Uncle May's Produce, Inc.

**Reviewed by:** General Counsel  
**Review Date:** April 19, 2026  
**Documents Reviewed:**
- `hr/hiring/offer-letter-templates.md` (CHRO, v1.0)
- `hr/compliance/payroll-provider-evaluation.md` (CHRO)

**Overall Assessment:** CHRO work is solid. Templates are well-structured and cover the basics. The following issues must be resolved before any offer letters are sent.

---

## Executive Summary

**Risk Level:** 🟡 MODERATE (good foundation; 6 compliance gaps to fix before hiring)

**Most Critical Issue:** The GM offer letter template is **insufficient** for Matt Weschler. A proper **Employment Agreement** (with NDA, IP assignment, and non-solicitation) is required for a hire of this seniority. The offer letter template should be used only for hourly and department lead hires.

**Remediation:** General Counsel has drafted `legal/gm-employment-agreement-DRAFT.md` (GM Employment Agreement). Use this for Matt Weschler. CHRO offer letter Template 1 should be retired for GM use.

---

## Critical Issues (Fix Before Sending Any Offer Letters)

### Issue 1: GM Needs Employment Agreement, Not Offer Letter
**Severity:** 🔴 Critical  
**Template Affected:** Template 1 (GM)

**Problem:** The GM offer letter contains only a single sentence of confidentiality protection: "You agree to maintain confidentiality of Uncle May's proprietary information, customer data, vendor relationships, and business strategies." This is **not a binding, enforceable NDA or employment agreement** sufficient for a GM with access to all company data.

**Why it matters:**
- Matt Weschler will have access to all vendor pricing, customer data, store financials, and operational processes
- If Matt leaves for a competitor, the Company has no meaningful legal recourse without a proper NDA/non-solicitation agreement
- The offer letter lacks: IP assignment clause, binding NDA with survival provisions, non-solicitation of employees/customers, enforceable remedies (injunctive relief)

**Remediation:**
- Use `legal/gm-employment-agreement-DRAFT.md` (drafted by General Counsel)
- CHRO Template 1 may be repurposed as a summary/confirmation but should NOT be the binding legal document for the GM
- CEO must fill in salary and bonus terms before sending

---

### Issue 2: Illinois Non-Compete Law — Salary Threshold Check Required
**Severity:** 🔴 Critical  
**Template Affected:** Template 1 (GM), Template 2 (Department Leads)

**Legal Background:** Under the Illinois Freedom to Work Act (820 ILCS 90/, effective January 1, 2022):
- **Non-compete agreements** are **UNENFORCEABLE** for employees earning less than $75,000/year (threshold increases by $2,500 every 5 years)
- **Non-solicitation agreements** are **UNENFORCEABLE** for employees earning less than $45,000/year (threshold increases by $2,500 every 5 years)

**Current thresholds (2022-2026):**
- Non-compete: $75,000/year minimum
- Non-solicitation: $45,000/year minimum

**Issue with Templates:** Templates do not contain non-compete or non-solicitation clauses (this is actually fine for the offer letter), but the CHRO compliance notes in the templates reference "at-will employment (exception: employment contracts override at-will — GM may have employment agreement)" without flagging the salary threshold requirement.

**Remediation:**
- If GM salary is ≥$75K: Non-compete in Employment Agreement is enforceable (Section 6.3)
- If GM salary is $45K-$74K: Non-solicitation enforceable, non-compete is NOT
- Department Leads ($40K-$55K range): Non-solicitation may be enforceable (if above $45K threshold); non-compete is NOT
- Hourly staff (<$40K): Neither non-compete nor non-solicitation is enforceable
- **CEO Action:** Confirm GM salary and include/remove non-compete clause in Employment Agreement accordingly

---

### Issue 3: Background Check Adverse Action Process (FCRA Compliance)
**Severity:** 🔴 Critical  
**Template Affected:** All templates + background check section

**Legal Background:** The Fair Credit Reporting Act (FCRA) requires a **two-step adverse action process** before an employer can rescind a job offer based on a background check:

**Step 1 (Pre-Adverse Action):**
- Before rescinding an offer, employer must provide:
  - Copy of the background check report
  - Summary of FCRA rights (CFPB-approved notice)
  - Opportunity to dispute inaccuracies (typically 5-7 business days)

**Step 2 (Adverse Action Notice):**
- After waiting 5-7 days (or confirming dispute resolved), employer may send:
  - Adverse action notice (denial of employment)
  - Name, address, and phone number of the background check company
  - Statement that the company did not make the decision (FCRA applies)
  - Notice of right to dispute
  - Notice of right to free copy of report within 60 days

**Illinois Supplemental Requirements:**
- Illinois Human Rights Act prohibits using criminal history to deny employment unless the offense is **directly related** to the duties of the position (applying Article 2 of the IHRA)
- Chicago Fair Chance Employer Pledge program (voluntary but recommended for community relations)

**Current Gap:** The CHRO background check section says "If concerns arise: consult with CEO before rescinding offer" but does NOT include the required FCRA two-step process.

**Remediation:**
1. Add FCRA adverse action process to the background check procedure in `hr/hiring/offer-letter-templates.md`
2. When selecting a background check provider (Checkr, GoodHire, etc.), confirm the provider handles FCRA adverse action notices automatically
3. Do NOT rescind any offer based on background check results without completing the two-step process

---

### Issue 4: Illinois CROWN Act / Anti-Discrimination Language
**Severity:** 🟡 High  
**Template Affected:** All templates

**Legal Background:** Illinois CROWN Act (Public Act 101-0596, effective January 1, 2020) prohibits employment discrimination based on hair texture and protective hairstyles (locs, braids, twists, Bantu knots, Afros, etc.).

**Why critical for Uncle May's:** Uncle May's targets Black communities and hires from those communities. CROWN Act compliance is both a legal obligation and a cultural imperative for the brand.

**Current Gap:** Offer letter templates reference EEO compliance ("Uncle May's does not discriminate based on race, color, religion, sex...") but do not specifically mention hair texture and protective hairstyles.

**Remediation:**
1. Add CROWN Act language to the Legal Compliance Notes section in offer letter templates: "Uncle May's Produce complies with the Illinois CROWN Act and prohibits discrimination based on hair texture and protective hairstyles, including locs, braids, twists, Bantu knots, Afros, and similar styles."
2. Add same language to the employee handbook (once created)
3. Train GM and hiring managers on CROWN Act requirements before hiring begins

---

### Issue 5: FLSA Exempt Classification — GM "50+ Hours" Language
**Severity:** 🟡 High  
**Template Affected:** Template 1 (GM)

**Legal Background:** Under the Fair Labor Standards Act (FLSA), to classify an employee as exempt from overtime (salaried exempt), the employer must satisfy:
1. **Salary basis test:** Employee earns ≥$684/week ($35,568/year) — federal threshold; Illinois follows federal
2. **Salary level test:** Same as above
3. **Duties test (executive exemption):** Employee's primary duty is management, supervises 2+ employees, and has authority to hire/fire

**Issue:** The template states "50+ hours/week (no overtime pay as exempt employee)" — this is technically fine **if the GM meets all three FLSA exemption tests**. However, the template doesn't confirm the salary threshold. If the GM salary is below $35,568/year (unlikely at a GM level, but worth confirming), the employee would be non-exempt and entitled to overtime.

**Additional Issue:** "50+ hours/week expected" language in an offer letter may constitute evidence of unpaid overtime liability if the employee is later found to be misclassified (or if the classification changes). Courts have found that expectation-of-overtime language in offer letters can strengthen misclassification claims.

**Remediation:**
1. Confirm GM salary meets FLSA salary level test (>$35,568/year; almost certainly true for a GM, but verify)
2. Soften "50+ hours/week" language to "Exempt employees are not eligible for overtime pay. The Company expects significant hours during store opening, peak periods, and operational challenges. Typical weekly hours are 50-55 but may vary."
3. The GM Employment Agreement (Section 1.2) properly characterizes the role without specifying hourly expectations — use that language

---

### Issue 6: Illinois Wage Payment and Collection Act — Final Pay Timing
**Severity:** 🟡 High  
**Template Affected:** All templates

**Legal Background:** Under the Illinois Wage Payment and Collection Act (820 ILCS 115/), when an employee is terminated (by employer), the final paycheck must be paid **at the next regularly scheduled pay date** or **within 13 days of termination** (whichever is later, practically speaking on the next payday). When an employee voluntarily resigns, the Company must pay on the next regularly scheduled payday.

**Current Gap:** Templates state "Your employment is at-will, meaning either you or Uncle May's may terminate the relationship at any time, with or without cause or notice" — but don't mention final pay timing, which is legally required. This omission won't invalidate the offer letter but creates ambiguity.

**Remediation:**
- Add one sentence to the Employment Terms section: "Upon separation of employment for any reason, the Company will pay all earned wages on or before the next regularly scheduled pay date, as required by the Illinois Wage Payment and Collection Act."

---

## Lower-Priority Items (Fix Before Store Opening)

### Item 7: Employee Handbook (Not Yet Created)
**Severity:** 🟡 Medium  
**Issue:** Uncle May's does not yet have an employee handbook. The handbook is legally important for:
- Anti-harassment and anti-discrimination policies (EEOC/IHRA)
- Workplace safety policies (OSHA, IDPH for food retail)
- Social media policy
- Drug and alcohol policy
- Attendance and tardiness policy
- Discipline and termination procedures
- Chicago paid sick leave policy (separate written policy required by ordinance)

**Recommendation:** General Counsel to draft employee handbook before store opening. Target completion: Q4 2026 (60 days before store opens, so GM can review and provide input).

### Item 8: Workers' Compensation Insurance
**Severity:** 🟡 Medium  
**Issue:** CHRO payroll evaluation notes workers' comp is required for all Illinois employers with 1+ employees. Uncle May's must obtain coverage **before the first employee starts**. Failure to have workers' comp when required is a Class 4 felony in Illinois (730 ILCS 5/5-4.5-45) and subjects the Company to fines up to $500/day.

**Action:** CEO/COO to purchase workers' comp policy before Matt Weschler's start date. Gusto can bundle workers' comp insurance, or obtain separately from a carrier (Travelers, Liberty Mutual, etc.).

### Item 9: Payroll Tax Registration (Before First Payroll)
**Severity:** 🟡 Medium  
**Issue:** Company must register with:
- **Illinois IDES** (for unemployment insurance) — register before first payroll
- **Illinois Department of Revenue** (for state income tax withholding) — register before first payroll
- **City of Chicago** (business license, tax registration if applicable) — confirm with CFO

**Action:** Set up Gusto and ensure all state/local registrations are complete before first payroll run.

### Item 10: I-9 Remote Verification Consideration
**Severity:** 🟢 Low  
**Issue:** If any employees are hired remotely or off-site, I-9 physical document review requirements apply on Day 1. Remote I-9 options exist (authorized representatives, E-Verify remote option) but require specific procedures.

**Action:** Since Uncle May's is a physical retail location, all employees will be on-site. Confirm I-9 process is completed in person on Day 1 per standard procedure.

---

## Summary of Required Actions

### CEO/CHRO — Before First Offer Letter Goes Out
1. ☐ Replace GM offer letter with `legal/gm-employment-agreement-DRAFT.md` (fill in salary)
2. ☐ Add FCRA two-step adverse action process to background check procedures
3. ☐ Add CROWN Act compliance language to offer letter templates
4. ☐ Add Illinois Wage Payment Act final pay language to offer letter templates
5. ☐ Confirm GM salary meets FLSA exemption threshold; soften "50+ hours" language
6. ☐ Obtain workers' comp insurance before Matt Weschler's start date

### General Counsel — Before Store Opening (Q4 2026)
1. ☐ Draft employee handbook (`legal/employee-handbook-DRAFT.md`)
2. ☐ Draft Chicago Paid Sick Leave policy (separate from handbook, required by ordinance)
3. ☐ Review background check provider agreement (Checkr/GoodHire) for FCRA compliance
4. ☐ Confirm state/local payroll tax registrations are complete

---

## What CHRO Did Well (Keep As-Is)

- **At-will employment language:** Correctly stated in all templates
- **I-9 process:** Thorough and legally accurate procedure outlined
- **Chicago minimum wage:** $16.60/hour correctly cited for 2026
- **Overtime language:** Correctly distinguishes exempt (GM) from non-exempt (department leads, hourly) employees
- **FLSA threshold:** Correctly cites $35,568/year federal exemption threshold
- **Pay schedule:** Biweekly / semi-monthly approach is legally compliant
- **Gusto recommendation:** Excellent selection; handles Illinois compliance (IDES, Chicago sick leave, minimum wage) automatically
- **Non-discrimination language:** Basic EEO language is present (can enhance with CROWN Act and IHRA specifics)
- **Background check timing:** Correct approach to contingent offers

---

**Document Prepared By:** General Counsel  
**Date:** April 19, 2026  
**Distribution:** CEO (Anthony Ivy), COO (Zoe Rowell), CHRO

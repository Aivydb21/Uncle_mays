# Document Format Requirements for External Contacts

**CRITICAL RULE:** All official documents sent to external contacts (journalists, investors, partners, summit organizers) MUST be in Word or PDF format.

**Established:** 2026-04-18 by CEO

---

## Approved Formats for External Contacts

### ✅ APPROVED FORMATS

1. **PDF (.pdf)**
   - Preferred for final documents
   - Maintains formatting across all devices
   - Professional appearance
   - Cannot be easily edited
   - Best for: Press kits, one-sheets, decks, formal proposals

2. **Microsoft Word (.docx)**
   - Editable format when collaboration needed
   - Widely compatible
   - Best for: Proposals requiring client input, collaborative documents

### ❌ NOT APPROVED FOR EXTERNAL CONTACTS

- ❌ Markdown (.md) — Internal use only
- ❌ Plain text (.txt) — Unprofessional
- ❌ Google Docs links — Requires Google account, tracking issues
- ❌ Notion pages — Requires Notion account
- ❌ HTML files — Not standard for business communication

---

## Required Conversions

### Current Materials Needing PDF Conversion

**HIGH PRIORITY:**
1. ✅ **uncle-mays-one-sheet.md** → **uncle-mays-one-sheet.pdf**
   - For Grocery Retail for All Summit pitch
   - For all media outreach
   - For investor meetings

2. **journalist-research-tier1.md** → (Keep internal, no external sharing)

3. **summit-opportunity-june-2026.md** → (Keep internal, no external sharing)

**INTERNAL ONLY (No conversion needed):**
- All research files
- All planning documents
- Heartbeat checklists
- Monitoring logs

---

## PDF Conversion Process

### Method 1: Pandoc (Recommended)
```bash
pandoc uncle-mays-one-sheet.md -o uncle-mays-one-sheet.pdf --pdf-engine=xelatex
```

### Method 2: Online Converter
- Use https://www.markdowntopdf.com/
- Upload .md file
- Download PDF
- Review formatting before sending

### Method 3: Copy to Word, Export to PDF
1. Open .md file in text editor
2. Copy content
3. Paste into Microsoft Word
4. Format as needed
5. File → Export → PDF

---

## Quality Checklist for PDFs

Before sending any PDF to external contact:

- [ ] Company logo present (if applicable)
- [ ] Contact information correct
- [ ] Formatting is clean and professional
- [ ] Links are clickable (if PDF supports it)
- [ ] No markdown syntax visible (**, ##, etc.)
- [ ] Images load properly
- [ ] File size reasonable (<5MB)
- [ ] Filename is professional (no spaces, use hyphens)

---

## Naming Conventions

### ✅ GOOD FILENAMES
- `Uncle-Mays-One-Sheet.pdf`
- `Uncle-Mays-Media-Kit-2026.pdf`
- `Anthony-Ivy-Bio.pdf`

### ❌ BAD FILENAMES
- `uncle mays one sheet.pdf` (spaces)
- `one-sheet.pdf` (not descriptive)
- `FINAL_FINAL_v3.pdf` (not professional)

---

## When to Use Each Format

### Use PDF When:
- Sending to journalists
- Submitting to conferences/events
- Attaching to pitch emails
- Sharing media kits
- Providing press materials
- Formal business communications

### Use Word When:
- Client needs to edit/add comments
- Collaborative proposals
- RFP responses requiring client input
- Contracts requiring signature

### Use Markdown When:
- Internal documentation only
- GitHub/repo documentation
- PR Director's own working files
- Draft materials before final export

---

## Action Required

**Immediate:**
1. CEO needs to convert `uncle-mays-one-sheet.md` to PDF for summit pitch
2. Update Gmail draft for Black Enterprise with corrected email
3. All future external documents start as PDF/Word, not Markdown

**Going Forward:**
- PR Director will create PDFs for all external materials
- Markdown files are working documents only
- Always ask CEO: "Do you want this as PDF or Word?" before finalizing

---

## Tools Available

**For CEO:**
- Microsoft Word (installed on Windows)
- Adobe Acrobat (if available)
- Online converters (markdowntopdf.com)

**For PR Director:**
- Can create markdown drafts
- Cannot directly create PDFs (no direct PDF tool access)
- Will provide markdown for CEO to convert
- Or use Python script to convert (if pandoc installed)

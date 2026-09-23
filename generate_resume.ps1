$ErrorActionPreference = "Stop"

function ConvertTo-PdfEscapedText($text) {
    return $text.Replace('\', '\\').Replace('(', '\(').Replace(')', '\)')
}

# Margins (A4: 595.28 x 841.89 pt)
$leftMargin = 40.0
$rightMargin = 555.28

$streamLines = [System.Collections.Generic.List[string]]::new()
$annots = [System.Collections.Generic.List[string]]::new()

function Add-Line($x1, $y1, $x2, $y2, $r, $g, $b, $w) {
    $streamLines.Add(("{0:F2} {1:F2} {2:F2} RG {3:F2} w {4:F2} {5:F2} m {6:F2} {7:F2} l S" -f $r, $g, $b, $w, $x1, $y1, $x2, $y2))
}

function Add-Text($font, $size, $x, $y, $text, $r, $g, $b) {
    $esc = ConvertTo-PdfEscapedText $text
    $streamLines.Add(("BT /{0} {1:F2} Tf {2:F2} {3:F2} {4:F2} rg 1 0 0 1 {5:F2} {6:F2} Tm ({7}) Tj ET" -f $font, $size, $r, $g, $b, $x, $y, $esc))
}

function Add-Bullet($x, $y, $r, $g, $b) {
    # small clean filled circle/square for bullet
    $streamLines.Add(("{0:F2} {1:F2} {2:F2} rg {3:F2} {4:F2} 2.0 2.0 re f" -f $r, $g, $b, ($x - 1.0), ($y + 2.2)))
}

function Add-Link($x1, $y1, $x2, $y2, $url) {
    $escUrl = ConvertTo-PdfEscapedText $url
    $linkStr = "<< /Type /Annot /Subtype /Link /Rect [{0:F2} {1:F2} {2:F2} {3:F2}] /Border [0 0 0] /A << /S /URI /URI ({4}) >> >>" -f @($x1, $y1, $x2, $y2, $escUrl)
    $annots.Add($linkStr)
}

# Layout Tracker
$global:currentY = 804.0

# 1. Header
# SAMIHA VAHORA
Add-Text "F1" 20.0 205.0 $global:currentY "SAMIHA VAHORA" 0.08 0.16 0.32
$global:currentY -= 15.0

# Full Stack Developer
Add-Text "F2" 11.0 238.0 $global:currentY "Full Stack Developer" 0.22 0.35 0.55
$global:currentY -= 14.0

# Contact Info
# Vadodara, India | samihavahora71@gmail.com | linkedin.com/in/samiha-vahora-9792a632a | github.com/samihavahora05
$c1 = "Vadodara, India  |  "
$c2 = "samihavahora71@gmail.com"
$c3 = "  |  "
$c4 = "linkedin.com/in/samiha-vahora-9792a632a"
$c5 = "  |  "
$c6 = "github.com/samihavahora05"

$startX = 54.0
Add-Text "F2" 8.5 $startX $global:currentY $c1 0.25 0.30 0.38
$xPos = $startX + 78.0

Add-Text "F2" 8.5 $xPos $global:currentY $c2 0.12 0.38 0.75
Add-Link $xPos ($global:currentY - 2.0) ($xPos + 115.0) ($global:currentY + 9.0) "mailto:samihavahora71@gmail.com"
$xPos += 115.0

Add-Text "F2" 8.5 $xPos $global:currentY $c3 0.25 0.30 0.38
$xPos += 12.0

Add-Text "F2" 8.5 $xPos $global:currentY $c4 0.12 0.38 0.75
Add-Link $xPos ($global:currentY - 2.0) ($xPos + 168.0) ($global:currentY + 9.0) "https://linkedin.com/in/samiha-vahora-9792a632a"
$xPos += 168.0

Add-Text "F2" 8.5 $xPos $global:currentY $c5 0.25 0.30 0.38
$xPos += 12.0

Add-Text "F2" 8.5 $xPos $global:currentY $c6 0.12 0.38 0.75
Add-Link $xPos ($global:currentY - 2.0) ($xPos + 115.0) ($global:currentY + 9.0) "https://github.com/samihavahora05"

$global:currentY -= 9.0

# Function for Section Header
function Add-SectionHeader($title) {
    # Divider line above section
    Add-Line $leftMargin $global:currentY $rightMargin $global:currentY 0.25 0.30 0.40 0.75
    $global:currentY -= 11.0
    Add-Text "F1" 9.5 $leftMargin $global:currentY $title 0.08 0.16 0.32
    $global:currentY -= 10.5
}

# --- SUMMARY ---
Add-SectionHeader "SUMMARY"
$sumLines = @(
    "Final-year B.Tech Computer Science student specializing in Full Stack Web Development with expanding expertise in AI/ML",
    "Engineering. Hands-on experience building and shipping production software during a full stack internship, including a fully working",
    "HR Management System and the company's official website (frontend and backend), alongside independent projects such as an",
    "AI-powered insurance matchmaking platform with semantic search and an on-device AI inference Android app. Proficient in React.js,",
    "Next.js, Node.js, Express.js, PHP, Laravel, MySQL, Python, and Kotlin."
)
foreach ($l in $sumLines) {
    Add-Text "F2" 8.4 $leftMargin $global:currentY $l 0.15 0.18 0.22
    $global:currentY -= 10.5
}
$global:currentY -= 3.0

# --- SKILLS ---
Add-SectionHeader "SKILLS"
$skills = @(
    @("Frontend:", "React.js, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Bootstrap, Flutter (Dart)"),
    @("Backend:", "Node.js, Express.js, PHP, Laravel, Supabase (Auth, Edge Functions), REST APIs, Axios"),
    @("Database:", "PostgreSQL (pgvector), MySQL, SQLite, Firebase"),
    @("AI / ML:", "YOLOv8, TensorFlow Lite, Scikit-learn, TensorFlow, pgvector Semantic Search, AI Engineering (Udemy, in progress)"),
    @("Tools & Platforms:", "Razorpay API, Docker, Jetpack Compose, Android Studio, Git, GitHub, VS Code")
)
foreach ($s in $skills) {
    Add-Text "F1" 8.4 $leftMargin $global:currentY $s[0] 0.10 0.15 0.25
    $xOffset = $leftMargin + 42.0
    if ($s[0] -eq "Tools & Platforms:") { $xOffset = $leftMargin + 78.0 }
    elseif ($s[0] -eq "Frontend:") { $xOffset = $leftMargin + 44.0 }
    elseif ($s[0] -eq "Backend:") { $xOffset = $leftMargin + 42.0 }
    elseif ($s[0] -eq "Database:") { $xOffset = $leftMargin + 44.0 }
    elseif ($s[0] -eq "AI / ML:") { $xOffset = $leftMargin + 40.0 }
    
    Add-Text "F2" 8.4 $xOffset $global:currentY $s[1] 0.18 0.22 0.28
    $global:currentY -= 10.5
}
$global:currentY -= 3.0

# --- EXPERIENCE ---
Add-SectionHeader "EXPERIENCE"
Add-Text "F1" 8.6 $leftMargin $global:currentY "Full Stack Web Development Intern" 0.08 0.15 0.25
Add-Text "F3" 8.6 ($leftMargin + 160.0) $global:currentY "-- BLUEBOXX DA Pvt Ltd" 0.25 0.35 0.50
$global:currentY -= 11.0

$expBullets = @(
    @(
        "Built the company's HR Management System (HRMS) end-to-end as a fully working production application, covering role-based",
        "dashboards (Admin/HR/Manager/Employee), org metrics, audit trail, leave and task management, and live notifications -- live at hrms.blueboxx.in."
    ),
    @(
        "Independently built BLUEBOXX DA's official company website end-to-end, both frontend and backend, and continue to own it as an ongoing",
        "main project."
    ),
    @(
        "Worked across the frontend of BLUEBOXX DA's IT training platform (courses, internships, jobs, and expert 1-on-1 sessions), including UI",
        "components and design/animation elements."
    ),
    @(
        "Collaborated with the software development team as it expanded outreach toward the US market for white-label and partnership work."
    )
)

foreach ($b in $expBullets) {
    Add-Bullet ($leftMargin + 4.0) $global:currentY 0.20 0.35 0.55
    for ($i = 0; $i -lt $b.Count; $i++) {
        Add-Text "F2" 8.2 ($leftMargin + 12.0) $global:currentY $b[$i] 0.15 0.18 0.22
        $global:currentY -= 10.0
    }
    $global:currentY -= 1.0
}
$global:currentY -= 2.0

# --- PROJECTS ---
Add-SectionHeader "PROJECTS"

# Project 1: InsurMatch
Add-Text "F1" 8.6 $leftMargin $global:currentY "InsurMatch -- AI-Powered Insurance Agent Matchmaking Platform" 0.08 0.15 0.25
$insurLink = "github.com/samihavahora05/insurmatch"
$insurLinkX = $rightMargin - 165.0
Add-Text "F2" 8.0 $insurLinkX $global:currentY $insurLink 0.12 0.38 0.75
Add-Link $insurLinkX ($global:currentY - 2.0) $rightMargin ($global:currentY + 8.0) "https://github.com/samihavahora05/insurmatch"
$global:currentY -= 10.5

$insurBullets = @(
    @(
        "Built a full-stack platform connecting clients with insurance agents through an AI matchmaker that ranks agent profiles using pgvector",
        "cosine similarity over query embeddings."
    ),
    @(
        "Designed a graceful fallback to client-side keyword matching when the embedding service is unavailable, ensuring the matchmaker always",
        "returns results."
    ),
    @(
        "Implemented Supabase Auth with Row Level Security, an agent directory, consultation booking, and separate client/agent dashboards;",
        "containerized the full stack with Docker for one-command local setup."
    )
)
foreach ($b in $insurBullets) {
    Add-Bullet ($leftMargin + 4.0) $global:currentY 0.20 0.35 0.55
    for ($i = 0; $i -lt $b.Count; $i++) {
        Add-Text "F2" 8.2 ($leftMargin + 12.0) $global:currentY $b[$i] 0.15 0.18 0.22
        $global:currentY -= 10.0
    }
    $global:currentY -= 1.0
}
$global:currentY -= 2.0

# Project 2: Object Detection
Add-Text "F1" 8.6 $leftMargin $global:currentY "Object Detection Android App" 0.08 0.15 0.25
$objLink = "github.com/samihavahora05/ObjectDetection"
$objLinkX = $rightMargin - 180.0
Add-Text "F2" 8.0 $objLinkX $global:currentY $objLink 0.12 0.38 0.75
Add-Link $objLinkX ($global:currentY - 2.0) $rightMargin ($global:currentY + 8.0) "https://github.com/samihavahora05/ObjectDetection"
$global:currentY -= 10.5

$objBullets = @(
    @(
        "Trained YOLOv8 Nano on a custom dataset, converted it to TFLite, and integrated it into a Kotlin Android app for real-time on-device",
        "inference with no internet connection required."
    ),
    @(
        "Built an AI product scanner that identifies packaged food items via live camera and returns ingredient information."
    ),
    @(
        "Optimised the frame-by-frame inference pipeline using Jetpack Compose UI and managed the full ML lifecycle from data preparation",
        "through quantisation and deployment."
    )
)
foreach ($b in $objBullets) {
    Add-Bullet ($leftMargin + 4.0) $global:currentY 0.20 0.35 0.55
    for ($i = 0; $i -lt $b.Count; $i++) {
        Add-Text "F2" 8.2 ($leftMargin + 12.0) $global:currentY $b[$i] 0.15 0.18 0.22
        $global:currentY -= 10.0
    }
    $global:currentY -= 1.0
}
$global:currentY -= 2.0

# --- EDUCATION ---
Add-SectionHeader "EDUCATION"
Add-Text "F1" 8.4 $leftMargin $global:currentY "B.Tech -- Computer Science & Engineering" 0.08 0.15 0.25
Add-Text "F2" 8.2 ($leftMargin + 180.0) $global:currentY ", ITM (SLS) Baroda University, Vadodara" 0.18 0.22 0.28
Add-Text "F2" 8.2 ($rightMargin - 125.0) $global:currentY "| 01/2024 - 05/2027 | CGPA: 8.43" 0.30 0.35 0.45
$global:currentY -= 10.5

Add-Text "F1" 8.4 $leftMargin $global:currentY "Diploma -- Computer Engineering" 0.08 0.15 0.25
Add-Text "F2" 8.2 ($leftMargin + 145.0) $global:currentY ", MSU Polytechnic, Vadodara" 0.18 0.22 0.28
Add-Text "F2" 8.2 ($rightMargin - 80.0) $global:currentY "| 06/2021 - 05/2024" 0.30 0.35 0.45
$global:currentY -= 13.0

# --- CERTIFICATIONS ---
Add-SectionHeader "CERTIFICATIONS"
$certs = @(
    "Advanced AI/ML & Deep Learning, SAP Analytics Cloud & ABAP on BTP -- Code Unnati, SAP & Edunet Foundation (ID: CU26_32276)",
    "Jetpack Compose & Kotlin for Modern Android Development -- Google",
    "8x Google Skill Badges (Cloud & App Development) -- Google",
    "AI Engineering -- Udemy"
)
foreach ($c in $certs) {
    Add-Bullet ($leftMargin + 4.0) $global:currentY 0.20 0.35 0.55
    Add-Text "F2" 8.2 ($leftMargin + 12.0) $global:currentY $c 0.15 0.18 0.22
    $global:currentY -= 10.0
}
$global:currentY -= 2.0

# --- KEY ACHIEVEMENTS ---
Add-SectionHeader "KEY ACHIEVEMENTS"
$achieve = @(
    "Social Media Manager, GDG On Campus Vadodara",
    "Certificate of Participation -- `"Innovation-2K25`" National Project Competition, PES College of Engineering (Oct 2025)"
)
foreach ($a in $achieve) {
    Add-Bullet ($leftMargin + 4.0) $global:currentY 0.20 0.35 0.55
    Add-Text "F2" 8.2 ($leftMargin + 12.0) $global:currentY $a 0.15 0.18 0.22
    $global:currentY -= 10.0
}

# Assemble PDF
$contentStream = ($streamLines -join "`n")
$contentBytes = [System.Text.Encoding]::ASCII.GetBytes($contentStream)
$contentLength = $contentBytes.Length

# Build PDF Objects
$objects = [System.Collections.Generic.List[string]]::new()

# Obj 1: Info
$objects.Add("1 0 obj`n<< /Title (Samiha Vahora - Resume)`n   /Author (Samiha Vahora)`n   /Subject (Full Stack Developer Resume)`n   /Creator (Samiha Vahora Portfolio)`n>>`nendobj")

# Obj 2: Catalog
$objects.Add("2 0 obj`n<< /Type /Catalog`n   /Pages 3 0 R`n>>`nendobj")

# Obj 3: Pages
$objects.Add("3 0 obj`n<< /Type /Pages`n   /Kids [4 0 R]`n   /Count 1`n>>`nendobj")

# Obj 4: Page
$annotsStr = ($annots -join " ")
$objects.Add("4 0 obj`n<< /Type /Page`n   /Parent 3 0 R`n   /MediaBox [0 0 595.28 841.89]`n   /Resources <<`n     /Font <<`n       /F1 5 0 R`n       /F2 6 0 R`n       /F3 7 0 R`n     >>`n   >>`n   /Annots [$annotsStr]`n   /Contents 8 0 R`n>>`nendobj")

# Obj 5: Font Helvetica-Bold
$objects.Add("5 0 obj`n<< /Type /Font`n   /Subtype /Type1`n   /BaseFont /Helvetica-Bold`n>>`nendobj")

# Obj 6: Font Helvetica
$objects.Add("6 0 obj`n<< /Type /Font`n   /Subtype /Type1`n   /BaseFont /Helvetica`n>>`nendobj")

# Obj 7: Font Helvetica-Oblique
$objects.Add("7 0 obj`n<< /Type /Font`n   /Subtype /Type1`n   /BaseFont /Helvetica-Oblique`n>>`nendobj")

# Obj 8: Stream
$objects.Add("8 0 obj`n<< /Length $contentLength >>`nstream`n" + $contentStream + "`nendstream`nendobj")

# Calculate offsets
$header = "%PDF-1.4`n"
$pdfBytes = [System.Collections.Generic.List[byte]]::new()
$headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
$pdfBytes.AddRange($headerBytes)

$offsets = [System.Collections.Generic.List[int]]::new()
$offsets.Add(0) # 0 object entry

foreach ($obj in $objects) {
    $offsets.Add($pdfBytes.Count)
    $objBytes = [System.Text.Encoding]::ASCII.GetBytes($obj + "`n")
    $pdfBytes.AddRange($objBytes)
}

$xrefOffset = $pdfBytes.Count
$xref = "xref`n0 $($objects.Count + 1)`n0000000000 65535 f `n"
for ($i = 1; $i -le $objects.Count; $i++) {
    $xref += ("{0:D10} 00000 n `n" -f $offsets[$i])
}
$trailer = "trailer`n<< /Size $($objects.Count + 1)`n   /Root 2 0 R`n   /Info 1 0 R`n>>`nstartxref`n$xrefOffset`n%%EOF`n"

$xrefBytes = [System.Text.Encoding]::ASCII.GetBytes($xref + $trailer)
$pdfBytes.AddRange($xrefBytes)

[System.IO.File]::WriteAllBytes("c:\Users\Lenovo\samiha-portfolio\resume.pdf", $pdfBytes.ToArray())
[System.IO.File]::WriteAllBytes("c:\Users\Lenovo\samiha-portfolio\public\resume.pdf", $pdfBytes.ToArray())

Write-Output "PDF generated successfully. Total size: $($pdfBytes.Count) bytes. Final Y: $global:currentY"

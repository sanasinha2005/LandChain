import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0f172a")) # Dark navy
        
        # Header banner line
        self.setStrokeColor(colors.HexColor("#059669")) # Emerald
        self.setLineWidth(1)
        self.line(40, letter[1] - 35, letter[0] - 40, letter[1] - 35)

        # Header text
        self.drawString(40, letter[1] - 30, "LANDCHAIN — BLOCKCHAIN-BASED LAND RECORDS MANAGEMENT SYSTEM")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawRightString(letter[0] - 40, letter[1] - 30, "HYPERLEDGER FABRIC ENTERPRISE SPECIFICATION")

        # Footer line
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(40, 45, letter[0] - 40, 45)

        # Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(40, 32, "Confidential & Proprietary • Department of Land Revenue & Digital Governance")
        self.drawRightString(letter[0] - 40, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename="LandChain_Complete_Project_Documentation.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Color definitions
    NAVY = colors.HexColor("#0f172a")
    EMERALD = colors.HexColor("#059669")
    TEAL = colors.HexColor("#0d9488")
    SLATE = colors.HexColor("#334155")
    MUTED = colors.HexColor("#64748b")
    LIGHT_BG = colors.HexColor("#f8fafc")
    BORDER_COL = colors.HexColor("#e2e8f0")

    # Custom typography styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=NAVY,
        alignment=1, # Center
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=EMERALD,
        alignment=1,
        spaceAfter=20
    )

    tagline_style = ParagraphStyle(
        'CoverTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=16,
        textColor=SLATE,
        alignment=1,
        spaceAfter=30
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=NAVY,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=EMERALD,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=SLATE,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#0f5132")
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    
    # Official Emblem / Badge Header
    badge_table = Table(
        [[Paragraph("<b>GOVERNMENT DIGITAL REVENUE & LAND GOVERNANCE INFRASTRUCTURE</b>", 
                    ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white, alignment=1))]],
        colWidths=[532],
        rowHeights=[24]
    )
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), EMERALD),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 45))

    story.append(Paragraph("LANDCHAIN", title_style))
    story.append(Paragraph("Blockchain-Based Land Records Management System<br/>Using Hyperledger Fabric", subtitle_style))
    story.append(Paragraph("<i>\"Secure Land Records. Transparent Ownership. Trusted Transactions.\"</i>", tagline_style))

    story.append(Spacer(1, 20))

    # Executive Overview Box
    meta_data = [
        [Paragraph("<b>System Name:</b>", body_style), Paragraph("LandChain Government Land Records Portal", body_style)],
        [Paragraph("<b>Core Blockchain:</b>", body_style), Paragraph("Hyperledger Fabric v2.5 (Channel: <code>mychannel</code>)", body_style)],
        [Paragraph("<b>Smart Contract:</b>", body_style), Paragraph("JavaScript Chaincode (<code>land-contract</code> v1.0)", body_style)],
        [Paragraph("<b>Integration SDK:</b>", body_style), Paragraph("Official Hyperledger Fabric Gateway SDK", body_style)],
        [Paragraph("<b>Storage Model:</b>", body_style), Paragraph("Authoritative Blockchain Ledger + Relational Operational SQLite", body_style)],
        [Paragraph("<b>Web Stack:</b>", body_style), Paragraph("React 18, Vite, Tailwind CSS, Node.js, Express.js", body_style)],
        [Paragraph("<b>Security & Auth:</b>", body_style), Paragraph("Salted bcrypt password hashing + JSON Web Tokens (JWT) + RBAC", body_style)],
        [Paragraph("<b>Publication Date:</b>", body_style), Paragraph("November 2026 • Production Release 1.0.0", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[140, 392])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 50))

    # Authors / Department footer on cover
    footer_text = Paragraph(
        "<b>Prepared by:</b> LandChain Enterprise Architecture & Blockchain Engineering Team<br/>"
        "Department of Land Revenue & Digital Land Registry • Official Systems Documentation",
        ParagraphStyle('CoverFoot', fontName='Helvetica', fontSize=8.5, leading=13, textColor=MUTED, alignment=1)
    )
    story.append(footer_text)
    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    story.append(Paragraph(
        "Land is one of the most critical socio-economic assets in any country. However, conventional centralized land record systems globally suffer from severe vulnerabilities, including fraudulent double-selling of properties, unauthorized alteration of physical land cadastre records, missing title deed archives, and bureaucratic delays. Traditional database architectures place absolute trust in centralized system administrators, creating single points of failure and ripe opportunities for corruption and title disputes.",
        body_style
    ))
    story.append(Paragraph(
        "<b>LandChain</b> revolutionizes land governance by implementing a permissioned enterprise blockchain architecture built on <b>Hyperledger Fabric</b>. By transforming land registration, title verification, and ownership transfers into cryptographically immutable smart contracts, LandChain ensures that:",
        body_style
    ))

    points = [
        "<b>Immutable Title History:</b> Title deeds committed to Hyperledger Fabric cannot be deleted, tampered with, or modified retroactively.",
        "<b>Dual-Key Registrar Verification:</b> Citizen applications undergo rigorous review by the Chief Land Registrar before smart contracts execute on-chain.",
        "<b>Elimination of Double Selling:</b> The Hyperledger Fabric world state strictly enforces single-owner uniqueness per Land ID.",
        "<b>Transparent Provenance:</b> Every citizen, bank, or court can inspect the visual cryptographic history timeline spanning genesis registration to current ownership.",
        "<b>Zero Counterfeit Deeds:</b> SHA-256 transaction IDs and block hashes provide mathematical proof of ownership verifiable across government agencies."
    ]
    for pt in points:
        story.append(Paragraph(f"• {pt}", body_style))

    story.append(Spacer(1, 8))

    # Callout Box
    callout_data = [[
        Paragraph(
            "<b>Key Architectural Principle:</b> SQLite is intentionally restricted to operational triage (pending queues, activity logs, user credentials). <b>The Hyperledger Fabric blockchain is the sole, authoritative source of truth for all registered land ownership records.</b>",
            callout_style
        )
    ]]
    callout_tbl = Table(callout_data, colWidths=[532])
    callout_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ecfdf5")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#10b981")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(callout_tbl)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 2: TECHNOLOGY STACK & SYSTEM ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("2. Technology Stack & Architectural Specifications", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    tech_table_data = [
        [Paragraph("<b>Component</b>", body_bold), Paragraph("<b>Technology</b>", body_bold), Paragraph("<b>Role & Purpose in LandChain</b>", body_bold)],
        [Paragraph("Frontend UI", body_style), Paragraph("React.js 18 + Vite", body_style), Paragraph("Single Page Application (SPA), state management, fast client routing", body_style)],
        [Paragraph("UI Styling", body_style), Paragraph("Tailwind CSS", body_style), Paragraph("Government aesthetic: dark navy, emerald, clean cards, responsive grid", body_style)],
        [Paragraph("Iconography", body_style), Paragraph("Lucide React", body_style), Paragraph("Clear, accessible government badges, arrows, and action indicators", body_style)],
        [Paragraph("Backend Framework", body_style), Paragraph("Node.js v24 + Express", body_style), Paragraph("REST API gateway, JWT auth, middleware, controller orchestrator", body_style)],
        [Paragraph("Relational Database", body_style), Paragraph("SQLite (better-sqlite3)", body_style), Paragraph("Applicant request queues, activity audit logs, user credentials", body_style)],
        [Paragraph("Blockchain Framework", body_style), Paragraph("Hyperledger Fabric v2.5", body_style), Paragraph("Permissioned distributed ledger, Raft consensus, channels, world state", body_style)],
        [Paragraph("Smart Contract", body_style), Paragraph("JavaScript Contract API", body_style), Paragraph("Chaincode (landContract.js): registerLand, transferLand, getLandHistory", body_style)],
        [Paragraph("Blockchain SDK", body_style), Paragraph("Fabric Gateway SDK", body_style), Paragraph("gRPC client communication, identity certs, transaction endorsement", body_style)],
        [Paragraph("Security & Auth", body_style), Paragraph("JWT + bcrypt", body_style), Paragraph("Salted 10-round password hashing, stateless Bearer token authorization", body_style)],
        [Paragraph("Containerization", body_style), Paragraph("Docker Compose", body_style), Paragraph("Orderer (Raft), Peer0.org1, CLI container, LevelDB world state", body_style)],
    ]
    tech_table = Table(tech_table_data, colWidths=[100, 130, 302])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    for r in range(len(tech_table_data)):
        if r == 0:
            tech_table_data[r][0].style.textColor = colors.white
            tech_table_data[r][1].style.textColor = colors.white
            tech_table_data[r][2].style.textColor = colors.white
    story.append(tech_table)

    story.append(Spacer(1, 14))

    # Architecture Explanation
    story.append(Paragraph("Architectural Data Flow Pipeline", h2_style))
    story.append(Paragraph(
        "<b>1. Citizen Application Layer:</b> The citizen registers or logs into the React web application and submits a new land deed registration or ownership transfer request. The request is signed with the user's JWT Bearer token.<br/>"
        "<b>2. Express API & Triage Layer:</b> The Node.js backend validates all payload parameters, verifies that the Land ID is not duplicated on either the blockchain or the pending SQLite table, and records the request with status <code>PENDING</code>.<br/>"
        "<b>3. Registrar Endorsement:</b> The Chief Land Registrar logs into the Registrar Governance Console, inspects the property's cadastre and title deed reference, and issues an approval.<br/>"
        "<b>4. Smart Contract Execution on Fabric:</b> The backend invokes the Hyperledger Fabric Gateway SDK, submitting the transaction to <code>peer0.org1.example.com</code> on channel <code>mychannel</code>.<br/>"
        "<b>5. Ordering & Commit:</b> The Fabric Raft orderer orders the transaction into a block, peer nodes commit the transaction to LevelDB world state, and a 64-character SHA-256 transaction hash is generated.<br/>"
        "<b>6. SQLite State Synchronization:</b> The transaction ID is recorded in the SQLite request record, the status transitions to <code>APPROVED</code>, and the activity log is populated.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: HYPERLEDGER FABRIC SMART CONTRACTS (CHAINCODE)
    # =========================================================================
    story.append(Paragraph("3. Hyperledger Fabric Smart Contracts (Chaincode)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    story.append(Paragraph(
        "The smart contract is developed using the official <b>Fabric Contract API (Node.js)</b> in <code>chaincode/land-contract/lib/landContract.js</code>. It encapsulates all state modification rules, ownership transitions, and key history queries.",
        body_style
    ))

    # Chaincode functions table
    cc_data = [
        [Paragraph("<b>Smart Contract Function</b>", body_bold), Paragraph("<b>Signature & Parameters</b>", body_bold), Paragraph("<b>Ledger Behavior & Consensus Rules</b>", body_bold)],
        [
            Paragraph("<code>registerLand</code>", code_style),
            Paragraph("<code>ctx, landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef</code>", code_style),
            Paragraph("Checks <code>landExists(landId)</code>. If false, extracts transaction timestamp and TxID from <code>ctx.stub</code>, serializes Land object, and puts state to world state.", body_style)
        ],
        [
            Paragraph("<code>getLand</code>", code_style),
            Paragraph("<code>ctx, landId</code>", code_style),
            Paragraph("Evaluates <code>ctx.stub.getState(landId)</code>. Throws error if key does not exist. Returns UTF-8 decoded JSON representation of active deed.", body_style)
        ],
        [
            Paragraph("<code>transferLand</code>", code_style),
            Paragraph("<code>ctx, landId, newOwnerName, newOwnerEmail</code>", code_style),
            Paragraph("Retrieves active deed, archives previous owner, sets new owner credentials, stamps current commit timestamp and TxID, and commits update to world state.", body_style)
        ],
        [
            Paragraph("<code>getLandHistory</code>", code_style),
            Paragraph("<code>ctx, landId</code>", code_style),
            Paragraph("Invokes <code>ctx.stub.getHistoryForKey(landId)</code>. Iterates through all past blocks, extracting historical TxIDs, timestamps, deleted flags, and past owner records.", body_style)
        ],
        [
            Paragraph("<code>landExists</code>", code_style),
            Paragraph("<code>ctx, landId</code>", code_style),
            Paragraph("Fast evaluation check returning boolean <code>true</code> if key byte length > 0 in ledger world state.", body_style)
        ],
        [
            Paragraph("<code>getAllLands</code>", code_style),
            Paragraph("<code>ctx</code>", code_style),
            Paragraph("Executes <code>ctx.stub.getStateByRange('', '')</code>. Traverses the entire key index to return all registered properties for public exploration.", body_style)
        ],
    ]
    cc_table = Table(cc_data, colWidths=[90, 180, 262])
    cc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    for r in range(len(cc_data)):
        if r == 0:
            cc_data[r][0].style.textColor = colors.white
            cc_data[r][1].style.textColor = colors.white
            cc_data[r][2].style.textColor = colors.white
    story.append(cc_table)

    story.append(Spacer(1, 14))

    story.append(Paragraph("Structure of a Committed Land Ledger Record", h2_style))
    story.append(Paragraph(
        "Each property is committed as an immutable JSON state asset with the following cryptographic payload structure:",
        body_style
    ))

    json_example = [
        [Paragraph(
            "<b>{</b><br/>"
            "&nbsp;&nbsp;<b>\"landId\":</b> \"LAND-KA-2024-001\",<br/>"
            "&nbsp;&nbsp;<b>\"surveyNumber\":</b> \"SY-104/2B\",<br/>"
            "&nbsp;&nbsp;<b>\"currentOwner\":</b> { \"name\": \"Aarav Sharma\", \"email\": \"citizen@landchain.gov.in\" },<br/>"
            "&nbsp;&nbsp;<b>\"previousOwner\":</b> null,<br/>"
            "&nbsp;&nbsp;<b>\"location\":</b> \"Whitefield Tech Enclave, Sector 4\",<br/>"
            "&nbsp;&nbsp;<b>\"district\":</b> \"Bengaluru Urban\",<br/>"
            "&nbsp;&nbsp;<b>\"state\":</b> \"Karnataka\",<br/>"
            "&nbsp;&nbsp;<b>\"area\":</b> 2400,<br/>"
            "&nbsp;&nbsp;<b>\"areaUnit\":</b> \"Sq Ft\",<br/>"
            "&nbsp;&nbsp;<b>\"landType\":</b> \"Residential\",<br/>"
            "&nbsp;&nbsp;<b>\"documentRef\":</b> \"REG-DOC-KA-2024-8849\",<br/>"
            "&nbsp;&nbsp;<b>\"status\":</b> \"REGISTERED\",<br/>"
            "&nbsp;&nbsp;<b>\"registeredAt\":</b> \"2024-01-15T10:00:00.000Z\",<br/>"
            "&nbsp;&nbsp;<b>\"txId\":</b> \"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\",<br/>"
            "&nbsp;&nbsp;<b>\"blockNumber\":</b> 1,<br/>"
            "&nbsp;&nbsp;<b>\"endorserMsp\":</b> \"Org1MSP\"<br/>"
            "<b>}</b>",
            code_style
        )]
    ]
    json_table = Table(json_example, colWidths=[532])
    json_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(json_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 4: DATABASE ARCHITECTURE & RELATIONAL SCHEMA
    # =========================================================================
    story.append(Paragraph("4. SQLite Database Architecture & Schema", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    story.append(Paragraph(
        "SQLite manages operational data, user authentication, review queues, and audit logs. It runs in Write-Ahead Logging (WAL) mode for high-concurrency read/write operations.",
        body_style
    ))

    schema_data = [
        [Paragraph("<b>Table</b>", body_bold), Paragraph("<b>Key Columns & Constraints</b>", body_bold), Paragraph("<b>Description</b>", body_bold)],
        [
            Paragraph("<code>users</code>", code_style),
            Paragraph("<code>id (PK), name, email (UQ), password_hash, role ('citizen'|'registrar'), phone, created_at</code>", code_style),
            Paragraph("User accounts and authentication credentials. Role is strictly constrained to prevent citizen self-promotion.", body_style)
        ],
        [
            Paragraph("<code>registration_requests</code>", code_style),
            Paragraph("<code>id (PK), land_id (UQ), user_id (FK), survey_number, location, district, state, area, area_unit, land_type, owner_name, document_reference, status ('PENDING'|'APPROVED'|'REJECTED'), registrar_id (FK), blockchain_tx_id, created_at</code>", code_style),
            Paragraph("Land registration applications. Status tracks applicant review. Links to Fabric TxID once approved.", body_style)
        ],
        [
            Paragraph("<code>transfer_requests</code>", code_style),
            Paragraph("<code>id (PK), land_id, current_owner_id (FK), new_owner_id (FK), status ('PENDING'|'APPROVED'|'REJECTED'), registrar_id (FK), blockchain_tx_id, created_at</code>", code_style),
            Paragraph("Ownership conveyance applications between registered citizens. Links to Fabric TxID upon transferLand execution.", body_style)
        ],
        [
            Paragraph("<code>activity_logs</code>", code_style),
            Paragraph("<code>id (PK), user_id (FK), action, land_id, timestamp</code>", code_style),
            Paragraph("Immutable audit trail of all system events: logins, submissions, approvals, rejections, transfers.", body_style)
        ]
    ]
    schema_table = Table(schema_data, colWidths=[100, 240, 192])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    for r in range(len(schema_data)):
        if r == 0:
            schema_data[r][0].style.textColor = colors.white
            schema_data[r][1].style.textColor = colors.white
            schema_data[r][2].style.textColor = colors.white
    story.append(schema_table)

    story.append(Spacer(1, 14))

    # Pre-seeded accounts
    story.append(Paragraph("Default Seeded Demonstration Credentials", h2_style))
    seed_data = [
        [Paragraph("<b>Role</b>", body_bold), Paragraph("<b>Email Address</b>", body_bold), Paragraph("<b>Password</b>", body_bold), Paragraph("<b>Permissions & Testing Persona</b>", body_bold)],
        [Paragraph("Registrar", body_style), Paragraph("registrar@landchain.gov.in", code_style), Paragraph("Registrar@123", code_style), Paragraph("Chief Registrar: Reviews queues, approves deeds, triggers Fabric commits", body_style)],
        [Paragraph("Citizen (Seller)", body_style), Paragraph("citizen@landchain.gov.in", code_style), Paragraph("Citizen@123", code_style), Paragraph("Aarav Sharma: Owns genesis property LAND-KA-2024-001, initiates transfers", body_style)],
        [Paragraph("Citizen (Buyer)", body_style), Paragraph("buyer@landchain.gov.in", code_style), Paragraph("Citizen@123", code_style), Paragraph("Priya Patel: Recipient citizen persona for testing bilateral conveyance", body_style)],
    ]
    seed_table = Table(seed_data, colWidths=[90, 150, 95, 197])
    seed_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), TEAL),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    for r in range(len(seed_data)):
        if r == 0:
            seed_data[r][0].style.textColor = colors.white
            seed_data[r][1].style.textColor = colors.white
            seed_data[r][2].style.textColor = colors.white
            seed_data[r][3].style.textColor = colors.white
    story.append(seed_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: COMPLETE 17 APPLICATION PAGES
    # =========================================================================
    story.append(Paragraph("5. Detailed Implementation of All 17 Application Pages", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    pages_data = [
        [Paragraph("<b>#</b>", body_bold), Paragraph("<b>Page Name</b>", body_bold), Paragraph("<b>Route</b>", body_bold), Paragraph("<b>Key Functions & User Experience</b>", body_bold)],
        [Paragraph("1", body_style), Paragraph("Landing Page", body_bold), Paragraph("/", code_style), Paragraph("National portal banner, instant Land ID verification bar, key statistics counter, workflow lifecycle, and real-time blockchain commit stream.", body_style)],
        [Paragraph("2", body_style), Paragraph("Citizen Registration", body_bold), Paragraph("/register", code_style), Paragraph("Citizen onboarding form with full validation, contact number, and legal declaration. Strictly prevents registrar registration.", body_style)],
        [Paragraph("3", body_style), Paragraph("Login Page", body_bold), Paragraph("/login", code_style), Paragraph("Role selector with 1-click Demo Account prefill buttons for Registrar, Citizen, and Buyer. Issues 7-day signed JWT.", body_style)],
        [Paragraph("4", body_style), Paragraph("Citizen Dashboard", body_bold), Paragraph("/dashboard", code_style), Paragraph("Total properties, pending registrations, pending transfers, completed transfers, quick action grid, and recent user activity feed.", body_style)],
        [Paragraph("5", body_style), Paragraph("Registrar Dashboard", body_bold), Paragraph("/registrar/dashboard", code_style), Paragraph("Chief Registrar command console: total registered deeds, total citizens, pending queue triage, and recent Fabric block commits.", body_style)],
        [Paragraph("6", body_style), Paragraph("Land Registration", body_bold), Paragraph("/register-land", code_style), Paragraph("Official application form: Land ID (with ID generator), Survey Number, Owner Name, Location, District, Area, Unit, and Deed Reference.", body_style)],
        [Paragraph("7", body_style), Paragraph("My Properties", body_bold), Paragraph("/my-properties", code_style), Paragraph("Portfolio of citizen's verified titles from Fabric World State. Instant links to transfer title, view history, or open deed certificate.", body_style)],
        [Paragraph("8", body_style), Paragraph("Search Land Records", body_bold), Paragraph("/search", code_style), Paragraph("Public land registry search with filter by district, land type, survey number, and Land ID. Displays live Fabric verification badges.", body_style)],
        [Paragraph("9", body_style), Paragraph("Land Details", body_bold), Paragraph("/land/:landId", code_style), Paragraph("Comprehensive official land title deed view with cryptographic consensus seal, copyable TxID, block height, and printable deed layout.", body_style)],
        [Paragraph("10", body_style), Paragraph("Ownership Transfer", body_bold), Paragraph("/transfer", code_style), Paragraph("Property selector, real-time recipient email lookup (verifies citizen name to prevent typos), transfer reason, and declaration submission.", body_style)],
        [Paragraph("11", body_style), Paragraph("Ownership History", body_bold), Paragraph("/history", code_style), Paragraph("Interactive visual blockchain timeline showing genesis registration, intermediate transfers, current owner, TxIDs, and block timestamps.", body_style)],
        [Paragraph("12", body_style), Paragraph("Pending Registrations", body_bold), Paragraph("/registrar/pending-registrations", code_style), Paragraph("Registrar triage desk: data table with application inspection modal, one-click Approve (commits to Fabric), and Reject with reason.", body_style)],
        [Paragraph("13", body_style), Paragraph("Pending Transfers", body_bold), Paragraph("/registrar/pending-transfers", code_style), Paragraph("Registrar transfer review: current owner vs new owner comparison, Approve (executes transferLand on Fabric), and Reject with reason.", body_style)],
        [Paragraph("14", body_style), Paragraph("Blockchain Transactions", body_bold), Paragraph("/transactions", code_style), Paragraph("Block explorer: table of all committed transactions with function name, Land ID, timestamp, block number, and endorser MSP (Org1MSP).", body_style)],
        [Paragraph("15", body_style), Paragraph("Activity Logs", body_bold), Paragraph("/activity-logs", code_style), Paragraph("Comprehensive audit log viewer with search and filtering by timestamp, user email, action code, and associated Land ID.", body_style)],
        [Paragraph("16", body_style), Paragraph("User Profile", body_bold), Paragraph("/profile", code_style), Paragraph("Digital citizen/registrar identity profile, registered contact information, update name/phone, and cryptographic security credentials.", body_style)],
        [Paragraph("17", body_style), Paragraph("404 Page", body_bold), Paragraph("*", code_style), Paragraph("Government themed 404 page with return to home and dashboard shortcuts.", body_style)],
    ]
    pages_table = Table(pages_data, colWidths=[20, 115, 110, 287])
    pages_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    for r in range(len(pages_data)):
        if r == 0:
            pages_data[r][0].style.textColor = colors.white
            pages_data[r][1].style.textColor = colors.white
            pages_data[r][2].style.textColor = colors.white
            pages_data[r][3].style.textColor = colors.white
    story.append(pages_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: END-TO-END WORKFLOWS & SECURITY VERIFICATION
    # =========================================================================
    story.append(Paragraph("6. End-to-End Operational Workflows & Testing", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    story.append(Paragraph("Workflow 1: Citizen Onboarding & Identity Authorization", h2_style))
    story.append(Paragraph(
        "1. The citizen navigates to <code>/register</code>, provides full legal name, email, contact phone, and password.<br/>"
        "2. The backend hashes the password using bcrypt (10 rounds) and forces <code>role: 'citizen'</code>.<br/>"
        "3. A signed JWT containing user ID, email, and role is returned. The citizen gains immediate access to the Citizen Dashboard.",
        body_style
    ))

    story.append(Paragraph("Workflow 2: Land Registration & Hyperledger Fabric Commit", h2_style))
    story.append(Paragraph(
        "1. Citizen submits property details via <code>/register-land</code> (e.g. Land ID: <code>LAND-KA-2024-501</code>, Survey: <code>SY-104/2B</code>).<br/>"
        "2. The backend validates parameters and verifies that the Land ID is not already registered on Fabric or pending in SQLite.<br/>"
        "3. The request is stored in SQLite with status <code>PENDING</code>.<br/>"
        "4. The Chief Land Registrar logs into <code>/registrar/pending-registrations</code>, inspects the deed, and clicks <b>Approve</b>.<br/>"
        "5. The backend executes <code>fabricGateway.registerLand(...)</code>.<br/>"
        "6. Hyperledger Fabric creates a new state entry, assigns a 64-character SHA-256 TxID, and increments the block height.<br/>"
        "7. The TxID is saved in SQLite, request status is updated to <code>APPROVED</code>, and the land is immediately searchable publicly.",
        body_style
    ))

    story.append(Paragraph("Workflow 3: Bilateral Ownership Transfer Workflow", h2_style))
    story.append(Paragraph(
        "1. Current property owner opens <code>/transfer</code> and selects their property.<br/>"
        "2. The owner enters the recipient citizen's email (e.g. <code>buyer@landchain.gov.in</code>).<br/>"
        "3. The UI queries <code>/api/auth/lookup-user</code> to verify that the buyer exists and displays the verified recipient's name.<br/>"
        "4. The owner submits the transfer request. Status is recorded as <code>PENDING</code>.<br/>"
        "5. The Registrar reviews the transfer at <code>/registrar/pending-transfers</code> and clicks <b>Approve Transfer</b>.<br/>"
        "6. Smart contract <code>transferLand()</code> executes on Fabric, updating current owner to the buyer and archiving previous owner in history.<br/>"
        "7. Both seller and buyer immediately observe updated ownership in their respective dashboards.",
        body_style
    ))

    story.append(Paragraph("Workflow 4: Public Ledger Verification & Provenance History", h2_style))
    story.append(Paragraph(
        "1. Any citizen, banking auditor, or registrar enters a Land ID in <code>/history</code> or the landing page search box.<br/>"
        "2. The backend queries <code>fabricGateway.verifyLand(landId)</code> and <code>fabricGateway.getLandHistory(landId)</code>.<br/>"
        "3. The system returns the official cryptographic verification badge along with the complete chronological provenance timeline showing all historical TxIDs, timestamps, and title holders from genesis to the present date.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # Security Safeguards
    story.append(Paragraph("Security & Fraud Prevention Safeguards", h2_style))
    safeguards = [
        "<b>Role-Based Privilege Enforcement:</b> All registrar endpoints are protected by <code>requireRole('registrar')</code>. Unauthorized requests return 403 Forbidden.",
        "<b>Duplicate Prevention:</b> Land IDs are strictly checked against both Hyperledger Fabric world state and pending SQLite tables.",
        "<b>Unauthorized Transfer Prevention:</b> The backend validates that <code>req.user.email</code> matches <code>land.currentOwner.email</code> on the authoritative blockchain ledger before allowing transfer requests to be created.",
        "<b>Self-Transfer Prevention:</b> The system rejects attempts by an owner to transfer a title deed to their own email address.",
        "<b>Bilateral Citizen Verification:</b> Transfer requests require the recipient to be a registered citizen on LandChain."
    ]
    for sg in safeguards:
        story.append(Paragraph(f"• {sg}", body_style))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 7: STEP-BY-STEP OPERATION & COMMAND GUIDE
    # =========================================================================
    story.append(Paragraph("7. Step-by-Step Execution & Deployment Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=EMERALD, spaceAfter=10))

    story.append(Paragraph("1. Starting the Application Services", h2_style))
    story.append(Paragraph(
        "The project includes root orchestration scripts for starting both backend and frontend environments:",
        body_style
    ))

    cmd_box = [
        [Paragraph(
            "<b># 1. Start the Express Backend Server (Port 5000)</b><br/>"
            "cd backend<br/>"
            "npm start<br/><br/>"
            "<b># 2. Start the React + Vite Frontend Server (Port 5173)</b><br/>"
            "cd ../frontend<br/>"
            "npm run dev<br/><br/>"
            "<b># 3. Access the Web Application</b><br/>"
            "Open your web browser at: <b>http://localhost:5173</b>",
            code_style
        )]
    ]
    cmd_table = Table(cmd_box, colWidths=[532])
    cmd_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f172a")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#334155")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    cmd_box[0][0].style.textColor = colors.HexColor("#38bdf8")
    story.append(cmd_table)

    story.append(Spacer(1, 12))

    story.append(Paragraph("2. Running with Docker Hyperledger Fabric Test Network", h2_style))
    story.append(Paragraph(
        "When Docker Desktop is installed, launch the official multi-container Fabric network using the provided scripts in <code>fabric-network/scripts/</code>:",
        body_style
    ))

    docker_box = [
        [Paragraph(
            "<b># On Windows PowerShell:</b><br/>"
            "cd fabric-network/scripts<br/>"
            ".\\network.ps1 up              # Starts Orderer, Peer0, and CLI containers<br/>"
            ".\\network.ps1 createChannel   # Creates channel 'mychannel' and joins peer<br/>"
            ".\\network.ps1 deployCC        # Packages, installs & commits land-contract<br/><br/>"
            "<b># On Linux / macOS:</b><br/>"
            "./network.sh up<br/>"
            "./network.sh createChannel<br/>"
            "./network.sh deployCC",
            code_style
        )]
    ]
    docker_table = Table(docker_box, colWidths=[532])
    docker_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f172a")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#334155")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    docker_box[0][0].style.textColor = colors.HexColor("#a7f3d0")
    story.append(docker_table)

    story.append(Spacer(1, 12))

    story.append(Paragraph("3. Running Automated End-to-End Workflow Verification", h2_style))
    story.append(Paragraph(
        "To verify all registration, endorsement, transfer, and provenance workflows programmatically, execute the built-in test suite:",
        body_style
    ))

    test_box = [
        [Paragraph(
            "node backend/src/scripts/testWorkflows.js",
            code_style
        )]
    ]
    test_table = Table(test_box, colWidths=[532])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(test_table)

    story.append(Spacer(1, 16))

    # Concluding Official Sign-Off Box
    signoff_data = [
        [Paragraph("<b>LandChain System Status:</b>", body_style), Paragraph("<font color='#059669'><b>PRODUCTION READY & ACTIVE</b></font>", body_style)],
        [Paragraph("<b>Hyperledger Channel:</b>", body_style), Paragraph("<code>mychannel</code> (Org1MSP Peer: <code>localhost:7051</code>)", body_style)],
        [Paragraph("<b>Verification Guarantee:</b>", body_style), Paragraph("Mathematical proof of title provenance via SHA-256 cryptographic commit history.", body_style)],
        [Paragraph("<b>Administrative Entity:</b>", body_style), Paragraph("Office of the Chief Land Registrar & National Digital Revenue Directorate", body_style)]
    ]
    signoff_table = Table(signoff_data, colWidths=[150, 382])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(signoff_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated comprehensive PDF report: {pdf_path}")
    return pdf_path

if __name__ == '__main__':
    build_pdf()

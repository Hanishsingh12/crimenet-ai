import os
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.config import settings

class ReportService:
    @staticmethod
    def generate_case_pdf(
        case_id: str,
        case_info: Dict[str, Any],
        entities: List[Dict[str, Any]],
        centrality_list: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]],
        analyst_notes: str = ""
    ) -> str:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        pdf_filename = f"CRIMENET_REPORT_{case_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_path = os.path.join(settings.UPLOAD_DIR, pdf_filename)

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        # Custom palette styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0c4a6e')
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569')
        )
        h2_style = ParagraphStyle(
            'H2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#b91c1c')
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("CRIMENET AI", title_style))
        story.append(Paragraph("AI-Powered Criminal Network Analysis & Investigation Intelligence Platform", subtitle_style))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284c7'), spaceAfter=12))

        # 2. Case Metadata Table
        case_data = [
            [Paragraph("<b>Case ID:</b>", body_style), Paragraph(case_id, body_style),
             Paragraph("<b>Date Generated:</b>", body_style), Paragraph(datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"), body_style)],
            [Paragraph("<b>Case Title:</b>", body_style), Paragraph(case_info.get("title", "Operation Hawkeye"), body_style),
             Paragraph("<b>Classification:</b>", body_style), Paragraph("SYNTHETIC DEMO DATA", body_style)],
            [Paragraph("<b>Status:</b>", body_style), Paragraph(case_info.get("status", "ACTIVE"), body_style),
             Paragraph("<b>Priority:</b>", body_style), Paragraph(case_info.get("priority", "HIGH"), body_style)]
        ]
        t_case = Table(case_data, colWidths=[80, 180, 90, 190])
        t_case.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t_case)
        story.append(Spacer(1, 14))

        # 3. Network & Centrality Analytics
        story.append(Paragraph("1. Network Topology & High-Centrality Entities", h2_style))
        cent_data = [["Entity ID", "Identified Name", "Role/Type", "Degree", "Betweenness", "Analytical Designation"]]
        for c in centrality_list[:6]:
            cent_data.append([
                c.get("entity_id", ""),
                c.get("name", "")[:20],
                c.get("type", ""),
                str(c.get("degree", 0)),
                f"{c.get('betweenness', 0.0):.3f}",
                c.get("analytical_label", "")[:28]
            ])
        t_cent = Table(cent_data, colWidths=[65, 120, 65, 45, 65, 180])
        t_cent.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ]))
        story.append(t_cent)
        story.append(Spacer(1, 12))

        # 4. Detected Anomalies
        story.append(Paragraph("2. Analytical Anomalies Requiring Investigator Review", h2_style))
        if anomalies:
            for a in anomalies[:4]:
                reasons_str = "; ".join(a.get("reasons", [])[:2])
                evidence_str = ", ".join(a.get("evidence", [])[:3])
                story.append(Paragraph(
                    f"• <b>[{a.get('severity', 'MED')}] {a.get('title', 'Anomaly')}</b> — Entity: {a.get('entity_id')} ({a.get('entity_name')})<br/>"
                    f"&nbsp;&nbsp;<i>Score:</i> {a.get('score')} | <i>Evidence:</i> {evidence_str}<br/>"
                    f"&nbsp;&nbsp;<i>Analytical Explanation:</i> {reasons_str}",
                    body_style
                ))
                story.append(Spacer(1, 4))
        else:
            story.append(Paragraph("No anomalous patterns flagged above baseline threshold.", body_style))
        story.append(Spacer(1, 10))

        # 5. Analyst Notes
        if analyst_notes:
            story.append(Paragraph("3. Analyst Field Notes", h2_style))
            story.append(Paragraph(analyst_notes, body_style))
            story.append(Spacer(1, 10))

        # 6. Legal Disclaimer & Evidence Integrity
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#ef4444'), spaceAfter=8))
        story.append(Paragraph(
            "<b>STATUTORY DISCLAIMER & ANALYTICAL NOTICE:</b><br/>"
            "This report is generated strictly as an investigative decision-support tool. "
            "All findings, graph connections, centrality scores, and anomaly indicators represent analytical leads "
            "derived from algorithmic modeling and synthetic demo records. Under no circumstances should this document "
            "be construed as a legal determination of guilt, criminality, or definitive wrongdoing. Human investigator "
            "verification and corroborating physical evidence are strictly mandatory.",
            disclaimer_style
        ))

        doc.build(story)
        return pdf_path

report_service = ReportService()

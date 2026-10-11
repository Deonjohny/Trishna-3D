from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

W, H = landscape(A4)
INK = HexColor('#10222b')
TEAL = HexColor('#176b63')
PAPER = HexColor('#f6f5f0')
MUTED = HexColor('#5f756e')
WHITE = white

COLORS = {
    'living': '#eee5d5',
    'stair': '#efe3d2',
    'bed': '#eee7dc',
    'dining': '#e5efe8',
    'passage': '#e8e7df',
    'kitchen': '#e2eeec',
    'toilet': '#e3edf0',
    'store': '#f4edda',
    'porch': '#e0eae6',
    'balcony': '#dce8e4',
    'hall': '#e9edea',
}

def header_banner(c, title, subtitle):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, H - 46, W, 46, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(34, H - 22, title)
    c.setFillColor(HexColor('#9ebcb4'))
    c.setFont('Helvetica', 8)
    c.drawString(34, H - 36, subtitle)
    c.setFillColor(HexColor('#a0b8b2'))
    c.setFont('Helvetica', 7.5)
    c.drawRightString(W - 34, H - 28, 'VECTOR ARCHITECTURAL CONCEPT')

def draw_sheet(c, title, subtitle, rooms, notes):
    header_banner(c, title, subtitle)
    ox, oy = 80, 68
    scale = 7.2
    pw = 33 * scale
    ph = 46 * scale

    c.setFillColor(WHITE)
    c.rect(ox, oy, pw, ph, fill=1, stroke=0)

    for name, w, d, color_key, rx, rz, rw, rd in rooms:
        px = ox + rx * scale
        py = oy + rz * scale
        c.setFillColor(HexColor(COLORS[color_key]))
        c.rect(px, py, rw * scale, rd * scale, fill=1, stroke=0)
        c.setStrokeColor(HexColor('#1f3a34'))
        c.setLineWidth(1.1)
        c.rect(px, py, rw * scale, rd * scale, fill=0, stroke=1)

        cx = px + rw * scale / 2
        cy = py + rd * scale / 2

        if color_key == 'stair':
            c.setStrokeColor(HexColor('#c09c5d'))
            c.setLineWidth(0.8)
            for step in range(1, 9):
                sy = py + step * (rd * scale) / 10
                c.line(px + 6, sy, px + rw * scale - 6, sy)
            c.setFillColor(INK)
            c.setFont('Helvetica-Bold', 6.5)
            c.drawCentredString(cx, cy + 8, name.upper())
            c.setFont('Helvetica', 6)
            c.drawCentredString(cx, cy - 2, f'{w} ft x {d} ft')
            c.setFont('Helvetica-Bold', 5.5)
            c.drawCentredString(cx, cy - 10, '↑ UP / DN')
        else:
            c.setFillColor(INK)
            fsize = 6.2 if rw >= 8 else 5.2
            c.setFont('Helvetica-Bold', fsize)
            if '/' in name:
                parts = name.split('/')
                c.drawCentredString(cx, cy + 5, parts[0].strip().upper())
                c.drawCentredString(cx, cy - 4, parts[1].strip().upper())
                c.setFont('Helvetica', 5.5)
                c.drawCentredString(cx, cy - 12, f'{w} ft x {d} ft')
            else:
                c.drawCentredString(cx, cy + 4, name.upper())
                c.setFillColor(HexColor('#485e57'))
                c.setFont('Helvetica', 5.5)
                c.drawCentredString(cx, cy - 5, f'{w} ft x {d} ft')

    # Dimension footer
    c.setFillColor(TEAL)
    c.setFont('Helvetica-Bold', 7)
    c.drawCentredString(ox + pw / 2, oy - 12, 'ROAD / MAIN ENTRY')
    c.setFont('Helvetica', 6.5)
    c.drawCentredString(ox + pw / 2, oy - 22, '33 ft overall width (10.00 M)')

    c.saveState()
    c.translate(ox - 16, oy + ph / 2)
    c.rotate(90)
    c.drawCentredString(0, 0, '46 ft overall depth (14.00 M)')
    c.restoreState()

    # Notes panel
    nx = ox + pw + 28
    ny = oy + ph - 8
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 9.5)
    c.drawString(nx, ny, 'PLAN NOTES')

    c.setFont('Helvetica', 7.2)
    for i, note in enumerate(notes):
        c.setFillColor(TEAL)
        c.circle(nx + 4, ny - 20 - i * 30, 2, fill=1, stroke=0)
        c.setFillColor(HexColor('#2e443f'))
        words = note.split()
        l1, l2 = [], []
        curr = l1
        for word in words:
            if len(' '.join(curr + [word])) > 36 and curr is l1:
                curr = l2
            curr.append(word)
        c.drawString(nx + 10, ny - 22 - i * 30, ' '.join(l1))
        if l2:
            c.drawString(nx + 10, ny - 32 - i * 30, ' '.join(l2))

    c.showPage()

def build_pdf(out_path):
    c = canvas.Canvas(str(out_path), pagesize=landscape(A4))

    # Ground Floor
    g_rooms = [
        ('Car Porch', 16, 16, 'porch', 0, 0, 16.5, 16),
        ('Bedroom 1', 12, 12, 'bed', 16.5, 0, 11.5, 12),
        ('Toilet 1', 5, 8, 'toilet', 28, 0, 5, 12),
        ('Living', 13, 13, 'living', 0, 16, 16.5, 14),
        ('Staircase', 7, 12, 'stair', 16.5, 12, 7, 14),
        ('Bedroom 2', 12, 12, 'bed', 23.5, 12, 4.5, 14),
        ('Toilet 2', 5, 8, 'toilet', 28, 12, 5, 14),
        ('Dining', 13, 11, 'dining', 0, 30, 16.5, 9),
        ('Kitchen', 11, 10, 'kitchen', 0, 39, 11.5, 7),
        ('Store', 7, 5, 'store', 11.5, 39, 5, 7),
        ('Bedroom 3', 12, 12, 'bed', 16.5, 26, 11.5, 20),
        ('Toilet 3', 5, 8, 'toilet', 28, 26, 5, 20),
    ]
    g_notes = [
        'Ground Floor: 1350 sq.ft built-up area.',
        'Car porch 16′-5″ × 16′-5″ with single front entrance.',
        'Living and Dining separate common zones.',
        'Kitchen with attached pantry / store room.',
        '3 Bedrooms with attached toilets on ground floor.',
        'Continuous U-shaped staircase with landing.',
    ]
    draw_sheet(c, 'GROUND FLOOR PLAN', 'Scale 1:100 • 10.00 M (32′-10″) × 14.00 M (45′-11″) • 1350 sq.ft', g_rooms, g_notes)

    # First Floor
    f1_rooms = [
        ('Front Balcony', 13, 6, 'balcony', 0, 0, 16.5, 6),
        ('Bedroom 1', 12, 12, 'bed', 16.5, 0, 11.5, 12),
        ('Toilet 1', 5, 8, 'toilet', 28, 0, 5, 12),
        ('Family Lounge', 13, 13, 'living', 0, 6, 16.5, 20),
        ('Staircase', 7, 12, 'stair', 16.5, 12, 7, 14),
        ('Bedroom 2', 12, 12, 'bed', 23.5, 12, 4.5, 14),
        ('Toilet 2', 5, 8, 'toilet', 28, 12, 5, 14),
        ('Rear Balcony', 11, 5, 'balcony', 0, 39, 16.5, 7),
        ('Bedroom 3', 12, 12, 'bed', 16.5, 26, 11.5, 20),
        ('Toilet 3', 5, 8, 'toilet', 28, 26, 5, 20),
    ]
    f1_notes = [
        'First Floor: 1350 sq.ft residential layout.',
        'Spacious family lounge 13′-1″ × 13′-1″.',
        '3 Bedrooms with attached private bathrooms.',
        'Front cantilevered balcony 13′-1″ × 5′-11″.',
        'Rear terrace balcony 11′-6″ × 4′-11″.',
        'Central staircase connects all three levels.',
    ]
    draw_sheet(c, 'FIRST FLOOR PLAN', 'Scale 1:100 • 10.00 M (32′-10″) × 14.00 M (45′-11″) • 1350 sq.ft', f1_rooms, f1_notes)

    # Third Floor
    f3_rooms = [
        ('Front Balcony', 10, 6, 'balcony', 0, 0, 16.5, 6),
        ('Bedroom 1', 12, 12, 'bed', 16.5, 0, 11.5, 16),
        ('Toilet 1', 5, 8, 'toilet', 28, 0, 5, 16),
        ('Play Area / Multipurpose Hall', 25, 15, 'hall', 0, 6, 16.5, 33),
        ('Staircase', 7, 12, 'stair', 16.5, 16, 7, 14),
        ('Bedroom 2', 12, 12, 'bed', 16.5, 30, 11.5, 16),
        ('Toilet 2', 5, 8, 'toilet', 28, 30, 5, 16),
        ('Rear Balcony', 13, 6, 'balcony', 0, 39, 16.5, 7),
    ]
    f3_notes = [
        'Third Floor: 1350 sq.ft recreation & suites.',
        'Large play area / multipurpose hall 24′-7″ × 14′-9″.',
        '2 Bedrooms with attached toilets.',
        'Front and rear cantilevered outdoor balconies.',
        'Total house built-up area: 4050 sq.ft across 3 floors.',
    ]
    draw_sheet(c, 'THIRD FLOOR PLAN', 'Scale 1:100 • 10.00 M (32′-10″) × 14.00 M (45′-11″) • 1350 sq.ft', f3_rooms, f3_notes)

    c.save()
    print(f'Wrote {out_path} ({out_path.stat().st_size} bytes)')

if __name__ == '__main__':
    targets = [
        Path('c:/Users/HP/Downloads/three_floor_architectural_concept_vector.pdf'),
        Path(__file__).resolve().parents[1] / 'public' / 'three-floor-architectural-concept.pdf',
    ]
    for target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        build_pdf(target)

from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

OUT = Path(__file__).resolve().parents[1] / 'public' / 'three-storey-concept-plan.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
W, H = landscape(A4)

INK = HexColor('#10222b')
TEAL = HexColor('#176b63')
MINT = HexColor('#e3efe8')
PAPER = HexColor('#f6f5f0')
MUTED = HexColor('#5f756e')
BLUE = HexColor('#3989a2')
GOLD = HexColor('#c99554')
WHITE = white

COLORS = {
    'living': '#eee5d5',
    'stair': '#efe3d2',
    'bed': '#eee7dc',
    'dining': '#e5efe8',
    'passage': '#e8e7df',
    'kitchen': '#e2eeec',
    'bath': '#e3edf0',
    'utility': '#e4efed',
    'store': '#f4edda',
    'lounge': '#e6e8df',
}

def header_banner(c, title, subtitle):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, H - 48, W, 48, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(34, H - 24, title)
    c.setFillColor(HexColor('#9ebcb4'))
    c.setFont('Helvetica', 8.5)
    c.drawString(34, H - 38, subtitle)
    c.setFillColor(HexColor('#a0b8b2'))
    c.setFont('Helvetica', 7.5)
    c.drawRightString(W - 34, H - 30, 'CONCEPT PLAN • NOT FOR CONSTRUCTION')

def page_space_plan(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, H - 54, W, 54, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(36, H - 25, 'THREE-STOREY HOUSE • CONCEPT PLAN')
    c.setFillColor(HexColor('#a5c5bc'))
    c.setFont('Helvetica', 8.5)
    c.drawString(36, H - 42, 'Prepared from your uploaded sample plan style • no balconies on any floor')
    c.drawRightString(W - 36, H - 32, 'CONCEPT PLAN • NOT FOR CONSTRUCTION')

    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(42, H - 98, 'Space plan')

    bullets = [
        'Three levels with one continuous staircase core aligned floor-to-floor.',
        'Ground floor is dedicated to shared/common spaces, including kitchen and dining.',
        'First and second floors each provide 5 bedrooms and 4 washrooms.',
        'No balconies or projecting terraces are included on any level.',
        'Concept footprint: approximately 36 ft × 42 ft per floor.',
    ]
    c.setFont('Helvetica', 9.5)
    for i, b in enumerate(bullets):
        c.setFillColor(TEAL)
        c.circle(48, H - 130 - i * 22, 2.5, fill=1, stroke=0)
        c.setFillColor(HexColor('#223330'))
        c.drawString(58, H - 133 - i * 22, b)

    cards = [
        ('GROUND FLOOR', 'Living • Dining • Kitchen • Utility • Guest/Flex • 4 washrooms'),
        ('FIRST FLOOR', '5 bedrooms • 4 washrooms • family lounge • aligned staircase'),
        ('SECOND FLOOR', '5 bedrooms • 4 washrooms • family lounge • aligned staircase'),
    ]
    card_w = (W - 84 - 28) / 3
    card_y = 115
    for i, (ctitle, cdesc) in enumerate(cards):
        cx = 42 + i * (card_w + 14)
        c.setFillColor(WHITE)
        c.roundRect(cx, card_y, card_w, 68, 6, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont('Helvetica-Bold', 8.5)
        c.drawString(cx + 12, card_y + 48, ctitle)
        c.setFillColor(HexColor('#4b5e58'))
        c.setFont('Helvetica', 8)
        words = cdesc.split('•')
        line1 = ' • '.join([w.strip() for w in words[:3]])
        line2 = ' • '.join([w.strip() for w in words[3:]]) if len(words) > 3 else ''
        c.drawString(cx + 12, card_y + 30, line1)
        if line2:
            c.drawString(cx + 12, card_y + 16, line2)

    c.setFillColor(HexColor('#fbf1d8'))
    c.roundRect(42, 38, W - 84, 52, 6, fill=1, stroke=0)
    c.setFillColor(HexColor('#875b1c'))
    c.setFont('Helvetica-Bold', 8.5)
    c.drawString(56, 73, 'IMPORTANT')
    c.setFont('Helvetica', 7.5)
    c.drawString(56, 58, 'This is a structured concept, not a construction-ready architectural drawing. Room sizes, door swings, windows,')
    c.drawString(56, 46, 'ventilation, structure, setbacks, fire egress and local Kerala building rules must be checked by a licensed professional.')
    c.showPage()

def draw_floor(c, level_num, level_title, level_sub, rooms, notes):
    header_banner(c, level_title, level_sub)
    
    # Grid area: 36 ft width x 42 ft depth
    # Draw at scale
    ox, oy = 72, 75
    scale = 8.5
    pw = 36 * scale   # 306 pt
    ph = 42 * scale   # 357 pt

    c.setFillColor(WHITE)
    c.rect(ox, oy, pw, ph, fill=1, stroke=0)

    # Draw rooms
    for name, w, d, color_key, rx, rz, rw, rd in rooms:
        px = ox + rx * scale
        py = oy + rz * scale
        c.setFillColor(HexColor(COLORS[color_key]))
        c.rect(px, py, rw * scale, rd * scale, fill=1, stroke=0)
        c.setStrokeColor(HexColor('#1f3a34'))
        c.setLineWidth(1.2)
        c.rect(px, py, rw * scale, rd * scale, fill=0, stroke=1)

        cx = px + rw * scale / 2
        cy = py + rd * scale / 2

        if color_key == 'stair':
            c.setStrokeColor(HexColor('#c09c5d'))
            c.setLineWidth(0.8)
            for step in range(1, 9):
                sy = py + step * (rd * scale) / 10
                c.line(px + 8, sy, px + rw * scale - 8, sy)
            c.setFillColor(INK)
            c.setFont('Helvetica-Bold', 7)
            c.drawCentredString(cx, cy + 10, name.upper())
            c.setFont('Helvetica', 6.5)
            c.drawCentredString(cx, cy, f'{w} ft x {d} ft')
            c.setFont('Helvetica-Bold', 6)
            c.drawCentredString(cx, cy - 10, '↑ UP')
            c.setFont('Helvetica', 5.5)
            c.drawCentredString(cx, cy - 20, 'CONTINUOUS CORE')
        else:
            c.setFillColor(INK)
            font_size = 6.8 if rw >= 10 else 5.8
            c.setFont('Helvetica-Bold', font_size)
            if '/' in name:
                parts = name.split('/')
                c.drawCentredString(cx, cy + 6, parts[0].strip().upper())
                c.drawCentredString(cx, cy - 4, parts[1].strip().upper())
                c.setFont('Helvetica', 6)
                c.drawCentredString(cx, cy - 14, f'{w} ft x {d} ft')
            else:
                c.drawCentredString(cx, cy + 4, name.upper())
                c.setFillColor(HexColor('#485e57'))
                c.setFont('Helvetica', 6)
                c.drawCentredString(cx, cy - 6, f'{w} ft x {d} ft')

    # Front main entry arrow and dimensions
    c.setFillColor(TEAL)
    c.setFont('Helvetica-Bold', 7)
    c.drawCentredString(ox + pw / 2, oy - 14, 'FRONT / MAIN ENTRY')
    c.setFont('Helvetica', 6.5)
    c.drawCentredString(ox + pw / 2, oy - 23, '36 ft overall width (concept)')

    # Depth dimension label
    c.saveState()
    c.translate(ox - 18, oy + ph / 2)
    c.rotate(90)
    c.drawCentredString(0, 0, '42 ft overall depth')
    c.restoreState()

    # Plan notes on right
    nx = ox + pw + 32
    ny = oy + ph - 10
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(nx, ny, 'PLAN NOTES')

    c.setFont('Helvetica', 7.5)
    for i, note in enumerate(notes):
        c.setFillColor(TEAL)
        c.circle(nx + 4, ny - 24 - i * 34, 2, fill=1, stroke=0)
        c.setFillColor(HexColor('#2e443f'))
        words = note.split()
        l1, l2 = [], []
        curr = l1
        for word in words:
            if len(' '.join(curr + [word])) > 38 and curr is l1:
                curr = l2
            curr.append(word)
        c.drawString(nx + 12, ny - 26 - i * 34, ' '.join(l1))
        if l2:
            c.drawString(nx + 12, ny - 36 - i * 34, ' '.join(l2))

    # Legend at bottom right
    c.setFillColor(INK)
    c.setFont('Helvetica', 6.5)
    c.drawString(nx, oy + 8, '* Bedroom 5 dimensions are illustrative and must be resized in a proper architectural layout.')
    c.drawRightString(W - 36, oy + 8, 'Schematic only • dimensions approximate')

    c.showPage()

def page_ground(c):
    rooms = [
        # Front row (z: 0 to 14)
        ('Living Room', 12, 14, 'living', 0, 0, 14, 14),
        ('Main Staircase', 8, 14, 'stair', 14, 0, 8, 14),
        ('Guest / Flex Room', 12, 14, 'bed', 22, 0, 14, 14),
        # Middle row (z: 14 to 28)
        ('Dining', 12, 14, 'dining', 0, 14, 14, 14),
        ('Lobby / Passage', 8, 14, 'passage', 14, 14, 8, 14),
        ('Kitchen', 12, 14, 'kitchen', 22, 14, 14, 14),
        # Rear row (z: 28 to 42)
        ('Bath 1', 6, 14, 'bath', 0, 28, 7, 14),
        ('Store', 6, 14, 'store', 7, 28, 7, 14),
        ('Utility / Wash', 8, 14, 'utility', 14, 28, 8, 14),
        ('Bath 2', 6, 14, 'bath', 22, 28, 7, 14),
        ('Bath 3 + 4', 6, 14, 'bath', 29, 28, 7, 14),
    ]
    notes = [
        'Ground floor: common living spaces, kitchen, dining, utility, guest/flex room and 4 washrooms.',
        'No balconies or projecting terraces on any level.',
        'Staircase stays in the same central position on all floors.',
        'Bathrooms are grouped toward the rear to simplify plumbing.',
        'Openings, doors, windows and structural columns are schematic only.',
        'A local architect/engineer must verify circulation, ventilation, setbacks, structure and code compliance.',
    ]
    draw_floor(c, 0, 'GROUND FLOOR / LEVEL 00', 'Common-use floor • kitchen and shared spaces • no balcony', rooms, notes)

def page_first(c):
    rooms = [
        # Front row (z: 0 to 14)
        ('Bedroom 1', 12, 14, 'bed', 0, 0, 14, 14),
        ('Stair / Landing', 8, 14, 'stair', 14, 0, 8, 14),
        ('Bedroom 2', 12, 14, 'bed', 22, 0, 14, 14),
        # Middle row (z: 14 to 28)
        ('Bedroom 3', 12, 14, 'bed', 0, 14, 14, 14),
        ('Family Lounge / Passage', 8, 14, 'passage', 14, 14, 8, 14),
        ('Bedroom 4', 12, 14, 'bed', 22, 14, 14, 14),
        # Rear row (z: 28 to 42)
        ('Bath 1', 6, 14, 'bath', 0, 28, 7, 14),
        ('Bedroom 5', 6, 14, 'bed', 7, 28, 7, 14),
        ('Bath 2 + Linen', 8, 14, 'bath', 14, 28, 8, 14),
        ('Bath 3', 6, 14, 'bath', 22, 28, 7, 14),
        ('Bath 4', 6, 14, 'bath', 29, 28, 7, 14),
    ]
    notes = [
        'Upper floor: 5 bedrooms and 4 washrooms. Bedroom 5 is a compact concept space; dimensions need refinement.',
        'No balconies or projecting terraces on any level.',
        'Staircase stays in the same central position on all floors.',
        'Bathrooms are grouped toward the rear to simplify plumbing.',
        'Openings, doors, windows and structural columns are schematic only.',
        'A local architect/engineer must verify circulation, ventilation, setbacks, structure and code compliance.',
    ]
    draw_floor(c, 1, 'FIRST FLOOR / LEVEL 01', 'Residential floor • 5 bedrooms + 4 washrooms • no balcony', rooms, notes)

def page_second(c):
    rooms = [
        # Front row (z: 0 to 14)
        ('Bedroom 1', 12, 14, 'bed', 0, 0, 14, 14),
        ('Stair / Landing', 8, 14, 'stair', 14, 0, 8, 14),
        ('Bedroom 2', 12, 14, 'bed', 22, 0, 14, 14),
        # Middle row (z: 14 to 28)
        ('Bedroom 3', 12, 14, 'bed', 0, 14, 14, 14),
        ('Family Lounge / Passage', 8, 14, 'passage', 14, 14, 8, 14),
        ('Bedroom 4', 12, 14, 'bed', 22, 14, 14, 14),
        # Rear row (z: 28 to 42)
        ('Bath 1', 6, 14, 'bath', 0, 28, 7, 14),
        ('Bedroom 5', 6, 14, 'bed', 7, 28, 7, 14),
        ('Bath 2 + Linen', 8, 14, 'bath', 14, 28, 8, 14),
        ('Bath 3', 6, 14, 'bath', 22, 28, 7, 14),
        ('Bath 4', 6, 14, 'bath', 29, 28, 7, 14),
    ]
    notes = [
        'Upper floor: 5 bedrooms and 4 washrooms. Bedroom 5 is a compact concept space; dimensions need refinement.',
        'No balconies or projecting terraces on any level.',
        'Staircase stays in the same central position on all floors.',
        'Bathrooms are grouped toward the rear to simplify plumbing.',
        'Openings, doors, windows and structural columns are schematic only.',
        'A local architect/engineer must verify circulation, ventilation, setbacks, structure and code compliance.',
    ]
    draw_floor(c, 2, 'SECOND FLOOR / LEVEL 02', 'Residential floor • 5 bedrooms + 4 washrooms • no balcony', rooms, notes)

def page_checklist(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, H - 48, W, 48, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(34, H - 24, 'DESIGN & BUILD CHECKLIST')
    c.setFillColor(HexColor('#9ebcb4'))
    c.setFont('Helvetica', 8.5)
    c.drawString(34, H - 38, 'Use this sheet when refining the concept with an architect')
    c.drawRightString(W - 34, H - 30, 'CONCEPT PLAN • NOT FOR CONSTRUCTION')

    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 13)
    c.drawString(42, H - 85, 'Before turning this concept into a working drawing')

    points = [
        ('01', 'Confirm the plot dimensions, road frontage, setbacks and permissible built-up area.'),
        ('02', 'Decide whether the ground-floor four washrooms should be common, guest, or utility toilets.'),
        ('03', 'Refine bedroom sizes and ensure each bathroom has access, privacy and ventilation.'),
        ('04', 'Keep the staircase aligned vertically, with suitable width, landing sizes, headroom and handrails.'),
        ('05', 'Align wet areas vertically where possible to reduce plumbing complexity.'),
        ('06', 'Add wall thicknesses, door/window schedules, lintels, columns, beams and foundations.'),
        ('07', 'Verify natural light, cross-ventilation, drainage, rainwater management and fire safety.'),
        ('08', 'Have a licensed architect/structural engineer review and approve all drawings before construction.'),
    ]
    for i, (num, text) in enumerate(points):
        py = H - 118 - i * 38
        c.setFillColor(HexColor('#e8eff0'))
        c.roundRect(42, py, W - 84, 28, 4, fill=1, stroke=0)
        c.setFillColor(HexColor('#194d48'))
        c.setFont('Helvetica-Bold', 9)
        c.drawString(56, py + 9, num)
        c.setFillColor(HexColor('#223432'))
        c.setFont('Helvetica', 8.5)
        c.drawString(84, py + 9, text)

    c.setFillColor(HexColor('#657773'))
    c.setFont('Helvetica', 7.5)
    c.drawString(42, 34, 'The plan is schematic and not to scale; room dimensions are illustrative and need architectural coordination.')
    c.showPage()

def build_pdf():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    page_space_plan(c)
    page_ground(c)
    page_first(c)
    page_second(c)
    page_checklist(c)
    c.save()
    print(f'Generated {OUT} ({OUT.stat().st_size} bytes)')

if __name__ == '__main__':
    build_pdf()

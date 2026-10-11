from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

OUT = Path(__file__).resolve().parents[1] / 'public' / 'example-two-storey-plan.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
W, H = landscape(A4)
INK=HexColor('#173b3a'); TEAL=HexColor('#16776d'); MINT=HexColor('#e5f0ea'); PAPER=HexColor('#f7f6f1'); MUTED=HexColor('#6b7c77'); BLUE=HexColor('#3989a2'); GOLD=HexColor('#c99554'); WHITE=white
ROOMS=[
 ('Front Sitout',8,5,'outdoor',(0,0,8,5)),('Puja Room',10,5,'prayer',(8,0,10,5)),('Passage',8,5,'passage',(18,0,8,5)),
 ('Dining',8,7,'dining',(0,5,8,7)),('Kitchen',10,7,'kitchen',(8,5,10,7)),('Bath / WC',8,7,'bath',(18,5,8,7)),
 ('Living',8,10,'living',(0,12,8,10)),('Bedroom 1',10,10,'bedroom',(8,12,10,10)),('Bedroom 2',8,10,'bedroom',(18,12,8,10)),
 ('Central Staircase',8,10,'stair',(0,22,8,10)),('Bedroom 3',10,10,'bedroom',(8,22,10,10)),('Family Lounge',8,10,'family',(18,22,8,10))]
COLORS={'outdoor':'#e4efed','living':'#eee5d5','dining':'#e5efe8','kitchen':'#e2eeec','prayer':'#f4edda','passage':'#e8e7df','stair':'#efe3d2','bath':'#e3edf0','bedroom':'#eee7dc','family':'#e6e8df'}
MINIMUM={'outdoor':'4 x 5','living':'8 x 10','dining':'7 x 7','kitchen':'7 x 7','prayer':'4 x 4','passage':'3 x 3','stair':'6 x 9','bath':'5 x 7','bedroom':'8 x 10','family':'8 x 8'}

def header(c,title,subtitle,page):
 c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColor(TEAL);c.roundRect(34,H-50,24,24,5,fill=1,stroke=0)
 c.setFillColor(WHITE);c.setFont('Helvetica-Bold',12);c.drawCentredString(46,H-42,'P');c.setFillColor(INK);c.setFont('Helvetica-Bold',9);c.drawString(67,H-39,'PLANDEON  /  HOUSE STUDIO')
 c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawRightString(W-36,H-39,f'GROUND FLOOR STARTER  ·  {page:02d} / 05');c.setStrokeColor(HexColor('#d9e0da'));c.line(34,H-62,W-34,H-62)
 c.setFillColor(INK);c.setFont('Helvetica-Bold',19);c.drawString(38,H-96,title);c.setFillColor(MUTED);c.setFont('Helvetica',8.5);c.drawString(38,H-113,subtitle)

def cover(c):
 c.setFillColor(INK);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColor(TEAL);c.roundRect(48,H-86,34,34,7,fill=1,stroke=0);c.setFillColor(WHITE);c.setFont('Helvetica-Bold',18);c.drawCentredString(65,H-75,'P')
 c.setFillColor(HexColor('#a6d8c2'));c.setFont('Helvetica-Bold',10);c.drawString(96,H-62,'PLANDEON  /  COPYABLE PLAN TEMPLATE')
 c.setFillColor(WHITE);c.setFont('Helvetica-Bold',29);c.drawString(50,H-153,'A dimensioned home');c.setFillColor(HexColor('#8fd5b4'));c.drawString(50,H-190,'you can start with.')
 c.setFillColor(HexColor('#c4d3cd'));c.setFont('Helvetica',10.5);c.drawString(52,H-222,'Ground-floor starter with exact room sizes and minimum targets.')
 c.drawString(52,H-240,'Includes a guide to copying the PDF and making small changes.')
 c.setFillColor(HexColor('#254943'));c.roundRect(50,105,330,190,12,fill=1,stroke=0);c.setFillColor(HexColor('#dff1e8'));c.setFont('Helvetica-Bold',12);c.drawString(70,264,'STARTER MODEL DIMENSIONS')
 facts=[('Outside width','26 ft  /  7.92 m'),('Outside length','32 ft  /  9.75 m'),('Ground floor area','832 sq ft  /  77.3 m²'),('Clear wall height','9 ft 2 in  /  2.80 m'),('Floor-to-floor target','10 ft 6 in  /  3.20 m')]
 for i,(label,value) in enumerate(facts):
  y=235-i*27;c.setFillColor(HexColor('#9bcbb8'));c.setFont('Helvetica',9);c.drawString(71,y,label);c.setFillColor(WHITE);c.setFont('Helvetica-Bold',9);c.drawRightString(357,y,value)
 c.setFillColor(HexColor('#244944'));c.roundRect(424,105,366,310,12,fill=1,stroke=0);c.setFillColor(HexColor('#dff1e8'));c.setFont('Helvetica-Bold',12);c.drawString(447,383,'FLOORS ARE YOUR CHOICE')
 lines=['This file demonstrates one complete ground floor.','Upload only this level to start, then add a clearly','labeled First Floor sheet later when you decide.','','Use the room schedule on page 3 as the exact starter.','Make small edits to sizes or names in your own copy.','','The 3D model is a planning visualization. Confirm','construction dimensions and local rules independently.']
 c.setFillColor(HexColor('#c4d3cd'));c.setFont('Helvetica',10)
 for i,line in enumerate(lines):c.drawString(447,351-i*25,line)
 c.setFillColor(HexColor('#99aaa4'));c.setFont('Helvetica',8);c.drawString(50,55,'5 PAGES  ·  PLAN  ·  DIMENSION TABLE  ·  HEIGHT / DOOR DEFAULTS  ·  UPLOAD INSTRUCTIONS')
 c.showPage()

def ground_plan(c):
 header(c,'Ground floor plan  /  exact starter','26 ft wide × 32 ft long  ·  12 connected spaces  ·  ground-floor height target 2.80 m',2)
 sx,sy=169,70;scale=12.0;pw=26*scale;ph=32*scale
 c.setFillColor(WHITE);c.roundRect(133,64,pw+72,ph+4,7,fill=1,stroke=0)
 for name,w,d,kind,(x,z,bw,bd) in ROOMS:
  # Keep z=0 at the front/garden edge, matching the 3D model's coordinate convention.
  px=sx+x*scale;py=sy+z*scale;c.setFillColor(HexColor(COLORS[kind]));c.rect(px,py,bw*scale,bd*scale,fill=1,stroke=0)
  c.setStrokeColor(INK);c.setLineWidth(.85);c.rect(px,py,bw*scale,bd*scale,fill=0,stroke=1)
  centerx=px+bw*scale/2;centery=py+bd*scale/2
  font=6.5 if bw>=8 else 5.5
  if kind!='stair':
   c.setFillColor(INK);c.setFont('Helvetica-Bold',font);c.drawCentredString(centerx,centery+4,name.upper())
   c.setFillColor(MUTED);c.setFont('Helvetica',6);c.drawCentredString(centerx,centery-6,f'{bw} ft x {bd} ft')
  if kind=='stair':
   c.setStrokeColor(GOLD);c.setLineWidth(.6)
   for i in range(1,9):
    yy=py+7+i*(bd*scale-14)/9;c.line(px+10,yy,px+bw*scale-10,yy)
   c.setFillColor(HexColor('#f7f1e5'));c.roundRect(centerx-34,centery-16,68,33,3,fill=1,stroke=0)
   c.setFillColor(TEAL);c.setFont('Helvetica-Bold',5.5);c.drawCentredString(centerx,centery+8,'CENTRAL STAIRCASE')
   c.setFont('Helvetica',5.5);c.drawCentredString(centerx,centery-1,f'{bw} ft x {bd} ft')
   c.setFont('Helvetica-Bold',5.2);c.drawCentredString(centerx,centery-10,'16 RISERS  /  UP')
 # Draw only modeled room-to-room door openings; the bath is private to the passage,
 # and the stair opens freely to the living room with a closed wall toward Bedroom 3.
 for i,room_a in enumerate(ROOMS):
  name_a,_,_,kind_a,(ax,az,aw,ad)=room_a
  for name_b,_,_,kind_b,(bx,bz,bw,bd) in ROOMS[i+1:]:
   vertical=abs(ax+aw-bx)<.001 or abs(bx+bw-ax)<.001
   horizontal=abs(az+ad-bz)<.001 or abs(bz+bd-az)<.001
   if vertical:
    lo=max(az,bz);hi=min(az+ad,bz+bd)
    if hi-lo<=.12:continue
    edge_x=ax+aw if abs(ax+aw-bx)<.001 else bx+bw;center_z=(lo+hi)/2;axis='z';px=sx+edge_x*scale;py=sy+center_z*scale;span=hi-lo
   elif horizontal:
    lo=max(ax,bx);hi=min(ax+aw,bx+bw)
    if hi-lo<=.12:continue
    edge_z=az+ad if abs(az+ad-bz)<.001 else bz+bd;center_x=(lo+hi)/2;axis='x';px=sx+center_x*scale;py=sy+edge_z*scale;span=hi-lo
   else:continue
   bath_pair=kind_a=='bath' or kind_b=='bath'
   bath_other=name_b if kind_a=='bath' else name_a if kind_b=='bath' else ''
   if bath_pair and not any(k in bath_other.lower() for k in ('passage','corridor','landing','hall')):continue
   stair_pair=kind_a=='stair' or kind_b=='stair'
   stair_other=name_b if kind_a=='stair' else name_a if kind_b=='stair' else ''
   if stair_pair and not any(k in stair_other.lower() for k in ('living','passage','landing','corridor','hall')):continue
   if stair_pair:
    # Free opening at the living-room stair entry, matching the walkthrough.
    c.setStrokeColor(WHITE);c.setLineWidth(3.5)
    if axis=='x':c.line(px-span*scale/2,py,px+span*scale/2,py)
    else:c.line(px,py-span*scale/2,px,py+span*scale/2)
    continue
   gap=min((2.5 if bath_pair else 3.0)*scale,span*scale*.65)
   c.setStrokeColor(WHITE);c.setLineWidth(3.4)
   if axis=='x':c.line(px-gap/2,py,px+gap/2,py)
   else:c.line(px,py-gap/2,px,py+gap/2)
   c.setStrokeColor(GOLD);c.setLineWidth(.8)
   if axis=='x':
    c.line(px-gap/2,py,px-gap/2,py+gap);c.arc(px-gap/2,py,px+gap/2,py+gap,0,90)
   else:
    c.line(px,py-gap/2,px+gap,py-gap/2);c.arc(px,py-gap/2,px+gap,py+gap/2,0,90)
 # Clean single exterior opening on the front sitout wall, directly from garden.
 door_x=sx+4*scale; front_y=sy;c.setFillColor(WHITE);c.rect(door_x-1.75*scale,front_y-2,3.5*scale,5,fill=1,stroke=0)
 c.setStrokeColor(TEAL);c.setLineWidth(1.8);c.line(door_x-1.75*scale,front_y,door_x-1.75*scale,front_y+1.75*scale)
 c.setStrokeColor(GOLD);c.setLineWidth(.8);c.arc(door_x-3.5*scale,front_y,door_x,front_y+3.5*scale,0,90)
 c.setFillColor(TEAL);c.setFont('Helvetica-Bold',6.5);c.drawString(door_x+7,front_y+10,'D1  /  3 ft 6 in')
 c.setStrokeColor(TEAL);c.setLineWidth(.8);c.line(sx,sy-18,sx+pw,sy-18);c.line(sx,sy-22,sx,sy-14);c.line(sx+pw,sy-22,sx+pw,sy-14)
 c.setFillColor(TEAL);c.setFont('Helvetica-Bold',8);c.drawCentredString(sx+pw/2,sy-30,"26'-0\" OUTSIDE WIDTH")
 c.setStrokeColor(TEAL);c.line(sx-28,sy,sx-28,sy+ph);c.line(sx-32,sy,sx-24,sy);c.line(sx-32,sy+ph,sx-24,sy+ph)
 c.saveState();c.translate(sx-40,sy+ph/2);c.rotate(90);c.setFillColor(TEAL);c.setFont('Helvetica-Bold',8);c.drawCentredString(0,0,"32'-0\" OUTSIDE LENGTH");c.restoreState()
 # garden/entry path
 c.setFillColor(HexColor('#dfe9da'));c.roundRect(door_x-12,14,24,21,3,fill=1,stroke=0);c.setFillColor(MUTED);c.setFont('Helvetica',6);c.drawCentredString(door_x,22,'GARDEN')
 c.setFillColor(INK);c.setFont('Helvetica-Bold',8);c.drawString(549,438,'EXACT ROOM GRID');c.setFillColor(MUTED);c.setFont('Helvetica',7.5)
 side=['Door arcs show leaf swing and clear opening.','Room doors: 3 ft; bath door: 2 ft 6 in.','Bathroom opens from the passage only.','Wall stays closed to kitchen and Bedroom 2.','Stairs are open from Living; wall closed to Bedroom 3.','D1 is the single garden-to-sitout entry.']
 for i,line in enumerate(side):c.drawString(549,420-i*16,line)
 c.setFillColor(INK);c.setFont('Helvetica-Bold',8);c.drawString(549,274,'ORIENTATION');c.setFillColor(MUTED);c.setFont('Helvetica',7.5);c.drawString(549,257,'Front / garden side is at the bottom.');c.drawString(549,241,'North is toward the top of the page.')
 c.showPage()

def schedule(c):
 header(c,'Room sizes  /  minimum defaults','All dimensions are clear internal planning sizes in feet; the model uses matching room footprints.',3)
 cols=[48,266,365,463,604,790];top=439;rowh=25
 c.setFillColor(INK);c.roundRect(48,top,742,26,4,fill=1,stroke=0);c.setFillColor(WHITE);c.setFont('Helvetica-Bold',8)
 for x,label in zip(cols[:-1],['ROOM','MODEL SIZE','AREA','DEFAULT MINIMUM','USE / NOTES']):c.drawString(x+8,top+9,label)
 for i,(name,w,d,kind,_) in enumerate(ROOMS):
  y=top-(i+1)*rowh;c.setFillColor(WHITE if i%2==0 else MINT);c.roundRect(48,y,742,rowh-2,3,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Helvetica-Bold',7.5);c.drawString(56,y+8,name);c.setFont('Helvetica',7.5);c.drawString(274,y+8,f'{w} x {d} ft');c.drawString(373,y+8,str(w*d));c.drawString(471,y+8,MINIMUM[kind]);c.setFillColor(MUTED);c.setFont('Helvetica',7);note='One outside entry' if name=='Front Sitout' else '16 risers, landing and rails' if kind=='stair' else 'Room minimum planning target';c.drawString(612,y+8,note)
 c.setFillColor(INK);c.setFont('Helvetica-Bold',9);c.drawString(50,87,'GROUND FLOOR TOTAL  /  832 sq ft')
 c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawString(50,68,'Every modeled room matches the size shown in the Model Size column. Minimums are defaults, not construction-code certification.')
 c.showPage()

def standards(c):
 header(c,'House dimensions  /  defaults','Use these defaults for the starter model; select another local standard only after checking your project needs.',4)
 c.setFillColor(WHITE);c.roundRect(48,280,352,142,8,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Helvetica-Bold',11);c.drawString(67,395,'Overall house envelope - minimum starter')
 facts=[('Width','26 ft  /  7.92 m'),('Length','32 ft  /  9.75 m'),('Ground-floor area','832 sq ft  /  77.3 m²'),('Clear room wall height','9 ft 2 in  /  2.80 m'),('Floor-to-floor height','10 ft 6 in  /  3.20 m')]
 for i,(a,b) in enumerate(facts):y=370-i*20;c.setFillColor(MUTED);c.setFont('Helvetica',8.5);c.drawString(68,y,a);c.setFillColor(INK);c.setFont('Helvetica-Bold',8.5);c.drawRightString(382,y,b)
 c.setFillColor(WHITE);c.roundRect(422,280,368,142,8,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Helvetica-Bold',11);c.drawString(441,395,'Door and circulation defaults')
 doors=[('D1  Garden to sitout','3 ft 6 in x 7 ft','Only exterior house entry'),('Internal room door','3 ft x 7 ft','Typical bedroom / living'),('Bathroom door','2 ft 6 in x 7 ft','Clear width target'),('Window','4 ft 3 in x 3 ft 6 in','Sill 2 ft 11 in'),('Stairs','6 ft x 9 ft bay','16 risers, 0.90 m landing')]
 for i,(a,b,d) in enumerate(doors):y=370-i*20;c.setFillColor(TEAL);c.setFont('Helvetica-Bold',7.5);c.drawString(441,y,a);c.setFillColor(INK);c.setFont('Helvetica',7.5);c.drawString(565,y,b);c.setFillColor(MUTED);c.setFont('Helvetica',7);c.drawString(675,y,d)
 c.setFillColor(HexColor('#edf3ed'));c.roundRect(48,142,742,105,8,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Helvetica-Bold',10);c.drawString(68,223,'One garden entrance')
 c.setFillColor(MUTED);c.setFont('Helvetica',8.5);c.drawString(68,204,'The ground floor has one exterior door, marked D1 at the front sitout. The path comes from the garden. All other exterior wall edges remain closed.')
 c.drawString(68,186,'Room-to-room doors are interior connections and do not create additional garden entrances.')
 c.setFillColor(INK);c.setFont('Helvetica-Bold',10);c.drawString(68,162,'Optional upper floors')
 c.setFillColor(MUTED);c.setFont('Helvetica',8.5);c.drawString(68,146,'Upload the ground floor alone to begin. Add a First Floor page later; the model height then follows the number of selected levels.')
 c.setFillColor(MUTED);c.setFont('Helvetica',7.5);c.drawString(48,104,'These dimensions are illustrative planning defaults. Confirm structure, ventilation, fire egress, accessibility, and local code with a qualified professional.')
 c.showPage()

def instructions(c):
 header(c,'Make your own copy  /  upload guide','You can use this ground floor as-is or copy its page and make small changes.',5)
 steps=[('1  Keep the page structure','Start with one page titled Ground Floor. To add a level, duplicate the page and title it First Floor.'),('2  Use exact text labels','Inside each room cell, place its name one line above the size, e.g. Bedroom 1 then 8 ft x 10 ft. Keep one room label per cell.'),('3  Keep a regular grid','Align labels in rows and columns. Use the same width down each column and depth across each row. To add rooms, insert a row or column and update the overall footprint.'),('4  State size and mark stairs','Add: Overall footprint: 26 ft width x 32 ft depth. Mark the garden side and one D1 entry. Label Central Staircase on both levels.'),('5  Export, upload and review','Export a top-down vector PDF with selectable upright text. Edit room labels or sizes, then upload the edited copy. Add a First Floor page when ready and review the 3D result.')]
 y=431
 for i,(title,body) in enumerate(steps):
  lines=[]
  from reportlab.lib.utils import simpleSplit
  for para in body.split('\n'):lines.extend(simpleSplit(para,'Helvetica',8.5,680))
  h=31+len(lines)*12;c.setFillColor(WHITE if i%2==0 else MINT);c.roundRect(48,y-h,742,h-5,6,fill=1,stroke=0);c.setFillColor(TEAL);c.setFont('Helvetica-Bold',9);c.drawString(64,y-17,title);c.setFillColor(MUTED);c.setFont('Helvetica',8.5)
  for j,line in enumerate(lines):c.drawString(64,y-32-j*12,line)
  y-=h+7
 c.setFillColor(HexColor('#fff1d9'));c.roundRect(48,61,742,43,6,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Helvetica-Bold',8);c.drawString(64,86,'IMPORTANT:')
 c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawString(128,86,'The importer reads labels and room sizes; it does not trace CAD walls or PDF door-swing symbols.')
 c.drawString(64,71,'Doors use centered openings at shared room edges with standard widths. Compare the model with your drawing.')
 c.showPage()

def main():
 c=canvas.Canvas(str(OUT),pagesize=landscape(A4),pageCompression=1);c.setTitle('Dimensioned Ground Floor - Upload Example');c.setAuthor('Plandeon House Studio')
 cover(c);ground_plan(c);schedule(c);standards(c);instructions(c);c.save();print(OUT)

if __name__=='__main__':main()

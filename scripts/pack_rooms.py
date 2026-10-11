from functools import lru_cache

W, H = 26, 32
ground = [("Sitout",8,6),("Living",10,13),("Dining",8,8),("Kitchen",8,8),("Puja",4,4),("Passage",4,5),("Stair",6,9),("Bath",8,7),("Bedroom 1",8,10),("Bedroom 2",8,10),("Bedroom 3",8,15),("Family",10,10)]
upper = [("Balcony",8,5),("Upper lounge",8,10),("Study",10,10),("Bath",8,10),("Terrace",8,10),("Family",10,10),("Bedroom 4",10,12),("Bedroom 5",8,10),("Bedroom 6",8,10),("Stair / landing",6,12)]

def solve(rooms, fixed=None):
    fixed = fixed or {}
    masks = []
    for name, w, h in rooms:
        variants = set()
        for a, b in {(w,h),(h,w)}:
            if a <= W and b <= H:
                variants.add((a,b))
        masks.append((name, tuple(sorted(variants, reverse=True))))
    @lru_cache(None)
    def visit(used, occupied):
        if used == (1 << len(rooms)) - 1:
            return () if occupied == (1 << (W*H)) - 1 else None
        free = ((1 << (W*H)) - 1) ^ occupied
        first = (free & -free).bit_length() - 1
        x, y = first % W, first // W
        for i, (name, variants) in enumerate(masks):
            if used & (1 << i):
                continue
            for w, h in variants:
                if x+w > W or y+h > H:
                    continue
                mask = 0
                for yy in range(y, y+h):
                    mask |= ((1 << w)-1) << (yy*W+x)
                if occupied & mask:
                    continue
                tail = visit(used | (1 << i), occupied | mask)
                if tail is not None:
                    return ((name,x,y,w,h),) + tail
        return None
    used, occupied, placements = 0, 0, []
    lookup={name:i for i,(name,_) in enumerate(masks)}
    for name,(x,y,w,h) in fixed.items():
        mask=0
        for yy in range(y,y+h): mask |= ((1<<w)-1) << (yy*W+x)
        if occupied & mask: return None
        occupied |= mask
        used |= 1<<lookup[name]
        placements.append((name,x,y,w,h))
    return tuple(placements) + visit(used,occupied) if visit(used,occupied) is not None else None

gf=solve(ground)
print("GROUND",gf)
for a in [1,2,3,4,6,8,9,12,18,24]:
    b=72//a
    uf=solve([r for r in upper if r[0] != "Stair / landing"]+[("Stair / landing",a,b)])
    if uf:
        print("UPPER",uf)
        break

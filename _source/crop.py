"""Cut face-centered crops of every Alex photo so no frame can cut his head off.

For each source photo we know where his face is (fx, fy as fractions). Each crop is the
largest rectangle of the target aspect that puts the face at x=50% and ~32% from the top,
clamped to the image bounds. Outputs WebP files to assets/img/alex/ plus faces.json with the
face position inside every crop (used by build.py and the verification harness).

Usage: python _source/crop.py [--debug]
"""
import io, json, sys, pathlib, urllib.request
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent / "assets" / "img" / "alex"
CACHE = HERE / ".cache"
CDN = "https://cdn.prod.website-files.com/66d7b904b20c8cdcd9ab2ce0/"

# face centre (fraction of width, fraction of height) measured on the originals
SOURCES = {
    "audience": ("6a04c6dc5ff6ea47532184c9_PBXJ2503-2.webp", 0.490, 0.330),
    "google":   ("68541e4750a11c37d83d5fe0_GOOGLE_ThinkAI_Day1_253%20copy.webp", 0.790, 0.300),
    "leader":   ("6a3b6454e2060ef356fb21aa_PBXJ2473-2.jpg", 0.450, 0.300),
    "stage":    ("689732e37cbe6ef38b422519_alex-stage-10.webp", 0.290, 0.235),
    "edu":      ("68b8ce89432ddede6b3475c8_alex-goryachev-ai-in-education-speaker.webp", 0.555, 0.247, 0.78),
}
SHAPES = {"wide": 4 / 3, "tall": 4 / 5, "sq": 1.0}
FACE_Y = 0.32      # where the face should sit vertically inside a crop
BAND = 0.42        # face may drift at most 8% off centre so crops stay large
LONG_EDGE = 1400


def load(name, file):
    CACHE.mkdir(exist_ok=True)
    p = CACHE / name
    if not p.exists():
        p.write_bytes(urllib.request.urlopen(CDN + file).read())
    return Image.open(p).convert("RGB")


def crop_box(W, H, Fx, Fy, aspect, max_h=1.0):
    # widest crop that keeps the face within the centre band (BAND..1-BAND), capped by the image height
    cw = min(min(Fx, W - Fx) / BAND, W, H * max_h * aspect)
    ch = cw / aspect
    left = min(max(Fx - cw / 2, 0), W - cw)
    top = min(max(Fy - FACE_Y * ch, 0), H - ch)
    return left, top, cw, ch


def main(debug=False):
    OUT.mkdir(parents=True, exist_ok=True)
    faces, sheet = {}, []
    for key, (file, fx, fy, *zoom) in SOURCES.items():
        max_h = zoom[0] if zoom else 1.0  # <1 crops tighter so a distant subject fills the frame
        im = load(key, file)
        W, H = im.size
        Fx, Fy = fx * W, fy * H
        for shape, aspect in SHAPES.items():
            l, t, cw, ch = crop_box(W, H, Fx, Fy, aspect, max_h)
            c = im.crop((round(l), round(t), round(l + cw), round(t + ch)))
            scale = LONG_EDGE / max(c.size)
            if scale < 1:
                c = c.resize((round(c.width * scale), round(c.height * scale)), Image.LANCZOS)
            name = f"{key}-{shape}.webp"
            c.save(OUT / name, "WEBP", quality=80, method=6)
            face = [round((Fx - l) / cw, 3), round((Fy - t) / ch, 3)]
            faces[f"{key}-{shape}"] = {"w": c.width, "h": c.height, "face": face, "kept": round(ch / H, 2)}
            if debug:
                d = c.copy(); dr = ImageDraw.Draw(d)
                x, y = face[0] * d.width, face[1] * d.height
                dr.ellipse((x - 14, y - 14, x + 14, y + 14), outline="red", width=5)
                sheet.append(d)
            print(f"{name:22} {c.width}x{c.height}  face={face}  kept {faces[key+'-'+shape]['kept']:.0%} of height  {(OUT/name).stat().st_size//1024} KB")
    (OUT / "faces.json").write_text(json.dumps(faces, indent=1))
    if debug:
        th = 260
        row = [s.resize((round(s.width * th / s.height), th)) for s in sheet]
        cols = 3
        rows = [row[i:i + cols] for i in range(0, len(row), cols)]
        S = Image.new("RGB", (max(sum(r.width for r in rr) + 8 * (len(rr) - 1) for rr in rows), len(rows) * (th + 8)), "white")
        for ri, rr in enumerate(rows):
            x = 0
            for r in rr:
                S.paste(r, (x, ri * (th + 8))); x += r.width + 8
        S.save(HERE / ".cache" / "crops-sheet.jpg", quality=80)


if __name__ == "__main__":
    main("--debug" in sys.argv)

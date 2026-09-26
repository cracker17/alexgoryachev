"""Branded 1200x630 Open Graph share cards, one per page: headline left, face-centred Alex photo right.

Text is drawn by Pillow (never by an image model) so headlines are always exact.
Usage: python _source/og.py   -> assets/img/og/<page>.jpg
"""
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = pathlib.Path(__file__).parent
SITE = HERE.parent
OUT = SITE / "assets" / "img" / "og"
FONTS = pathlib.Path("C:/Windows/Fonts")
W, H = 1200, 630
INK, CYAN, MUTED = (13, 15, 18), (10, 187, 255), (163, 169, 177)

CARDS = {
    "speaking": ("google", "AI keynotes · Workshops · Virtual", "The AI keynote speaker who moves organizations to act."),
    "enterprise": ("audience", "For enterprise leaders", "Turn agentic AI into operating advantage."),
    "higher-education": ("edu", "For higher education", "Most universities are reacting to AI. Help yours lead it."),
    "member-organizations": ("stage", "For associations & member organizations", "Give every member a practical AI playbook."),
    "about": ("leader", "About Alex Goryachev", "Stay above the algorithm — or work for it."),
    "work-with-alex": ("audience", "Book Alex", "Check Alex's availability for your event."),
    "ai-keynote-speaker-singapore": ("audience", "AI keynote speaker · Singapore & APAC", "An AI keynote for your Singapore event."),
    "ai-higher-education-speaker-apac": ("edu", "AI in higher education · Singapore & APAC", "Help your university lead AI."),
    "credentials": ("google", "Alex Goryachev — Credentials", "The receipts behind the experience."),
    "thank-you": ("leader", "Request received", "You'll hear back within one business day."),
}


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in text.split():
        test = (line + " " + word).strip()
        if draw.textlength(test, font=fnt) <= width:
            line = test
        else:
            lines.append(line); line = word
    lines.append(line)
    # never leave a single word on the last line
    if len(lines) > 1 and " " not in lines[-1]:
        head, _, last = lines[-2].rpartition(" ")
        if head and draw.textlength(last + " " + lines[-1], font=fnt) <= width:
            lines[-2], lines[-1] = head, last + " " + lines[-1]
    return lines


def card(page, photo, eyebrow, title):
    # background: ink with a soft cyan glow top-left
    canvas = Image.new("RGB", (W, H), INK)
    ImageDraw.Draw(canvas).ellipse((-300, -360, 560, 380), fill=(9, 58, 86))
    canvas = canvas.filter(ImageFilter.GaussianBlur(130))
    # photo: square face-centred crop on the right, faded into the ink on its left edge
    ph = Image.open(SITE / "assets/img/alex" / f"{photo}-sq.webp").convert("RGB").resize((H, H), Image.LANCZOS)
    mask = Image.new("L", (H, H), 255)
    md = ImageDraw.Draw(mask)
    for x in range(300):
        md.line([(x, 0), (x, H)], fill=int(255 * (x / 300) ** 1.5))
    canvas.paste(ph, (W - H, 0), mask)
    d = ImageDraw.Draw(canvas)
    x = 72
    # eyebrow
    ey = font("seguisb.ttf", 22)
    d.line([(x, 108), (x + 30, 108)], fill=CYAN, width=3)
    d.text((x + 44, 94), eyebrow.upper(), font=ey, fill=CYAN, spacing=4)
    # headline (shrinks to fit 4 lines)
    for size in (64, 58, 54, 50, 46):
        tf = font("segoeuib.ttf", size)
        lines = wrap(d, title, tf, 500)
        if len(lines) <= 4:
            break
    y = 150
    for ln in lines:
        d.text((x, y), ln, font=tf, fill=(255, 255, 255))
        y += int(size * 1.12)
    # footer: name + role + domain
    d.line([(x, 520), (x + 56, 520)], fill=CYAN, width=4)
    d.text((x, 536), "Alex Goryachev", font=font("segoeuib.ttf", 28), fill=(255, 255, 255))
    d.text((x, 572), "AI & Innovation Keynote Speaker  ·  alexgoryachev.com", font=font("segoeui.ttf", 20), fill=MUTED)
    OUT.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT / f"{page}.jpg", "JPEG", quality=86, optimize=True, progressive=True)
    print(f"og/{page}.jpg  {(OUT / f'{page}.jpg').stat().st_size // 1024} KB  ({len(lines)} lines @ {size}px)")


if __name__ == "__main__":
    for page, (photo, eyebrow, title) in CARDS.items():
        card(page, photo, eyebrow, title)

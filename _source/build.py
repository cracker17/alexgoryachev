"""Compose the Alex Goryachev pages from partials + page bodies.

Usage: python build.py  -> writes E:/001 Personal Projects/Alex Goryachev Site/*.html
"""
import json, re, pathlib, html, urllib.parse

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent  # site root (one level up from _source/)
P = lambda n: (HERE / "partials" / n).read_text(encoding="utf-8")

CDN = "https://cdn.prod.website-files.com/66d7b904b20c8cdcd9ab2ce0/"
# Where the site will live. Canonical/OG URLs must be absolute or link previews show no image.
SITE_URL = "https://alexgoryachev.vercel.app"  # change to https://www.alexgoryachev.com once the domain points at Vercel
IMG = {
    "book": CDN + "6a3beb60700d93e6770c4034_alex-goryachev_book-front.jpg",
    "wsj": CDN + "6a0b14d2fbca19fcce3b95e2_wsjbestseller.png",
    "shrm": CDN + "677c43608de6309f9d557e36_shrm.png",
    "rotary": CDN + "6a3e09f1f3f8b5c3e7bef40a_rotary_logo.svg",
    "ieee": CDN + "6a04a28d50c15bf9b1394edc_ieee-logo.png",
    "csu": CDN + "6a3e0d3ce6075a01c4bd22b2_csu_logo.svg",
}
# face-centred crops of every Alex photo (made by crop.py): IMG["stage-tall"] etc.
FACES = json.loads((HERE.parent / "assets/img/alex/faces.json").read_text())
for _k, _v in FACES.items():
    IMG[_k] = f"assets/img/alex/{_k}.webp"


def alex(key, alt, cls="", extra=""):
    """<img> for a face-centred crop, sized from faces.json so there's no layout shift."""
    f = FACES[key]
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{IMG[key]}" alt="{html.escape(alt)}" width="{f["w"]}" height="{f["h"]}" loading="lazy" decoding="async"{extra}>'


def hero_media(key):
    """Right-hand photo panel on desktop, photo-above-text on tablet/phone. Tablets get the 4:3 crop."""
    f = FACES[key + "-tall"]
    return (f'<div class="hero__media"><picture>'
            f'<source media="(min-width: 600px) and (max-width: 899px)" srcset="{IMG[key + "-wide"]}">'
            f'<img src="{IMG[key + "-tall"]}" alt="" width="{f["w"]}" height="{f["h"]}" fetchpriority="high"></picture></div>')

ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
ARROW_BTN = ARROW.replace("<svg ", '<svg class="arrow" ', 1)
CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'


def ask(title):
    return "work-with-alex.html?program=" + urllib.parse.quote(title)


KEYNOTES = {
    "adapt": ("Adapt or Vanish", "audience", "Alex Goryachev delivering an AI keynote to a live corporate audience",
              "Most AI programs stall because the organization never agrees on one plan. Alex shows what large organizations are doing with agentic AI right now, the 3 moves that turn pilots into work that ships, and the shared language that keeps teams from meaning different things by “AI strategy.”",
              ["Most requested", "45–75 min"],
              ["Where your company stands right now", "The 3 moves that turn pilots into work that ships", "One shared language for AI strategy"]),
    "leadership": ("Leadership in the Age of AI: The Practical Playbook", "leader", "Alex Goryachev speaking about agentic AI at a leadership event",
                   "Leaders are approving AI budgets, vendors, and roadmaps they cannot evaluate themselves, in front of teams that are anxious about all of it. Alex hands your audience the decisions only a leader can make, and the words to bring their people with them.",
                   ["Keynote", "45–75 min"],
                   ["What to fund this quarter", "What to ask a vendor before signing", "How to talk to teams who think AI is coming for their jobs"]),
    "relearn": ("Relearn or Rehire", "stage", "Alex Goryachev presenting to a live audience from the keynote stage",
                "Every job description is being rewritten around AI. This is the workforce decision only a leader can make: which tasks agents absorb, which skills gain value, and whether you reskill the team you have or replace it.",
                ["Future of work", "45–75 min"],
                ["Which tasks AI agents absorb", "How fast skills lose value", "What reskilling costs compared with hiring"]),
    "educating": ("Educating for the Unknown: Preparing Students for a Future That Doesn't Exist Yet", "edu", "Alex Goryachev speaking about AI in education to university leaders",
                  "Students adopted AI faster than any technology in campus history. Alex gives presidents, provosts, and faculty a pragmatic AI strategy: governance, teaching, and student outcomes, drawn from advising the California State University system's $17M ChatGPT Edu rollout.",
                  ["Higher education", "45–75 min"],
                  ["A governance model for campus AI", "Faculty adoption and teaching", "Student readiness and outcomes"]),
    "opportunity": ("The AI Opportunity for You, Your Industry & Your Organization", "google", "Alex Goryachev speaking on AI at Google's Think AI event",
                    "Most keynotes are scripted. This one is built from your questions. After a detailed intake, Alex writes the session for your industry and your organization: research, industry benchmarks, expert answers, and an extended live Q&A that runs until the questions do.",
                    ["Fully custom", "Extended Q&A"],
                    ["A session built from your intake", "Research and benchmarks for your industry", "Live Q&A that runs until the questions do"]),
}


def keynote(key, featured=False):
    t, img, alt, d, tags, takeaways = KEYNOTES[key]
    tg = "".join(f'<span class="tag{" tag--cyan" if i == 0 else ""}">{html.escape(x)}</span>' for i, x in enumerate(tags))
    cls = "card card--glow" + (" card--featured" if featured else "")
    if featured:
        rooms = [("Executives", "get the money case."), ("Skeptics", "get an honest account of what goes wrong."),
                 ("Engineers", "get implementation detail."), ("Front-line managers", "leave with Monday actions.")]
        extra = f'''<div class="card__rooms">
              <p class="card__kicker">Built for mixed rooms</p>
              <ul>{"".join(f"<li><b>{a}</b> {b}</li>" for a, b in rooms)}</ul>
            </div>
            <p class="card__proof">Draws on <b>170+ AI pilots</b> · <b>51 live deployments</b> · a <b>$1.1B</b> innovation portfolio</p>
            <div class="card__tags"><span class="tag">In person · Virtual · Hybrid</span><span class="tag">50 to 10,000+ seats</span></div>'''
        media = alex(img + "-tall", alt)
    else:
        items = "".join(f"<li>{CHECK}<span>{html.escape(x)}</span></li>" for x in takeaways)
        extra = f'''<div class="card__takeaways">
              <p class="card__kicker">You'll leave with</p>
              <ul class="feature-list small">{items}</ul>
            </div>'''
        media = alex(img + "-wide", alt)
    return f'''<article class="{cls}" data-reveal>
          <div class="card__media">{media}</div>
          <div class="card__body">
            <div class="card__tags">{tg}</div>
            <h3 class="h3">{html.escape(t)}</h3>
            <p>{html.escape(d)}</p>
            {extra}
            <a class="link-arrow" href="{ask(t)}">Ask about this talk {ARROW}</a>
          </div>
        </article>'''


def textcard(num, title, desc, tags=(), dark=False, cta="Ask about this format"):
    title, desc, tags = html.unescape(title), html.unescape(desc), [html.unescape(t) for t in tags]
    tg = "".join(f'<span class="tag{" tag--cyan" if i == 0 else ""}">{html.escape(x)}</span>' for i, x in enumerate(tags))
    return f'''<article class="card card--glow{" card--dark" if dark else ""}" data-reveal>
          <div class="card__body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><span class="card__num">{num}</span><div class="card__tags">{tg}</div></div>
            <h3 class="h3">{html.escape(title)}</h3>
            <p>{html.escape(desc)}</p>
            <a class="link-arrow" href="{ask(title)}">{cta} {ARROW}</a>
          </div>
        </article>'''


STATS = '''<div class="stats" role="list">
          <div class="stat" role="listitem"><div class="stat__num" data-count="310" data-suffix="+">310+</div><div class="stat__label">Keynotes</div></div>
          <div class="stat" role="listitem"><div class="stat__num" data-count="40">40</div><div class="stat__label">Countries</div></div>
          <div class="stat" role="listitem"><div class="stat__num" data-count="1.1" data-decimals="1" data-prefix="$" data-suffix="B">$1.1B</div><div class="stat__label">Portfolio</div></div>
          <div class="stat" role="listitem"><div class="stat__num" data-count="98" data-suffix="%">98%</div><div class="stat__label">Recommend</div></div>
          <div class="stat" role="listitem"><div class="stat__num" data-count="582" data-suffix="+">582+</div><div class="stat__label">Verified reviews</div></div>
        </div>'''

STATS_SECTION = f'''<section class="section section--dark section--tight" aria-label="Alex, by the numbers">
      <div class="container">
        <p class="eyebrow" style="margin-bottom:28px">Alex, by the numbers</p>
        {STATS}
      </div>
    </section>'''

PRESS = '''<section class="logos" aria-label="Frequently featured in">
      <div class="container"><p class="logos__label">Frequently featured in</p></div>
      <div data-marquee="press" data-speed="42"></div>
    </section>'''

CLIENTS = '''<section class="logos logos--paper" aria-label="Clients">
      <div class="container"><p class="logos__label"><b>310+</b> keynotes, workshops &amp; advisory engagements</p></div>
      <div data-marquee="clients-a" data-speed="60"></div>
      <div data-marquee="clients-b" data-direction="right" data-speed="64"></div>
    </section>'''

QUOTES = '''<section class="section section--dark" aria-labelledby="quotes-title">
      <div class="container">
        <div class="section-head section-head--split">
          <div style="display:grid;gap:20px">
            <span class="eyebrow">In their own words</span>
            <h2 class="h2" id="quotes-title" data-split>What leaders say <em>after the applause.</em></h2>
          </div>
          <div class="review-summary" data-reveal><span class="stars" aria-hidden="true">★★★★★</span><span><b style="color:#fff">98%</b> would recommend · 582+ verified audience responses</span></div>
        </div>
        <div class="quotes" data-quotes></div>
      </div>
    </section>'''

WHY = [
    ("Innovation for everyone", "Alex turns AI into practical concepts — not techspeak — that land with executives, HR, sales, engineering, and faculty alike. It's the same approach he honed building university-anchored innovation centers across 14 countries, bridging cultures and generations."),
    ("Built around your audience", "Across 310+ keynotes, workshops, and advisory engagements on 6 continents, no two have ever been the same. Alex builds every program around your audience's challenges, industry, and goals — from agentic AI strategy and the future of work to innovation culture."),
    ("Value that lasts", "Most programs end at applause. Alex's end with deployment — the same frameworks proven inside Cisco, Dell, Pfizer, and IBM and documented in his WSJ bestseller Fearless Innovation. Workshops and advisory install them in your team, so they're still running long after the event."),
    ("Proven where it counts", "Two decades leading AI and innovation where the stakes are real — a $1.1B portfolio at Cisco, three Olympic Games, 300,000+ employees, and AI transformation for Fortune 100s, governments, and America's largest public university system. Every engagement is measured, so you see the ROI."),
    ("Your team will thank you", "A 60-minute keynote, a hands-on workshop, a virtual session, or multi-month advisory — for enterprises, universities, and associations alike. Whatever the format, 98% of audiences say they would recommend him."),
]


def steps(items, start=1):
    rows = "".join(f'''
            <li class="steps-list__item">
              <span class="steps-list__num">{i:02d}</span>
              <h3>{html.escape(t)}</h3>
              <p>{html.escape(d)}</p>
            </li>''' for i, (t, d) in enumerate(items, start))
    return f'<ol class="steps-list"><span class="steps-list__rail" aria-hidden="true"><i></i></span>{rows}\n          </ol>'


WHY_SECTION = f'''<section class="section section--dark-2" aria-labelledby="why-title">
      <div class="container sticky-split">
        <div class="sticky-split__aside">
          <span class="eyebrow">Why audiences love Alex</span>
          <h2 class="h2" id="why-title" data-split>Eye-opening. <em>Refreshingly human.</em></h2>
          <p class="lead">That's how leaders at Coca-Cola, AWS, and Disney describe Alex's AI keynotes and employee innovation workshops — capable of building a shared vision around agentic AI.</p>
          <div class="sticky-split__media" data-scale-in>
            {alex("audience-wide", "Alex Goryachev speaking on stage")}
            <div class="badge-float"><b>98%</b><span>of 582+ verified attendees would recommend Alex</span></div>
          </div>
          <div class="btn-row"><a class="btn btn--ghost btn--sm" href="about.html">About Alex</a></div>
        </div>
        {steps(WHY)}
      </div>
    </section>'''


def faq_block(m):
    items = [l.split("|", 1) for l in m.group(1).strip().splitlines() if "|" in l]
    out = []
    for i, (q, a) in enumerate(items):
        out.append(f'''<div class="faq__item{' is-open' if i == 0 else ''}" data-reveal>
            <h3><button class="faq__q" type="button" aria-expanded="{'true' if i == 0 else 'false'}">{html.escape(q.strip())}<span class="faq__icon" aria-hidden="true"></span></button></h3>
            <div class="faq__a"><div><p>{html.escape(a.strip())}</p></div></div>
          </div>''')
    return '<div class="faq">\n          ' + "\n          ".join(out) + "\n        </div>"


# ---------------------------------------------------------------------------
# Ad landing pages ("layout": "lp")
# ---------------------------------------------------------------------------
LP_OPTIONS = {
    "sg": {"org": ["Corporate / MNC", "Government / agency", "Conference organizer", "Speaking bureau"],
           "format": ["In person, Singapore", "Virtual", "Not sure yet"]},
    "he": {"org": ["University", "University system office", "Association / consortium", "Other institution"],
           "format": ["In person, on campus", "Virtual", "Not sure yet"]},
}


def lp_form(c):
    """Two-step lead form: step 1 = two one-tap questions (+ optional date), step 2 = contact details."""
    o = LP_OPTIONS[c]

    def choices(name, opts):
        return "".join(f'<label class="choice"><input type="radio" name="{name}" value="{html.escape(v)}"><span>{html.escape(v)}</span></label>' for v in opts)

    return f'''<div class="lpf-card" id="lp-form" tabindex="-1">
          <div class="lpf-card__head">
            <h2 class="lpf-card__title">Check Alex's availability</h2>
            <span class="pulse-dot">Replies within one business day</span>
          </div>
          <form class="lpf" data-lp-form data-campaign="{c}" novalidate>
            <div class="lpf__progress" aria-live="polite"><span>Step <b data-step-num>1</b> of 2</span><span class="lpf__bar" aria-hidden="true"><i></i></span></div>
            <div class="lpf__step" data-step="1">
              <p class="lpf__q" id="q-org-{c}">Who's booking?</p>
              <div class="choices" role="radiogroup" aria-labelledby="q-org-{c}" data-group="org_type">{choices("org_type", o["org"])}</div>
              <p class="lpf__err" data-err="org_type">Choose one to continue.</p>
              <p class="lpf__q" id="q-fmt-{c}">Format</p>
              <div class="choices choices--3" role="radiogroup" aria-labelledby="q-fmt-{c}" data-group="format">{choices("format", o["format"])}</div>
              <p class="lpf__err" data-err="format">Choose one to continue.</p>
              <div class="field">
                <input id="lp-{c}-date" name="event_date" type="text" placeholder=" " autocomplete="off">
                <label for="lp-{c}-date">Event date or timeframe (optional)</label>
              </div>
              <input type="hidden" name="program" value="">
              <p class="lpf__program" data-program-note hidden>Program: <b></b></p>
              <button class="btn lpf__btn" type="button" data-next>Continue {ARROW_BTN}</button>
            </div>
            <div class="lpf__step" data-step="2" hidden>
              <div class="field">
                <input id="lp-{c}-name" name="name" type="text" placeholder=" " autocomplete="name" required>
                <label for="lp-{c}-name">Full name *</label>
                <p class="field__err">Please enter your name.</p>
              </div>
              <div class="field">
                <input id="lp-{c}-email" name="email" type="email" placeholder=" " autocomplete="email" inputmode="email" required>
                <label for="lp-{c}-email">Work email *</label>
                <p class="field__err">Please enter a valid email address.</p>
                <p class="lpf__hint" data-typo hidden>Did you mean <button type="button"></button>?</p>
              </div>
              <div class="field">
                <input id="lp-{c}-org" name="organization" type="text" placeholder=" " autocomplete="organization" required>
                <label for="lp-{c}-org">Organization *</label>
                <p class="field__err">Please enter your organization.</p>
              </div>
              <div class="field">
                <textarea id="lp-{c}-goal" name="goal" placeholder=" " rows="3"></textarea>
                <label for="lp-{c}-goal">What should your audience walk away with?</label>
              </div>
              <input class="lpf__hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
              <div class="lpf__actions">
                <button class="lpf__back" type="button" data-back>← Back</button>
                <button class="btn lpf__btn" type="submit" data-submit>Check availability {ARROW_BTN}</button>
              </div>
            </div>
            <p class="lpf__micro">{CHECK}<span>A reply within one business day with availability and a fee range. No obligation.</span></p>
            <p class="lpf__error" role="alert" hidden></p>
          </form>
        </div>'''


def quotes_pick(m):
    return QUOTES.replace('<div class="quotes" data-quotes></div>', f'<div class="quotes" data-quotes="{m.group(1)}"></div>')


def clients_row(m):
    label = {"sg": "Trusted by teams at <b>EDB Singapore</b>, Google, AWS and more",
             "he": "Trusted by <b>California State University</b>, the UT System and IEEE"}[m.group(1)]
    return f'''<section class="logos logos--paper" aria-label="Clients">
      <div class="container"><p class="logos__label">{label}</p></div>
      <div data-marquee="clients-{m.group(1)}" data-speed="46"></div>
    </section>'''


def lp_links(body):
    """On landing pages every program CTA stays on the page: glide to the form and pre-select the program."""
    return re.sub(r'href="work-with-alex\.html\?program=([^"]+)">(?:Ask about this talk|Ask about this format)',
                  lambda m: f'href="#lp-form" data-program="{html.escape(urllib.parse.unquote(m.group(1)))}">Request this program', body)


def build(page):
    src = (HERE / "pages" / page).read_text(encoding="utf-8")
    meta = json.loads(re.match(r"<!--meta(.*?)-->", src, re.S).group(1))
    body = re.sub(r"<!--meta.*?-->\s*", "", src, count=1, flags=re.S)

    form = lambda fid: P("form.html").replace("{{fid}}", fid)
    booking = P("booking.html").replace("{{booking_title}}", meta.get("booking_title", "Turn your next event into <em>AI and innovation action.</em>")) \
        .replace("{{booking_lead}}", meta.get("booking_lead", "These aren't just better ways to use ChatGPT, or create short-term buzz. This is what the most influential organizations on earth use to shape the future.")) \
        .replace("{{form}}", form("bk"))

    body = re.sub(r"\[\[FAQ(.*?)\]\]", faq_block, body, flags=re.S)
    body = re.sub(r"\{\{kn:(\w+)(:featured)?\}\}", lambda m: keynote(m.group(1), bool(m.group(2))), body)
    body = re.sub(r"\{\{form:(\w+)\}\}", lambda m: form(m.group(1)), body)
    body = re.sub(r"\{\{quotes:([\d,]+)\}\}", quotes_pick, body)
    body = re.sub(r"\{\{clients:(sg|he)\}\}", clients_row, body)
    if meta.get("layout") == "lp" and "{{lpform}}" in body:
        body = body.replace("{{lpform}}", lp_form(meta["campaign"]))
    for k, v in {"{{booking}}": booking, "{{press}}": PRESS, "{{clients}}": CLIENTS, "{{quotes}}": QUOTES,
                 "{{stats}}": STATS, "{{stats_section}}": STATS_SECTION, "{{why}}": WHY_SECTION,
                 "{{arrow}}": ARROW_BTN, "{{arrow_link}}": ARROW, "{{check}}": CHECK}.items():
        body = body.replace(k, v)
    body = re.sub(r"\{\{hero_media:(\w+)\}\}", lambda m: hero_media(m.group(1)), body)
    body = re.sub(r"\{\{alex:([\w-]+)\|([^}]*)\}\}", lambda m: alex(m.group(1), m.group(2)), body)
    body = re.sub(r"\{\{img:([\w-]+)\}\}", lambda m: IMG[m.group(1)], body)
    body = re.sub(r"\{\{steps:(\w+)\}\}", lambda m: steps(meta[m.group(1)]), body)
    body = re.sub(r'\{\{text:(\d+):([^|}]+)\|([^|}]+)\|([^|}]*)\|?(dark)?\}\}',
                  lambda m: textcard(m.group(1), m.group(2), m.group(3), [t for t in m.group(4).split(",") if t], bool(m.group(5))), body)

    head = P("head.html").replace("{{title}}", html.escape(meta["title"])).replace("{{desc}}", html.escape(meta["desc"])) \
        .replace("{{heroimg}}", IMG[meta["hero"] + "-tall"])         .replace("{{url}}", f"{SITE_URL}/{page.removesuffix('.html')}").replace("{{siteurl}}", SITE_URL)         .replace("{{ogimage}}", f"{SITE_URL}/assets/img/og/{page.replace('.html', '.jpg')}")         .replace("{{ogalt}}", html.escape(meta.get("og_alt", "Alex Goryachev, AI & innovation keynote speaker, on stage")))
    # logo inlined in the header so its three strokes can be "written" by site.js
    logo = (HERE.parent / "assets/img/logo.svg").read_text(encoding="utf-8").strip()
    logo = logo.replace("<svg ", '<svg class="logo-svg" role="img" aria-label="Alex Goryachev" width="184" height="54" ', 1)
    header = P("header.html").replace('<img src="assets/img/logo.svg" alt="Alex Goryachev" width="124" height="36">', logo)
    for key in ("speaking", "serve", "about"):
        attr = ""
        if meta.get("cur") == key:
            attr = ' aria-current="page"' if key != "serve" else ' data-active'
        header = header.replace("{{cur:%s}}" % key, attr)

    footer = P("footer.html")
    if meta.get("layout") == "lp":
        # ad landing page: no site nav, noindex, lead-form script, every CTA stays on the page
        header = P("lp-header.html").replace("{{logo}}", logo)
        footer = P("lp-footer.html")
        head = head.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">') \
                   .replace('<script defer src="assets/js/site.js"></script>', '<script defer src="assets/js/lp.js"></script>\n<script defer src="assets/js/site.js"></script>')
        body = lp_links(body)
        if 'id="lp-form"' not in body:   # e.g. the thank-you page: no form to glide to
            header = header.replace('href="#lp-form" data-magnetic>Check availability', 'href="speaking.html" data-magnetic>Visit the site')
            footer = re.sub(r'<div class="sticky-cta".*?</a>\s*</div>\s*', "", footer, flags=re.S)
        head = head.replace("<body>", f'<body class="is-lp" data-campaign="{meta.get("campaign", "")}" data-page="{page.removesuffix(".html")}">', 1)
    doc = head + header + '\n<main id="main">\n' + body.strip() + "\n</main>\n\n" + footer
    leftover = re.findall(r"\{\{[^}]+\}\}", doc)
    if leftover:
        raise SystemExit(f"{page}: unresolved {leftover}")
    (OUT / page).write_text(doc, encoding="utf-8")
    print(f"built {page}  {len(doc)//1024} KB")
    return meta


if __name__ == "__main__":
    indexed = []
    for p in sorted((HERE / "pages").glob("*.html")):
        if build(p.name).get("layout") != "lp":
            indexed.append(p.stem)
    # sitemap = indexable pages only (ad landing pages are noindex)
    urls = "".join(f"  <url><loc>{SITE_URL}/{s}</loc></url>\n" for s in indexed)
    (OUT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n", encoding="utf-8")
    print(f"sitemap.xml  {len(indexed)} urls")

/* ==========================================================================
   Ad landing pages: headline match, attribution, two-step lead form,
   Web3Forms submit and Meta Pixel events. Loaded only on "layout: lp" pages,
   before site.js (so the headline is swapped before GSAP splits it).
   ========================================================================== */
(() => {
  "use strict";

  /* ---- CONFIG: fill these in before the ads go live ---------------------- */
  const CONFIG = Object.assign({
    web3formsKey: "",          // free access key from https://web3forms.com (leads go to the email it's tied to)
    metaPixelId: "",           // e.g. "123456789012345" — leave empty and no pixel loads
    leadEmail: "booking@alexgoryachev.com",
    thankYou: "thank-you.html",
  }, window.LP_CONFIG || {});
  /* ------------------------------------------------------------------------ */

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const campaign = document.body.dataset.campaign || ($("[data-lp-form]")?.dataset.campaign) || new URLSearchParams(location.search).get("c") || "";

  /* ---- Headline match: ?h=<variant> picks from a whitelist (never raw URL text) ---- */
  const VARIANTS = {
    sg: {
      summit: ["The AI keynote your leadership summit <em>will still be talking about.</em>", "A practitioner's read on agentic AI for regional leadership teams — customised to your industry, in person in Singapore or virtual across APAC."],
      gov: ["Help your agency lead <em>the agentic AI shift.</em>", "Trusted by EDB Singapore. Independent, practitioner-led AI keynotes and briefings for public-sector leaders — no vendor to sell, no platform to push."],
      conference: ["A main-stage AI keynote <em>built for your delegates.</em>", "310+ keynotes on 6 continents, rebuilt every time from a pre-event survey of your actual audience — 98% of attendees would recommend him."],
      bureau: ["The AI speaker your clients book <em>on the first conversation.</em>", "$1.1B innovation portfolio, WSJ bestselling author, 98% recommendation score, zero vendor conflicts. Availability and a fee range within one business day."],
      virtual: ["A virtual AI keynote <em>for teams across APAC.</em>", "Produced for camera with live polling and Q&A, so distributed audiences participate — 45 to 75 minutes on any platform."],
    },
    he: {
      governance: ["Build AI governance <em>before the first agent goes live.</em>", "Decision rights, acceptable use and academic integrity — drawn from advising the California State University system across 22 campuses."],
      faculty: ["Bring your faculty <em>from AI debate to decisions.</em>", "Structured faculty dialogue and town halls that turn polarised conversation into action-ready recommendations for leadership."],
      leaders: ["AI strategy for presidents, provosts <em>and CIOs.</em>", "Independent, data-backed guidance from inside the largest AI deployment in academia — no platform to push, no vendor relationship."],
      keynote: ["An AI keynote for your convocation <em>or leadership retreat.</em>", "Data-backed talks built on real institutional experience — not trends, not vendor demos. In person on campus or virtual across APAC."],
    },
  };
  const variantKey = (params.get("h") || "").toLowerCase();
  const variant = VARIANTS[campaign] && Object.prototype.hasOwnProperty.call(VARIANTS[campaign], variantKey) ? variantKey : "default";
  if (variant !== "default") {
    const [h, lead] = VARIANTS[campaign][variant];
    const h1 = $("[data-variant-title]"), p = $("[data-variant-lead]");
    if (h1) h1.innerHTML = h;           // whitelisted constant, not user input
    if (p) p.textContent = lead;
  }

  /* ---- Background video: skip for reduced motion / data saver (poster shows instead) ---- */
  const bgv = $("[data-bg-video]");
  if (bgv) {
    const saveData = navigator.connection && navigator.connection.saveData;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || saveData) {
      bgv.removeAttribute("autoplay"); bgv.preload = "none"; bgv.pause();
    } else {
      const p = bgv.play(); if (p && p.catch) p.catch(() => {});   // some browsers need an explicit play() for muted autoplay
      // pause while off-screen to save battery
      if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { en.isIntersecting ? bgv.play().catch(() => {}) : bgv.pause(); }).observe(bgv);
    }
  }

  /* ---- Attribution: first touch per visit, so browsing first still credits the ad ---- */
  const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
  const store = (() => { try { return window.sessionStorage; } catch { return null; } })();
  let attr = {};
  try { attr = JSON.parse(store?.getItem("lp_attr") || "{}"); } catch { attr = {}; }
  const fresh = Object.fromEntries(ATTR_KEYS.filter((k) => params.get(k)).map((k) => [k, params.get(k).slice(0, 200)]));
  if (Object.keys(fresh).length || !attr.landing_url) {
    // a fresh ad click (new UTMs) resets the touch; otherwise keep the first landing of this visit
    const touch = { landing_url: location.href.split("#")[0], referrer: document.referrer || "(direct)" };
    attr = Object.keys(fresh).length ? Object.assign({}, touch, fresh) : Object.assign(touch, attr);
    try { store?.setItem("lp_attr", JSON.stringify(attr)); } catch {}
  }

  /* ---- Meta Pixel (only if an ID is set) ---- */
  const pixel = (...args) => { if (window.fbq) window.fbq(...args); };
  if (CONFIG.metaPixelId && !window.fbq) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.metaPixelId);
  }
  if (window.fbq) pixel("track", "PageView");
  const contentName = () => `${campaign || "lp"}:${variant}`;

  /* ---- Thank-you page: fire the deduplicated Lead once, then personalise the copy ---- */
  if (document.body.dataset.page === "thank-you") {
    let pending = null;
    try { pending = JSON.parse(store?.getItem("lp_lead") || "null"); store?.removeItem("lp_lead"); } catch {}
    if (pending) pixel("track", "Lead", { content_name: pending.content_name }, { eventID: pending.eventID });
    const c = params.get("c");
    $$("[data-c]").forEach((el) => { el.hidden = el.dataset.c !== c; });
    if (pending?.first) $$("[data-first-name]").forEach((el) => (el.textContent = ", " + pending.first));
    return;
  }

  const form = $("[data-lp-form]");
  if (!form) return;
  const steps = $$(".lpf__step", form);
  const stepNum = $("[data-step-num]", form);
  const card = form.closest(".lpf-card");
  let step = 1, step1Tracked = false;

  const showStep = (n) => {
    step = n;
    steps.forEach((s) => (s.hidden = +s.dataset.step !== n));
    stepNum.textContent = n;
    form.classList.toggle("is-step-2", n === 2);
    const first = $(`[data-step="${n}"] input:not([type=hidden]):not([type=checkbox]), [data-step="${n}"] textarea`, form);
    if (n === 2 && first) first.focus({ preventScroll: true });
    if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      gsap.fromTo($(`[data-step="${n}"]`, form), { x: n === 2 ? 28 : -28, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: "power3.out", clearProps: "transform,opacity" });
  };

  // program buttons anywhere on the page pre-select that program (site.js handles the glide)
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-program]");
    if (!b) return;
    const name = b.dataset.program;
    form.elements.program.value = name;
    const note = $("[data-program-note]", form);
    note.hidden = false; $("b", note).textContent = name;
    pixel("track", "ViewContent", { content_name: name, content_category: contentName() });
  });

  // step 1: both one-tap questions required, date optional
  const groupValid = (name) => {
    const ok = !!form.querySelector(`input[name="${name}"]:checked`);
    $(`[data-err="${name}"]`, form).classList.toggle("is-shown", !ok);
    return ok;
  };
  $$(".choices input", form).forEach((i) => i.addEventListener("change", () => $(`[data-err="${i.name}"]`, form).classList.remove("is-shown")));
  $("[data-next]", form).addEventListener("click", () => {
    const a = groupValid("org_type"), b = groupValid("format");
    if (!a || !b) return;
    if (!step1Tracked) { pixel("track", "Contact", { content_name: contentName() }); step1Tracked = true; }
    showStep(2);
  });
  $("[data-back]", form).addEventListener("click", () => showStep(1));

  // email typo guard for the most common domains
  const DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "live.com", "yahoo.com.sg", "singnet.com.sg"];
  const TYPOS = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmal.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com",
    "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "outlok.com": "outlook.com", "outloo.com": "outlook.com", "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "icloud.co": "icloud.com" };
  const email = form.elements.email, hint = $("[data-typo]", form);
  const checkTypo = () => {
    const v = email.value.trim(), at = v.lastIndexOf("@");
    const dom = at > 0 ? v.slice(at + 1).toLowerCase() : "";
    let fix = TYPOS[dom];
    if (!fix && dom && !DOMAINS.includes(dom) && /\.(con|cm|om|comm)$/.test(dom)) fix = dom.replace(/\.(con|cm|om|comm)$/, ".com");
    hint.hidden = !fix;
    if (fix) { const b = $("button", hint); b.textContent = v.slice(0, at + 1) + fix; b.onclick = () => { email.value = b.textContent; hint.hidden = true; email.focus(); }; }
  };
  email.addEventListener("blur", checkTypo);
  email.addEventListener("input", () => { if (!hint.hidden) checkTypo(); });

  const fieldValid = (input) => {
    const v = input.value.trim();
    const ok = input.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) : v.length > 1;
    input.closest(".field").classList.toggle("is-invalid", !ok);
    return ok;
  };
  $$("[data-step='2'] [required]", form).forEach((i) => i.addEventListener("input", () => i.closest(".field").classList.remove("is-invalid")));

  const errorBox = $(".lpf__error", form);
  const fail = (msg, mailto) => {
    errorBox.hidden = false;
    errorBox.innerHTML = "";
    errorBox.append(msg + " ");
    if (mailto) { const a = document.createElement("a"); a.href = mailto; a.textContent = "Email Alex's team instead"; errorBox.append(a, "."); }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (step === 1) { $("[data-next]", form).click(); return; }
    const req = $$("[data-step='2'] [required]", form);
    const bad = req.filter((i) => !fieldValid(i));
    if (bad.length) { bad[0].focus(); return; }
    if (form.elements.botcheck.checked) return;          // honeypot: bots tick it, people never see it

    const f = form.elements;
    const data = {
      name: f.name.value.trim(), email: f.email.value.trim(), organization: f.organization.value.trim(),
      org_type: form.querySelector("input[name=org_type]:checked")?.value || "", format: form.querySelector("input[name=format]:checked")?.value || "",
      event_date: f.event_date.value.trim(), program: f.program.value, goal: f.goal.value.trim(),
      campaign, headline_variant: variant, ...attr, page: location.href.split("#")[0],
    };
    const tag = campaign === "he" ? "[HE ad]" : "[SG ad]";
    const subject = `${tag} ${data.org_type} — ${data.organization} (${data.format})`;
    const summary = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
    const mailto = `mailto:${CONFIG.leadEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;

    if (!CONFIG.web3formsKey) {
      console.warn("[lp] Web3Forms key not set — falling back to email.");
      fail("This form isn't connected yet.", mailto);
      return;
    }
    const btn = $("[data-submit]", form);
    btn.disabled = true; btn.classList.add("is-loading"); errorBox.hidden = true;
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: CONFIG.web3formsKey, subject, from_name: "alexgoryachev.com — ad landing page", replyto: data.email, botcheck: false, ...data }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.status);
      const eventID = "lead-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      pixel("track", "Lead", { content_name: contentName() }, { eventID });
      try { store?.setItem("lp_lead", JSON.stringify({ eventID, content_name: contentName(), first: data.name.split(" ")[0] })); } catch {}
      location.href = `${CONFIG.thankYou}?c=${encodeURIComponent(campaign)}`;
    } catch (err) {
      btn.disabled = false; btn.classList.remove("is-loading");
      fail("Sorry, that didn't go through.", mailto);
    }
  });

  /* ---- Sticky phone CTA: shows after the hero, hides while the form is on screen ---- */
  const bar = $("[data-sticky-cta]");
  if (bar && "IntersectionObserver" in window) {
    let formVisible = true, pastHero = false;
    const sync = () => {
      const show = pastHero && !formVisible;
      bar.classList.toggle("is-shown", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      $("a", bar).tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([en]) => { formVisible = en.isIntersecting; sync(); }, { threshold: .15 }).observe(card);
    const hero = $(".hero");
    if (hero) new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; sync(); }).observe(hero);
  }
})();

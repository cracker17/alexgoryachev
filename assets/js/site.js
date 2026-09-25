/* ==========================================================================
   Alex Goryachev — shared site behaviour + GSAP scroll animations
   Logo, testimonial and press data live here so every page stays in sync.
   ========================================================================== */
(() => {
  "use strict";

  const CDN = "https://cdn.prod.website-files.com/66d7b904b20c8cdcd9ab2ce0/";
  const CDN2 = "https://cdn.prod.website-files.com/66ea01764bdbfc440be12eec/";

  const PRESS = [
    ["Inc. Magazine", "66eb53096d9ca40824990b6b_Inc.png"],
    ["Fast Company", "66eb5309cd6bbd8f5b73a4a3_FastCompany.png"],
    ["LinkedIn Top AI Voice", "6a0fbf34aabb3a3bcbe932a0_linkedin_badge_transparent.png"],
    ["CEO Magazine", "66eb5309c68ee40d92ae8467_CEC.png"],
    ["Entrepreneur", "66eb530a55403836555f0796_Entrepreneur.png"],
    ["Forbes", "66e0af18d8350621987d7171_Forbies.png"],
    ["TechCrunch", "66e8743ebcfdc8692a680f17_TechCrunch.png"],
    ["TEDx", "66e8743ecec0118e5c0609a9_tedx.png"],
    ["The Wall Street Journal", "66e8743eff827e1206907066_wsj.png"],
  ];

  const CLIENTS_A = [
    ["AMD", "6a3e04840c9a591dea3b0203_amd_logo.svg"],
    ["IBM", "6a3e041e67fdb4af12c01546_ibm_logo.svg"],
    ["Cisco", "6a3e03f167fdb4af12c00e4d_cisco_svg.svg"],
    ["Dell", "6a3e03bbab331afa48db2284_dell_logo.svg"],
    ["Coca-Cola FEMSA", "6a3e031e0f46133177e9b1f5_coca-cola-femsa_logo.svg"],
    ["EDB Singapore", "6a3e024c6c2af494c94a9af9_edb-singapore_logo.svg"],
    ["Amgen", "66e89d54282cc26be3a01bfa_AMGEN.png"],
    ["Disney", "66e89d5428b98b04385f24ce_disney.png"],
    ["ADNOC", "66e89d55f531d3dbacb2a37f_image%2012.png"],
    ["ISO", "6a3e09a357451e4a90f2ebb9_iso_logo.svg"],
    ["Japan Patent Office", "6a3e0963116ce8f8f1673127_jpo_logo.svg"],
    ["Pfizer", "6a3e04ae15067d2f5a631587_pfizer_logo.svg"],
    ["SIDF", "66e89d55e0760f18fc7842a0_SIEF.png"],
  ];
  const CLIENTS_B = [
    ["Visa", "66e89d551486f5e06ac822b2_Visa.png"],
    ["Wells Fargo", "66e89d55bfd09628f43f4e40_Wells_Fargo.png"],
    ["Bosch", "6a3e0206454e17c7868da26e_bosch-logo.svg"],
    ["SHRM", "677c43608de6309f9d557e36_shrm.png"],
    ["Rotary", "6a3e09f1f3f8b5c3e7bef40a_rotary_logo.svg"],
    ["Google", "6a3e0ad7f3f8b5c3e7bf2f5e_google_logo.svg"],
    ["AWS", "6a3e0a29e6075a01c4bb7244_aws_logo.svg"],
    ["Caterpillar", "6a3e0df0e8123d58d7624083_cat_logo.svg"],
    ["Microsoft", "6a04a48f4836552bd6da4392_Microsoft_logo_(2012).svg.webp"],
    ["ServiceNow", "6a3e0bca8d1e92a7e6d4b7e5_servicenow_logo.svg"],
    ["Ciena", "6a3e0c1aba5377b3a587d039_ciena_logo.svg"],
    ["California State University", "6a3e0d3ce6075a01c4bd22b2_csu_logo.svg"],
    ["Zoho", "6a3e0b3dba5377b3a5878738_zoho_logo.svg"],
    ["IEEE", "6a04a28d50c15bf9b1394edc_ieee-logo.png"],
  ];

  const QUOTES = [
    ["Alex’s keynote was the highlight of the event.", "Amazon Web Services", "6857247daae4ad43b007c73b_aws.png"],
    ["Alex speaks like someone who has actually led transformation at scale — because he has.", "Bosch", "6a04a24b339e9cdc1ee8f768_Bosch_logo.png"],
    ["Most universities are still preparing students for a world that no longer exists. Alex made that impossible to ignore.", "IEEE", "6a04a28d50c15bf9b1394edc_ieee-logo.png"],
    ["For the first time, people across the organization felt like their ideas truly mattered — and within days, teams were already taking action and building new solutions together.", "ServiceNow", "6a1095e1a909753287fb8aaa_servicenow.svg"],
    ["Alex created the kind of tension leadership teams need — forcing us to confront hard questions about the future of work and whether we are adapting fast enough.", "University of Texas System", "6a10964fe4c069f0af7990ce_UofTsystem_seal.svg.png"],
    ["Alex has a rare ability to challenge how leaders think — and do it in a way that inspires alignment, not defensiveness. Our executive team left with clarity, urgency, and a shared vision for how to lead in the age of AI.", "Disney", "6857244cd421d169784524b3_disney.png"],
  ];

  const root = document.documentElement;
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = reduceMQ.matches;
  if (reduced) root.classList.add("reduced");
  const hasGSAP = typeof window.gsap !== "undefined";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

  /* ------------------------------------------------------------------ */
  /* Build shared blocks                                                 */
  /* ------------------------------------------------------------------ */
  function buildMarquees() {
    $$("[data-marquee]").forEach((el) => {
      const type = el.dataset.marquee;
      const list = type === "press" ? PRESS : type === "clients-a" ? CLIENTS_A : CLIENTS_B;
      const boxed = type !== "press";
      const items = list.map(([alt, file]) => {
        const img = `<img src="${CDN}${file}" alt="${esc(alt)}" loading="lazy" decoding="async" width="132" height="32">`;
        return `<li class="marquee__item">${boxed ? `<span>${img}</span>` : img}</li>`;
      }).join("");
      el.classList.add("marquee", boxed ? "marquee--clients" : "marquee--press");
      el.innerHTML = `<ul class="marquee__track">${items}</ul><ul class="marquee__track" aria-hidden="true">${items}</ul>`;
      el.setAttribute("role", "region");
      el.setAttribute("aria-label", type === "press" ? "Featured in" : "Clients");
    });
  }

  function buildQuotes() {
    $$("[data-quotes]").forEach((el) => {
      const cards = QUOTES.map(([q, org, file], i) => `
        <figure class="quote" id="q-${i}" aria-roledescription="slide" aria-label="${i + 1} of ${QUOTES.length}">
          <div class="quote__mark" aria-hidden="true">“</div>
          <blockquote>${esc(q)}</blockquote>
          <figcaption><span><strong>${esc(org)}</strong>Event client</span></figcaption>
        </figure>`).join("");
      const dots = QUOTES.map((_, i) => `<button type="button" aria-label="Show testimonial ${i + 1}"></button>`).join("");
      el.innerHTML = `
        <div class="quotes__track" tabindex="0" aria-label="Testimonials">${cards}</div>
        <div class="quotes__controls">
          <div class="quotes__dots">${dots}</div>
          <div class="quotes__arrows">
            <button class="round-btn" type="button" data-dir="-1" aria-label="Previous testimonial"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button class="round-btn" type="button" data-dir="1" aria-label="Next testimonial"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>
          </div>
        </div>`;
      initCarousel(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Carousel: native scroll-snap + pointer drag + autoplay              */
  /* ------------------------------------------------------------------ */
  function initCarousel(el) {
    const track = $(".quotes__track", el);
    const slides = $$(".quote", track);
    const dots = $$(".quotes__dots button", el);
    let index = 0, timer = null, paused = false;

    const go = (i, smooth = true) => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: smooth ? "smooth" : "auto" });
      mark();
    };
    const mark = () => dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
    const restart = () => {
      clearInterval(timer);
      if (reduced) return;
      // re-trigger the dot progress animation
      dots.forEach((d) => d.removeAttribute("aria-current"));
      requestAnimationFrame(() => requestAnimationFrame(mark));
      timer = setInterval(() => { if (!paused) go(index + 1); }, 6000);
    };

    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); restart(); }));
    $$("[data-dir]", el).forEach((b) => b.addEventListener("click", () => { go(index + +b.dataset.dir); restart(); }));

    // sync index when the user scrolls/swipes
    let sT;
    track.addEventListener("scroll", () => {
      clearTimeout(sT);
      sT = setTimeout(() => {
        const x = track.scrollLeft;
        let best = 0, bd = Infinity;
        slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - x); if (d < bd) { bd = d; best = i; } });
        if (best !== index) { index = best; mark(); }
      }, 90);
    }, { passive: true });

    // mouse drag (touch uses native scrolling)
    let down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
      track.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startL - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false; track.classList.remove("is-dragging");
      if (moved) {
        const x = track.scrollLeft;
        let best = 0, bd = Infinity;
        slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - track.offsetLeft - x); if (d < bd) { bd = d; best = i; } });
        go(best); restart();
      }
    });

    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); restart(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); restart(); }
    });

    const setPaused = (p) => { paused = p; el.classList.toggle("is-paused", p); };
    el.addEventListener("mouseenter", () => setPaused(true));
    el.addEventListener("mouseleave", () => setPaused(false));
    el.addEventListener("focusin", () => setPaused(true));
    el.addEventListener("focusout", () => setPaused(false));
    document.addEventListener("visibilitychange", () => setPaused(document.hidden));

    // only autoplay while on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { if (en.isIntersecting) restart(); else clearInterval(timer); }, { threshold: .3 }).observe(el);
    }
    mark();
  }

  /* ------------------------------------------------------------------ */
  /* Header: scroll state, dropdowns, mobile menu                        */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    // header stays pinned; it only gains the frosted bar once the page scrolls
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // dropdowns: hover on fine pointers, tap-to-open on touch, Escape closes
    const canHover = window.matchMedia("(hover: hover)").matches;
    $$(".nav__item[data-dropdown]", header).forEach((item) => {
      const btn = $(".nav__link", item);
      const open = (v) => { item.classList.toggle("is-open", v); btn.setAttribute("aria-expanded", v ? "true" : "false"); };
      let t;
      item.addEventListener("mouseenter", () => { clearTimeout(t); $$(".nav__item.is-open", header).forEach((o) => o !== item && o.classList.remove("is-open")); open(true); });
      item.addEventListener("mouseleave", () => { t = setTimeout(() => open(false), 160); });
      btn.addEventListener("click", (e) => {
        const isOpen = item.classList.contains("is-open");
        // links navigate on hover devices (menu already open) or on a second tap
        if (btn.tagName === "A" && (canHover || isOpen)) return;
        e.preventDefault();
        open(!isOpen);
      });
      item.addEventListener("focusin", () => open(true));
      item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) open(false); });
      item.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); btn.focus(); } });
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".nav__item[data-dropdown]")) $$(".nav__item.is-open").forEach((o) => { o.classList.remove("is-open"); $(".nav__link", o).setAttribute("aria-expanded", "false"); }); });

    const toggle = $(".nav__toggle");
    const menu = $(".mobile-menu");
    if (toggle && menu) {
      const set = (v) => {
        root.classList.toggle("menu-open", v);
        toggle.setAttribute("aria-expanded", v ? "true" : "false");
        toggle.setAttribute("aria-label", v ? "Close menu" : "Open menu");
        menu.setAttribute("aria-hidden", v ? "false" : "true");
        if (v && hasGSAP && !reduced) gsap.fromTo($$(".mobile-menu__group, .mobile-menu .btn", menu), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7, ease: "power3.out", delay: .15 });
      };
      toggle.addEventListener("click", () => set(!root.classList.contains("menu-open")));
      $$("a", menu).forEach((a) => a.addEventListener("click", () => set(false)));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("menu-open")) { set(false); toggle.focus(); } });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Tabs (with URL hash support: #keynotes / #workshops / #virtual)     */
  /* ------------------------------------------------------------------ */
  function initTabs() {
    $$("[data-tabs]").forEach((wrap) => {
      const btns = $$('[role="tab"]', wrap);
      const panels = btns.map((b) => document.getElementById(b.getAttribute("aria-controls")));
      const list = $('[role="tablist"]', wrap);
      const pill = $(".tabs__pill", wrap);
      const movePill = (b) => { if (!pill) return; pill.style.width = b.offsetWidth + "px"; pill.style.transform = `translateX(${b.offsetLeft}px)`; };
      const select = (i, focus = false, fromHash = false) => {
        btns.forEach((b, j) => {
          const on = i === j;
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.tabIndex = on ? 0 : -1;
          panels[j].hidden = !on;
        });
        movePill(btns[i]);
        if (focus) btns[i].focus();
        if (hasGSAP && !reduced && !fromHash) {
          gsap.fromTo($$(".card, .move, .quote", panels[i]), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .8, ease: "power3.out" });
        }
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      };
      btns.forEach((b, i) => {
        b.addEventListener("click", () => { select(i); history.replaceState(null, "", "#" + b.dataset.hash); });
        b.addEventListener("keydown", (e) => {
          const k = e.key;
          if (k === "ArrowRight" || k === "ArrowLeft") { e.preventDefault(); select((i + (k === "ArrowRight" ? 1 : -1) + btns.length) % btns.length, true); }
          if (k === "Home") { e.preventDefault(); select(0, true); }
          if (k === "End") { e.preventDefault(); select(btns.length - 1, true); }
        });
      });
      const fromHash = () => {
        const h = location.hash.slice(1);
        const i = btns.findIndex((b) => b.dataset.hash === h);
        if (i > -1) { select(i, false, true); setTimeout(() => wrap.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), 60); }
      };
      window.addEventListener("hashchange", fromHash);
      window.addEventListener("resize", () => movePill(btns.find((b) => b.getAttribute("aria-selected") === "true")));
      document.fonts && document.fonts.ready.then(() => movePill(btns.find((b) => b.getAttribute("aria-selected") === "true")));
      const initial = btns.findIndex((b) => b.dataset.hash === location.hash.slice(1));
      select(initial > -1 ? initial : 0, false, true);
      if (initial > -1) setTimeout(() => wrap.scrollIntoView(), 50);
      if (list) list.setAttribute("aria-orientation", "horizontal");
    });
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                       */
  /* ------------------------------------------------------------------ */
  function initFaq() {
    $$(".faq").forEach((faq) => {
      $$(".faq__q", faq).forEach((q) => {
        q.addEventListener("click", () => {
          const open = q.getAttribute("aria-expanded") === "true";
          $$(".faq__q", faq).forEach((o) => { o.setAttribute("aria-expanded", "false"); o.closest(".faq__item").classList.remove("is-open"); });
          q.setAttribute("aria-expanded", open ? "false" : "true");
          q.closest(".faq__item").classList.toggle("is-open", !open);
          if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 520);
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Horizontal accordion (formats)                                      */
  /* ------------------------------------------------------------------ */
  function initHAccord() {
    $$(".haccord").forEach((wrap) => {
      const items = $$(".haccord__item", wrap);
      const activate = (it) => {
        items.forEach((o) => { o.classList.toggle("is-active", o === it); const b = $(".haccord__btn", o); if (b) b.setAttribute("aria-expanded", o === it ? "true" : "false"); });
      };
      items.forEach((it) => {
        const b = $(".haccord__btn", it);
        b && b.addEventListener("click", () => activate(it));
        if (window.matchMedia("(hover: hover) and (min-width: 901px)").matches) it.addEventListener("mouseenter", () => activate(it));
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Booking forms (front-end only — wire to your form backend)          */
  /* ------------------------------------------------------------------ */
  function initForms() {
    const params = new URLSearchParams(location.search);
    const program = params.get("program");
    $$("[data-booking]").forEach((card) => {
      const form = $("form", card);
      if (!form) return;
      const msg = form.elements.message;
      if (program && msg && !msg.value) msg.value = `I'd like to ask about "${program}" for our event.`;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        $$(".field", form).forEach((f) => {
          const input = $("input, textarea", f);
          if (!input || !input.required) return;
          const valid = input.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()) : input.value.trim().length > 1;
          f.classList.toggle("is-invalid", !valid);
          if (!valid && ok) { input.focus(); ok = false; }
        });
        if (!ok) return;
        const name = (form.elements.name.value || "").trim().split(" ")[0];
        const who = $("[data-first-name]", card);
        if (who) who.textContent = name ? `, ${name}` : "";
        card.classList.add("is-sent");
        const s = $(".form-success", card);
        s && s.focus();
        if (hasGSAP && !reduced) gsap.from($$(".form-success > *", card), { y: 20, opacity: 0, stagger: .08, duration: .7, ease: "power3.out" });
      });
      $$("input, textarea", form).forEach((i) => i.addEventListener("input", () => i.closest(".field").classList.remove("is-invalid")));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Card spotlight glow                                                 */
  /* ------------------------------------------------------------------ */
  function initGlow() {
    $$(".card--glow").forEach((c) => c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Counters (text fallback if GSAP missing)                            */
  /* ------------------------------------------------------------------ */
  function formatNum(v, el) {
    const d = +(el.dataset.decimals || 0);
    const n = d ? v.toFixed(d) : Math.round(v).toLocaleString("en-US");
    return (el.dataset.prefix || "") + n + (el.dataset.suffix || "");
  }

  /* ------------------------------------------------------------------ */
  /* GSAP                                                                 */
  /* ------------------------------------------------------------------ */
  function initMotion() {
    if (!hasGSAP) { root.classList.add("reveal-all", "no-scrub"); return; }
    const plugins = [window.ScrollTrigger, window.SplitText].filter(Boolean);
    gsap.registerPlugin(...plugins);
    const ST = window.ScrollTrigger;
    const Split = window.SplitText;
    const mm = gsap.matchMedia();

    // Reduced motion: show everything, no scroll effects
    mm.add("(prefers-reduced-motion: reduce)", () => {
      root.classList.add("reveal-all", "no-scrub");
      $$("[data-count]").forEach((el) => (el.textContent = formatNum(+el.dataset.count, el)));
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* --- Scroll progress bar --- */
      const bar = $(".scroll-progress");
      if (bar && ST) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

      /* --- Hero intro --- */
      const hero = $(".hero");
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: .1 });
        const media = $(".hero__media img", hero);
        if (media) tl.fromTo(media, { scale: 1.18, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.2, ease: "power2.out" }, 0);
        const title = $(".hero__title", hero);
        const others = $$("[data-hero]", hero).filter((e) => e !== title);
        if (title && Split) {
          gsap.set(title, { opacity: 1 });
          const s = Split.create(title, { type: "lines,words", mask: "lines", linesClass: "split-line" });
          tl.from(s.words, { yPercent: 110, duration: 1.2, stagger: .045 }, .25);
        } else if (title) tl.fromTo(title, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, .25);
        tl.fromTo(others, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .1 }, .7);
        // gentle zoom on scroll (no vertical drift, so his head never slides out of the frame)
        if (media && ST) gsap.to(media, { scale: 1.06, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        const content = $(".hero__content", hero);
        if (content && ST && !hero.classList.contains("hero--split")) gsap.to(content, { y: -80, opacity: .2, ease: "none", scrollTrigger: { trigger: hero, start: "center center", end: "bottom top", scrub: true } });
      }
      setTimeout(() => root.classList.add("hero-done"), 50);

      if (!ST) { root.classList.add("reveal-all", "no-scrub"); return; }

      /* --- Split headings (line mask reveal) --- */
      $$("[data-split]").forEach((el) => {
        if (el.closest(".hero")) return;
        if (!Split) { gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }); return; }
        Split.create(el, {
          type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1.1, stagger: .09, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
        });
      });

      /* --- Generic reveals (batched) --- */
      gsap.set("[data-reveal]", { y: 48, opacity: 0 });
      ST.batch("[data-reveal]", {
        start: "top 90%", once: true,
        onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1, stagger: .09, ease: "power3.out", overwrite: true }),
      });
      // sideways entrances only where there's room; phones/tablets rise up instead (no page widening)
      const wideScreen = window.matchMedia("(min-width: 1001px)").matches;
      $$("[data-reveal-x]").forEach((el) => gsap.from(el, { x: wideScreen ? (el.dataset.revealX === "left" ? -40 : 40) : 0, y: wideScreen ? 0 : 40, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } }));
      $$("[data-scale-in]").forEach((el) => gsap.from(el, { scale: .92, opacity: 0, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } }));

      /* --- Parallax images --- */
      $$("[data-parallax]").forEach((img) => {
        const amt = +(img.dataset.parallax || 12);
        gsap.fromTo(img, { yPercent: -amt }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });

      /* --- Counters --- */
      $$("[data-count]").forEach((el) => {
        const obj = { v: 0 };
        const end = +el.dataset.count;
        el.textContent = formatNum(0, el);
        gsap.to(obj, { v: end, duration: 2.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => (el.textContent = formatNum(obj.v, el)) });
      });

      /* --- Sticky step lists: activate + rail --- */
      $$(".steps-list").forEach((list) => {
        const items = $$(".steps-list__item", list);
        const rail = $(".steps-list__rail i", list);
        if (rail) gsap.to(rail, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 65%", end: "bottom 60%", scrub: .4 } });
        // a single reading line at 55% of the viewport: exactly one row is lit at a time
        items.forEach((it) => ST.create({ trigger: it, start: "top 55%", end: "bottom 55%", toggleClass: { targets: it, className: "is-active" } }));
      });

      /* --- Scrubbed word-by-word quote --- */
      $$(".big-quote[data-scrub]").forEach((q) => {
        if (!Split) { root.classList.add("no-scrub"); return; }
        const s = Split.create(q, { type: "words", wordsClass: "w" });
        gsap.to(s.words, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: q, start: "top 80%", end: "bottom 45%", scrub: .5 } });
      });

      /* --- Marquee speed-up with scroll velocity --- */
      ST.create({
        start: 0, end: "max",
        onUpdate: (self) => {
          const v = Math.min(Math.abs(self.getVelocity()) / 900, 3);
          marqueeTweens.forEach((t) => { if (!t._hover) gsap.to(t, { timeScale: (t._dir) * (1 + v), duration: .3, overwrite: true, onComplete: () => gsap.to(t, { timeScale: t._dir, duration: 1.2 }) }); });
        },
      });

      /* --- Process line (work with alex) --- */
      $$(".process").forEach((p) => {
        const line = $(".process__line i", p);
        if (line) gsap.to(line, { scaleX: 1, ease: "none", scrollTrigger: { trigger: p, start: "top 75%", end: "top 30%", scrub: .5 } });
        gsap.from($$(".process__dot", p), { scale: 0, duration: .8, stagger: .2, ease: "back.out(2)", scrollTrigger: { trigger: p, start: "top 80%", once: true } });
      });

      /* --- Footer big word drift --- */
      const fw = $(".footer-word");
      if (fw) gsap.fromTo(fw, { xPercent: -42 }, { xPercent: -58, ease: "none", scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true } });
    });

    /* --- Desktop-only pins --- */
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)", () => {
      if (!ST) return;
      // Pins are created in page order (timeline sits above the framework on About);
      // out-of-order pins miscalculate their start and leave an empty spacer.
      // Horizontal timeline
      $$("[data-hscroll]").forEach((sec) => {
        const track = $(".timeline__track", sec);
        const bar = $(".timeline__bar i", sec);
        const dist = () => Math.max(0, track.scrollWidth - $(".timeline__viewport", sec).clientWidth);
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
        tl.to(track, { x: () => -dist(), ease: "none" }, 0);
        if (bar) tl.to(bar, { scaleX: 1, ease: "none" }, 0);
      });
      // Pinned framework: moves slide in one by one
      $$("[data-pin-framework]").forEach((sec) => {
        const moves = $$(".move", sec);
        const bars = $$(".framework-progress i", sec);
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=" + moves.length * 55 + "%", pin: true, scrub: .6, anticipatePin: 1 } });
        moves.forEach((m, i) => {
          tl.fromTo(m, { y: 140, opacity: 0, rotate: i % 2 ? 2 : -2 }, { y: 0, opacity: 1, rotate: 0, duration: 1, ease: "power2.out" }, i);
          if (bars[i]) tl.to(bars[i], { scaleX: 1, duration: 1, ease: "none" }, i);
        });
        tl.to({}, { duration: .4 });
      });
      ST.sort();
    });

    /* --- Magnetic buttons (fine pointers) --- */
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const handlers = [];
      $$("[data-magnetic]").forEach((b) => {
        const xTo = gsap.quickTo(b, "x", { duration: .5, ease: "power3.out" });
        const yTo = gsap.quickTo(b, "y", { duration: .5, ease: "power3.out" });
        const move = (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35); };
        const leave = () => { xTo(0); yTo(0); };
        b.addEventListener("pointermove", move); b.addEventListener("pointerleave", leave);
        handlers.push([b, move, leave]);
      });
      return () => handlers.forEach(([b, m, l]) => { b.removeEventListener("pointermove", m); b.removeEventListener("pointerleave", l); gsap.set(b, { x: 0, y: 0 }); });
    });

    // images loading late can change layout — refresh triggers once everything is in
    window.addEventListener("load", () => ST && ST.refresh());
  }

  /* ------------------------------------------------------------------ */
  /* Marquees (GSAP loop, CSS-free)                                      */
  /* ------------------------------------------------------------------ */
  const marqueeTweens = [];
  function initMarqueeMotion() {
    if (!hasGSAP || reduced) return;
    $$(".marquee").forEach((m) => {
      const tracks = $$(".marquee__track", m);
      const dir = m.dataset.direction === "right" ? -1 : 1;
      const speed = +(m.dataset.speed || 38); // seconds per loop
      const tween = gsap.fromTo(tracks, { xPercent: dir === 1 ? 0 : -100 }, { xPercent: dir === 1 ? -100 : 0, duration: speed, ease: "none", repeat: -1 });
      tween._dir = 1;
      marqueeTweens.push(tween);
      m.addEventListener("mouseenter", () => { tween._hover = true; gsap.to(tween, { timeScale: .12, duration: .6, overwrite: true }); });
      m.addEventListener("mouseleave", () => { tween._hover = false; gsap.to(tween, { timeScale: 1, duration: .8, overwrite: true }); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Logo: calligraphy draw. One pen line traces "Alex" → "G" →          */
  /* "oryachev" as a single continuous stroke, the ink floods in, a glare */
  /* sweeps across the letters, then it rests 30s and writes again.       */
  /* ------------------------------------------------------------------ */
  function initLogo() {
    const svg = $(".nav__logo .logo-svg");
    if (!svg) return;
    if (!hasGSAP || reduced) { svg.style.opacity = 1; return; }
    const NS = "http://www.w3.org/2000/svg";
    const CYAN = "#0ABBFF";
    const parts = $$("path", svg).map((p) => ({ p, b: p.getBBox(), len: p.getTotalLength() })).sort((a, b) => a.b.x - b.b.x);

    // glare: a white highlight band that lives only inside the letters (a gradient on <use> copies of the paths)
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `<linearGradient id="logo-glare" gradientUnits="userSpaceOnUse" x1="-75" y1="0" x2="-15" y2="0" gradientTransform="skewX(-20)">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    svg.prepend(defs);
    const shine = document.createElementNS(NS, "g");
    shine.setAttribute("fill", "url(#logo-glare)");
    shine.setAttribute("pointer-events", "none");
    parts.forEach((o, i) => {
      o.p.id = "logo-part-" + i;
      const u = document.createElementNS(NS, "use");
      u.setAttribute("href", "#" + o.p.id);
      shine.appendChild(u);
      // pen setup: outline stroke drawn with a dash, fill hidden until the line is complete
      o.p.style.stroke = CYAN;
      o.p.style.strokeWidth = ".55";
      o.p.style.strokeLinecap = "round";
      o.p.style.strokeLinejoin = "round";
      o.p.style.strokeDasharray = o.len;
    });
    svg.appendChild(shine);
    const grad = $("#logo-glare", svg);
    const glare = () => gsap.fromTo(grad, { attr: { x1: -75, x2: -15 } }, { attr: { x1: 170, x2: 230 }, duration: 1.2, ease: "power2.inOut", overwrite: true });

    const paths = parts.map((o) => o.p);
    const total = parts.reduce((t, o) => t + o.len, 0);
    const tl = gsap.timeline({ repeat: -1, delay: .25 });
    tl.set(paths, { strokeDashoffset: (i) => parts[i].len, fillOpacity: 0, strokeOpacity: 1 })
      .set(svg, { opacity: 1 });
    // one continuous line: each part's share of ~3.2s is proportional to its outline length
    parts.forEach((o) => tl.to(o.p, { strokeDashoffset: 0, duration: 3.2 * (o.len / total), ease: "none" }));
    tl.to(paths, { fillOpacity: 1, duration: .6, ease: "power2.out", stagger: .08 }, "-=0.15")
      .to(paths, { strokeOpacity: 0, duration: .6 }, "<")
      .add(glare, "-=0.1")
      .to(svg, { opacity: 0, duration: .5, ease: "power2.in" }, "+=30");   // rest 30s, then fade and rewrite

    // glare on hover too, once the name is written
    $(".nav__logo").addEventListener("mouseenter", () => { if (+paths[0].style.fillOpacity > .9) glare(); });
  }

  /* ------------------------------------------------------------------ */
  function boot() {
    buildMarquees();
    buildQuotes();
    initHeader();
    initLogo();
    initTabs();
    initFaq();
    initHAccord();
    initForms();
    initGlow();
    initMarqueeMotion();
    const start = () => initMotion();
    // wait for web fonts so SplitText measures real line breaks
    if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(start);
    else start();
    const y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

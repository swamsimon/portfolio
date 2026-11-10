/* =========================================================
   EDIT THESE THREE VALUES
   ========================================================= */
const CONFIG = {
  // Email is split in two so spam bots can't scrape it from the page source.
  emailUser: "swamyee.mya",
  emailDomain: "gmail.com",
  // Free contact form: sign up at formspree.io, create a form, paste its ID here
  // (the part after /f/ in the form URL). Leave as-is to fall back to the visitor's email app.
  formspreeId: "xkjjdjpj",
  // Lines that cycle in the hero
  typedLines: [
    "analysing logs in Splunk",
    "hunting through PCAPs in Wireshark",
    "building forensic timelines",
    "mapping findings to MITRE ATT&CK",
    "investigating digital evidence in Autopsy",
    "analysing Windows event logs",
    "investigating suspicious network traffic",
    "correlating security events across logs",
    "identifying indicators of compromise",
    "monitoring threats in SIEM platforms",
    "investigating phishing attempts",
    "analysing malware behaviour in sandboxes",
    "performing network reconnaissance with Nmap",
    "enumerating services and vulnerabilities",
    "conducting penetration testing in Kali Linux",
    "exploiting vulnerabilities in HTB labs",
    "hunting for persistence mechanisms",
    "examining registry and file system artefacts",
    "reconstructing user activity from digital evidence",
    "practising incident response techniques",
    "building detection rules for suspicious activity",
    "documenting findings and remediation steps",
    "strengthening my home cybersecurity lab",
    "learning through hands-on TryHackMe challenges"
  ],
};

document.documentElement.classList.remove("no-js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Footer year ---------- */
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

/* ---------- Avatar: fall back to initials if profile.jpg is missing ---------- */
const avatarImg = $("#avatarImg");
if (avatarImg) {
  const drop = () => avatarImg.remove();
  avatarImg.addEventListener("error", drop);
  if (avatarImg.complete && avatarImg.naturalWidth === 0) drop();
}

/* ---------- Progress bars (width set here so no inline styles are needed) ---------- */
$$("[data-progress]").forEach((el) => {
  const pct = Math.max(0, Math.min(100, Number(el.dataset.progress) || 0));
  el.style.width = pct + "%";
});

/* ---------- Email (assembled at runtime) ---------- */
const email = `${CONFIG.emailUser}@${CONFIG.emailDomain}`;
const emailLink = $("#emailLink");
if (emailLink) {
  emailLink.textContent = email;
  emailLink.href = `mailto:${email}`;
}

/* ---------- Mobile menu ---------- */
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
if (navToggle && navMenu) {
  const setOpen = (open) => {
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  navToggle.addEventListener("click", () => setOpen(!navMenu.classList.contains("is-open")));
  $$(".nav__link", navMenu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
}

/* ---------- Sticky nav shadow + active link ---------- */
const nav = $("#nav");
if (nav) {
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
const links = $$('.nav__link[href^="#"]');
const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
if (sections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ---------- Scroll reveal ---------- */
const reveals = $$(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  reveals.forEach((el) => io.observe(el));
}

/* ---------- Typed line in hero ---------- */
const typed = $("#typed");
if (typed) {
  const lines = CONFIG.typedLines;
  if (reduceMotion) {
    typed.textContent = lines[0];
  } else {
    let line = 0, char = 0, deleting = false;
    const tick = () => {
      const text = lines[line];
      char += deleting ? -1 : 1;
      typed.textContent = text.slice(0, char);
      let delay = deleting ? 28 : 55;
      if (!deleting && char === text.length) { deleting = true; delay = 1800; }
      else if (deleting && char === 0) { deleting = false; line = (line + 1) % lines.length; delay = 350; }
      setTimeout(tick, delay);
    };
    tick();
  }
}

/* ---------- Write-up filters ---------- */
const filters = $$(".filter");
const posts = $$(".post");
filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    const cat = btn.dataset.filter;
    filters.forEach((b) => b.classList.toggle("is-active", b === btn));
    posts.forEach((p) => {
      const show = cat === "all" || p.dataset.cat === cat;
      p.classList.toggle("is-hidden", !show);
      if (show) p.classList.add("is-visible");
    });
  })
);

/* ---------- Contact form ---------- */
const form = $("#contactForm");
const statusEl = $("#formStatus");
if (form && statusEl) {
  const say = (msg, cls) => { statusEl.textContent = msg; statusEl.className = "form__status " + (cls || ""); };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const from = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (data.get("_gotcha")) return; // bot filled the hidden field
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
      say("Please fill in your name, a valid email and a message.", "err");
      return;
    }

    // No Formspree ID yet: open the visitor's email app instead
    if (!CONFIG.formspreeId || CONFIG.formspreeId === "YOUR_FORM_ID") {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name}\n${from}`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      say("Opening your email app…", "ok");
      return;
    }

    say("Sending…");
    try {
      const res = await fetch(`https://formspree.io/f/${encodeURIComponent(CONFIG.formspreeId)}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say("Thanks, your message has been sent. I'll reply soon.", "ok");
    } catch {
      say("Something went wrong. Please email me directly instead.", "err");
    }
  });
}

/* ---------- Particle network background ---------- */
const canvas = $("#particles");
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dots = [], raf = 0;
  const LINK = 130;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.round((w * h) / 16000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,224,184,.7)";
      ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j];
        const dist = Math.hypot(d.x - o.x, d.y - o.y);
        if (dist < LINK) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y);
          ctx.strokeStyle = `rgba(0,224,184,${0.16 * (1 - dist / LINK)})`;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
  // Pause when the tab is hidden to save battery
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) draw();
  });
}

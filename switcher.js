/* Tool switcher — shared by every tool page and by index.html.
   To add a tool: create its .html page (copy the <header> block from an existing one,
   set data-tool on <div class="switcher">), then add an entry to TOOLS below.
   index.html reads this same list, so nothing else needs updating. */
(() => {
  const TOOLS = [
    {
      key: "resize", file: "resize.html", title: "Image Resizer", desc: "Bulk resize & compress",
      icon: '<rect x="3" y="8" width="13" height="13" rx="2"/><path d="M13 3h8v8M21 3l-8 8"/>',
    },
    {
      key: "frame", file: "frame.html", title: "Photo Framer", desc: "Instagram-ready frames",
      icon: '<rect x="5" y="2" width="14" height="20" rx="1.5"/><rect x="7.5" y="6" width="9" height="6" rx=".5"/><rect x="7.5" y="13" width="9" height="6" rx=".5"/>',
    },
    {
      key: "convert", file: "convert.html", title: "Image Converter", desc: "Any format to any format",
      icon: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
    },
  ];
  window.PHOTO_TOOLS = TOOLS;   // used by index.html

  // Inside index.html each tool runs as "tool.html?embed". Then the menu asks
  // index.html to swap the view instead of loading a new page.
  const embedded = new URLSearchParams(location.search).has("embed") && window.parent !== window;

  const host = document.querySelector(".switcher");
  if (!host) return;
  const current = host.dataset.tool;
  if (!embedded) { try { localStorage.setItem("phototools.tool", current); } catch (_) {} }

  const svg = (inner, size = 18, sw = 2) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

  host.innerHTML = `
    <button type="button" class="switch-btn" aria-haspopup="true" aria-expanded="false" title="Switch tool">
      ${svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', 16, 2.2)}
      <span class="lbl">Switch tool</span>
      <span class="chev">${svg('<path d="M6 9l6 6 6-6"/>', 14, 2.4)}</span>
    </button>
    <nav class="menu hidden" aria-label="Tools">
      ${TOOLS.map((t) => `
        <a href="index.html#${t.key}" data-key="${t.key}"${t.key === current ? ' aria-current="page"' : ""}>
          <span class="ico">${svg(t.icon)}</span>
          <span><b>${t.title}</b><small>${t.desc}</small></span>
          <span class="tick">${svg('<path d="M5 12l5 5 9-10"/>', 16, 2.6)}</span>
        </a>`).join("")}
    </nav>`;

  const btn = host.querySelector(".switch-btn"), menu = host.querySelector(".menu");
  const links = [...menu.querySelectorAll("a")];

  function open() {
    menu.classList.remove("hidden"); btn.setAttribute("aria-expanded", "true");
    (links.find((a) => a.hasAttribute("aria-current")) || links[0]).focus();
  }
  function close(refocus) {
    if (menu.classList.contains("hidden")) return;
    menu.classList.add("hidden"); btn.setAttribute("aria-expanded", "false");
    if (refocus) btn.focus();
  }
  btn.addEventListener("click", () => (menu.classList.contains("hidden") ? open() : close()));
  document.addEventListener("click", (e) => { if (!host.contains(e.target)) close(); });
  menu.addEventListener("keydown", (e) => {
    const i = links.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    else if (e.key === "Tab") close();
  });
  links.forEach((a) => a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;           // new tab / window: let the link work
    if (a.hasAttribute("aria-current")) { e.preventDefault(); close(true); return; }
    if (embedded) {
      e.preventDefault(); close();
      window.parent.postMessage({ type: "phototools:switch", key: a.dataset.key }, "*");
    }
  }));
})();

/* Tool switcher — shared by every tool page and by index.html.
   To add a tool: create its .html page (copy the <header> block from an existing one,
   set data-tool on <div class="switcher">), then add an entry to TOOLS below.
   index.html reads this same list, so nothing else needs updating. */
(() => {
  const TOOLS = [
    {
      key: "resize", file: "resize.html", title: "Image Resizer", short: "Resize", desc: "Bulk resize & compress",
      icon: '<rect x="3" y="8" width="13" height="13" rx="2"/><path d="M13 3h8v8M21 3l-8 8"/>',
    },
    {
      key: "frame", file: "frame.html", title: "Photo Framer", short: "Frame", desc: "Instagram-ready frames",
      icon: '<rect x="5" y="2" width="14" height="20" rx="1.5"/><rect x="7.5" y="6" width="9" height="6" rx=".5"/><rect x="7.5" y="13" width="9" height="6" rx=".5"/>',
    },
    {
      key: "convert", file: "convert.html", title: "Image Converter", short: "Convert", desc: "Any format to any format",
      icon: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
    },
  ];
  window.PHOTO_TOOLS = TOOLS;   // used by index.html

  // Inside index.html each tool runs as "tool.html?embed". Then the buttons ask
  // index.html to swap the view instead of loading a new page.
  const embedded = new URLSearchParams(location.search).has("embed") && window.parent !== window;

  const host = document.querySelector(".switcher");
  if (!host) return;
  const current = host.dataset.tool;
  if (!embedded) { try { localStorage.setItem("phototools.tool", current); } catch (_) {} }

  const svg = (inner, size = 18, sw = 2) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

  // One button per tool; the current tool is highlighted.
  host.innerHTML = `<nav class="tabs" aria-label="Tools">${TOOLS.map((t) => `
    <a class="tab" href="index.html#${t.key}" data-key="${t.key}" title="${t.desc}"${t.key === current ? ' aria-current="page"' : ""}>
      ${svg(t.icon, 16, 2.1)}<span class="full">${t.title}</span><span class="short">${t.short || t.title}</span>
    </a>`).join("")}
  </nav>`;

  host.querySelectorAll(".tab").forEach((a) => a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;           // new tab / window: let the link work
    if (a.hasAttribute("aria-current")) { e.preventDefault(); return; }
    if (embedded) {
      e.preventDefault();
      window.parent.postMessage({ type: "phototools:switch", key: a.dataset.key }, "*");
    }
  }));
})();

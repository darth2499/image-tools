/* "Save to Photos" on phones — shared by every tool page.
   Websites can't write to the photo library directly, so this opens the phone's share sheet
   with the finished images. On iPhone that sheet has "Save Image" / "Save N Images",
   which puts them straight into Photos (Android: Save to device / Photos).

   A tool uses it like this:
     if (PhotoSave.available) { ...show a "Save to Photos" button... }
     PhotoSave.save(async () => [{ name, blob }, ...])   // call from the button's click
     PhotoSave.clear()                                   // when settings change (drops a prepared batch)
     PhotoSave.canSave(mimeOrExt)                        // can Photos take this format? */
(() => {
  const ua = navigator.userAgent;
  const isPhone = /iPhone|iPad|iPod|Android/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);   // iPadOS reports as Mac
  let canShareFiles = false;
  try { canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.jpg", { type: "image/jpeg" })] })); } catch (_) {}

  const PHOTO_TYPES = { "image/jpeg": 1, "image/png": 1, "image/gif": 1, "image/heic": 1, "image/heif": 1, "image/webp": 1, "image/tiff": 1, "image/avif": 1 };
  const EXT_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", tif: "image/tiff", tiff: "image/tiff", avif: "image/avif", heic: "image/heic" };
  const typeOf = (x) => (x && x.includes("/") ? x : EXT_TYPES[String(x || "").replace(/^\./, "").toLowerCase()] || "");

  let pending = null;   // files prepared but not yet shared (the phone wanted a fresh tap)

  function toast(msg) {
    let el = document.getElementById("photosave-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "photosave-toast";
      el.setAttribute("role", "status");
      el.style.cssText = "position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);z-index:60;" +
        "max-width:calc(100vw - 32px);padding:10px 16px;border-radius:10px;background:var(--panel,#242321);color:var(--text,#ece8e2);" +
        "border:1px solid var(--accent,#e0672b);font:600 14px/1.35 system-ui,-apple-system,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);text-align:center";
      document.body.append(el);
    }
    el.textContent = msg; el.hidden = false;
    clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 4000);
  }

  async function share(files) {
    try {
      await navigator.share({ files });
      return "saved";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";        // closed the share sheet
      if (e && e.name === "NotAllowedError") {                    // took too long after the tap: ask for one more tap
        pending = files;
        toast(`${files.length === 1 ? "Your image is" : `${files.length} images are`} ready — tap Save to Photos again`);
        return "needs-tap";
      }
      throw e;
    }
  }

  window.PhotoSave = {
    available: isPhone && canShareFiles && typeof navigator.share === "function",
    canSave: (x) => !!PHOTO_TYPES[typeOf(x)],
    clear() { pending = null; },
    /** getFiles: async () => [{ name, blob }]. Resolves "saved" | "cancelled" | "needs-tap". */
    async save(getFiles) {
      if (pending) { const f = pending; pending = null; return share(f); }
      const list = await getFiles();
      if (!list || !list.length) return "cancelled";
      const files = list.map(({ name, blob }) => new File([blob], name, { type: blob.type || typeOf(name.split(".").pop()) }));
      return share(files);
    },
    toast,
  };
})();

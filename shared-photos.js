/* Shared photo list — keeps the same photos in every tool.
   When a tool runs inside index.html, adding, removing, clearing or reordering
   photos in one tool does the same in the others. index.html passes the messages
   along and remembers the list for tools that load later.
   Opened on its own (resize.html, frame.html) a tool just works by itself.

   A tool uses it like this:
     SharedPhotos.connect({ add(photos), remove(ids), clear(), order(ids) })  // changes made in other tools
     SharedPhotos.added([{ id, file }]) / removed(ids) / cleared() / reordered(ids)  // changes made here
     SharedPhotos.newId()  // id for a newly added photo */
(() => {
  const embedded = new URLSearchParams(location.search).has("embed") && window.parent !== window;
  let handlers = null;

  const post = (msg) => { if (embedded) window.parent.postMessage({ ...msg, sharedPhotos: true }, "*"); };

  window.addEventListener("message", (e) => {
    const d = e.data;
    if (!embedded || !handlers || e.source !== window.parent || !d || !d.sharedPhotos) return;
    const fn = handlers[d.type];
    if (typeof fn === "function") fn(d.type === "add" ? d.photos : d.ids);
  });

  window.SharedPhotos = {
    enabled: embedded,
    newId: () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)),
    connect(h) { handlers = h; post({ type: "hello" }); },
    added: (photos) => photos.length && post({ type: "add", photos }),
    removed: (ids) => ids.length && post({ type: "remove", ids }),
    cleared: () => post({ type: "clear" }),
    reordered: (ids) => post({ type: "order", ids }),
  };
})();

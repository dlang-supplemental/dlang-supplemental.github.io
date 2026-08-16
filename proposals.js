(() => {
  const root = document.querySelector("[data-proposals]");
  if (!root) return;

  const catalogUrl = root.getAttribute("data-catalog-url");
  const tag = (root.getAttribute("data-tag") || "proposal").toLowerCase();
  const list = root.querySelector("[data-proposals-list]");
  const status = root.querySelector("[data-proposals-status]");
  if (!list || !catalogUrl) return;

  const setStatus = (text) => {
    if (!status) return;
    status.hidden = !text;
    status.textContent = text || "";
  };

  setStatus("Loading proposals…");

  const render = (pages) => {
    const items = (pages || []).filter(
      (page) => Array.isArray(page.tags) && page.tags.includes(tag)
    );
    if (!items.length) {
      setStatus("No proposals are tagged yet.");
      return;
    }

    const frag = document.createDocumentFragment();
    for (const page of items) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = page.href || page.url;

      const name = document.createElement("span");
      name.className = "project-list__name";
      name.textContent = page.title;
      a.appendChild(name);

      if (page.description) {
        const desc = document.createElement("span");
        desc.className = "project-list__desc";
        desc.textContent = page.description;
        a.appendChild(desc);
      }

      li.appendChild(a);
      frag.appendChild(li);
    }

    list.replaceChildren(frag);
    setStatus("");
  };

  fetch(catalogUrl, { headers: { Accept: "application/json" } })
    .then((res) => {
      if (!res.ok) throw new Error(`catalog ${res.status}`);
      return res.json();
    })
    .then((catalog) => render(catalog.pages))
    .catch(() => {
      // Keep the static fallback already in the markup.
      setStatus("");
    });
})();

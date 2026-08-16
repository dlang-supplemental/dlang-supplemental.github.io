(() => {
  const roots = document.querySelectorAll("[data-catalog], [data-proposals]");
  if (!roots.length) return;

  roots.forEach((root) => {
    const catalogUrl =
      root.getAttribute("data-catalog-url") || window.__pageCatalogUrl;
    const tag = (root.getAttribute("data-tag") || "proposal").toLowerCase();
    const list = root.querySelector("[data-catalog-list], [data-proposals-list]");
    const status = root.querySelector(
      "[data-catalog-status], [data-proposals-status]"
    );
    const empty = root.getAttribute("data-empty") || "Nothing tagged yet.";
    if (!catalogUrl || !list) return;

    const setStatus = (text) => {
      if (!status) return;
      status.hidden = !text;
      status.textContent = text || "";
    };

    setStatus("Loading…");

    const render = (pages) => {
      const items = (pages || []).filter(
        (page) => Array.isArray(page.tags) && page.tags.includes(tag)
      );
      if (!items.length) {
        setStatus(empty);
        return;
      }

      const cards = list.classList.contains("project-list");
      const frag = document.createDocumentFragment();
      for (const page of items) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = page.href || page.url;
        if (cards) {
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
        } else {
          a.textContent = page.title;
          li.appendChild(a);
          if (page.description) {
            li.appendChild(document.createTextNode(" — " + page.description));
          }
          frag.appendChild(li);
          continue;
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
        setStatus("");
      });
  });
})();

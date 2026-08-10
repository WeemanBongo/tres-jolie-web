const container = document.getElementById('price-list');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Parst eine einzelne CSV-Zeile inkl. Quotes, Kommas und "" als Escaped-Quote.
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

fetch('/data/preisliste.csv')
  .then(res => {
    if (!res.ok) throw new Error('Preisliste konnte nicht geladen werden');
    return res.text();
  })
  .then(text => {
    const rows = text.trim().split('\n').slice(1);
    const categories = {};

    rows.forEach(row => {
      if (!row.trim()) return;

      const [category, categoryDesc, name, itemDesc, duration, price] = parseCsvLine(row);
      if (!category || !name) return;

      if (!categories[category]) {
        categories[category] = {
          description: categoryDesc || '',
          items: []
        };
      }

      categories[category].items.push({ name, itemDesc, duration, price });
    });

    const categoryNames = Object.keys(categories);
    if (categoryNames.length === 0) {
      container.innerHTML = '<p class="price-list-status">Aktuell ist keine Preisliste hinterlegt. Bitte kontaktiere uns direkt.</p>';
      return;
    }

    container.innerHTML = categoryNames.map(category => {
      const data = categories[category];

      const items = data.items.map(item => {
        const priceLabel = item.price ? `CHF ${escapeHtml(item.price)}` : 'auf Anfrage';
        return `
          <div class="price-item">
            <div class="price-text">
              <strong>${escapeHtml(item.name)}</strong>
              ${item.itemDesc ? `<div class="item-description">${escapeHtml(item.itemDesc)}</div>` : ``}
              ${item.duration ? `<div class="duration">⏱ ${escapeHtml(item.duration)}</div>` : ``}
            </div>
            <div class="price-value">${priceLabel}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="price-category">
          <h3>${escapeHtml(category)}</h3>
          ${data.description ? `<p class="category-description">${escapeHtml(data.description)}</p>` : ``}
          ${items}
        </div>
      `;
    }).join('');
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = '<p class="price-list-status">Die Preisliste konnte nicht geladen werden. Bitte versuche es später erneut oder kontaktiere uns direkt.</p>';
  });

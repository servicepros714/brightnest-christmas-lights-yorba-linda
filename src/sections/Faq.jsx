import { useState } from 'react';
import { FAQS } from '../config/site.js';
import Icon from '../components/Icon.jsx';

export default function Faq() {
  const [active, setActive] = useState(FAQS[0].id);

  const onKey = (e, i) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + FAQS.length) % FAQS.length;
    setActive(FAQS[next].id);
    document.getElementById('faq-tab-' + FAQS[next].id)?.focus();
  };

  return (
    <section id="faq" className="section section--cream">
      <div className="container">
        <header className="sec-head sec-head--split">
          <div>
            <p className="eyebrow" data-reveal="slide">
              FAQ
            </p>
            <h2 className="sec-title" data-reveal="slide">
              Good questions, straight answers
            </h2>
          </div>
        </header>

        <div className="faq">
          {/* Desktop: vertical tabs + answer panel */}
          <div className="faq__tabs" role="tablist" aria-orientation="vertical" aria-label="FAQ topics">
            {FAQS.map((f, i) => (
              <button
                key={f.id}
                id={'faq-tab-' + f.id}
                role="tab"
                type="button"
                className={'faq__tab' + (active === f.id ? ' is-active' : '')}
                aria-selected={active === f.id}
                aria-controls={'faq-panel-' + f.id}
                tabIndex={active === f.id ? 0 : -1}
                onClick={() => setActive(f.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="faq__tab-num">{String(i + 1).padStart(2, '0')}</span>
                {f.tab}
              </button>
            ))}
          </div>
          {FAQS.map((f) => (
            <div
              key={f.id}
              id={'faq-panel-' + f.id}
              role="tabpanel"
              aria-labelledby={'faq-tab-' + f.id}
              className="faq__panel"
              hidden={active !== f.id}
            >
              <h3 className="faq__q">{f.q}</h3>
              <p className="faq__a">{f.a}</p>
            </div>
          ))}

          {/* Mobile: accordion */}
          <div className="faq__acc">
            {FAQS.map((f) => (
              <details key={f.id} className="acc">
                <summary>
                  <span>{f.q}</span>
                  <Icon name="arrowRight" size={16} className="acc__chev" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

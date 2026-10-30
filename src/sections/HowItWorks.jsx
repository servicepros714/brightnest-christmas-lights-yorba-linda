import Icon from '../components/Icon.jsx';
import { DEPOSIT_LABEL } from '../lib/pricing.js';

const STEPS = [
  {
    icon: 'calendar',
    title: 'Book',
    text: `Pick your package, add-ons and an install window online. Hold it with a ${DEPOSIT_LABEL} deposit — or pay at the visit.`,
  },
  {
    icon: 'pencil',
    title: 'Design',
    text: 'We walk your rooflines with you, plan the layout and power, and confirm your final price on-site.',
  },
  {
    icon: 'ladder',
    title: 'Install',
    text: 'Our crew hangs commercial-grade LEDs along every line in your design and sets your timer.',
  },
  {
    icon: 'takedown',
    title: 'Takedown',
    text: 'After the holidays we take everything down. Add off-season storage and we keep it for next year.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section section--cream">
      <div className="container">
        <header className="sec-head sec-head--center">
          <p className="eyebrow" data-reveal="slide">
            How it works
          </p>
          <h2 className="sec-title" data-reveal="slide">
            From booking to takedown, handled
          </h2>
        </header>

        <div className="gables">
          <svg className="gables__string" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 8 Q125 34 250 8 T500 8 T750 8 T1000 8" />
          </svg>
          <ol className="gables__list">
            {STEPS.map((s, i) => (
              <li key={s.title} className="gable" data-reveal="rise" style={{ '--d': i }}>
                <div className="gable__roof" aria-hidden="true">
                  <span className="gable__num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="gable__body">
                  <span className="gable__icon">
                    <Icon name={s.icon} size={22} />
                  </span>
                  <h3 className="gable__title">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

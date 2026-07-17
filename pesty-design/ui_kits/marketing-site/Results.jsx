// Results / case studies — dark teal band with big result metrics
const { Stat, Button, Badge } = window.PestyMarketingDesignSystem_3e0158;

function Results() {
  const cases = [
    { client: 'Native Pest Management', value: '$100K', label: 'monthly ad spend saved after 6 months of SEO', icon: 'trending-up' },
    { client: "LaJaunie's Pest Control", value: '329', label: 'new recurring customers at a $72.04 CAC', icon: 'target' },
    { client: 'Reliant Pest Management', value: '$24.24', label: 'cost per qualified lead from SEO alone', icon: 'zap' },
  ];
  return (
    <section className="kit-results">
      <div className="pesty-container">
        <div className="kit-section__head kit-section__head--dark">
          <span className="eyebrow" style={{ color: 'var(--red-300)' }}>The receipts</span>
          <h2 className="kit-section__title" style={{ color: '#fff' }}>
            Results that lead to <span style={{ color: 'var(--red-400)' }}>domination &amp; celebration</span>
          </h2>
          <p className="kit-results__sub">
            Move fast toward your sales goals with smart, aggressive SEO and PPC. Beat your
            monthly targets — then take the team out to celebrate.
          </p>
        </div>
        <div className="kit-results__grid">
          {cases.map((c) => (
            <div className="kit-casecard" key={c.client}>
              <Badge variant="dark" size="sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>Case Study</Badge>
              <Stat value={c.value} label={c.label} icon={c.icon} onDark />
              <div className="kit-casecard__foot">
                <span className="kit-casecard__client">{c.client}</span>
                <Button variant="light" size="sm" iconRight="arrow-up-right">Read</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Results = Results;

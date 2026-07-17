// Services section — SEO, PPC, Web Design
const { Card, Icon, Button } = window.PestyMarketingDesignSystem_3e0158;

function Services() {
  const services = [
    { icon: 'trending-up', name: 'Pest control SEO', copy: 'We secure your position at the top—where the view is best.', link: 'Learn about SEO' },
    { icon: 'target', name: 'Pest control PPC', copy: 'Aggressive campaigns that capture and convert with precision.', link: 'Learn about PPC' },
    { icon: 'zap', name: 'Web Design', copy: 'Battle-tested designs tailored to conquer your market.', link: 'Learn about Web Design' },
  ];
  return (
    <section className="kit-section">
      <div className="pesty-container">
        <div className="kit-section__head">
          <span className="eyebrow">Masters of pest control marketing</span>
          <h2 className="kit-section__title">Everything you need to dominate your market</h2>
        </div>
        <div className="kit-services">
          {services.map((s) => (
            <Card key={s.name} interactive padding="lg" className="kit-service">
              <span className="kit-service__icon"><Icon name={s.icon} size={26} /></span>
              <h3 className="kit-service__name">{s.name}</h3>
              <p className="kit-service__copy">{s.copy}</p>
              <Button variant="ghost" size="sm" iconRight="arrow-right" className="kit-service__link">{s.link}</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Services = Services;

// Final CTA band + footer
const { Icon } = window.PestyMarketingDesignSystem_3e0158;

function CtaBand() {
  return (
    <section className="kit-cta">
      <div className="pesty-container kit-cta__inner">
        <h2 className="kit-cta__title">Your city's available.<br />Let's see if we're the fit.</h2>
        <p className="kit-cta__sub">In 15 minutes, we'll know if we can help you dominate your market.</p>
        <div className="kit-cta__form"><CityCheck /></div>
        <p className="kit-cta__meta">794 PCOs have checked their market recently</p>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="kit-footer">
      <div className="pesty-container kit-footer__grid">
        <div className="kit-footer__brand">
          <img src="../../assets/brand/pesty-logo-white.svg" alt="Pesty Marketing" />
          <p>SEO and PPC for ambitious pest control companies.</p>
        </div>
        <div className="kit-footer__col">
          <h4>Services</h4>
          <a href="#">Pest control SEO</a>
          <a href="#">Pest control PPC</a>
          <a href="#">Pest control web design</a>
        </div>
        <div className="kit-footer__col">
          <h4>Company</h4>
          <a href="#">Case studies</a>
          <a href="#">About us</a>
          <a href="#">Podcast</a>
        </div>
        <div className="kit-footer__col">
          <h4>Contact</h4>
          <a href="tel:8667920622"><Icon name="phone" size={15} /> (866) 792-0622</a>
          <a href="#"><Icon name="map-pin" size={15} /> 280 Madison Ave, NY 10016</a>
        </div>
      </div>
      <div className="pesty-container kit-footer__bottom">
        <span>© 2026 Pesty Marketing. All rights reserved.</span>
        <span>Privacy Policy · Terms of Service</span>
      </div>
    </footer>
  );
}
window.CtaBand = CtaBand;
window.SiteFooter = SiteFooter;

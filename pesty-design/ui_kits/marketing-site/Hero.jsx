// Hero section
const { Badge, Tag } = window.PestyMarketingDesignSystem_3e0158;

function Hero() {
  return (
    <section className="kit-hero" id="top">
      <div className="pesty-container kit-hero__grid">
        <div className="kit-hero__copy">
          <Badge variant="soft" size="md">★ Built exclusively for pest control</Badge>
          <h1 className="kit-hero__title">The #1 pest control <span>marketing partner</span></h1>
          <p className="kit-hero__lead">
            SEO &amp; PPC for ambitious pest control companies. We empower operators to
            grow and scale with control, clarity, and confidence.
          </p>
          <div className="kit-hero__tags">
            <Tag icon="shield-check">Trusted by PCT Top 100</Tag>
            <Tag icon="trending-up">100,000+ qualified leads</Tag>
          </div>
          <div className="kit-hero__form">
            <p className="kit-hero__formlabel">Start with your local market</p>
            <CityCheck />
          </div>
        </div>

        <div className="kit-hero__media">
          <div className="kit-hero__blob"></div>
          <image-slot
            id="pesty-hero-ceo"
            class="kit-hero__photo"
            shape="rounded"
            radius="20"
            placeholder="Drop CEO / team photo"
          ></image-slot>
          <div className="kit-hero__floatcard">
            <span className="kit-hero__floatfig">+30%</span>
            <span className="kit-hero__floatcap">YoY growth, year over year</span>
          </div>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;

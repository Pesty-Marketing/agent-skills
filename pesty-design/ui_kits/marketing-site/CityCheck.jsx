// Interactive "check your local market" lead form — Pesty's signature CTA.
const { Button, Input, Icon } = window.PestyMarketingDesignSystem_3e0158;

function CityCheck({ onDark = false, compact = false }) {
  const [city, setCity] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (city.trim()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`kit-citycheck kit-citycheck--done ${onDark ? 'on-dark' : ''}`}>
        <span className="kit-citycheck__badge"><Icon name="shield-check" size={18} /></span>
        <div>
          <p className="kit-citycheck__title">Good news — <strong>{city}</strong> is available.</p>
          <p className="kit-citycheck__sub">We only work with one pest control company per city. Let's book your discovery call.</p>
        </div>
        <Button variant="primary" size="md" iconRight="arrow-right" onClick={() => setSubmitted(false)}>Book my call</Button>
      </div>
    );
  }

  return (
    <form className={`kit-citycheck ${onDark ? 'on-dark' : ''} ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <div className="kit-citycheck__field">
        <Input
          icon="map-pin"
          placeholder="Enter your city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="City"
        />
      </div>
      <Button type="submit" variant="primary" size="md" iconRight="search">Search now</Button>
    </form>
  );
}
window.CityCheck = CityCheck;

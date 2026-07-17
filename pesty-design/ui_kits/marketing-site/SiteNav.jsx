// Pesty marketing site — top navigation
const { Button, IconButton, Icon } = window.PestyMarketingDesignSystem_3e0158;

function SiteNav({ onNav }) {
  const [open, setOpen] = React.useState(false);
  const links = ['Case Studies', 'About', 'Services', 'Learn', 'Contact'];
  return (
    <header className="kit-nav">
      <div className="kit-nav__bar pesty-container">
        <a className="kit-nav__logo" href="#top" onClick={() => onNav && onNav('top')}>
          <img src="../../assets/brand/pesty-logo.svg" alt="Pesty Marketing" />
        </a>
        <nav className="kit-nav__links">
          {links.map((l) => (
            <a key={l} href="#" onClick={(e) => { e.preventDefault(); }}>
              {l}
            </a>
          ))}
        </nav>
        <div className="kit-nav__actions">
          <a className="kit-nav__phone" href="tel:8556240247">
            <Icon name="phone" size={16} /> (855) 624-0247
          </a>
          <Button size="sm" variant="primary" iconRight="arrow-right">Check your market</Button>
        </div>
        <div className="kit-nav__mobile">
          <IconButton icon={open ? 'x' : 'menu'} label="Menu" variant="ghost" onClick={() => setOpen(!open)} />
        </div>
      </div>
      {open && (
        <div className="kit-nav__drawer pesty-container">
          {links.map((l) => <a key={l} href="#" onClick={(e) => { e.preventDefault(); setOpen(false); }}>{l}</a>)}
          <Button size="md" full variant="primary" iconRight="arrow-right">Check your market</Button>
        </div>
      )}
    </header>
  );
}
window.SiteNav = SiteNav;

// Trust bar — client logo cloud (text wordmarks as placeholders for real logos)
function TrustBar() {
  const clients = ['Rowland', 'Native Pest', "Wayne's", 'Pest Pros of MI', "LaJaunie's", 'Reliant'];
  return (
    <section className="kit-trust">
      <div className="pesty-container">
        <p className="kit-trust__label">Trusted by the operators serious about growth</p>
        <div className="kit-trust__row">
          {clients.map((c) => (
            <span className="kit-trust__logo" key={c}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
window.TrustBar = TrustBar;

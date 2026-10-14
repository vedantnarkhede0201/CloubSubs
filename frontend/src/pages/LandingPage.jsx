import { Link } from 'react-router-dom';

const highlights = [
  { number: '01', title: 'Customer records', text: 'Keep client details, renewals and service relationships together.' },
  { number: '02', title: 'Subscription billing', text: 'Understand plan assignments, invoices and payment activity.' },
  { number: '03', title: 'Usage visibility', text: 'Review user and storage usage for every active service.' }
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link className="brand" to="/" aria-label="CloudSubs home">
          <span className="brand-mark" aria-hidden="true">C</span><span>cloudsubs<span className="brand-period">.</span></span>
        </Link>
        <nav aria-label="Landing page navigation">
          <Link to="/login">Sign in to workspace <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="hero-kicker"><span aria-hidden="true" /> SAAS BILLING, MADE CLEAR</span>
            <h1>Subscriptions in sync.<br /><span>Business in focus.</span></h1>
            <p>One considered workspace to manage SaaS clients, plans, billing and service usage—connected to your CloudSubs database.</p>
            <div className="hero-actions">
              <Link to="/login" className="button button-primary button-large">Sign in to workspace <span aria-hidden="true">→</span></Link>
              <Link to="/clients" className="button button-quiet button-large">Explore records</Link>
            </div>
            <div className="hero-footnote"><span className="live-dot" /> Connected to your billing workspace</div>
          </div>
          <div className="hero-visual" aria-label="Illustration of the CloudSubs administration dashboard">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="mini-dashboard">
              <div className="mini-top"><span className="mini-brand"><i /> cloudsubs</span><span className="mini-avatar">CS</span></div>
              <div className="mini-greeting"><small>OVERVIEW</small><strong>Good morning</strong><span>Your business at a glance.</span></div>
              <div className="mini-flow" aria-label="CloudSubs data flow">
                <div className="mini-flow-node"><span aria-hidden="true">◉</span><div><b>Customer records</b><small>CLIENT · SUBSCRIPTION</small></div></div>
                <div className="mini-flow-node"><span aria-hidden="true">◇</span><div><b>Billing records</b><small>INVOICE · PAYMENT</small></div></div>
                <div className="mini-flow-node"><span aria-hidden="true">⌁</span><div><b>Service usage</b><small>USAGE RECORDS</small></div></div>
              </div>
              <div className="mini-record"><span className="record-symbol">◈</span><div><b>Plans, clients, billing</b><small>All connected in one place</small></div><span>→</span></div>
            </div>
            <div className="floating-stamp"><span>CS</span><small>YOUR BILLING<br />WORKSPACE</small></div>
          </div>
        </section>
        <section className="landing-highlights" aria-labelledby="highlights-title">
          <div className="highlight-intro"><p className="eyebrow">THE WORKSPACE</p><h2 id="highlights-title">The details that keep<br />your service moving.</h2></div>
          <div className="highlight-list">
            {highlights.map((item) => <article className="highlight-item" key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><span className="highlight-arrow" aria-hidden="true">↗</span></article>)}
          </div>
        </section>
      </main>
      <footer className="landing-footer"><span>© CloudSubs</span><span>SaaS billing and subscription management</span></footer>
    </div>
  );
}

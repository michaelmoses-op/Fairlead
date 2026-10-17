import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Preview } from "../components/Preview";
import { Wordmark } from "../components/Wordmark";

export function Landing() {
  useEffect(() => {
    document.title = "Fairlead";
  }, []);

  return (
    <div className="landing">
      <header className="nav">
        <div className="wrap nav-inner">
          <Link to="/" className="brand" aria-label="Fairlead">
            <Wordmark variant="nav" />
          </Link>
          <Link to="/editor" className="nav-link">
            Open a diagram
          </Link>
        </div>
      </header>
      <main>
        <section className="hero wrap">
          <h1>
            See the <span>path</span>
            <br />
            your data takes.
          </h1>
          <p className="lede">
            Fairlead allows engineers to map out microservices, databases, and APIs with precision. Design your
            system&apos;s wiring before writing a single line of code.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/editor">
              Start Building for Free
            </Link>
            <Link className="btn btn-secondary" to="/editor?sample=orders">
              Try the example
            </Link>
          </div>
          <Preview />
        </section>
        <section className="features" aria-label="Features">
          <article>
            <div className="feature-icon feature-icon-blue">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9DB4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="7" height="7" rx="1.5" />
                <rect x="13" y="4" width="7" height="7" rx="1.5" />
                <rect x="4" y="13" width="7" height="7" rx="1.5" />
                <path d="M13 16.5H20" />
              </svg>
            </div>
            <h2>Precision Layouts</h2>
            <p>Intelligent grid-snapping and auto-routing wires ensure your architecture diagrams are always clean and professional.</p>
          </article>
          <article>
            <div className="feature-icon feature-icon-mint">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#86F0D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <ellipse cx="12" cy="6" rx="7" ry="3" />
                <path d="M5 6V18C5 19.7 8.1 21 12 21S19 19.7 19 18V6" />
                <path d="M5 12C5 13.7 8.1 15 12 15S19 13.7 19 12" />
              </svg>
            </div>
            <h2>Service Catalogs</h2>
            <p>Pre-built components for common cloud services, databases, and microservice patterns to speed up your design process.</p>
          </article>
          <article>
            <div className="feature-icon feature-icon-pink">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFA9BA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="9" r="3" />
                <circle cx="17" cy="10" r="2.5" />
                <path d="M3.5 19C4 15.8 6.2 14.5 9 14.5S14 15.8 14.5 19" />
                <path d="M15.5 14.8C18.5 14.5 20 16 20.5 19" />
              </svg>
            </div>
            <h2>Live Collaboration</h2>
            <p>Invite your team to review and edit diagrams in real-time. Share high-resolution exports or live links.</p>
          </article>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Wordmark variant="footer" />
        </div>
      </footer>
    </div>
  );
}

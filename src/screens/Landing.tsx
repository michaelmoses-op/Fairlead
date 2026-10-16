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
            <Wordmark tone="paper" />
          </Link>
          <Link to="/editor" className="nav-link">
            Open a chart
          </Link>
        </div>
      </header>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">Local chart</p>
            <h1>Show where the data goes.</h1>
            <p className="lede">
              Draw the places data rests and the programs that move it. Each wire is one movement: a direction, a
              verb, and a payload. Under the chart, the same picture is written out in sentences.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/editor">
                Open a chart
              </Link>
              <Link className="btn btn-secondary" to="/editor?sample=orders">
                Open the orders example
              </Link>
            </div>
          </div>
          <Preview />
        </section>
        <section className="legend wrap" aria-label="What a wire carries">
          <article>
            <h2>Direction</h2>
            <p>The arrow is the way the data moves.</p>
          </article>
          <article>
            <h2>Verb</h2>
            <p>reads, writes, returns, publishes, receives.</p>
          </article>
          <article>
            <h2>Payload</h2>
            <p>A few words for what travels, such as customer row or invoice JSON.</p>
          </article>
        </section>
        <section className="band">
          <div className="wrap band-inner">
            <p>Name a service, then draw the wire that carries its data.</p>
            <Link className="btn btn-primary" to="/editor">
              Open a chart
            </Link>
          </div>
        </section>
      </main>
      <footer className="wrap site-footer">
        <Wordmark tone="paper" />
        <p>The chart describes systems, and it does not connect to them.</p>
      </footer>
    </div>
  );
}

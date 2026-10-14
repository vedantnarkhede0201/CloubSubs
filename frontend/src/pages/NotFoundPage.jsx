import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="not-found-code">404</span>
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>This page went off-plan.</h1>
      <p>The link may be outdated, or the page may have moved.</p>
      <Link to="/" className="button button-primary">Back to CloudSubs</Link>
    </div>
  );
}

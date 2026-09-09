import { homeHref } from '@/lib/catalogue';
export default function NotFound(){return <main className="empty-state"><h1>404</h1><p>This page is not in the atlas.</p><a href={homeHref('en')}>CJK Input Atlas →</a></main>}

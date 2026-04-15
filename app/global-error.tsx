'use client';
// global-error.tsx: Next.js 요구사항에 따라 Client Component 필수.
// 루트 레이아웃을 완전히 대체하므로 <html>/<body> 태그 직접 포함 필수.
// React 19: <title>/<style>을 <head> 자식으로 렌더 시 metadata context(useContext) 경유 →
// SSG 프리렌더링에서 dispatcher 미초기화 오류. <head dangerouslySetInnerHTML>로 우회.
export const dynamic = 'force-dynamic';

const headHtml = `
<meta charset="utf-8" />
<title>TERMINAL — SYSTEM ERROR</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #05060a;
    color: #D6E5ED;
    font-family: 'Space Mono', 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  .container { max-width: 480px; width: 100%; }
  .label { font-size: 10px; letter-spacing: 0.2em; color: rgba(214,229,237,0.4); margin-bottom: 1rem; }
  .title { font-size: 1rem; font-weight: 700; letter-spacing: 0.2em; color: #c85020; margin-bottom: 1.5rem; }
  .message { font-size: 11px; color: rgba(214,229,237,0.6); margin-bottom: 2rem; line-height: 1.6; }
  .digest { font-size: 10px; color: rgba(214,229,237,0.3); margin-bottom: 2rem; }
  a.restart {
    display: inline-block;
    background: transparent;
    border: 1px solid rgba(214,229,237,0.3);
    color: #D6E5ED;
    font-family: inherit;
    font-size: 11px;
    letter-spacing: 0.2em;
    padding: 0.75rem 2rem;
    cursor: pointer;
    text-decoration: none;
  }
  a.restart:hover { border-color: rgba(214,229,237,0.7); }
</style>
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      {/* eslint-disable-next-line react/no-danger */}
      <head dangerouslySetInnerHTML={{ __html: headHtml }} />
      <body>
        <div className="container">
          <div className="label">TERMINAL / SYSTEM</div>
          <div className="title">[ CRITICAL ERROR ]</div>
          <div className="message">
            A fatal error occurred in the application. The session could not be restored.
          </div>
          {error.digest && (
            <div className="digest">ERR_DIGEST: {error.digest}</div>
          )}
          <a href="/" className="restart">[ RESTART SESSION ]</a>
        </div>
      </body>
    </html>
  );
}

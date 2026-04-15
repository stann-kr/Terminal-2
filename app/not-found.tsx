'use client';
// dynamic='force-dynamic': SSG 프리렌더링 시 hook 디스패처 초기화 문제 회피
// next/link, PageLayout 등 외부 임포트 없이 self-contained 구현
// 이유: Next.js 16 + Turbopack/Webpack SSG 프리렌더링 중
// 외부 클라이언트 컴포넌트(DecodeText, Link 등) import 시 useState/useContext null 오류 발생.
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 text-terminal-primary font-mono bg-terminal-bg-base">
      <div className="w-full max-w-[700px] space-y-6">
        {/* Return link */}
        <div className="mb-6">
          <a
            href="/home"
            className="text-xs tracking-widest cursor-pointer inline-block px-3 py-1.5 border transition-colors whitespace-nowrap border-terminal-bg-panel-border/40 text-terminal-subdued hover:bg-terminal-bg-panel-border/20"
          >
            ◀ RETURN /home
          </a>
        </div>

        {/* Page header */}
        <div className="mb-8 font-mono">
          <div className="text-xs tracking-widest mb-1 text-terminal-muted">/404</div>
          <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-terminal-accent-alert text-shadow-glow-alert">
            ERROR: 404
          </h1>
        </div>

        {/* Error content */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-terminal-accent-alert text-shadow-glow-alert text-sm font-mono block tracking-wider">
            REQUESTED SIGNAL NOT FOUND IN LOCAL NODE
          </p>
          <p className="text-terminal-muted text-xs block max-w-md mx-auto leading-relaxed">
            The coordinate or resource you are looking for has been moved or purged from the terminal registry.
          </p>
        </div>
      </div>
    </div>
  );
}

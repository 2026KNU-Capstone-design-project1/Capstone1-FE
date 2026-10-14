export default function PlaceholderPage({ title }) {
  return (
    <section className="grid min-h-[calc(100vh-117px)] place-items-center rounded-xl border border-app-border bg-app-panel p-8 text-center">
      <div>
        <h2 className="text-2xl font-bold text-app-text">{title}</h2>
        <p className="mt-3 text-sm text-app-muted">페이지 콘텐츠가 준비될 영역입니다.</p>
      </div>
    </section>
  );
}

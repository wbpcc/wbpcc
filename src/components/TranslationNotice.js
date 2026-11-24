// Shown on Bangla/Hindi pages until an editor marks the page "Reviewed".
// Phase 2: this becomes per-article (auto-translated / reviewed).
export default function TranslationNotice({ d }) {
  return (
    <div className="tnotice" role="note">
      <div className="wrap">
        <span>{d.tnotice.text}</span>
        <a href="#report-translation">{d.tnotice.report}</a>
      </div>
    </div>
  );
}

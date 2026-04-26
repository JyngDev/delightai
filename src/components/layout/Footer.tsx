export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-8 py-4 mt-auto"
      style={{ borderTop: "1px solid #f4f4f5" }}
    >
      <div className="flex items-center gap-1.5">
        <img src="/images/logo.svg" alt="Delight.AI" width={14} height={14} />
        <span className="text-[12px] font-medium text-[#171717]">Delight.AI</span>
      </div>
      <div className="flex items-center gap-5">
        <a href="#" className="text-[12px] text-[#a1a1aa] hover:text-[#525252] transition-colors">Docs</a>
        <a href="#" className="text-[12px] text-[#a1a1aa] hover:text-[#525252] transition-colors">Support</a>
        <a href="#" className="text-[12px] text-[#a1a1aa] hover:text-[#525252] transition-colors">Privacy</a>
        <span className="text-[12px] text-[#d4d4d8]">© 2026 Delight.AI</span>
      </div>
    </footer>
  );
}

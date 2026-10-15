import { Bookmark, MessageCircle, Sparkles, UserRound } from "lucide-react";

const currentLinks = [
  { number: "01", label: "Главная", href: "#top", active: true },
  { number: "02", label: "Подобрать место", href: "#plan" },
  { number: "03", label: "Как это работает", href: "#how-it-works" },
] as const;

const plannedLinks = [
  { label: "Профиль", icon: UserRound },
  { label: "Мессенджер", icon: MessageCircle },
  { label: "Избранное", icon: Bookmark },
] as const;

export function Sidebar() {
  return (
    <aside
      aria-label="Разделы проекта"
      className="relative hidden min-w-0 flex-col border-r border-[#dce5dc] bg-[#f8f7ed] px-[18px] pb-6 pt-9 text-[#30303d] min-[901px]:flex"
    >
      <div className="sticky top-6">
        <p className="mb-4 px-3 text-[10px] font-black tracking-[0.18em] text-[#89749b]">СЕЙЧАС</p>
        <nav aria-label="Разделы сайта" className="flex flex-col gap-1">
          {currentLinks.map((item) => (
            <a
              key={item.number}
              href={item.href}
              aria-current={"active" in item ? "page" : undefined}
              className={`group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#756196] ${
                "active" in item
                  ? "border-l-[3px] border-[#6fbdb4] bg-[#ebe6ef] pl-[9px]"
                  : "hover:bg-[#efede8]"
              }`}
            >
              <span className="min-w-5 text-[10px] font-black text-[#9b88aa]">{item.number}</span>
              <span className={"active" in item ? "text-[#65517f]" : "text-[#555562] group-hover:text-[#65517f]"}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="mx-3 my-7 h-px bg-[#dce3d9]" />
        <p className="mb-4 px-3 text-[10px] font-black tracking-[0.18em] text-[#89749b]">ПОЗЖЕ</p>
        <div className="flex flex-col gap-1">
          {plannedLinks.map(({ label, icon: Icon }) => (
            <div key={label} className="flex min-h-[43px] items-center gap-2.5 rounded-xl px-3 text-[12px] font-semibold text-[#818190]">
              <Icon size={16} aria-hidden="true" className="shrink-0 text-[#9386a7]" />
              <span>{label}</span>
              <small className="ml-auto rounded-full bg-[#ece9ef] px-1.5 py-0.5 text-[9px] font-bold text-[#9485a5]">скоро</small>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-[calc(100vh-190px)] mt-12 rounded-2xl border border-[#e1dce8] bg-[linear-gradient(145deg,#eee8f0_0%,#e7f3ec_100%)] p-4 shadow-[0_12px_28px_rgba(87,71,111,0.06)]">
        <span className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#756196] shadow-sm"><Sparkles size={18} aria-hidden="true" /></span>
        <strong className="block text-[13px] leading-[1.35] text-[#4e3e66]">Хорошие встречи начинаются с идеи.</strong>
        <p className="mb-0 mt-2 text-[11px] leading-[1.5] text-[#737481]">Тет-а-тет помогает сделать первый шаг.</p>
      </div>
    </aside>
  );
}

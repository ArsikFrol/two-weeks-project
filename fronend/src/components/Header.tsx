"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Подобрать место", href: "#plan" },
  { label: "Найти друга", planned: true },
  { label: "Сообщения", planned: true },
  { label: "Избранное", planned: true },
  { label: "О проекте", href: "#project" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b-2 border-[#78c9c4] bg-[#f2f1df] text-[#242337] shadow-[0_8px_28px_rgba(40,45,75,0.06)]">
      <div className="mx-auto flex h-[78px] w-full max-w-[1540px] items-center gap-5 px-5 sm:px-8 xl:px-12">
        <a
          href="#top"
          onClick={() => setMenuOpen(false)}
          aria-label="Тет-а-тет — на главную"
          className="group inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#765d99]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#7770a9] text-[11px] font-black tracking-[-0.08em] text-white shadow-[4px_4px_0_#91d4d0] transition-transform group-hover:-rotate-6">
            Т·А·Т
          </span>
          <span className="bg-[linear-gradient(180deg,#a66d88_0%,#79689b_52%,#58a9a5_100%)] bg-clip-text text-[21px] font-black tracking-[-0.075em] text-transparent sm:text-[23px]">
            ТЕТ-А-ТЕТ.
          </span>
        </a>

        <nav aria-label="Основная навигация" className="ml-auto hidden items-center gap-1 xl:flex">
          {navigation.map((item) =>
            "href" in item ? (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-2.5 text-[13px] font-semibold transition-colors hover:bg-white/75 hover:text-[#67548c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#765d99]"
              >
                {item.label}
              </a>
            ) : (
              <span
                key={item.label}
                title="Раздел появится позже"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium text-[#777784]"
              >
                {item.label}<span className="h-1.5 w-1.5 rounded-full bg-[#9d9ac2]" aria-label="Скоро" />
              </span>
            ),
          )}
        </nav>

        <a
          href="#plan"
          className="ml-auto hidden min-h-10 shrink-0 items-center rounded-full bg-[#756196] px-5 text-[13px] font-bold shadow-[0_7px_18px_rgba(117,97,150,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-[#604d82] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#756196] sm:inline-flex xl:ml-3"
        >
          <span className="inline-flex items-center gap-2 text-white">Начать <ArrowUpRight size={16} aria-hidden="true" /></span>
        </a>

        <button
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="mobile-header-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#d4d1bc] text-[#685388] transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#765d99] sm:ml-0 xl:hidden"
        >
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-header-navigation"
          aria-label="Мобильная навигация"
          className="absolute inset-x-0 top-full border-b-2 border-[#78c9c4] bg-[#f2f1df] px-5 pb-5 pt-2 shadow-[0_18px_25px_rgba(40,45,75,0.12)] sm:px-8 xl:hidden"
        >
          <div className="mx-auto flex max-w-[1540px] flex-col gap-1">
            {navigation.map((item) =>
              "href" in item ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-[#765d99]"
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label} className="flex items-center justify-between px-4 py-3 text-sm text-[#777784]">
                  {item.label}<small className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-bold text-[#7770a9]">скоро</small>
                </span>
              ),
            )}
            <a
              href="#plan"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-[#756196] px-5 text-sm font-bold sm:hidden"
            >
              <span className="inline-flex items-center gap-2 text-white">Начать <ArrowUpRight size={16} aria-hidden="true" /></span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

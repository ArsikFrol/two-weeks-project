import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh items-center overflow-hidden bg-[linear-gradient(110deg,#a9c0be_0%,#abc9c7_56%,#d4efeb_100%)] font-sans">
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-0 left-[20%] h-full w-[36%] opacity-30 max-[700px]:left-1/2 max-[700px]:w-[68%] max-[700px]:-translate-x-1/2"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="error-logo-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c58b9f" />
            <stop offset="100%" stopColor="#416ead" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="100"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="130"
          fontWeight="900"
          fill="url(#error-logo-gradient)"
        >
          ТЕТ-А-ТЕТ
        </text>
      </svg>

      <div className="relative mx-auto w-full max-w-[1260px] px-10 max-[700px]:px-5">
        <h1
          className="whitespace-nowrap text-[#f4f3df]"
          style={{
            margin: 0,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "clamp(38px, 10vw, 142px)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.065em",
          }}
        >
          ERROR 404 :(
        </h1>
        <p
          className="text-[#f4f3df]"
          style={{ margin: "18px 0 34px", fontSize: "clamp(22px, 3.5vw, 48px)", lineHeight: 1.1 }}
        >
          Кажется, этой страницы нет.
        </p>
        <Link
          href="/"
          className="inline-block border-b border-[#f4f3df] pb-1.5 text-[17px] font-semibold text-[#f4f3df] hover:border-white hover:text-white"
          style={{ color: "#f4f3df" }}
        >
          Вернуться на главную →
        </Link>
      </div>
    </main>
  );
}

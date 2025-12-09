const AkshatImg = "/Images/AkshatParate.webp";
const PoojaImg = "/Images/PoojaSoni.png";

export default function About() {
  return (
    <div className="relative flex flex-col min-h-screen bg-app text-fg custom-scrollbar">
      {/* Background layers - same as Home */}
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4 space-y-10">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          About EchoIntellect
        </h1>

        {/* About Section */}
        <div className="bg-[#0f1620] border border-panel rounded-lg p-5 leading-relaxed">
          <p className="text-muted">
            EchoIntellect is built on a singular vision — to make AI
            intelligence transparent, comparable, and accessible. Instead of
            switching between chatbots individually, users can submit one prompt
            and instantly observe how different AI models interpret, reason, and
            respond — all within a unified, distraction-free dark interface.
          </p>
          <p className="text-muted mt-3">
            Whether you're a researcher, developer, or curious learner,
            EchoIntellect transforms AI exploration into a structured insight
            discovery experience — with speed, clarity, and precision at its
            core.
          </p>
        </div>

        {/* Feature Section */}
        <section>
          <h3 className="text-xl font-semibold mb-3 text-[var(--color-primary)]">
            What EchoIntellect Offers
          </h3>
          <ul className="space-y-3">
            <li className="bg-[#0f1620] border border-panel rounded-lg px-4 py-2">
              <span className="text-fg font-medium">Unified Prompting:</span>{" "}
              <span className="text-muted">
                Submit one query and compare responses across multiple AI
                models.
              </span>
            </li>
            <li className="bg-[#0f1620] border border-panel rounded-lg px-4 py-2">
              <span className="text-fg font-medium">
                Live Response Experience:
              </span>{" "}
              <span className="text-muted">
                Typing animations and real-time response cues for better
                interaction.
              </span>
            </li>
            <li className="bg-[#0f1620] border border-panel rounded-lg px-4 py-2">
              <span className="text-fg font-medium">Effortless Sharing:</span>{" "}
              <span className="text-muted">
                Copy or share individual model outputs with a single click.
              </span>
            </li>
            <li className="bg-[#0f1620] border border-panel rounded-lg px-4 py-2">
              <span className="text-fg font-medium">
                Flexible Input Workflow:
              </span>{" "}
              <span className="text-muted">
                Use dedicated model prompts or a universal input bar.
              </span>
            </li>
            <li className="bg-[#0f1620] border border-panel rounded-lg px-4 py-2">
              <span className="text-fg font-medium">Accessible by Design:</span>{" "}
              <span className="text-muted">
                Simple browser-based login with fair usage limits.
              </span>
            </li>
            <li className="bg-[#0f1620] border border-panel rounded-lg px-4 py-2">
              <span className="text-fg font-medium">
                Responsive Everywhere:
              </span>{" "}
              <span className="text-muted">
                Optimized layout for mobile, tablet, and desktop.
              </span>
            </li>
          </ul>
        </section>

        {/* ✅ Founders Section */}
        <section className="mt-12">
          <h3 className="text-xl font-semibold mb-6 border-b border-gray-800 pb-2">
            Founders Behind EchoIntellect
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Founder - Akshat */}
            <div
              className="flex items-center gap-5 bg-[#111823] p-5 rounded-xl border border-gray-800 shadow-lg
              transition-all duration-500 hover:shadow-primary/50 hover:border-primary hover:-translate-y-1 hover:scale-[1.01] hover:rotate-[1deg]"
            >
              <div
                className="relative flex-shrink-0 w-28 h-28 rounded-full overflow-hidden border-2 border-primary shadow-md group cursor-pointer
                transition-all duration-500 hover:shadow-primary/70 hover:scale-105 hover:rotate-[-2deg]"
              >
                <img
                  src={AkshatImg}
                  alt="Akshat Parate"
                  className="w-full h-full object-cover object-center"
                  style={{ aspectRatio: "1/1" }}
                />
                <a
                  href="https://www.linkedin.com/in/akshatparate03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100
                  transition-all duration-300 text-white text-sm font-medium"
                >
                  Akshat Parate
                </a>
              </div>

              <div>
                <h4 className="text-lg font-semibold">AKSHAT PARATE</h4>
                <p className="text-muted text-sm font-bold">
                  Founder · Backend Developer
                </p>
                <p className="text-primary text-sm mt-1">
                  "Building the engine behind intelligence."
                </p>
              </div>
            </div>

            {/* Co-Founder - Pooja */}
            <div
              className="flex items-center gap-5 bg-[#111823] p-5 rounded-xl border border-gray-800 shadow-lg
              transition-all duration-500 hover:shadow-primary/50 hover:border-primary hover:-translate-y-1 hover:scale-[1.01] hover:rotate-[1deg]"
            >
              <div
                className="relative flex-shrink-0 w-28 h-28 rounded-full overflow-hidden border-2 border-primary shadow-md group cursor-pointer
                transition-all duration-500 hover:shadow-primary/70 hover:scale-105 hover:rotate-[-2deg]"
              >
                <img
                  src={PoojaImg}
                  alt="Pooja Soni"
                  className="w-full h-full object-cover object-center"
                  style={{ aspectRatio: "1/1" }}
                />
                <a
                  href="https://www.linkedin.com/in/pooja-soni098"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100
                  transition-all duration-300 text-white text-sm font-medium"
                >
                  Pooja Soni
                </a>
              </div>

              <div>
                <h4 className="text-lg font-semibold">POOJA SONI</h4>
                <p className="text-muted text-sm font-bold">
                  Co-Founder · Frontend Developer
                </p>
                <p className="text-primary text-sm mt-1">
                  "Turning ideas into interfaces."
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

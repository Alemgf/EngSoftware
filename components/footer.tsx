export default function Footer() {
  return (
    <footer
      id="contato"
      className="py-16 border-t border-accent/10 relative overflow-hidden bg-secondary/30 isolate scroll-mt-24"
    >
      <div className="dot-pattern"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">
              LANDING<span className="text-accent">.</span>Studio
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Desenvolvimento de sites e landing pages personalizadas para impulsionar seu negócio online.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:landingstudiopro@gmail.com"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  landingstudiopro@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+5527998170613" className="text-muted-foreground hover:text-accent transition-colors">
                  (27) 99817-0613
                </a>
              </li>
              <li className="text-muted-foreground">Espírito Santo, Brasil</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-accent/10">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LANDING.Studio. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Link } from "react-router-dom";
import { Waves, MapPin, ClipboardList, Users, BarChart3, Download, ArrowRight, Anchor, Droplets, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBay from "@/assets/hero-bay.jpg";
import studentsImg from "@/assets/students-monitoring.jpg";
import communityImg from "@/assets/community-report.jpg";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-grael-navy/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Waves className="h-7 w-7 text-grael-gold" />
            <div>
              <span className="font-heading font-extrabold text-white text-lg tracking-tight">BaíaViva</span>
              <span className="hidden sm:inline text-white/50 text-xs ml-2">Projeto Grael</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://projetograel.org.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white text-sm hidden sm:inline-block transition-colors"
            >
              Projeto Grael
            </a>
            <Link to="/auth">
              <Button className="bg-grael-gold hover:bg-grael-gold/90 text-grael-navy font-semibold text-sm">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBay} alt="Baía de Guanabara com monitoramento ambiental" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-grael-navy/90 via-grael-navy/70 to-grael-navy/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-grael-gold/20 border border-grael-gold/30 rounded-full px-4 py-1.5 mb-6">
              <Anchor className="h-4 w-4 text-grael-gold" />
              <span className="text-grael-gold text-sm font-medium">Projeto Grael — Niterói, RJ</span>
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
              Monitoramento Ambiental da{" "}
              <span className="text-grael-gold">Baía de Guanabara</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl">
              Plataforma colaborativa de ciência cidadã que conecta professores, alunos e a comunidade 
              para coletar e compartilhar dados sobre a qualidade ambiental da baía.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-grael-gold hover:bg-grael-gold/90 text-grael-navy font-bold text-base px-8">
                  Participar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                  Como Funciona
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-grael-navy py-6 border-y border-grael-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "6", label: "Pontos de Coleta" },
              { value: "350+", label: "Jovens Atendidos" },
              { value: "4", label: "Tipos de Análise" },
              { value: "100%", label: "Gratuito" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-heading font-extrabold text-3xl text-grael-gold">{stat.value}</p>
                <p className="text-white/60 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-grael-navy">
              Como Funciona
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma integrada para monitoramento ambiental participativo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                title: "Coleta Científica",
                description: "Professores e alunos registram dados padronizados em campo: turbidez, pH, temperatura, lixo flutuante, condições climáticas e coordenadas GPS.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Users,
                title: "Participação Comunitária",
                description: "Qualquer cidadão pode relatar ocorrências ambientais geolocalizadas: lixo flutuante, poluição, animais doentes — diretamente pelo celular.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: BarChart3,
                title: "Dashboard & Dados",
                description: "Visualize gráficos, mapas interativos e exporte dados em CSV, XLSX e GeoJSON compatíveis com ArcGIS para análises avançadas.",
                color: "bg-teal-50 text-teal-600",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-5`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-bold text-xl text-grael-navy">{item.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Columns: Science + Community */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Science */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 text-sm font-medium">Monitoramento Científico</span>
              </div>
              <h2 className="font-heading font-extrabold text-3xl text-grael-navy">
                Dados de campo com rigor científico
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Professores e alunos do Projeto Grael coletam dados ambientais em 6 pontos estratégicos da Baía de Guanabara. 
                Os registros incluem análises de qualidade da água, contagem de lixo flutuante e condições meteorológicas.
              </p>
              <ul className="mt-6 space-y-3">
                {["Turbidez, pH e temperatura da água", "Contagem e classificação de lixo", "Direção e velocidade do vento", "GPS com precisão WGS84 (EPSG:4326)"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-grael-gold flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={studentsImg} alt="Alunos coletando amostras na baía" className="w-full h-auto object-cover" loading="lazy" width={800} height={600} />
            </div>
          </div>

          {/* Community */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg">
              <img src={communityImg} alt="Voluntária reportando ocorrência ambiental" className="w-full h-auto object-cover" loading="lazy" width={800} height={600} />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-amber-50 rounded-full px-4 py-1.5 mb-4">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span className="text-amber-600 text-sm font-medium">Ciência Cidadã</span>
              </div>
              <h2 className="font-heading font-extrabold text-3xl text-grael-navy">
                A comunidade como agente de mudança
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Qualquer pessoa pode contribuir relatando problemas ambientais diretamente pelo celular. 
                Basta apontar no mapa, descrever a ocorrência e enviar. Simples assim.
              </p>
              <ul className="mt-6 space-y-3">
                {["Lixo flutuante e poluição", "Animais marinhos doentes", "Manchas na água", "Localização via GPS do celular"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-grael-gold flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Export / ArcGIS */}
      <section className="py-20 bg-grael-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Wind className="h-10 w-10 text-grael-gold mx-auto mb-6" />
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Dados abertos, compatíveis com ArcGIS
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Exporte dados em GeoJSON (WGS84/EPSG:4326), CSV e XLSX. 
            Totalmente compatíveis com ArcGIS, QGIS e Google Earth para análises geoespaciais avançadas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {["GeoJSON", "CSV", "XLSX", "WGS84"].map(format => (
              <span key={format} className="px-6 py-3 rounded-full border border-grael-gold/30 text-grael-gold font-semibold text-sm">
                {format}
              </span>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/auth">
              <Button size="lg" className="bg-grael-gold hover:bg-grael-gold/90 text-grael-navy font-bold text-base px-10">
                <Download className="mr-2 h-5 w-5" /> Acessar e Exportar Dados
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-grael-navy">
            Junte-se ao monitoramento
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Seja professor, aluno ou membro da comunidade — sua participação faz a diferença 
            para a preservação da Baía de Guanabara.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-grael-navy hover:bg-grael-navy/90 text-white font-bold text-base px-8">
                Criar Conta Gratuita <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="https://projetograel.org.br" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-grael-navy text-grael-navy hover:bg-grael-navy/5 text-base px-8">
                Conheça o Projeto Grael
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-grael-navy py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Waves className="h-6 w-6 text-grael-gold" />
              <div>
                <span className="font-heading font-bold text-white">BaíaViva</span>
                <span className="text-white/40 text-xs ml-2">por Projeto Grael</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="https://projetograel.org.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                projetograel.org.br
              </a>
              <span>Jurujuba, Niterói — RJ</span>
            </div>
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} Projeto Grael. Plataforma de monitoramento ambiental.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

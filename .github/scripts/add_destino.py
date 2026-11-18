"""Insere a seção "O Destino" (mapa interativo) no index.html gerado em dist/.

Os arquivos do mapa ficam em destino/ neste repositório e são copiados para dist/
antes deste script rodar. Para editar locais, fotos ou links: destino/data/weddingLocations.json
"""
from pathlib import Path
import sys

VERSAO = "20261117"
index = Path("dist/index.html")
html = index.read_text(encoding="utf-8")

if "mp-destino-map" in html:
    print("mapa já inserido")
    sys.exit(0)

SECAO = f'''  <p class="hosp-intro reveal" style="margin-top:3rem">
    Prefere outra opção? Separamos pousadas, casas e chalés a poucos minutos a pé da Villa
    no <a href="#destino" style="color:var(--agua)">mapa do destino</a> logo abaixo.
  </p>
</section>

<!-- mp-destino-map · MAPA INTERATIVO DE DESTINO -->
<section id="destino">
  <span class="section-eyebrow reveal">Patacho · Alagoas</span>
  <h2 class="section-title reveal reveal-delay-1">O Destino</h2>
  <div class="divider center reveal reveal-delay-2"></div>
  <p class="destino-intro reveal reveal-delay-3">
    Do aeroporto de Maceió até o pé na areia do Patacho. A Villa é o nosso ponto de encontro:
    cerimônia e festa no mesmo lugar, com pousadas charmosas a uma caminhada de distância.
  </p>
  <div class="destino-shell reveal" id="destino-app" data-src="data/weddingLocations.json?v={VERSAO}"></div>
</section>

'''

fim = html.find("<!-- ── TRAJE")
if fim == -1:
    sys.exit("ERRO: não achei a seção TRAJE no index.html")
ini = html.find("  <!-- Hotéis próximos -->")
if ini != -1 and ini < fim and "✏️ Nome do Hotel" in html[ini:fim]:
    html = html[:ini] + SECAO + html[fim:]          # troca os cartões ✏️ provisórios pelo mapa
else:
    html = html[:fim] + SECAO.split("</section>\n\n", 1)[1] + html[fim:]  # só acrescenta a seção

html = html.replace("</head>", f'  <link rel="stylesheet" href="mapa-destino.css?v={VERSAO}" />\n</head>', 1)
html = html.replace(
    '<li><a href="#traje"',
    '<li><a href="#destino"    onclick="closeNav()">Destino</a></li>\n    <li><a href="#traje"', 1)
html = html.replace("</body>", f'<script src="mapa-destino.js?v={VERSAO}" defer></script>\n</body>', 1)

index.write_text(html, encoding="utf-8")
print("mapa do destino inserido")

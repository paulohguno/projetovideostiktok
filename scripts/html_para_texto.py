"""Converte uma página do TikTok Shop salva (Ctrl+S) em texto, sem imagens.
Uso: python3 -I html_para_texto.py arquivo.html"""
import html, re, sys

h = open(sys.argv[1], encoding='utf-8', errors='ignore').read()
titulo = re.search(r'<title>(.*?)</title>', h, re.S)
print('TITULO DA PAGINA:', html.unescape(titulo.group(1).strip()) if titulo else '-')
h = re.sub(r'<(script|style|svg|noscript)\b.*?</\1>', ' ', h, flags=re.S | re.I)
h = re.sub(r'<br\s*/?>|</(div|p|li|h\d|span|tr|button)>', '\n', h, flags=re.I)
texto = html.unescape(re.sub(r'<[^>]+>', ' ', h))
linhas = [re.sub(r'[ \t]+', ' ', l).strip() for l in texto.splitlines()]
print('---- TEXTO DA PAGINA ----')
print('\n'.join(l for l in linhas if l)[:20000])

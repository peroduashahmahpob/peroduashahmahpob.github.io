"""Jana set laman untuk ahli team (salin laman utama + semua laman model, tukar nama/nombor WhatsApp).
Guna: python3 _tools/make_team.py   (dijalankan dari folder repo). Tambah ahli baru dalam TEAM di bawah."""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = [d for d in ("axia", "bezza", "myvi", "ativa", "traz", "alza", "aruz") if os.path.isfile(f"{ROOT}/{d}/index.html")]
TEAM = [
    dict(slug="aisyah", first="Aisyah", full="AISYAH", wa="60182031020", photo="img/aisyah.jpg", tagline="PAKAR LOAN ANDA"),
    dict(slug="fendi", first="Fendi", full="FENDI", wa="60189038194", photo="img/fendi.jpg", tagline="PAKAR LOAN ANDA"),
]
def common(s, m):
    s = s.replace("60137258194", m["wa"])
    s = s.replace("Salam Shah,", f"Salam {m['first']},").replace("WhatsApp Shah", f"WhatsApp {m['first']}")
    s = s.replace("| Shah Mahpob</title>", f"| {m['first']} · Team Shah Mahpob</title>")
    s = s.replace("Tanya Shah Mahpob, Sales Advisor Perodua, terus di WhatsApp.", f"Tanya {m['first']} (Team Shah Mahpob), Sales Advisor Perodua, terus di WhatsApp.")
    s = s.replace("· WhatsApp Shah Mahpob", f"· WhatsApp {m['first']}")
    s = s.replace("sila tanya Shah", f"sila tanya {m['first']}").replace("Tanya Shah untuk", f"Tanya {m['first']} untuk")
    role = f"{m['tagline'].title()} · Team Shah Mahpob" if m.get("tagline") else "Team Shah Mahpob · Sales Advisor Perodua"
    s = s.replace("<b>SHAH MAHPOB</b><br>Sales Advisor Perodua", f"<b>{m['full']}</b><br>{role}")
    return s
for m in TEAM:
    out = f"{ROOT}/{m['slug']}"; os.makedirs(out, exist_ok=True)
    s = common(open(f"{ROOT}/index.html").read(), m)
    s = s.replace("<title>Perodua Shah Mahpob | Sales Advisor</title>", f"<title>{m['first']} · Team Shah Mahpob | Sales Advisor Perodua</title>")
    s = s.replace('content="Shah Mahpob, Sales Advisor Perodua.', f'content="{m["first"]} (Team Shah Mahpob), Sales Advisor Perodua.')
    s = s.replace('<meta property="og:title" content="Perodua Shah Mahpob" />', f'<meta property="og:title" content="{m["full"]} · Team Shah Mahpob" />')
    s = s.replace("img/shah.jpg", m["photo"]).replace('alt="Shah Mahpob, Sales Advisor Perodua"', f'alt="{m["first"]}, Sales Advisor Perodua"')
    tag = (f'<p style="display:inline-block;margin-top:12px;padding:8px 16px;border-radius:999px;background:var(--o);color:#fff;font-weight:900;font-size:15px;letter-spacing:.14em">{m["tagline"]}</p>') if m.get("tagline") else ""
    s = s.replace("<h1>PERODUA<br><span>SHAH MAHPOB</span></h1>", f"<h1>{m['full']}<br><span>TEAM SHAH MAHPOB</span></h1>{tag}")
    if m.get("tagline"):
        s = s.replace(f'content="{m["first"]} (Team Shah Mahpob), Sales Advisor Perodua.', f'content="{m["first"]} (Team Shah Mahpob), {m["tagline"].title()}. Sales Advisor Perodua.')
    open(f"{out}/index.html", "w").write(s)
    for d in MODELS:
        s = common(open(f"{ROOT}/{d}/index.html").read(), m)
        s = s.replace('<span>SHAH MAHPOB</span></nav>', f'<span>{m["full"]} · TEAM SHAH</span></nav>')
        s = re.sub(r'(src|content)="img/', rf'\1="../../{d}/img/', s)
        s = s.replace("img.src = `img/", f"img.src = `../../{d}/img/")
        os.makedirs(f"{out}/{d}", exist_ok=True); open(f"{out}/{d}/index.html", "w").write(s)
    left = []
    for f in [f"{out}/index.html"] + [f"{out}/{d}/index.html" for d in MODELS]:
        for i, l in enumerate(open(f).read().splitlines(), 1):
            if re.search(r"Shah(?! Mahpob)|60137258194|SHAH MAHPOB(?!</span></h1>)", l) and "TEAM SHAH" not in l and "Team Shah" not in l:
                left.append(f"{os.path.relpath(f, ROOT)}:{i}: {l.strip()[:90]}")
    print(m["slug"], "->", len(MODELS) + 1, "laman;", "baki rujukan Shah:", len(left)); print("\n".join(left[:15]))

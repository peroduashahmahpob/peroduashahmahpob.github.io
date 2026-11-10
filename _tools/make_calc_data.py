"""Kumpul harga semua laman model -> kalkulator/data.js (jalankan semula bila harga berubah)."""
import os, re, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["axia", "bezza", "myvi", "ativa", "traz", "alza", "aruz"]
out = []
for m in ORDER:
    f = f"{ROOT}/{m}/index.html"
    if not os.path.isfile(f): continue
    s = open(f).read()
    rate = float(re.search(r"const RATE = ([0-9.]+);", s).group(1))
    fees = re.search(r"const FEES = \{ roadtax: ([0-9.]+), reg: ([0-9.]+), claim: ([0-9.]+) \}", s)
    rt0, reg, claim = map(float, fees.groups())
    block = s[s.index("const VARIANTS = ["):]; block = block[:block.index("];")]
    vs = []
    for o in re.finditer(r'\{ id: "[^"]+", name: "([^"]+)", body: ([0-9.]+),(?: rt: ([0-9.]+),)? ins: ([0-9.]+)', block):
        name, body, rt, ins = o.group(1), float(o.group(2)), float(o.group(3) or rt0), float(o.group(4))
        otr = round(body + rt + reg + claim + ins, 2)
        vs.append({"name": name, "body": body, "rt": rt, "reg": reg, "claim": claim, "ins": ins, "otr": otr})
    out.append({"id": m, "model": m.capitalize(), "rate": rate, "page": f"../{m}/", "variants": vs})
open(f"{ROOT}/kalkulator/data.js", "w").write("// dijana oleh _tools/make_calc_data.py — jangan edit tangan\nwindow.HARGA = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
for m in out: print(m["model"], m["rate"], len(m["variants"]), [v["otr"] for v in m["variants"]])

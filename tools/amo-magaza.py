#!/usr/bin/env python3
"""AMO mağaza sayfasını günceller: varsayılan dil, simge ve ekran görüntüleri.

Eklentinin kendisi `web-ext sign` ile yayımlanır; bu betik yalnızca listeleme
bilgisini yazar. AMO'nun istek sınırı günlüktür ve aşılırsa bütün uç noktalar
saatlerce 429 döner, o yüzden betik tek seferde çalışır ve 429'da durur.

Kullanım (anahtarlar kasadan, değerleri basılmadan):
  key-vault calistir amo_jwt_issuer=AMO_ISS amo_jwt_secret=AMO_SEC -- \
    python3 tools/amo-magaza.py
"""
import base64, hashlib, hmac, json, os, sys, time, urllib.error, urllib.request, uuid
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
ADDON = "/addons/addon/wiki-cleaner@yakupemre/"
ALTYAZI = [
    {"en-US": "Every blue word is another tab: Wiki Cleaner turns internal links into plain text and hides citation markers.",
     "tr": "Her mavi kelime yeni bir sekme: Wiki Cleaner dahili bağlantıları düz metne çevirir, atıf işaretlerini gizler."},
    {"en-US": "Before and after: the same paragraph, with nothing pulling you away.",
     "tr": "Önce ve sonra: aynı paragraf, seni çeken hiçbir şey yok."},
    {"en-US": "Off in one click, from the toolbar or the right-click menu. Links come back exactly as they were.",
     "tr": "Araç çubuğundan ya da sağ tık menüsünden tek tıkla kapat. Bağlantılar eski hâline birebir döner."},
    {"en-US": "Reads nothing, sends nothing. Infoboxes, navigation tables and footnotes stay untouched.",
     "tr": "Hiçbir şey okumaz, hiçbir şey göndermez. Bilgi kutuları, gezinme tabloları ve dipnotlar olduğu gibi kalır."},
]


def b64(veri: bytes) -> bytes:
    return base64.urlsafe_b64encode(veri).rstrip(b"=")


def jwt() -> str:
    iss, sir = os.environ["AMO_ISS"], os.environ["AMO_SEC"]
    simdi = int(time.time())
    bas = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    gov = b64(json.dumps({"iss": iss, "jti": str(uuid.uuid4()), "iat": simdi, "exp": simdi + 60}).encode())
    imza = b64(hmac.new(sir.encode(), bas + b"." + gov, hashlib.sha256).digest())
    return (bas + b"." + gov + b"." + imza).decode()


def cagir(yontem, yol, veri=None, ham=None, ctype="application/json"):
    govde = ham if ham is not None else (json.dumps(veri).encode() if veri is not None else None)
    istek = urllib.request.Request(
        "https://addons.mozilla.org/api/v5" + yol, data=govde, method=yontem,
        headers={"Authorization": "JWT " + jwt(), "Content-Type": ctype})
    try:
        with urllib.request.urlopen(istek) as yanit:
            return yanit.status, json.loads(yanit.read() or b"{}")
    except urllib.error.HTTPError as hata:
        return hata.code, hata.read().decode()[:400]


def cok_parcali(alanlar, dosya_alani, yol_png, yontem, yol):
    sinir = uuid.uuid4().hex
    parcalar = []
    for ad, deger in alanlar.items():
        parcalar.append(f'--{sinir}\r\nContent-Disposition: form-data; name="{ad}"\r\n\r\n{deger}\r\n'.encode())
    parcalar.append(
        f'--{sinir}\r\nContent-Disposition: form-data; name="{dosya_alani}"; filename="{yol_png.name}"\r\n'
        f"Content-Type: image/png\r\n\r\n".encode() + yol_png.read_bytes() + b"\r\n")
    parcalar.append(f"--{sinir}--\r\n".encode())
    return cagir(yontem, yol, ham=b"".join(parcalar), ctype=f"multipart/form-data; boundary={sinir}")


def dur(kod, mesaj):
    print(mesaj, flush=True)
    sys.exit(kod)


def main():
    durum, yanit = cagir("GET", ADDON)
    if durum != 200:
        dur(1, f"okunamadı: {durum} {yanit}")
    print(f"mevcut: dil={yanit['default_locale']} görsel={len(yanit['previews'])}", flush=True)

    if yanit["default_locale"] != "en-US":
        durum, sonuc = cagir("PATCH", ADDON, {"default_locale": "en-US"})
        if durum == 400 and "support_email" in str(sonuc):
            # Destek e-postası yok; AMO yine de varsayılan dilde bir değer istiyor.
            durum, sonuc = cagir("PATCH", ADDON, {"default_locale": "en-US", "support_email": {"en-US": None}})
        if durum == 429:
            dur(2, f"istek sınırı: {sonuc}")
        print(f"dil: {durum} {sonuc if isinstance(sonuc, str) else sonuc['default_locale']}", flush=True)

    durum, sonuc = cok_parcali({}, "icon", KOK / "docs/brand/logo-512.png", "PATCH", ADDON)
    if durum == 429:
        dur(2, f"istek sınırı: {sonuc}")
    print(f"simge: {durum}", flush=True)

    if len(yanit["previews"]) == 0:
        for sira, altyazi in enumerate(ALTYAZI):
            durum, sonuc = cok_parcali(
                {"caption": json.dumps(altyazi), "position": str(sira)}, "image",
                KOK / f"docs/store/en-{sira + 1}.png", "POST", ADDON + "previews/")
            if durum == 429:
                dur(2, f"istek sınırı: {sonuc}")
            print(f"görsel {sira + 1}: {durum}", flush=True)
            time.sleep(3)

    durum, yanit = cagir("GET", ADDON)
    print(f"son durum: dil={yanit['default_locale']} görsel={len(yanit['previews'])}", flush=True)


if __name__ == "__main__":
    main()

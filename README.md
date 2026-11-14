<!-- Kısa Açıklama: Kravitz Lean & Fit (MACFit) antrenman ve beslenme rehberi projesinin Türkçe dokümantasyonu -->

# Kravitz Lean & Fit — MACFit Antrenman ve Beslenme Rehberi

Bu web uygulaması, **MACFit Tanita ölçüm verilerinize** ve **Lenny Kravitz / Dodd Romero** tarafından uygulanan **Piramit (30 → 15 → 10 → 5) + 21'ler Aktif Core Dinlenmesi** sistemine göre hazırlanmış, takip karmaşası olmayan, doğrudan görsel ve video destekli mobil uyumlu antrenman rehberidir.

## Özellikler

- **4 Günlük MACFit Antrenman Programı:**
  - **1. Gün:** Üst Vücut İtiş & V-Taper (Göğüs + Omuz + Triceps)
  - **2. Gün:** Atletik Alt Vücut & Metabolik Ateşleme (Bacak + Kalça)
  - **3. Gün:** Bruce Lee Sırt & Kol Detayı (Sırt + Arka Omuz + Biceps)
  - **4. Gün:** Full-Body Fonksiyonel Kondisyon & Göbek Yağı Yok Edici
- **Canlı Çift Kare Form Animasyonu:** Her hareket kartında başlangıç (`0.jpg`) ve bitiş (`1.jpg`) kareleri arasında otomatik geçiş ve manuel kontrol.
- **Doğrulanmış Eğitim Videoları:** Her ana hareket ve aktif dinlenme core hareketi için modal içi YouTube oynatıcı ve doğrudan YouTube bağlantısı.
- **21'ler Core & Sabah Mide Vakumu Rehberi:** Set aralarında yapılacak tüm karın hareketleri ve sabah aç karnına uygulanacak *Stomach Vacuum* protokolü.
- **Beslenme & Göbek Eritme Protokolü:** 1970 kcal BMR baz alınarak 2.050-2.150 kcal / 170-180 g protein hedefli 18:6 ve 16:8 Aralıklı Oruç planı.

## Yerel Çalıştırma

Uygulama ES Modules (`type="module"`) kullandığı için basit bir HTTP sunucusu ile çalıştırılmalıdır:

```bash
npx serve .
# veya
python -m http.server 8080
```

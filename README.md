<!-- Kısa Açıklama: Kravitz Lean & Fit (MACFit) antrenman ve beslenme rehberi projesinin Türkçe dokümantasyonu -->

# Kravitz Lean & Fit — MACFit Antrenman ve Beslenme Rehberi

Bu web uygulaması, **MACFit Tanita ölçüm verilerinize** ve **Lenny Kravitz / Dodd Romero** tarafından uygulanan **Piramit (30 → 15 → 10 → 5) + 21'ler Aktif Core Dinlenmesi** sistemine göre hazırlanmış, takip karmaşası olmayan, doğrudan **reklamsız yerel HTML5 video ve görsel destekli** mobil uyumlu antrenman rehberidir.

## Özellikler

- **Sıfır Reklamlı Yerel Egzersiz Videoları (`assets/videos/*.mp4`):** Açık kaynaklı `hasaneyldrm/exercises-dataset` ve `free-exercise-db` veri setlerinden indirilen 32 hareket animasyonu, `ffmpeg` ile H.264 `.mp4` videolarına dönüştürülerek doğrudan proje içine gömülmüştür. YouTube veya reklamlı üçüncü parti oynatıcı kullanmaz.
- **Canlı Video + Başlangıç/Bitiş Form Kareleri:** Her hareket kartında doğrudan dönen MP4 videosunun yanı sıra `1. Başlangıç` ve `2. Bitiş` gerçek salon fotoğrafları arasında tek tıkla geçiş yapılabilir.
- **0.5× Yavaş Çekim & İndirme Destekli Detay Modalı:** Her hareket ve aktif dinlenme core egzersizi için tam kontrollü yerel HTML5 oynatıcı (`0.5× Yavaş Çekim` / `1.0× Normal`) ve MP4 indirme bağlantısı.
- **4 Günlük MACFit Antrenman Programı:**
  - **1. Gün:** Üst Vücut İtiş & V-Taper (Göğüs + Omuz + Triceps)
  - **2. Gün:** Atletik Alt Vücut & Metabolik Ateşleme (Bacak + Kalça)
  - **3. Gün:** Bruce Lee Sırt & Kol Detayı (Sırt + Arka Omuz + Biceps)
  - **4. Gün:** Full-Body Fonksiyonel Kondisyon & Göbek Yağı Yok Edici
- **21'ler Core & Sabah Mide Vakumu Rehberi:** Set aralarında yapılacak tüm karın hareketleri ve sabah aç karnına uygulanacak *Stomach Vacuum* protokolü.
- **Beslenme & Göbek Eritme Protokolü:** 1970 kcal BMR baz alınarak 2.050-2.150 kcal / 170-180 g protein hedefli 18:6 ve 16:8 Aralıklı Oruç planı.

## Yerel Çalıştırma

Uygulama ES Modules (`type="module"`) kullandığı için basit bir HTTP sunucusu ile çalıştırılmalıdır:

```bash
npx serve .
# veya
python -m http.server 8080
```

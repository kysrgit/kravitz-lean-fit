<!-- Kısa Açıklama: Kravitz Lean & Fit (MACFit) antrenman ve beslenme rehberi projesinin Türkçe dokümantasyonu -->

# Kravitz Lean & Fit — MACFit Antrenman ve Beslenme Rehberi

Bu web uygulaması, **MACFit Tanita ölçüm verilerinize** ve **Lenny Kravitz / Dodd Romero** tarafından uygulanan **Piramit (30 → 15 → 10 → 5) + 21'ler Aktif Core Dinlenmesi** sistemine göre hazırlanmış, takip karmaşası olmayan, doğrudan **reklamsız HD/Full HD stüdyo video ve görsel destekli** mobil uyumlu antrenman rehberidir.

## Özellikler

- **Mobil Öncelikli (Mobile-First) Salon UI/UX Tasarımı:** Telefonda tek elle kullanım için **Başparmak Bölgesi (Thumb-Zone) Sabit Alt Navigasyon Barı** (`#mobile-bottom-nav`), sağa-sola kaydırma gerektirmeyen **Sıfır Yatay Kaydırmalı Mobil Tablo Kartları**, videonun üstünü kapatmayan alt kontrol şeridi, yatay kaydırmalı sistem kuralları karuseli ve **Bottom-Sheet** detay modalı içerir.
- **Yazılı & Tablo Özeti (Tek Bakışta Tüm Program + Gün İçi Tablo Görünümü):** Her antrenman gününün üstünde **Tablo + Video Kartları / Sadece Yazılı-Tablo Özeti / Sadece Video Kartları** arasında geçiş yapabilir; üst bardaki **`📋 Yazılı & Tablo Özet`** veya **`📋 Hızlı Bakış`** sekmesiyle 4 günlük programın, piramit set/tekrarlarının, 21'ler core rehberinin, alternatiflerin ve beslenme protokolünün tüm özetini tek sayfada (yazdırılabilir / PDF uyumlu) görüntüleyebilirsiniz.
- **Görsel Doğrulamalı 65 Egzersizlik Çift Kamera Açılı Stüdyo Kütüphanesi (`assets/videos/*-front.mp4` ve `*-side.mp4`):** 20 ana egzersiz, 13 aktif dinlenme core hareketi ve tüm alternatif hareketler için toplam **130 adet HD/Full HD stüdyo MP4 videosu** + **130 adet yüksek çözünürlüklü `.jpg` kare** doğrudan proje içine indirilmiştir. YouTube veya reklamlı oynatıcı içermez.
- **Etkileşimli Alternatif Hareketler (Makine Doluysa / Yapılamıyorsa):** Her ana hareketin (20 hareket) ve her aktif dinlenme/core hareketinin (13 hareket) altında ve detay modalında **2'şer adet doğrulanmış alternatif hareket** bulunur. Tıklandığında video, ekipman bilgisi, "Ne Zaman Yapılır?" rehberi ve ipuçları anında güncellenir.
- **Ön Açı, Yan Açı ve HD Form Kareleri:** Her hareket kartında **`Ön Açı (HD)`**, **`Yan Açı (HD)`** videoları ve **`Fotoğraf (HD)`** (`assets/images/<key>/start.jpg`, `end.jpg`) arasında tek tıkla geçiş yapılabilir.
- **0.5× Yavaş Çekim & Çift Kamera Destekli Detay Modalı:** Her hareket, alternatif ve aktif dinlenme core egzersizi için tam kontrollü yerel HTML5 oynatıcı (`Ön Açı` / `Yan Açı`, `0.5×` / `1.0×` hız, modal içi alternatif geçişi ve `HD MP4 İndir ↓` bağlantısı).
- **4 Günlük MACFit Antrenman Programı:**
  - **1. Gün:** Üst Vücut İtiş & V-Taper (Göğüs + Omuz + Triceps)
  - **2. Gün:** Atletik Alt Vücut & Metabolik Ateşleme (Bacak + Kalça)
  - **3. Gün:** Bruce Lee Sırt & Kol Detayı (Sırt + Arka Omuz + Biceps)
  - **4. Gün:** Full-Body Fonksiyonel Kondisyon & Göbek Yağı Yok Edici
- **21'ler Core & Sabah Mide Vakumu Rehberi:** Set aralarında yapılacak tüm karın hareketleri ve alternatifleri, ayrıca sabah aç karnına uygulanacak *Stomach Vacuum & Hollow Core Hold* protokolü.
- **Beslenme & Göbek Eritme Protokolü:** 1970 kcal BMR baz alınarak 2.050-2.150 kcal / 170-180 g protein hedefli 18:6 ve 16:8 Aralıklı Oruç planı.

## Yerel Çalıştırma

Uygulama ES Modules (`type="module"`) kullandığı için basit bir HTTP sunucusu ile çalıştırılmalıdır:

```bash
npx serve .
# veya
python -m http.server 8080
```

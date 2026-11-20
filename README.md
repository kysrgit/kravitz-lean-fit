<!-- Kısa Açıklama: Kravitz Lean & Fit antrenman ve beslenme rehberi projesinin Türkçe dokümantasyonu -->

# Kravitz Lean & Fit — Spor Salonu Antrenman & Beslenme Rehberi

Bu web uygulaması, yalnızca kendi tarayıcınızda saklanan kişisel **Profilim** ölçümlerinize ve **Kravitz'ten Esinlenilmiş Uyarlama** (**Piramit + 21'ler Aktif Core**) çerçevesinde (basın kaynaklarında aktarılan haftada 5-6 gün / 50-35-21-14-10 veya 50-25-12-5 ve aralıklı oruç uygulanmayan düzenin 4 veya 3 günlük sürdürülebilir uyarlaması olarak) hazırlanmış, takip karmaşası olmayan, doğrudan **reklamsız egzersiz formu bağlantılı** mobil uyumlu antrenman rehberidir.

## Özellikler

- **Mobil Öncelikli (Mobile-First) Salon UI/UX Tasarımı:** Telefonda tek elle kullanım için **Başparmak Bölgesi (Thumb-Zone) Sabit Alt Navigasyon Barı** (`#mobile-bottom-nav`), sağa-sola kaydırma gerektirmeyen **Sıfır Yatay Kaydırmalı Mobil Tablo Kartları**, form ve alternatiflere hızlı erişim barı, yatay kaydırmalı sistem kuralları karuseli ve **Bottom-Sheet** detay modalı içerir.
- **Yazılı & Tablo Özeti (Tek Bakışta Tüm Program + Gün İçi Tablo Görünümü):** Her antrenman gününün üstünde **Tablo + Hareket Kartları / Sadece Yazılı-Tablo Özeti / Sadece Hareket Kartları** arasında geçiş yapabilir; üst bardaki **`Yazılı & Tablo Özet`** veya **`Hızlı Bakış`** sekmesiyle 4 günlük programın, piramit set/tekrarlarının, 21'ler core rehberinin, alternatiflerin ve beslenme protokolünün tüm özetini tek sayfada (yazdırılabilir / PDF uyumlu) görüntüleyebilirsiniz.
- **Egzersiz Fotoğrafları (free-exercise-db, Public Domain) & MuscleWiki Kaynak Bağlantısı (`sourceUrl` → `Formu izle ↗`):** Başlangıç/bitiş pozisyonu fotoğrafları yerel WebP olarak sunulur; tüm egzersizler ve alternatifler ek olarak ilgili [MuscleWiki](https://musclewiki.com) egzersiz form sayfasına bağlanır. Lisans uyumu ([MuscleWiki Kullanım Şartları](https://api.musclewiki.com/api-terms)) gereği üçüncü taraf videolar yeniden barındırılmaz; önceki `assets/videos`, `assets/images` ve `assets/gifs` klasörleri hem çalışma dizininden hem de `git filter-repo` ile tüm Git geçmişinden temizlenmiştir.
- **Etkileşimli Alternatif Hareketler (Makine Doluysa / Yapılamıyorsa):** Her ana hareketin ve her aktif dinlenme/core hareketinin altında ve detay modalında **2'şer adet alternatif hareket** bulunur. Tıklandığında kart fotoğrafı, dış form bağlantısı, ekipman bilgisi, "Ne Zaman Yapılır?" rehberi ve ipuçları anında güncellenir.
- **Detay Modalı & Form İpuçları:** Her hareket, alternatif ve aktif dinlenme core egzersizi için başlangıç/bitiş görselleri, uygulama ipuçları, modal içi alternatif seçici ve doğrudan `Formu izle ↗ (MuscleWiki)` yönlendirmesi sunar.
- **4 Günlük Spor Salonu Antrenman Programı (ve Etkileşimli 3 Günlük Şablonlar):**
  - **1. Gün:** Üst Vücut İtiş & V-Taper (Göğüs + Omuz + Triceps)
  - **2. Gün:** Atletik Alt Vücut & Metabolik Ateşleme (Bacak + Kalça)
  - **3. Gün:** Bruce Lee Sırt & Kol Detayı (Sırt + Arka Omuz + Biceps)
  - **4. Gün:** Full-Body Fonksiyonel Kondisyon & Metabolik Antrenman
- **21'ler Core & Sabah Mide Vakumu Rehberi:** Set aralarında yapılacak tüm karın hareketleri ve alternatifleri, ayrıca sabah aç karnına uygulanacak *Stomach Vacuum & Hollow Core Hold* protokolü.
- **Beslenme & Aralıklı Öğün Planı:** Kişisel Profilim verilerinize göre hesaplanan kalori ve ~2 g/kg protein hedefli esnek 18:6 ve 16:8 öğün penceresi.

## Yerel Çalıştırma

Uygulama ES Modules (`type="module"`) kullandığı için basit bir HTTP sunucusu ile çalıştırılmalıdır:

```bash
npx serve .
# veya
python -m http.server 8080
```

## Barındırma (GitHub Pages)

Bu uygulama saf statik HTML/CSS/ES Modüllerden oluştuğu için ek platform yapılandırması (`vercel.json` vb.) olmadan doğrudan **GitHub Pages** üzerinden sunulur. Önceki `vercel.json` dosyası GitHub Pages ortamında işlevi bulunmadığı için kaldırılmıştır.

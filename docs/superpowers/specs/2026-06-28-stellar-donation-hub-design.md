# Stellar Micro-Donation Hub Tasarım Belgesi (Spec)

**Tarih:** 2026-06-28  
**Durum:** Taslak (Draft)  
**Yazar:** Antigravity (AI Coding Assistant)  

---

## 1. Genel Bakış (Overview)
Bu proje, Stellar Testnet üzerinde çalışan, açık kaynaklı geliştiricilerin projelerini listelemelerine ve Freighter cüzdanı aracılığıyla testnet XLM bağışları almalarına olanak tanıyan merkeziyetsiz bir mikro-bağış portalıdır (dApp). 

Uygulama, Stellar Level 1 (White Belt) gereksinimlerini tam olarak karşılarken, canlı bakiye takipleri, proje ekleme formu ve yerel bağış geçmişi gibi gelişmiş özelliklerle premium bir kullanıcı deneyimi sunmayı hedefler.

---

## 2. Teknoloji Yığını (Tech Stack)
* **Framework:** React 18 + Vite (TypeScript şablonu)
* **Styling:** TailwindCSS v4 (Modern CSS Entegrasyonu)
* **Stellar Kütüphaneleri:**
  * `@stellar/freighter-api` (Cüzdan bağlantısı ve işlem imzalama için)
  * `@stellar/stellar-sdk` (İşlem inşası ve Horizon API sorguları için)
* **Durum Yönetimi:** React Hooks (`useState`, `useEffect`, `useContext`)
* **Veri Depolama:** Tarayıcı Yerel Depolaması (Local Storage - Eklenen projeler ve bağış geçmişi için)
* **Horizon API Sunucusu:** `https://horizon-testnet.stellar.org` (Stellar Resmi Testnet Düğümü)

---

## 3. Bileşen Hiyerarşisi (Component Hierarchy)
Uygulama, modülerlik ve kod temizliği için aşağıdaki bileşen yapısına bölünecektir:

```text
src/
├── components/
│   ├── Header.tsx           # Logo, Cüzdan Bağlantısı, Bakiye Gösterimi
│   ├── Hero.tsx             # Karşılama ve Tanıtım Alanı
│   ├── ProjectCard.tsx      # Tek bir proje kartı (İlerleme çubuğu, bağış formu)
│   ├── ProjectGrid.tsx      # Projelerin listelendiği grid ve "Yeni Proje" butonu
│   ├── AddProjectModal.tsx  # Yeni proje ekleme formu (Modal)
│   ├── DonationHistory.tsx  # Başarılı bağış geçmişi listesi
│   └── Toast.tsx            # Başarılı/Başarısız/Bekleme bildirim kartları
├── App.tsx                  # Ana uygulama düzeni ve durum yönetimi
└── index.css                # TailwindCSS v4 importları ve genel stiller
```

---

## 4. Stellar Entegrasyon ve Veri Akışı (Stellar Integration & Data Flow)

### 4.1 Cüzdan Yönetimi
* **Bağlanma:** `window.stellarPubkey` kontrol edilir veya Freighter API'den `getPublicKey()` çağrılarak adres alınır.
* **Bakiyeyi Güncelleme:** Horizon API'ye cüzdan adresi ile istek atılarak native XLM bakiyesi çekilir:
  ```typescript
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const accountInfo = await server.loadAccount(publicKey);
  const nativeBalance = accountInfo.balances.find(b => b.asset_type === "native")?.balance;
  ```

### 4.2 Projelerin Canlı Bakiye Sorgulaması
* Her proje kartı render edildiğinde veya belirli aralıklarla, projenin cüzdan adresi Horizon sunucusu üzerinden sorgulanır.
* Elde edilen bakiye, projenin toplam fon miktarı olarak progress bar üzerinde gösterilir.

### 4.3 İşlem İnşası ve İmzalama (Donation Flow)
1. **İşlem Hazırlama:** `TransactionBuilder` ile bir ödeme (Payment) işlemi taslağı oluşturulur:
   * `Operation.payment({ destination, asset: Asset.native(), amount })`
2. **Freighter ile İmzalama:**
   * `const signedTx = await FreighterAPI.signTransaction(txXdr, { network: "TESTNET" })`
3. **Ağa Gönderme:**
   * `const response = await server.submitTransaction(signedTx)`
4. **Onaylama:** `response.hash` değeri alınarak kullanıcıya Toast gösterilir ve işlem yerel geçmişe kaydedilir.

---

## 5. Yerel Depolama (Local Storage) Modeli

### 5.1 Projeler Şeması (Projects Schema)
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  destinationAddress: string;
  targetAmount: number;
  category: string;
  isCustom: boolean; // Kullanıcının kendisinin ekleyip eklemediği
}
```

### 5.2 Bağış Geçmişi Şeması (Donation History Schema)
```typescript
interface Donation {
  id: string;
  projectName: string;
  amount: string;
  txHash: string;
  timestamp: number;
}
```

---

## 6. Doğrulama Planı (Verification Plan)
1. **Cüzdan Bağlantısı:** Connect butonunun Freighter'ı tetiklemesi, adres ve bakiyenin doğru yansıması.
2. **Form Doğrulaması:** Yeni proje eklenirken Stellar adres biçiminin (G ile başlayan 56 karakter) ve hedef tutarın geçerliliğinin doğrulanması.
3. **Transfer Testi:** Testnet üzerinde Freighter ile işlem imzalayıp bağış gönderilmesi, alıcı hesabın bakiyesinin artması ve Horizon Explorer linkinin çalışması.

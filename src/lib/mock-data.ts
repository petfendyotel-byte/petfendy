// Mock data for development
import type { User, HotelRoom, TaxiService, Pet, CityPricing, RoomPricing, AdditionalService, Page, BlogPost, GalleryImage, FAQ } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "user@example.com",
    name: "Ahmet Yılmaz",
    phone: "+905551234567",
    passwordHash: "hashed_password_123",
    role: "user",
    emailVerified: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "admin-1",
    email: "admin@petfendy.com",
    name: "Admin User",
    phone: "+905559876543",
    passwordHash: "hashed_admin_password",
    role: "admin",
    emailVerified: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockHotelRooms: HotelRoom[] = [
  {
    id: "room-1",
    name: "Standart Oda",
    type: "standard",
    capacity: 1,
    pricePerNight: 150,
    available: true,
    amenities: ["Yatak", "Su Kasesi", "Oyuncaklar"],
    images: [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1625316708582-7c38734be31d?w=800&h=600&fit=crop",
    ],
    videos: [
      { type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ],
    description: "Evcil dostunuz için konforlu ve güvenli standart konaklama odası. Geniş pencereler ve doğal aydınlatma ile huzurlu bir ortam.",
    features: ["Günlük temizlik", "Doğal ışık", "Ses yalıtımı", "7/24 gözetim"],
  },
  {
    id: "room-2",
    name: "Deluxe Oda",
    type: "deluxe",
    capacity: 2,
    pricePerNight: 250,
    available: true,
    amenities: ["Yatak", "Oyun Alanı", "Kamera Gözetimi", "Klima"],
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800&h=600&fit=crop",
    ],
    videos: [],
    description: "Premium konfor ve ekstra alan sunan deluxe odamız. İki evcil hayvan için ideal, oyun alanı ve özel bakım hizmetleri dahil.",
    features: ["Geniş oyun alanı", "Kamera ile canlı izleme", "Klima sistemi", "Özel beslenme programı", "Günlük aktiviteler"],
  },
  {
    id: "room-3",
    name: "Suite Oda",
    type: "suite",
    capacity: 3,
    pricePerNight: 400,
    available: true,
    amenities: ["Geniş Yatak", "Özel Oyun Alanı", "24/7 Kamera", "Klima", "Isıtma"],
    images: [
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=600&fit=crop",
    ],
    videos: [],
    description: "Lüks konaklama deneyimi sunan suite odamız. Üç evcil hayvan için geniş yaşam alanı, özel oyun bahçesi ve premium hizmetler.",
    features: ["VIP özel alan", "Özel oyun bahçesi", "Premium yatak ve malzemeler", "Veteriner kontrolü", "Spa ve bakım servisi", "24/7 güvenlik"],
  },
]

export const mockTaxiServices: TaxiService[] = [
  {
    id: "taxi-1",
    name: "Pet Taxi",
    description: "Güvenli ve ekonomik evcil hayvan taşıma servisi",
    basePrice: 50,
    pricePerKm: 15,
    maxPetWeight: 10,
    capacity: 2,
    features: ["Güvenli taşıma", "Klima", "Temizlik", "Deneyimli şoför"],
    available: true,
  },
  {
    id: "taxi-2",
    name: "Luxury Pet Transport",
    description: "Premium araçlarla lüks evcil hayvan taşıma hizmeti",
    basePrice: 75,
    pricePerKm: 25,
    maxPetWeight: 20,
    capacity: 4,
    features: ["Premium araç", "Veteriner refakat", "GPS takip", "Özel bakım"],
    available: true,
  },
  {
    id: "taxi-3",
    name: "Express Pet Service",
    description: "Hızlı ve acil durum evcil hayvan taşıma servisi",
    basePrice: 100,
    pricePerKm: 20,
    maxPetWeight: 30,
    capacity: 1,
    features: ["Hızlı servis", "Özel bakım", "Acil durum desteği", "7/24 hizmet"],
    available: true,
  },
]

export const mockPets: Pet[] = [
  {
    id: "pet-1",
    userId: "1",
    name: "Boncuk",
    type: "dog",
    breed: "Golden Retriever",
    age: 3,
    weight: 25,
    specialNeeds: "Hiçbiri",
  },
  {
    id: "pet-2",
    userId: "1",
    name: "Misi",
    type: "cat",
    breed: "Siamese",
    age: 2,
    weight: 4,
    specialNeeds: "Diyetli mama",
  },
]

// City-based pricing for taxi service
export const mockCityPricings: CityPricing[] = [
  {
    id: "city-1",
    fromCity: "İstanbul",
    toCity: "Ankara",
    additionalFee: 100,
    discount: 0,
    distanceKm: 450,
  },
  {
    id: "city-2",
    fromCity: "İstanbul",
    toCity: "İzmir",
    additionalFee: 150,
    discount: 10,
    distanceKm: 470,
  },
  {
    id: "city-3",
    fromCity: "Ankara",
    toCity: "İzmir",
    additionalFee: 80,
    discount: 0,
    distanceKm: 590,
  },
]

// Room pricing for dynamic date-based pricing
export const mockRoomPricings: RoomPricing[] = [
  {
    id: "price-1",
    roomId: "room-1",
    date: new Date("2025-12-31"),
    pricePerNight: 250,
    available: true,
  },
  {
    id: "price-2",
    roomId: "room-2",
    date: new Date("2025-12-31"),
    pricePerNight: 400,
    available: true,
  },
]

// Turkish cities for taxi service
export const mockTurkishCities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Şanlıurfa",
  "Kocaeli",
  "Mersin",
  "Diyarbakır",
  "Hatay",
  "Manisa",
  "Kayseri",
]

// Turkish city districts mapping
export const mockCityDistricts: Record<string, string[]> = {
  "İstanbul": [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
    "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
    "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
    "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
    "Şile", "Şişli", "Sultanbeyli", "Sultangazi", "Tuzla", "Ümraniye",
    "Üsküdar", "Zeytinburnu"
  ],
  "Ankara": [
    "Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya",
    "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana",
    "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan",
    "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"
  ],
  "İzmir": [
    "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova",
    "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe",
    "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz",
    "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar",
    "Selçuk", "Tire", "Torbalı", "Urla"
  ],
  "Bursa": [
    "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey",
    "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli",
    "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"
  ],
  "Antalya": [
    "Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike",
    "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı",
    "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"
  ],
  "Adana": [
    "Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş",
    "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"
  ],
  "Konya": [
    "Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli",
    "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli",
    "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar",
    "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent",
    "Tuzlukçu", "Yalıhüyük", "Yunak"
  ],
  "Gaziantep": [
    "Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey",
    "Şehitkamil", "Yavuzeli"
  ],
  "Şanlıurfa": [
    "Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti",
    "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"
  ],
  "Kocaeli": [
    "Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük",
    "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"
  ],
  "Mersin": [
    "Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar",
    "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"
  ],
  "Diyarbakır": [
    "Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani",
    "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"
  ],
  "Hatay": [
    "Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa",
    "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"
  ],
  "Manisa": [
    "Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç",
    "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma",
    "Şehzadeler", "Turgutlu", "Yunusemre"
  ],
  "Kayseri": [
    "Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan",
    "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza",
    "Yahyalı", "Yeşilhisar"
  ]
}

// Additional services for hotel reservations
export const mockAdditionalServices: AdditionalService[] = [
  {
    id: "service-1",
    name: "Pet Kuaför",
    type: "grooming",
    price: 200,
    duration: "2 saat",
    description: "Profesyonel tıraş, banyo ve tırnak kesimi hizmeti"
  },
  {
    id: "service-2",
    name: "Köpek Eğitimi",
    type: "training",
    price: 500,
    duration: "1 hafta",
    description: "Temel itaat eğitimi ve sosyalleşme programı"
  },
  {
    id: "service-3",
    name: "Günlük Bakım",
    type: "daycare",
    price: 150,
    duration: "Gün boyunca",
    description: "Gün içi oyun ve aktivite programı"
  },
  {
    id: "service-4",
    name: "Premium Kuaför",
    type: "grooming",
    price: 350,
    duration: "3 saat",
    description: "Lüks bakım paketi: Banyo, tıraş, tırnak, kulak temizliği ve parfüm"
  },
  {
    id: "service-5",
    name: "İleri Seviye Eğitim",
    type: "training",
    price: 800,
    duration: "2 hafta",
    description: "İleri seviye itaat ve özel komut eğitimi"
  }
]

// CMS Pages
export const mockPages: Page[] = [
  {
    id: "page-about",
    slug: "about",
    title: "Hakkımızda",
    subtitle: "Petfendy'i Tanıyın",
    content: "<p>Petfendy, Ankara'nın en güvenilir evcil hayvan oteli ve taksi hizmetidir. 2020 yılından beri evcil dostlarınıza profesyonel bakım ve güvenli ulaşım hizmeti sunuyoruz.</p><p>Uzman ekibimiz, modern tesislerimiz ve şeffaf hizmet anlayışımızla binlerce mutlu müşteriye hizmet verdik.</p>",
    heroImage: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=400&fit=crop",
    published: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01")
  },
  {
    id: "page-services",
    slug: "services",
    title: "Hizmetlerimiz",
    subtitle: "Evcil hayvanlarınız için kapsamlı ve profesyonel hizmetler sunuyoruz",
    content: "<p>Petfendy olarak evcil hayvanlarınızın tüm ihtiyaçlarını karşılayacak geniş bir hizmet yelpazesi sunuyoruz.</p>",
    heroImage: "",
    published: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01")
  }
]

// Blog Posts
export const mockBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "Evcil Hayvanınızı Otele Hazırlama Rehberi",
    slug: "evcil-hayvaninizi-otele-hazirlama-rehberi",
    excerpt: "Evcil dostunuzu otele bırakmadan önce yapmanız gereken hazırlıklar ve dikkat edilmesi gereken noktalar.",
    content: "<h2>Giriş</h2><p>Evcil hayvanınızı otele bırakmak başta endişe verici gelebilir. Ancak doğru hazırlıkla bu süreç hem sizin hem de dostunuz için çok daha rahat geçecektir.</p><h2>Hazırlık Listesi</h2><ul><li>Aşı karnesi</li><li>Sevdiği oyuncaklar</li><li>Özel mama tercihi</li><li>Sağlık bilgileri</li></ul>",
    coverImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
    category: "Rehberler",
    tags: ["pet otel", "hazırlık", "sağlık"],
    author: "Petfendy Ekibi",
    published: true,
    publishedAt: new Date("2025-01-15"),
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15")
  },
  {
    id: "blog-2",
    title: "Pet Taksi ile Güvenli Seyahat İpuçları",
    slug: "pet-taksi-ile-guvenli-seyahat-ipuclari",
    excerpt: "Evcil hayvanınızla şehirler arası seyahat ederken dikkat etmeniz gerekenler.",
    content: "<h2>Seyahat Öncesi</h2><p>Pet taksi ile seyahat etmeden önce evcil hayvanınızın rahat etmesi için bazı hazırlıklar yapmanız önemlidir.</p><h2>İpuçları</h2><ul><li>Seyahatten önce veteriner kontrolü</li><li>Rahat taşıma çantası</li><li>Su ve mama tedariki</li><li>Molalar</li></ul>",
    coverImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop",
    category: "Seyahat",
    tags: ["pet taksi", "seyahat", "güvenlik"],
    author: "Petfendy Ekibi",
    published: true,
    publishedAt: new Date("2025-01-20"),
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20")
  },
  {
    id: "blog-3",
    title: "Köpek Eğitiminin Önemi",
    slug: "kopek-egitiminin-onemi",
    excerpt: "Profesyonel köpek eğitiminin köpeğinizin ve sizin hayatınıza katkıları.",
    content: "<h2>Eğitim Neden Önemli?</h2><p>Köpek eğitimi sadece itaat değil, aynı zamanda köpeğinizle aranızda güçlü bir bağ kurmanın en etkili yoludur.</p><h2>Faydaları</h2><ul><li>Daha uyumlu bir arkadaş</li><li>Güvenli sosyalleşme</li><li>Stres azaltma</li><li>Problem davranışların önlenmesi</li></ul>",
    coverImage: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=600&fit=crop",
    category: "Eğitim",
    tags: ["köpek eğitimi", "davranış", "sosyalleşme"],
    author: "Petfendy Ekibi",
    published: true,
    publishedAt: new Date("2025-01-25"),
    createdAt: new Date("2025-01-25"),
    updatedAt: new Date("2025-01-25")
  }
]

// Gallery Images
export const mockGalleryImages: GalleryImage[] = [
  {
    id: "gallery-1",
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop",
    title: "Mutlu Köpek",
    description: "Otelimizdeki mutlu anlar",
    category: "Otel",
    uploadedAt: new Date("2025-01-10")
  },
  {
    id: "gallery-2",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop",
    title: "Sevimli Kedi",
    description: "Konforlu odalarımızda dinlenen kedi",
    category: "Otel",
    uploadedAt: new Date("2025-01-11")
  },
  {
    id: "gallery-3",
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
    title: "Oyun Zamanı",
    description: "Oyun alanımızda eğlence",
    category: "Aktiviteler",
    uploadedAt: new Date("2025-01-12")
  },
  {
    id: "gallery-4",
    url: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=600&fit=crop",
    title: "Eğitim Seansı",
    description: "Profesyonel eğitim programımız",
    category: "Eğitim",
    uploadedAt: new Date("2025-01-13")
  },
  {
    id: "gallery-5",
    url: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&h=600&fit=crop",
    title: "Pet Taksi",
    description: "Güvenli taşıma hizmetimiz",
    category: "Taksi",
    uploadedAt: new Date("2025-01-14")
  },
  {
    id: "gallery-6",
    url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=600&fit=crop",
    title: "Bakım Hizmeti",
    description: "Pet kuaför hizmetlerimiz",
    category: "Bakım",
    uploadedAt: new Date("2025-01-15")
  }
]

// FAQs
export const mockFAQs: FAQ[] = [
  {
    id: "faq-1",
    question: "Pet otel rezervasyonu nasıl yapılır?",
    answer: "Ana sayfadan 'Otel Rezervasyonu' butonuna tıklayarak tarih seçimi yapabilir, uygun odaları görüntüleyebilir ve rezervasyon oluşturabilirsiniz.",
    category: "Otel",
    order: 1,
    published: true
  },
  {
    id: "faq-2",
    question: "Evcil hayvanımı otele bırakırken neler getirmeliyim?",
    answer: "Evcil hayvanınızın aşı karnesi, sevdiği oyuncaklar ve özel mama tercihi varsa bunları getirebilirsiniz. Tüm temel ihtiyaçlar tarafımızdan karşılanmaktadır.",
    category: "Otel",
    order: 2,
    published: true
  },
  {
    id: "faq-3",
    question: "Pet taksi hizmeti hangi şehirlere hizmet veriyor?",
    answer: "Türkiye'nin tüm şehirlerine pet taksi hizmeti veriyoruz. Mesafe bazlı şeffaf fiyatlandırma ile güvenli taşıma sağlıyoruz.",
    category: "Taksi",
    order: 3,
    published: true
  },
  {
    id: "faq-4",
    question: "Ödeme yöntemleri nelerdir?",
    answer: "Kredi kartı ile güvenli online ödeme yapabilirsiniz. Tüm ödemeler SSL sertifikası ile korunmaktadır.",
    category: "Genel",
    order: 4,
    published: true
  },
  {
    id: "faq-5",
    question: "Rezervasyonumu iptal edebilir miyim?",
    answer: "Rezervasyonunuzu giriş tarihinden 48 saat öncesine kadar ücretsiz iptal edebilirsiniz. Detaylar için iptal politikamızı inceleyebilirsiniz.",
    category: "Genel",
    order: 5,
    published: true
  },
  {
    id: "faq-6",
    question: "Otelinizde hangi hizmetler sunuluyor?",
    answer: "Otelimiizde konaklama, oyun alanı, özel bakım, veteriner kontrolü, kamera gözetimi ve daha fazlası bulunmaktadır.",
    category: "Otel",
    order: 6,
    published: true
  },
  {
    id: "faq-7",
    question: "Pet taksi için önceden rezervasyon gerekli mi?",
    answer: "Evet, pet taksi hizmetimiz için rezervasyon yapmanız önerilir. Böylece size en uygun aracı ve zamanı planlayabiliriz.",
    category: "Taksi",
    order: 7,
    published: true
  }
]

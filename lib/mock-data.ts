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
    basePrice: 0,
    pricePerKm: 0,
    maxPetWeight: 10,
    capacity: 2,
    features: ["Güvenli taşıma", "Klima", "Temizlik", "Deneyimli şoför"],
    available: true,
  },
  {
    id: "taxi-2",
    name: "Luxury Pet Transport",
    description: "Premium araçlarla lüks evcil hayvan taşıma hizmeti",
    basePrice: 0,
    pricePerKm: 0,
    maxPetWeight: 20,
    capacity: 4,
    features: ["Premium araç", "Veteriner refakat", "GPS takip", "Özel bakım"],
    available: true,
  },
  {
    id: "taxi-3",
    name: "Express Pet Service",
    description: "Hızlı ve acil durum evcil hayvan taşıma servisi",
    basePrice: 0,
    pricePerKm: 0,
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

// Turkish cities for taxi service - All 81 provinces
export const mockTurkishCities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
]

// Turkish city districts mapping - All 81 provinces with their districts
export const mockCityDistricts: Record<string, string[]> = {
  "Adana": [
    "Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş",
    "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"
  ],
  "Adıyaman": [
    "Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"
  ],
  "Afyonkarahisar": [
    "Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", 
    "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Merkez", "Sandıklı", 
    "Sinanpaşa", "Sultandağı", "Şuhut"
  ],
  "Ağrı": [
    "Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"
  ],
  "Aksaray": [
    "Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi"
  ],
  "Amasya": [
    "Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"
  ],
  "Ankara": [
    "Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya",
    "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana",
    "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan",
    "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"
  ],
  "Antalya": [
    "Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike",
    "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı",
    "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"
  ],
  "Ardahan": [
    "Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"
  ],
  "Artvin": [
    "Ardanuç", "Arhavi", "Borçka", "Hopa", "Merkez", "Murgul", "Şavşat", "Yusufeli"
  ],
  "Aydın": [
    "Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", 
    "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", 
    "Söke", "Sultanhisar", "Yenipazar"
  ],
  "Balıkesir": [
    "Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", 
    "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", 
    "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"
  ],
  "Bartın": [
    "Amasra", "Kurucaşile", "Merkez", "Ulus"
  ],
  "Batman": [
    "Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"
  ],
  "Bayburt": [
    "Aydıntepe", "Demirözü", "Merkez"
  ],
  "Bilecik": [
    "Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"
  ],
  "Bingöl": [
    "Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"
  ],
  "Bitlis": [
    "Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"
  ],
  "Bolu": [
    "Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", 
    "Seben", "Yeniçağa"
  ],
  "Burdur": [
    "Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", 
    "Kemer", "Merkez", "Tefenni", "Yeşilova"
  ],
  "Bursa": [
    "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey",
    "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli",
    "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"
  ],
  "Çanakkale": [
    "Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", 
    "Gelibolu", "Gökçeada", "Lapseki", "Merkez", "Yenice"
  ],
  "Çankırı": [
    "Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", 
    "Korgun", "Kurşunlu", "Merkez", "Orta", "Şabanözü", "Yapraklı"
  ],
  "Çorum": [
    "Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", 
    "Mecitözü", "Merkez", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"
  ],
  "Denizli": [
    "Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", 
    "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", 
    "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"
  ],
  "Diyarbakır": [
    "Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani",
    "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"
  ],
  "Düzce": [
    "Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"
  ],
  "Edirne": [
    "Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"
  ],
  "Elazığ": [
    "Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", 
    "Maden", "Merkez", "Palu", "Sivrice"
  ],
  "Erzincan": [
    "Çayırlı", "İliç", "Kemah", "Kemaliye", "Merkez", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"
  ],
  "Erzurum": [
    "Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", 
    "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", 
    "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"
  ],
  "Eskişehir": [
    "Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", 
    "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"
  ],
  "Gaziantep": [
    "Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey",
    "Şehitkamil", "Yavuzeli"
  ],
  "Giresun": [
    "Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", 
    "Eynesil", "Görele", "Güce", "Keşap", "Merkez", "Piraziz", "Şebinkarahisar", 
    "Tirebolu", "Yağlıdere"
  ],
  "Gümüşhane": [
    "Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"
  ],
  "Hakkâri": [
    "Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"
  ],
  "Hatay": [
    "Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa",
    "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"
  ],
  "Iğdır": [
    "Aralık", "Karakoyunlu", "Merkez", "Tuzluca"
  ],
  "Isparta": [
    "Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Merkez", 
    "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"
  ],
  "İstanbul": [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
    "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
    "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
    "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
    "Şile", "Şişli", "Sultanbeyli", "Sultangazi", "Tuzla", "Ümraniye",
    "Üsküdar", "Zeytinburnu"
  ],
  "İzmir": [
    "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova",
    "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe",
    "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz",
    "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar",
    "Selçuk", "Tire", "Torbalı", "Urla"
  ],
  "Kahramanmaraş": [
    "Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", 
    "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"
  ],
  "Karabük": [
    "Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"
  ],
  "Karaman": [
    "Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"
  ],
  "Kars": [
    "Akyaka", "Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz"
  ],
  "Kastamonu": [
    "Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", 
    "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", 
    "Küre", "Merkez", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"
  ],
  "Kayseri": [
    "Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan",
    "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza",
    "Yahyalı", "Yeşilhisar"
  ],
  "Kırıkkale": [
    "Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"
  ],
  "Kırklareli": [
    "Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"
  ],
  "Kırşehir": [
    "Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"
  ],
  "Kilis": [
    "Elbeyli", "Merkez", "Musabeyli", "Polateli"
  ],
  "Kocaeli": [
    "Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük",
    "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"
  ],
  "Konya": [
    "Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli",
    "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli",
    "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar",
    "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent",
    "Tuzlukçu", "Yalıhüyük", "Yunak"
  ],
  "Kütahya": [
    "Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", 
    "Gediz", "Hisarcık", "Merkez", "Pazarlar", "Simav", "Şaphane", "Tavşanlı"
  ],
  "Malatya": [
    "Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", 
    "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"
  ],
  "Manisa": [
    "Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç",
    "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma",
    "Şehzadeler", "Turgutlu", "Yunusemre"
  ],
  "Mardin": [
    "Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", 
    "Ömerli", "Savur", "Yeşilli"
  ],
  "Mersin": [
    "Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar",
    "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"
  ],
  "Muğla": [
    "Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", 
    "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"
  ],
  "Muş": [
    "Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"
  ],
  "Nevşehir": [
    "Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"
  ],
  "Niğde": [
    "Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"
  ],
  "Ordu": [
    "Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", 
    "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", 
    "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"
  ],
  "Osmaniye": [
    "Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"
  ],
  "Rize": [
    "Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", 
    "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Merkez", "Pazar"
  ],
  "Sakarya": [
    "Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", 
    "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", 
    "Serdivan", "Söğütlü", "Taraklı"
  ],
  "Samsun": [
    "19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", 
    "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Ondokuzmayıs", "Salıpazarı", 
    "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"
  ],
  "Siirt": [
    "Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"
  ],
  "Sinop": [
    "Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"
  ],
  "Sivas": [
    "Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", 
    "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Merkez", "Suşehri", 
    "Şarkışla", "Ulaş", "Yıldızeli", "Zara"
  ],
  "Şanlıurfa": [
    "Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti",
    "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"
  ],
  "Şırnak": [
    "Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"
  ],
  "Tekirdağ": [
    "Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", 
    "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"
  ],
  "Tokat": [
    "Almus", "Artova", "Başçiftlik", "Erbaa", "Merkez", "Niksar", "Pazar", 
    "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"
  ],
  "Trabzon": [
    "Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", 
    "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", 
    "Ortahisar", "Şalpazarı", "Sürmene", "Tonya", "Vakfıkebir", "Yomra"
  ],
  "Tunceli": [
    "Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"
  ],
  "Uşak": [
    "Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"
  ],
  "Van": [
    "Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", 
    "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"
  ],
  "Yalova": [
    "Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"
  ],
  "Yozgat": [
    "Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", 
    "Kadışehri", "Merkez", "Saraykent", "Sarıkaya", "Şefaatli", "Sorgun", 
    "Sulusaray", "Yenifakılı", "Yerköy"
  ],
  "Zonguldak": [
    "Alaplı", "Çaycuma", "Devrek", "Gökçebey", "Kilimli", "Kozlu", "Merkez", "Ereğli"
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
  },
  {
    id: "blog-4",
    title: "Temel İtaat Eğitimi: Köpeğinizle İyi Bir İletişim Kurmanın Anahtarı",
    slug: "temel-itaat-egitimi-kopeginizle-iyi-bir-iletisim-kurmanin-anahtari",
    excerpt: "Köpeğinizle sağlam bir iletişim kurmak, onunla sağlıklı bir ilişki geliştirmenin ve davranışlarını kontrol altında tutmanın önemli bir parçasıdır.",
    content: `<p>Köpeğinizle sağlam bir iletişim kurmak, onunla sağlıklı bir ilişki geliştirmenin ve davranışlarını kontrol altında tutmanın önemli bir parçasıdır. Temel itaat eğitimi, köpeğinize gerekli komutları öğretirken aynı zamanda sizinle güçlü bir bağ oluşturmanızı sağlar.</p>

<h2>Temel İtaat Eğitimi Nedir?</h2>
<p>Temel itaat eğitimi, köpeklere temel davranış ve komutları öğretmeyi amaçlayan bir eğitim programıdır. Bu eğitim, köpeğinizin günlük hayatta sizinle ve çevresiyle uyumlu bir şekilde yaşamasını sağlamak için önemlidir. Temel itaat eğitimi, köpeğinizi disipline etmenin yanı sıra güvenliği, sosyalizasyonu ve iletişimi geliştirmeyi hedefler.</p>

<h2>Temel Komutlar</h2>
<p>Temel itaat eğitimi, köpeğinize aşağıdaki temel komutları öğretmeyi içerir:</p>

<h3>Otur</h3>
<p>Köpeğinizi oturmaya teşvik etmek için bu komutu kullanabilirsiniz. Otur komutu, köpeğinizi sakinleştirmek, kontrollü bir davranış sergilemesini sağlamak veya başka bir komuta geçiş yapmak için kullanılabilir.</p>

<h3>Yat/Yer</h3>
<p>Bu komut, köpeğinizi yatmaya veya belirli bir yerde beklemeye yönlendirmek için kullanılır. Yat komutu, köpeğinize sakin ve rahat bir şekilde uzanmayı öğretir.</p>

<h3>Gel</h3>
<p>Köpeğinizi size doğru gelmeye teşvik etmek ve onu çağırdığınızda size yaklaşmasını sağlamak için kullanılır. Gel komutu, köpeğinizin güvenliğini sağlamak ve serbest dolaşımda kontrolü elinizde tutmak için önemlidir.</p>

<h3>Bekle/Dur</h3>
<p>Bu komut, köpeğinizi belirli bir noktada bekletmek veya hareketini sınırlamak için kullanılır. Bekle komutu, köpeğinizin bir kapıda, merdivende veya trafikte güvende kalmasını sağlar.</p>

<h2>Pozitif Takviye</h2>
<p>Temel itaat eğitimi, pozitif takviye yöntemleriyle gerçekleştirilir. Köpeğinize doğru davranışı sergilediğinde övgü, sevgi veya ödül gibi teşvikler vermek temel bir prensiptir. Pozitif takviye, köpeğinizle güvene dayalı bir ilişki kurmayı ve onun motivasyonunu artırmayı amaçlar.</p>

<p>Temel itaat eğitimi, köpeğinizin davranış problemlerini önlemek veya düzeltmek için de kullanılabilir. Düzenli ve tutarlı bir şekilde eğitime devam etmek, köpeğinizin öğrendiği becerileri pekiştirmek ve sürdürmek için önemlidir.</p>

<p>Unutmayın ki, her köpek farklıdır ve öğrenme hızı ve yetenekleri de farklılık gösterebilir. Sabır, sürekli pratik ve pozitif takviye yöntemlerini kullanmak, köpeğinizle iyi bir iletişim ve sağlıklı bir ilişki kurmanın temelidir.</p>

<p><strong>Temel itaat eğitiminde uzmanlar ile birlikte çalışmak için bizimle iletişime geçebilirsiniz.</strong></p>`,
    coverImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop",
    category: "Eğitim",
    tags: ["köpek eğitimi", "itaat eğitimi", "komutlar", "pozitif takviye"],
    author: "Petfendy Ekibi",
    published: true,
    publishedAt: new Date("2023-06-03"),
    createdAt: new Date("2023-06-03"),
    updatedAt: new Date("2023-06-03")
  },
  {
    id: "blog-5",
    title: "Yavru Köpek Eğitimi için İpuçları",
    slug: "yavru-kopek-egitimi-icin-ipuclari",
    excerpt: "Yeni bir yavru köpek evlat edindiğinizde, evcil hayvanınızın eğitimi önemlidir. Yavruluk zamanı bir köpeğin eğitimi için en uygun zamandır.",
    content: `<p>Yeni bir yavru köpek evlat edindiğinizde, evcil hayvanınızın eğitimi önemlidir. Eğitimsiz bir köpek, stresli olabilir ve yanlış davranışlar geliştirebilir. Yavruluk zamanı bir köpeğin eğitimi için en uygun zamandır. Düzgün eğitim almamış bir köpekte sosyalleşme, davranış bozuklukları ve hayatınıza adapte olma sorunları ortaya çıkabilir.</p>

<h2>1. Adım: Yavru Köpeğinizi Tanıyın</h2>
<p>Yavru köpeğinizi tanımak, onunla etkileşim kurmanızı ve onun davranışını anlamanızı sağlar. Bu nedenle, ilk adım yavru köpeğinizin karakteristik özelliklerini öğrenmek olmalıdır. Bu özellikler, köpeğin ırkına, yaşına, cinsiyetine, kişiliğine ve yeteneklerine bağlı olarak farklılık gösterir.</p>

<h2>2. Adım: Tuvalet Eğitimi Verin</h2>
<p>Tuvalet eğitimi, evcil hayvanınızın temel eğitiminde en önemli adımdır. Yavru köpekler tuvalet eğitimi almak için en iyi yaş aralığı 8-16 hafta arasındadır. Tuvalet eğitimi, sabır ve özveri gerektiren bir süreçtir, ancak doğru bir şekilde yapılırsa, evcil hayvanınızın hayatı boyunca ona faydası olacaktır.</p>

<h2>3. Adım: Komutları Öğretin</h2>
<p>Evcil hayvanınızın komutları öğrenmesi, güvenliği sağlamak için önemlidir. Komutlar, temel olarak "otur", "yere", "bekle", "gel", "hayır" gibi kelimeleri içerir. Bu komutları öğretmek, evcil hayvanınızın iyi davranışlar sergilemesini sağlar.</p>

<h2>4. Adım: Sosyalleşme Eğitimi Verin</h2>
<p>Köpekler sosyal hayvanlardır ve diğer köpeklerle ve insanlarla etkileşim kurmaya ihtiyaç duyarlar. Sosyalleşme eğitimi, köpeğinizi diğer insanlarla ve hayvanlarla uyumlu hale getirir ve evdeki yaşamınızı daha kolay hale getirir.</p>

<h2>5. Adım: Olumlu Tepki Verin</h2>
<p>Evcil hayvanınızın iyi davranışlar sergilemesi, onu teşvik etmek ve eğitim sürecini daha kolay hale getirmek için olumlu tepkiler verin. Köpeğinizi övün, sevin ve ödüllendirin. Bu, köpeğinizin öğrenme sürecini hızlandırır ve onu daha iyi davranışlar sergilemeye teşvik eder.</p>

<h2>6. Adım: Sabırlı Olun</h2>
<p>Köpek eğitimi, sabır gerektiren bir süreçtir. Eğitim sürecinde, evcil hayvanınızın öğrenme hızı ve özellikleri konusunda anlayışlı olun. Her köpek farklıdır, bu nedenle eğitim süreci de farklı olabilir. Sabırlı olmak, köpeğinizin iyi davranışlar sergilemesi için çok önemlidir.</p>

<h2>7. Adım: Eğitimi Rutin Hale Getirin</h2>
<p>Eğitim sürecini rutin hale getirin. Köpeğinizin öğrenme hızını artırmak için, eğitimi aynı zamanda ve aynı yerde yapın. Bu, köpeğinizin eğitim sürecinde daha hızlı ilerlemesine yardımcı olacaktır.</p>

<p>Temel köpek eğitimi, evcil hayvanınızın güvenliği ve sağlığı için son derece önemlidir. Yavru köpeklerinizi eğitmek, sabır, özveri ve tutarlılık gerektirir. Kendiniz yeterli gelmediğiniz durumlarda mutlaka bir uzmana başvurun.</p>`,
    coverImage: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop",
    category: "Eğitim",
    tags: ["yavru köpek", "köpek eğitimi", "tuvalet eğitimi", "sosyalleşme"],
    author: "Petfendy Ekibi",
    published: true,
    publishedAt: new Date("2023-03-12"),
    createdAt: new Date("2023-03-12"),
    updatedAt: new Date("2023-03-12")
  },
  {
    id: "blog-6",
    title: "Köpeklerin Sosyalleşmesi: Sıkılmış Köpeklerinizi Mutlu Etmek İçin İpuçları",
    slug: "kopeklerin-sosyallesmesi-sikilmis-kopeklerinizi-mutlu-etmek-icin-ipuclari",
    excerpt: "Köpekler, sosyal yaratıklardır ve insanlar gibi etkileşim kurmaya ihtiyaç duyarlar. Sosyalizasyon eğitimi ile köpeğinizi mutlu edin.",
    content: `<p>Köpekler, sosyal yaratıklardır ve insanlar gibi etkileşim kurmaya ihtiyaç duyarlar. Ancak, bazı köpekler sosyalizasyon konusunda zorluk çekebilirler ve bu da davranış problemlerine neden olabilir. Sıkılmış köpekler, yıkıcı davranışlar sergileme eğilimindedir ve bu da ev sahipleri için stresli bir durum olabilir.</p>

<h2>Köpeklerde Sosyalleşme Nedir?</h2>
<p>Köpeklerin sosyalleşmesi, onların insanlar ve diğer köpeklerle etkileşim kurmasını ve davranışlarını kontrol altında tutmasını öğrenmelerini içerir. Sosyalleşme süreci, köpeklerin erken yaşlarda başlar ve ömür boyu devam eder. Sosyalleşme, köpeklerin yeni insanlar ve diğer köpeklerle karşılaştıklarında rahat ve güvende hissetmelerine yardımcı olur.</p>

<p>Köpeklerin sosyalleşmesi, sağlıklı bir yaşam sürmeleri için çok önemlidir. Sosyalleşmeyen köpekler, yabancılarla ve diğer köpeklerle etkileşim kurmakta zorluk çekebilirler ve bu da davranış problemlerine neden olabilir.</p>

<h2>Sosyalizasyon Eğitimi Nedir?</h2>
<p>Sosyalizasyon eğitimi, köpeklerin daha sosyal olmalarına yardımcı olmak için tasarlanmış bir eğitim programıdır. Bu program, köpeklerin diğer köpeklerle, insanlarla ve çevreleriyle daha iyi etkileşim kurmalarını sağlar. Sosyal köpekler, daha mutlu, daha az stresli ve daha az davranış problemleriyle karşı karşıya kalırlar.</p>

<h2>Sosyalizasyon Eğitimi İçin Adımlar</h2>

<h3>Sosyalizasyona Erken Başlamak</h3>
<p>Köpeklerin sosyalizasyon süreci, erken yaşlarda başlamalıdır. Köpekler 12 haftalıkken sosyalleşmeye başlamalıdır. Köpeğiniz yetişkin bir köpek ise uzman eğitmenler ile bu sorunun üstesinden gelinebilir.</p>

<h3>Köpeğinize Farklı Ortamlarda Deneyimler Sunmak</h3>
<p>Köpeklerinizi farklı ortamlara götürün ve onları farklı deneyimler ile eğitin. Köpeklerinizi, parklara, sokaklara, plajlara, mağazalara ve diğer sosyal ortamlara götürün farklı canlılar ve köpekler ile tanıştırın.</p>

<h3>Köpeğinizi Farklı İnsanlarla Tanıştırın</h3>
<p>Köpeklerinizi farklı insanlarla tanıştırın. Farklı yaş, cinsiyet, boy, ten rengi ve kıyafetler giyen insanlarla tanıştırmak onu mutlu edecektir aynı zamanda farklı insanlara alışmasını sağlayacaktır.</p>

<h3>Diğer Köpeklerle Tanıştırın</h3>
<p>Köpek sosyalizasyonunun en önemli kısmı diğer köpekler ve canlılar ile tanıştırmaktadır. Eğer köpeğinizin agresif veya stresli tepkileri var ise bu işlemi bir uzman eşliğinde yapmanız köpeğiniz için en iyisi olacaktır.</p>

<h3>Pozitif Takviye Kullanın</h3>
<p>Pozitif takviye kullanmak köpekler için en iyi sonuç veren yöntemlerden biridir. Sosyalizasyon eğitimi sırasında pozitif takviye kullanın. Köpeklerinize, ödül vererek istenilen davranışları teşvik edin.</p>

<h3>Bir Uzmana Danışın</h3>
<p>Köpek sosyalizasyonu köpeğinizin mutluluğu için doğru bir şekilde yönetilmesi gereken bir süreçtir. Özellikle yetişkin köpeklerde oturmuş bir davranış şekli olduğu için eğitimleri için mutlaka bir uzmana başvurmanızı tavsiye ederiz.</p>`,
    coverImage: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&h=600&fit=crop",
    category: "Eğitim",
    tags: ["köpek sosyalleşme", "sosyalizasyon", "köpek davranışı", "eğitim"],
    author: "Petfendy Ekibi",
    published: true,
    publishedAt: new Date("2023-03-11"),
    createdAt: new Date("2023-03-11"),
    updatedAt: new Date("2023-03-11")
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

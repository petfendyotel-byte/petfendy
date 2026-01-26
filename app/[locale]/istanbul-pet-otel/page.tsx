import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Star, Heart, Shield } from "lucide-react";
import Link from "next/link";

export default function IstanbulPetOtelPage() {
  const t = useTranslations('services');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MapPin className="w-4 h-4" />
            İstanbul Pet Otel Hizmeti
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            İstanbul'da
            <span className="text-blue-600 block">Güvenli Pet Otel</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            İstanbul'da sevimli dostlarınız için güvenli, konforlu ve profesyonel pet otel hizmeti. 
            Deneyimli ekibimizle evcil hayvanlarınız güvende.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tr/booking/hotel">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Hemen Rezervasyon Yap
              </Button>
            </Link>
            <Link href="/tr/iletisim">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Phone className="w-4 h-4 mr-2" />
                İletişime Geç
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              İstanbul Pet Otel Özellikleri
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Evcil hayvanlarınız için en iyi bakım ve konfor standartları
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Güvenli Ortam</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  7/24 güvenlik kamerası, veteriner hekim desteği ve acil durum protokolleri ile tam güvenlik
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Sevgi Dolu Bakım</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Deneyimli ve hayvan sever personelimiz evcil dostlarınıza özel ilgi gösterir
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Premium Hizmet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Özel oyun alanları, düzenli beslenme programı ve günlük aktiviteler
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              İstanbul Hizmet Bölgeleri
            </h2>
            <p className="text-gray-600">
              İstanbul'un her bölgesinden evcil hayvanlarınızı güvenle teslim alıyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Beşiktaş", "Şişli", "Kadıköy", "Üsküdar",
              "Bakırköy", "Beyoğlu", "Fatih", "Sarıyer"
            ].map((district) => (
              <Card key={district} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">{district}</h3>
                  <p className="text-sm text-gray-600 mt-1">Ücretsiz Transfer</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Contact */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              İstanbul Pet Otel Rezervasyonu
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Evcil dostlarınız için güvenli ve konforlu konaklama deneyimi
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>7/24 Hizmet</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>Anında İletişim</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Güvenli Ortam</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tr/booking/hotel">
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  Rezervasyon Yap
                </Button>
              </Link>
              <Link href="/tr/iletisim">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                  Bilgi Al
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-amber-100 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              ⚠️ Önemli Bilgilendirme
            </h3>
            <p className="text-amber-700">
              Şu anda pet otel hizmetimiz <strong>Ankara</strong> bölgesinde aktiftir. 
              İstanbul için hizmet başlangıç tarihi hakkında bilgi almak için iletişime geçin.
            </p>
            <div className="mt-4">
              <Link href="/tr/ankara-pet-otel">
                <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-200">
                  Ankara Pet Otel Hizmetini İncele
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
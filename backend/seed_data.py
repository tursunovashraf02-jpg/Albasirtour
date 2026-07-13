"""Demo content seeding for AL BASIR TOUR."""

from typing import Callable


TOURS = [
    {
        "slug": "istanbul-cappadocia-7d",
        "country": "Turkey",
        "city": "Istanbul + Cappadocia",
        "hotel": "Ramada Merter 4* / Sultan Cave Suites 5*",
        "days": 7, "nights": 6,
        "meals": "HB", "transport": "Bus + Domestic Flight",
        "flight_included": True, "insurance_included": True, "visa_included": False,
        "price": 890.0, "old_price": 1150.0, "discount_percent": 22,
        "currency": "USD", "package": "Gold", "featured": True,
        "image": "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg",
        "gallery": [
            "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg",
            "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b",
            "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200",
        ],
        "translations": {
            "en": {"title": "Istanbul & Cappadocia Grand Tour",
                   "description": "Wander the Bosphorus at dusk, drift over fairy chimneys at dawn — a curated 7-day journey pairing Ottoman heritage with Cappadocia's lunar landscapes.",
                   "highlights": "Balloon flight · Bosphorus cruise · Blue Mosque · Goreme open-air museum"},
            "uz": {"title": "Istanbul va Kappadokiya sayohati",
                   "description": "Bosfor bo'ylab kechki sayr, tong palasidagi issiq havo sharlari — Usmoniylar tarixi va Kappadokiya sehri jamlangan 7 kunlik dasturi.",
                   "highlights": "Sharda uchish · Bosfor kruizi · Ko'k masjid · Goreme muzeyi"},
            "ru": {"title": "Стамбул и Каппадокия — гранд-тур",
                   "description": "Босфор на закате и полёт на воздушном шаре над скалами Каппадокии — тщательно спланированный 7-дневный маршрут.",
                   "highlights": "Полёт на шаре · Круиз по Босфору · Голубая мечеть · Гёреме"},
        },
        "departure_dates": ["2026-03-15", "2026-04-05", "2026-05-01"],
        "rating": 4.9, "reviews_count": 128,
    },
    {
        "slug": "dubai-luxury-5d",
        "country": "UAE",
        "city": "Dubai",
        "hotel": "Atlantis The Palm 5*",
        "days": 5, "nights": 4,
        "meals": "BB", "transport": "Private Transfer",
        "flight_included": True, "insurance_included": True, "visa_included": True,
        "price": 1490.0, "old_price": 1790.0, "discount_percent": 17,
        "currency": "USD", "package": "VIP", "featured": True,
        "image": "https://images.pexels.com/photos/19612315/pexels-photo-19612315.jpeg",
        "gallery": [
            "https://images.pexels.com/photos/19612315/pexels-photo-19612315.jpeg",
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
            "https://images.unsplash.com/photo-1580674684081-7617fbf3d745",
        ],
        "translations": {
            "en": {"title": "Dubai — Skyline & Sand Dunes",
                   "description": "Five days of quiet luxury: Burj Khalifa observation at sunset, desert safari at golden hour, yacht cruising the Marina.",
                   "highlights": "Burj Khalifa · Desert safari · Marina yacht · Palm Jumeirah"},
            "uz": {"title": "Dubay — osmono'par va cho'l",
                   "description": "5 kunlik hashamatli sayohat: Burj Khalifa'dan quyoshning botishi, oltin soatda cho'l safari, Marina bo'ylab yaxta.",
                   "highlights": "Burj Khalifa · Cho'l safari · Yaxta · Palm Jumeirah"},
            "ru": {"title": "Дубай — небоскрёбы и дюны",
                   "description": "5 дней тихой роскоши: закат с Бурдж-Халифа, сафари в золотой час, круиз по Marina.",
                   "highlights": "Бурдж-Халифа · Сафари · Яхта · Palm Jumeirah"},
        },
        "departure_dates": ["2026-02-20", "2026-03-10", "2026-04-15"],
        "rating": 4.8, "reviews_count": 96,
    },
    {
        "slug": "umrah-10d",
        "country": "Saudi Arabia",
        "city": "Makkah + Madinah",
        "hotel": "Swissôtel Al Maqam 5* / Anwar Al Madinah Movenpick",
        "days": 10, "nights": 9,
        "meals": "FB", "transport": "VIP Bus + Flight",
        "flight_included": True, "insurance_included": True, "visa_included": True,
        "price": 1680.0, "old_price": 1890.0, "discount_percent": 11,
        "currency": "USD", "package": "Gold", "featured": True,
        "image": "https://images.unsplash.com/photo-1513072064285-240f87fa81e8",
        "gallery": [
            "https://images.unsplash.com/photo-1513072064285-240f87fa81e8",
            "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa",
        ],
        "translations": {
            "en": {"title": "Umrah — Sacred Journey",
                   "description": "Full-support Umrah with Uzbek-speaking guides, close-to-Haram hotels, and daily ziyarat.",
                   "highlights": "Kaaba · Prophet's Mosque · Ziyarat · Mina & Arafat"},
            "uz": {"title": "Umra — muqaddas safar",
                   "description": "Umra safari — o'zbek tilida gid, Haramga yaqin mehmonxonalar, kunlik ziyoratlar bilan.",
                   "highlights": "Ka'ba · Masjid an-Nabawiy · Ziyorat · Mina va Arafot"},
            "ru": {"title": "Умра — священное путешествие",
                   "description": "Полное сопровождение: гид на узбекском, отели рядом с Харамом, ежедневные зиярат.",
                   "highlights": "Кааба · Мечеть Пророка · Зиярат · Мина и Арафат"},
        },
        "departure_dates": ["2026-03-01", "2026-04-01", "2026-05-01"],
        "rating": 5.0, "reviews_count": 214,
    },
    {
        "slug": "bali-paradise-8d",
        "country": "Indonesia",
        "city": "Bali",
        "hotel": "Ayana Resort 5*",
        "days": 8, "nights": 7,
        "meals": "BB", "transport": "Private Van",
        "flight_included": True, "insurance_included": True, "visa_included": False,
        "price": 1290.0, "old_price": 1490.0, "discount_percent": 13,
        "currency": "USD", "package": "Gold", "featured": True,
        "image": "https://images.pexels.com/photos/35043038/pexels-photo-35043038.jpeg",
        "gallery": [
            "https://images.pexels.com/photos/35043038/pexels-photo-35043038.jpeg",
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
        ],
        "translations": {
            "en": {"title": "Bali — Emerald Escape",
                   "description": "Ubud jungle mornings, Uluwatu cliff sunsets, and villa afternoons overlooking rice terraces.",
                   "highlights": "Ubud rice terraces · Uluwatu · Nusa Penida · Tanah Lot"},
            "uz": {"title": "Bali — zumrad orolga safar",
                   "description": "Ubud o'rmoni, Uluwatu qoyalari va guruch dalalari uzra villalar — tabiat bilan uzviy sayohat.",
                   "highlights": "Ubud · Uluwatu · Nusa Penida · Tanah Lot"},
            "ru": {"title": "Бали — изумрудный побег",
                   "description": "Утро в джунглях Убуда, закаты в Улувату и виллы над рисовыми террасами.",
                   "highlights": "Убуд · Улувату · Нуса-Пенида · Танах-Лот"},
        },
        "departure_dates": ["2026-04-10", "2026-05-15"],
        "rating": 4.9, "reviews_count": 87,
    },
    {
        "slug": "malaysia-kl-langkawi-6d",
        "country": "Malaysia",
        "city": "Kuala Lumpur + Langkawi",
        "hotel": "Berjaya Times Square + Andaman Langkawi",
        "days": 6, "nights": 5,
        "meals": "BB", "transport": "Flight + Bus",
        "flight_included": True, "insurance_included": True, "visa_included": False,
        "price": 1090.0, "old_price": 1250.0, "discount_percent": 13,
        "currency": "USD", "package": "Silver", "featured": False,
        "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07",
        "gallery": ["https://images.unsplash.com/photo-1596422846543-75c6fc197f07"],
        "translations": {
            "en": {"title": "Malaysia — Twin Cities",
                   "description": "Petronas Towers by night, Langkawi mangroves by day.",
                   "highlights": "Petronas · Batu Caves · Langkawi cable car · Island hopping"},
            "uz": {"title": "Malayziya — ikki shahar",
                   "description": "Kechqurun Petronas minoralari, kunduzi Langkavi mangrolari.",
                   "highlights": "Petronas · Batu · Langkavi · Orollar"},
            "ru": {"title": "Малайзия — два города",
                   "description": "Башни Петронас ночью и мангры Лангкави днём.",
                   "highlights": "Петронас · Бату · Лангкави · Острова"},
        },
        "departure_dates": ["2026-03-20", "2026-05-05"],
        "rating": 4.7, "reviews_count": 54,
    },
    {
        "slug": "egypt-pyramids-nile-8d",
        "country": "Egypt",
        "city": "Cairo + Luxor",
        "hotel": "Marriott Mena House + Sonesta St. George",
        "days": 8, "nights": 7,
        "meals": "HB", "transport": "Cruise + Flight",
        "flight_included": True, "insurance_included": True, "visa_included": True,
        "price": 1190.0, "old_price": 1390.0, "discount_percent": 14,
        "currency": "USD", "package": "Gold", "featured": False,
        "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020",
        "gallery": ["https://images.unsplash.com/photo-1568322445389-f64ac2515020"],
        "translations": {
            "en": {"title": "Egypt — Pyramids & Nile",
                   "description": "Sail the Nile between Luxor temples and stand before Giza's timeless stones.",
                   "highlights": "Giza pyramids · Sphinx · Nile cruise · Valley of Kings"},
            "uz": {"title": "Misr — piramidalar va Nil",
                   "description": "Nil daryosi bo'ylab kruiz, Giza piramidalari oldida — abadiy tarix.",
                   "highlights": "Piramidalar · Sfenks · Nil kruizi · Podshohlar vodiysi"},
            "ru": {"title": "Египет — пирамиды и Нил",
                   "description": "Круиз по Нилу и величие пирамид Гизы.",
                   "highlights": "Пирамиды · Сфинкс · Круиз · Долина Царей"},
        },
        "departure_dates": ["2026-03-25", "2026-04-20"],
        "rating": 4.8, "reviews_count": 71,
    },
    {
        "slug": "thailand-phuket-7d",
        "country": "Thailand",
        "city": "Phuket + Bangkok",
        "hotel": "Le Meridien Phuket + Anantara Siam",
        "days": 7, "nights": 6,
        "meals": "BB", "transport": "Flight + Speedboat",
        "flight_included": True, "insurance_included": True, "visa_included": False,
        "price": 1150.0, "old_price": 1320.0, "discount_percent": 13,
        "currency": "USD", "package": "Silver", "featured": False,
        "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
        "gallery": ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a"],
        "translations": {
            "en": {"title": "Thailand — Islands & Temples",
                   "description": "Turquoise bays of Phi Phi, glittering wats of Bangkok.",
                   "highlights": "Phi Phi islands · Grand Palace · James Bond Island · Night markets"},
            "uz": {"title": "Tailand — orollar va ibodatxonalar",
                   "description": "Phi Phi ko'k suvlari va Bangkok yaltiroq ibodatxonalari.",
                   "highlights": "Phi Phi · Katta saroy · James Bond oroli · Tungi bozorlar"},
            "ru": {"title": "Таиланд — острова и храмы",
                   "description": "Бирюзовые бухты Пхи-Пхи и мерцающие ваты Бангкока.",
                   "highlights": "Пхи-Пхи · Большой дворец · Остров Джеймса Бонда · Ночные рынки"},
        },
        "departure_dates": ["2026-02-25", "2026-04-05"],
        "rating": 4.8, "reviews_count": 64,
    },
    {
        "slug": "qatar-doha-4d",
        "country": "Qatar",
        "city": "Doha",
        "hotel": "The Ritz-Carlton Doha 5*",
        "days": 4, "nights": 3,
        "meals": "BB", "transport": "Private Transfer",
        "flight_included": True, "insurance_included": True, "visa_included": True,
        "price": 890.0, "old_price": 990.0, "discount_percent": 10,
        "currency": "USD", "package": "Silver", "featured": False,
        "image": "https://images.unsplash.com/photo-1518684079-3c830dcef090",
        "gallery": ["https://images.unsplash.com/photo-1518684079-3c830dcef090"],
        "translations": {
            "en": {"title": "Qatar — Doha Weekend",
                   "description": "Museum of Islamic Art, souq wanderings and desert inland sea.",
                   "highlights": "MIA Museum · Souq Waqif · Inland Sea · Katara"},
            "uz": {"title": "Qatar — Doha hafta oxiri",
                   "description": "Islom san'ati muzeyi, souq va cho'ldagi ichki dengiz.",
                   "highlights": "MIA · Souq Waqif · Ichki dengiz · Katara"},
            "ru": {"title": "Катар — уик-энд в Дохе",
                   "description": "Музей исламского искусства, старинный сук и внутреннее море.",
                   "highlights": "MIA · Сук Вакиф · Внутреннее море · Катара"},
        },
        "departure_dates": ["2026-03-05", "2026-04-15"],
        "rating": 4.7, "reviews_count": 39,
    },
]


COUNTRIES = [
    {"slug": "turkey", "image": "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg",
     "video": "", "gallery": ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"],
     "translations": {
         "en": {"name": "Turkey", "tagline": "Where continents meet",
                "description": "From the balconies of Istanbul to the lunar chimneys of Cappadocia."},
         "uz": {"name": "Turkiya", "tagline": "Ikki qit'a qo'shilgan yer",
                "description": "Istanbul balkonlaridan Kappadokiya ajoyibotlarigacha."},
         "ru": {"name": "Турция", "tagline": "Место встречи континентов",
                "description": "От балконов Стамбула до лунных скал Каппадокии."}},
     "popular_spots": [{"name": "Istanbul"}, {"name": "Cappadocia"}, {"name": "Antalya"}, {"name": "Bodrum"}]},
    {"slug": "uae", "image": "https://images.pexels.com/photos/19612315/pexels-photo-19612315.jpeg",
     "video": "", "gallery": ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c"],
     "translations": {
         "en": {"name": "United Arab Emirates", "tagline": "Skylines & dunes",
                "description": "A city of superlatives sitting on the edge of golden desert."},
         "uz": {"name": "BAA", "tagline": "Osmono'parlar va cho'l",
                "description": "Oltin cho'l chekkasidagi shov-shuv shahar."},
         "ru": {"name": "ОАЭ", "tagline": "Небоскрёбы и дюны",
                "description": "Город превосходной степени на границе золотой пустыни."}},
     "popular_spots": [{"name": "Dubai"}, {"name": "Abu Dhabi"}, {"name": "Sharjah"}]},
    {"slug": "saudi-arabia", "image": "https://images.unsplash.com/photo-1513072064285-240f87fa81e8",
     "video": "", "gallery": ["https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa"],
     "translations": {
         "en": {"name": "Saudi Arabia", "tagline": "Land of the Two Holy Mosques",
                "description": "Spiritual pilgrimages and desert heritage."},
         "uz": {"name": "Saudiya Arabistoni", "tagline": "Ikki muqaddas masjid yurti",
                "description": "Muqaddas ziyoratlar va cho'l an'analari."},
         "ru": {"name": "Саудовская Аравия", "tagline": "Земля Двух Святынь",
                "description": "Духовные паломничества и наследие пустыни."}},
     "popular_spots": [{"name": "Makkah"}, {"name": "Madinah"}, {"name": "Jeddah"}, {"name": "AlUla"}]},
    {"slug": "malaysia", "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07",
     "video": "", "gallery": [],
     "translations": {
         "en": {"name": "Malaysia", "tagline": "Truly Asia", "description": "Urban energy and tropical islands."},
         "uz": {"name": "Malayziya", "tagline": "Haqiqiy Osiyo", "description": "Shahar quvvati va tropik orollar."},
         "ru": {"name": "Малайзия", "tagline": "Настоящая Азия", "description": "Городская энергия и тропические острова."}},
     "popular_spots": [{"name": "Kuala Lumpur"}, {"name": "Langkawi"}, {"name": "Penang"}]},
    {"slug": "egypt", "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020",
     "video": "", "gallery": [],
     "translations": {
         "en": {"name": "Egypt", "tagline": "Where history breathes", "description": "Pyramids, temples, the Nile."},
         "uz": {"name": "Misr", "tagline": "Tarix nafas oladigan yer", "description": "Piramidalar, ibodatxonalar, Nil."},
         "ru": {"name": "Египет", "tagline": "Где дышит история", "description": "Пирамиды, храмы, Нил."}},
     "popular_spots": [{"name": "Cairo"}, {"name": "Luxor"}, {"name": "Aswan"}, {"name": "Sharm El Sheikh"}]},
    {"slug": "thailand", "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
     "video": "", "gallery": [],
     "translations": {
         "en": {"name": "Thailand", "tagline": "Land of Smiles", "description": "Turquoise bays, glittering wats."},
         "uz": {"name": "Tailand", "tagline": "Tabassumlar mamlakati", "description": "Feruza qo'ltiqlar, ibodatxonalar."},
         "ru": {"name": "Таиланд", "tagline": "Страна улыбок", "description": "Бирюзовые бухты, храмы."}},
     "popular_spots": [{"name": "Bangkok"}, {"name": "Phuket"}, {"name": "Chiang Mai"}]},
    {"slug": "qatar", "image": "https://images.unsplash.com/photo-1518684079-3c830dcef090",
     "video": "", "gallery": [],
     "translations": {
         "en": {"name": "Qatar", "tagline": "Modern Arabia", "description": "Contemporary Doha meets desert stillness."},
         "uz": {"name": "Qatar", "tagline": "Zamonaviy Arabiston", "description": "Zamonaviy Doha va cho'l sukunati."},
         "ru": {"name": "Катар", "tagline": "Современная Аравия", "description": "Современная Доха и тишина пустыни."}},
     "popular_spots": [{"name": "Doha"}, {"name": "Al Wakrah"}]},
    {"slug": "indonesia", "image": "https://images.pexels.com/photos/35043038/pexels-photo-35043038.jpeg",
     "video": "", "gallery": [],
     "translations": {
         "en": {"name": "Indonesia", "tagline": "Emerald archipelago", "description": "Bali temples, Ubud rice terraces."},
         "uz": {"name": "Indoneziya", "tagline": "Zumrad arxipelag", "description": "Bali ibodatxonalari, Ubud dalalari."},
         "ru": {"name": "Индонезия", "tagline": "Изумрудный архипелаг", "description": "Храмы Бали, террасы Убуда."}},
     "popular_spots": [{"name": "Bali"}, {"name": "Jakarta"}, {"name": "Lombok"}]},
]


REVIEWS = [
    {"name": "Nozima R.", "rating": 5, "text": "Umra safaridan qaytdik — hamma narsa yuqori darajada. Gidlar samimiy, mehmonxonalar Haramga juda yaqin. Tavsiya qilaman!", "tour_slug": "umrah-10d"},
    {"name": "Дмитрий К.", "rating": 5, "text": "Дубай — вау! Организация на высоте, каждая деталь продумана. Спасибо AL BASIR!", "tour_slug": "dubai-luxury-5d"},
    {"name": "Ahmed S.", "rating": 5, "text": "Cappadocia balloon flight was magical. Guides spoke perfect English. Booking through AL BASIR was seamless.", "tour_slug": "istanbul-cappadocia-7d"},
    {"name": "Malika T.", "rating": 5, "text": "Bali orollari orzuim edi — AL BASIR uni voqelikka aylantirdi. Villa, guruch dalalari, hamma narsa mukammal.", "tour_slug": "bali-paradise-8d"},
    {"name": "Игорь В.", "rating": 4, "text": "Малайзия понравилась, особенно Лангкави. Небольшая заминка с трансфером, но всё быстро решили.", "tour_slug": "malaysia-kl-langkawi-6d"},
    {"name": "Bekzod A.", "rating": 5, "text": "Misr piramidalari — bolalik orzum. Nil kruizi ajoyib bo'ldi. Rahmat!", "tour_slug": "egypt-pyramids-nile-8d"},
]


FAQS = [
    {"order": 1, "translations": {
        "en": {"q": "How early should I book?", "a": "We recommend booking 30-60 days ahead for the best rates and flight availability."},
        "uz": {"q": "Qachonlik bron qilishim kerak?", "a": "Eng yaxshi narx va o'rin uchun 30-60 kun oldindan bron qiling."},
        "ru": {"q": "За сколько бронировать?", "a": "Мы рекомендуем бронировать за 30-60 дней для лучших цен."}}},
    {"order": 2, "translations": {
        "en": {"q": "What is included in the price?", "a": "Flights, hotels with breakfast, insurance, airport transfers, and English/Uzbek/Russian speaking guides."},
        "uz": {"q": "Narxga nima kiradi?", "a": "Aviabilet, mehmonxona (nonushta bilan), sug'urta, transfer va gid xizmati."},
        "ru": {"q": "Что входит в стоимость?", "a": "Перелёты, отели с завтраком, страховка, трансферы и гид."}}},
    {"order": 3, "translations": {
        "en": {"q": "How do I pay?", "a": "Upload proof of transfer via QR / bank details / payment link. Our team confirms within 24h."},
        "uz": {"q": "Qanday to'layman?", "a": "QR kod / bank rekvizit / to'lov havolasi orqali chek yuboring — 24 soat ichida tasdiqlaymiz."},
        "ru": {"q": "Как оплатить?", "a": "Загрузите чек через QR / реквизиты / ссылку — подтвердим в течение 24 часов."}}},
    {"order": 4, "translations": {
        "en": {"q": "Can I cancel?", "a": "Yes — cancellation is free up to 14 days before departure. Later cancellations may incur airline fees."},
        "uz": {"q": "Bekor qila olamanmi?", "a": "Ha — safar boshlanishidan 14 kun oldin bepul bekor qilish mumkin."},
        "ru": {"q": "Могу ли я отменить?", "a": "Да — бесплатная отмена за 14 дней до вылета."}}},
]


TESTIMONIALS = [
    {"name": "Sarvinoz M.", "role": "Traveler, Umrah 2025", "quote": "Har bir tafsilot mukammal — Ka'ba oldida turishning o'zi shifobaxsh edi.", "picture": "https://images.unsplash.com/photo-1544005313-94ddf0286df2"},
    {"name": "Andrey P.", "role": "Путешественник, Дубай 2025", "quote": "AL BASIR = премиум. Всё чётко, отель шикарный, гид внимательный.", "picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"},
    {"name": "Layla H.", "role": "Family traveler, Turkey 2025", "quote": "The best trip we've ever taken as a family — flawlessly organised.", "picture": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"},
]


PARTNERS = [
    {"name": "Turkish Airlines", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Turkish_Airlines_logo_2019_compact.svg/320px-Turkish_Airlines_logo_2019_compact.svg.png"},
    {"name": "Emirates", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/320px-Emirates_logo.svg.png"},
    {"name": "Qatar Airways", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Qatar_Airways_Logo.svg/320px-Qatar_Airways_Logo.svg.png"},
    {"name": "Uzbekistan Airways", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Uzbekistan_Airways_logo.svg/320px-Uzbekistan_Airways_logo.svg.png"},
    {"name": "Booking.com", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Booking.com_logo.svg/320px-Booking.com_logo.svg.png"},
    {"name": "Visa", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/320px-Visa_Inc._logo.svg.png"},
]


BLOG = [
    {"slug": "why-cappadocia-is-magical", "image": "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg",
     "published": True,
     "translations": {
         "en": {"title": "Why Cappadocia is Magical at Dawn", "excerpt": "The world looks different from a wicker basket 1000 feet above fairy chimneys.",
                "body": "There is a hush that falls over Cappadocia before sunrise... (full article)"},
         "uz": {"title": "Kappadokiya tong palasida nega sehrli", "excerpt": "Peri quvurlari uzra sabatdan ochilgan olam boshqacha ko'rinadi.",
                "body": "Tong oldidan Kappadokiyada g'aroyib sukunat cho'kadi..."},
         "ru": {"title": "Почему Каппадокия волшебна на рассвете", "excerpt": "Мир выглядит иначе из плетёной корзины над скалами.",
                "body": "Перед рассветом Каппадокия погружается в удивительную тишину..."}}},
    {"slug": "packing-for-umrah", "image": "https://images.unsplash.com/photo-1513072064285-240f87fa81e8",
     "published": True,
     "translations": {
         "en": {"title": "The Complete Umrah Packing Guide", "excerpt": "Everything you truly need — and what you can leave behind.",
                "body": "Full guide with checklists..."},
         "uz": {"title": "To'liq Umra yig'ilish qo'llanmasi", "excerpt": "Nimalar kerak va nimalarni uyda qoldirish mumkin.",
                "body": "Batafsil ro'yxat bilan qo'llanma..."},
         "ru": {"title": "Полное руководство по сборам в Умру", "excerpt": "Всё, что действительно нужно — и что можно оставить дома.",
                "body": "Полное руководство с чек-листами..."}}},
    {"slug": "dubai-in-48-hours", "image": "https://images.pexels.com/photos/19612315/pexels-photo-19612315.jpeg",
     "published": True,
     "translations": {
         "en": {"title": "Dubai in 48 Hours: The Curated Loop", "excerpt": "From Burj Khalifa sunrise to Al Fahidi late-night coffee.",
                "body": "A hand-picked 48-hour Dubai itinerary..."},
         "uz": {"title": "Dubay 48 soatda", "excerpt": "Burj Khalifa'dan Al Fahidi tungi qahvasigacha.",
                "body": "Qo'lda tanlangan 48 soatlik dastur..."},
         "ru": {"title": "Дубай за 48 часов", "excerpt": "От рассвета на Бурдж-Халифа до кофе в Аль-Фахиди.",
                "body": "Тщательно составленный 48-часовой маршрут..."}}},
]


GALLERY = [
    {"id": "g1", "image": "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg", "category": "Turkey", "title": "Cappadocia balloons"},
    {"id": "g2", "image": "https://images.pexels.com/photos/19612315/pexels-photo-19612315.jpeg", "category": "UAE", "title": "Dubai skyline"},
    {"id": "g3", "image": "https://images.unsplash.com/photo-1513072064285-240f87fa81e8", "category": "Saudi Arabia", "title": "Makkah at night"},
    {"id": "g4", "image": "https://images.pexels.com/photos/35043038/pexels-photo-35043038.jpeg", "category": "Indonesia", "title": "Bali resort pool"},
    {"id": "g5", "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07", "category": "Malaysia", "title": "Petronas towers"},
    {"id": "g6", "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020", "category": "Egypt", "title": "Pyramids of Giza"},
    {"id": "g7", "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a", "category": "Thailand", "title": "Phi Phi islands"},
    {"id": "g8", "image": "https://images.unsplash.com/photo-1518684079-3c830dcef090", "category": "Qatar", "title": "Doha skyline"},
    {"id": "g9", "image": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200", "category": "Turkey", "title": "Istanbul mosque"},
    {"id": "g10", "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4", "category": "Indonesia", "title": "Ubud rice terraces"},
    {"id": "g11", "image": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745", "category": "UAE", "title": "Dubai marina"},
    {"id": "g12", "image": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa", "category": "Saudi Arabia", "title": "Madinah mosque"},
]


async def seed_all(db, now_utc: Callable):
    # Tours
    for t in TOURS:
        exists = await db.tours.find_one({"slug": t["slug"]})
        if not exists:
            doc = dict(t)
            doc["tour_id"] = f"tour_{t['slug']}"
            doc["created_at"] = now_utc()
            await db.tours.insert_one(doc)

    for c in COUNTRIES:
        exists = await db.countries.find_one({"slug": c["slug"]})
        if not exists:
            doc = dict(c)
            doc["created_at"] = now_utc()
            await db.countries.insert_one(doc)

    for r in REVIEWS:
        exists = await db.reviews.find_one({"name": r["name"], "text": r["text"]})
        if not exists:
            doc = dict(r)
            doc["review_id"] = f"rev_{r['name'].replace(' ', '_').lower()}"
            doc["approved"] = True
            doc["created_at"] = now_utc()
            await db.reviews.insert_one(doc)

    for f in FAQS:
        exists = await db.faq.find_one({"order": f["order"]})
        if not exists:
            doc = dict(f)
            doc["created_at"] = now_utc()
            await db.faq.insert_one(doc)

    for tst in TESTIMONIALS:
        exists = await db.testimonials.find_one({"name": tst["name"]})
        if not exists:
            await db.testimonials.insert_one(dict(tst))

    for p in PARTNERS:
        exists = await db.partners.find_one({"name": p["name"]})
        if not exists:
            await db.partners.insert_one(dict(p))

    for b in BLOG:
        exists = await db.blog.find_one({"slug": b["slug"]})
        if not exists:
            doc = dict(b)
            doc["created_at"] = now_utc()
            await db.blog.insert_one(doc)

    for g in GALLERY:
        exists = await db.gallery.find_one({"id": g["id"]})
        if not exists:
            await db.gallery.insert_one(dict(g))

    # Settings default
    settings_exists = await db.settings.find_one({"_id": "main"})
    if not settings_exists:
        await db.settings.insert_one({
            "_id": "main",
            "payment_qr": "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee",
            "payment_link": "https://pay.example.com/albasir",
            "bank_details": "AL BASIR TOUR MCHJ\nBank: NBU\nAccount: 2020 8000 1234 5678 9012\nMFO: 00450\nSTIR: 123456789",
            "contact_phone": "+998 71 200 12 34",
            "contact_telegram": "@albasir_tour",
            "contact_whatsapp": "+998 90 123 45 67",
            "contact_email": "info@albasir.com",
            "contact_address": "Tashkent, Amir Temur ko'chasi 12A",
            "contact_map": "https://www.google.com/maps?q=Tashkent+Amir+Temur+12A&output=embed",
            "about_image1": "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg",
            "about_image2": "https://images.unsplash.com/photo-1513072064285-240f87fa81e8",
            "about_stat_years": "12+",
            "about_stat_countries": "8",
            "about_stat_guests": "10k+",
            "about_translations": {
                "uz": {
                    "eyebrow": "2013-yildan beri",
                    "title": "Har bir tafsilotga alohida e'tibor",
                    "subtitle": "AL BASIR Toshkentda oddiy g'oyadan tug'ildi: sayohat oson bo'lishi kerak, lekin hech qachon oddiy emas. 12 yil va 10,000+ mehmondan keyin ham biz har bir mehmonxonani qo'lda tanlaymiz, har bir gidni tayyorlaymiz va har bir transfer vaqtini tekshiramiz.",
                    "mission": "Joyni faqat ko'rish emas, balki his qilish uchun sayohatlar yaratish.",
                    "vision": "2028-yilga qadar Markaziy Osiyodagi eng ishonchli premium sayohat kuratori bo'lish.",
                    "values": "Ustalik. G'amxo'rlik. Halollik. Tez sotuvdan ko'ra uzoq muddatli munosabatlar.",
                },
                "en": {
                    "eyebrow": "Since 2013",
                    "title": "A quiet obsession with detail",
                    "subtitle": "AL BASIR was born in Tashkent from a simple idea: travel should feel effortless, but never generic. Twelve years and 10,000+ guests later, we still hand-select every hotel, brief every guide, and check every transfer time.",
                    "mission": "To design journeys that reveal a place, not just visit it.",
                    "vision": "The most trusted premium travel curator in Central Asia by 2028.",
                    "values": "Craft. Care. Honesty. Long-term relationships over quick sales.",
                },
                "ru": {
                    "eyebrow": "С 2013 года",
                    "title": "Тихая одержимость деталями",
                    "subtitle": "AL BASIR родился в Ташкенте из простой идеи: путешествие должно быть лёгким, но никогда шаблонным. 12 лет и более 10 000 гостей — и мы по-прежнему лично выбираем каждый отель и проверяем каждый трансфер.",
                    "mission": "Создавать путешествия, которые раскрывают место, а не просто посещают его.",
                    "vision": "Самый надёжный премиальный куратор путешествий в Центральной Азии к 2028 году.",
                    "values": "Мастерство. Забота. Честность. Долгосрочные отношения важнее быстрых продаж.",
                },
            },
        })

    # Default requisites
    req_exists = await db.requisites.find_one({})
    if not req_exists:
        await db.requisites.insert_one({
            "requisite_id": "req_default_nbu",
            "title": "NBU — Asosiy hisob",
            "bank_name": "NBU",
            "account_holder": "AL BASIR TOUR MCHJ",
            "account_number": "2020 8000 1234 5678 9012",
            "mfo": "00450",
            "stir": "123456789",
            "currency": "UZS",
            "details": "",
            "is_active": True,
            "order": 0,
            "created_at": now_utc(),
        })

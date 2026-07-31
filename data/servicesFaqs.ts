import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/i18n-types";

interface LocalizedFAQ {
  question: Localized;
  answer: Localized;
}

/**
 * FAQ set for the /services listing page — broader booking/policy
 * questions than the per-service FAQs in data/services.ts, and
 * distinct from the homepage's data/faqs.ts so each page has unique
 * FAQ content rather than repeating the same six questions.
 */
export const SERVICES_FAQS: LocalizedFAQ[] = [
  {
    question: {
      en: "How do I book a chauffeur service in Dubai?",
      ar: "كيف يمكنني حجز خدمة سائق خاص في دبي؟",
      ru: "Как забронировать услуги шофёра в Дубае?",
      zh: "如何在迪拜预订专属司机服务?",
      fr: "Comment réserver un service de chauffeur à Dubaï?",
      de: "Wie buche ich einen Chauffeurservice in Dubai?",
    },
    answer: {
      en: "Book directly on our website, request an instant quote, or WhatsApp us with your trip details — pickup location, time, and vehicle preference. We confirm every booking with a named chauffeur and vehicle before your trip.",
      ar: "احجزوا مباشرة عبر موقعنا الإلكتروني، أو اطلبوا عرض سعر فوري، أو تواصلوا معنا عبر واتساب مع تفاصيل رحلتكم - مكان الانطلاق والوقت والسيارة المفضلة. نؤكد كل حجز بتحديد اسم السائق والسيارة قبل رحلتكم.",
      ru: "Забронируйте напрямую на нашем сайте, запросите мгновенный расчёт стоимости или напишите нам в WhatsApp с деталями поездки — место подачи, время и предпочтения по автомобилю. Мы подтверждаем каждое бронирование с указанием имени шофёра и автомобиля до начала поездки.",
      zh: "您可以直接通过我们的网站预订、申请即时报价,或通过WhatsApp联系我们并告知行程详情——包括接送地点、时间及车型偏好。我们会在行程开始前为您确认具体司机及车辆信息。",
      fr: "Réservez directement sur notre site web, demandez un devis instantané ou contactez-nous sur WhatsApp avec les détails de votre trajet — lieu de prise en charge, horaire et préférence de véhicule. Nous confirmons chaque réservation avec un chauffeur et un véhicule nommés avant votre trajet.",
      de: "Buchen Sie direkt auf unserer Website, fordern Sie ein Sofortangebot an oder schreiben Sie uns auf WhatsApp mit Ihren Fahrtdetails — Abholort, Uhrzeit und Fahrzeugwunsch. Wir bestätigen jede Buchung mit einem namentlich genannten Chauffeur und Fahrzeug vor Ihrer Fahrt.",
    },
  },
  {
    question: {
      en: "How much does a chauffeur service cost?",
      ar: "كم تبلغ تكلفة خدمة السائق الخاص؟",
      ru: "Сколько стоит услуга шофёра?",
      zh: "专属司机服务的费用是多少?",
      fr: "Combien coûte un service de chauffeur?",
      de: "Wie viel kostet ein Chauffeurservice?",
    },
    answer: {
      en: "Pricing depends on the vehicle, duration, and trip type — airport transfers and one-way trips are priced per journey, while city travel is available hourly or for a full day. Request a quote for an exact rate; there are no hidden fees or surge pricing.",
      ar: "يعتمد السعر على نوع السيارة والمدة ونوع الرحلة - يتم تسعير رحلات المطار والرحلات ذات الاتجاه الواحد لكل رحلة، بينما تتوفر رحلات المدينة بالساعة أو ليوم كامل. اطلبوا عرض سعر للحصول على السعر الدقيق؛ لا توجد رسوم خفية أو تسعير مرتفع في أوقات الذروة.",
      ru: "Стоимость зависит от автомобиля, продолжительности и типа поездки — трансферы из аэропорта и поездки в одну сторону оплачиваются за поездку, а поездки по городу доступны с почасовой или полнодневной оплатой. Запросите расчёт стоимости для точной цены; скрытых комиссий или наценок в час пик нет.",
      zh: "费用取决于车型、时长及行程类型——机场接送及单程行程按次收费,市区出行则可按小时或全天计费。请申请报价以获取准确费用;我们不收取任何隐藏费用,也不实行高峰加价。",
      fr: "Le tarif dépend du véhicule, de la durée et du type de trajet — les transferts aéroport et trajets simples sont facturés par trajet, tandis que les déplacements en ville sont disponibles à l'heure ou à la journée. Demandez un devis pour un tarif exact; aucun frais caché ni majoration en période de forte demande.",
      de: "Der Preis hängt vom Fahrzeug, der Dauer und der Fahrtart ab — Flughafentransfers und einfache Fahrten werden pro Fahrt berechnet, während Stadtfahrten stundenweise oder ganztägig verfügbar sind. Fordern Sie ein Angebot für einen genauen Preis an; es gibt keine versteckten Gebühren oder Preisaufschläge zu Stoßzeiten.",
    },
  },
  {
    question: {
      en: "What types of vehicles are available?",
      ar: "ما هي أنواع السيارات المتوفرة؟",
      ru: "Какие типы автомобилей доступны?",
      zh: "有哪些类型的车辆可供选择?",
      fr: "Quels types de véhicules sont disponibles?",
      de: "Welche Fahrzeugtypen stehen zur Verfügung?",
    },
    answer: {
      en: "Our fleet spans executive sedans (Mercedes S-Class, BMW 7 Series), SUVs (Range Rover, Cadillac Escalade), group vans (Mercedes V-Class), and ultra-luxury vehicles (Rolls-Royce Phantom) — matched to the occasion when you book.",
      ar: "يضم أسطولنا سيارات سيدان تنفيذية (مرسيدس S-Class، وBMW الفئة السابعة)، وسيارات دفع رباعي (رينج روفر، كاديلاك إسكاليد)، وحافلات صغيرة للمجموعات (مرسيدس V-Class)، وسيارات فاخرة للغاية (رولز رويس فانتوم) - يتم اختيار السيارة المناسبة للمناسبة عند الحجز.",
      ru: "Наш автопарк включает представительские седаны (Mercedes S-Class, BMW 7 Series), внедорожники (Range Rover, Cadillac Escalade), микроавтобусы для групп (Mercedes V-Class) и автомобили класса ультра-люкс (Rolls-Royce Phantom) — подбираются в соответствии со случаем при бронировании.",
      zh: "我们的车队包括行政轿车(奔驰S级、宝马7系)、豪华SUV(路虎揽胜、凯迪拉克凯雷德)、团体商务车(奔驰V级)以及顶级奢华车型(劳斯莱斯幻影)——预订时可根据场合匹配合适车型。",
      fr: "Notre flotte comprend des berlines de direction (Mercedes Classe S, BMW Série 7), des SUV (Range Rover, Cadillac Escalade), des minibus de groupe (Mercedes Classe V) et des véhicules ultra-luxe (Rolls-Royce Phantom) — adaptés à l'occasion lors de votre réservation.",
      de: "Unsere Flotte umfasst Business-Limousinen (Mercedes S-Klasse, BMW 7er), SUVs (Range Rover, Cadillac Escalade), Gruppenvans (Mercedes V-Klasse) und Ultra-Luxusfahrzeuge (Rolls-Royce Phantom) — passend zum Anlass bei Ihrer Buchung.",
    },
  },
  {
    question: {
      en: "Do you track flights for airport pickups?",
      ar: "هل تتابعون رحلات الطيران لخدمة الاستقبال من المطار؟",
      ru: "Отслеживаете ли вы рейсы для встречи в аэропорту?",
      zh: "机场接机服务是否会追踪航班信息?",
      fr: "Suivez-vous les vols pour les prises en charge à l'aéroport?",
      de: "Verfolgen Sie Flüge für Flughafenabholungen?",
    },
    answer: {
      en: "Yes. Every airport transfer includes live flight tracking, so your chauffeur adjusts pickup time automatically for early or delayed arrivals — at no extra charge.",
      ar: "نعم. تشمل كل عملية استقبال من المطار متابعة مباشرة لرحلة الطيران، بحيث يقوم سائقكم بتعديل وقت الاستقبال تلقائيًا في حال الوصول المبكر أو المتأخر - دون أي رسوم إضافية.",
      ru: "Да. Каждый трансфер из аэропорта включает отслеживание рейса в реальном времени, поэтому ваш шофёр автоматически корректирует время встречи при раннем или задержанном прибытии — без дополнительной платы.",
      zh: "是的。每次机场接送服务都包含实时航班追踪,司机会根据航班提前或延误情况自动调整接机时间——不收取任何额外费用。",
      fr: "Oui. Chaque transfert aéroport inclut un suivi de vol en temps réel, afin que votre chauffeur ajuste automatiquement l'heure de prise en charge en cas d'arrivée anticipée ou retardée — sans frais supplémentaires.",
      de: "Ja. Jeder Flughafentransfer beinhaltet eine Live-Flugverfolgung, sodass Ihr Chauffeur die Abholzeit bei früher oder verspäteter Ankunft automatisch anpasst — ohne Aufpreis.",
    },
  },
  {
    question: {
      en: "Which airports and terminals do you cover?",
      ar: "ما هي المطارات والصالات التي تغطونها؟",
      ru: "Какие аэропорты и терминалы вы обслуживаете?",
      zh: "贵公司覆盖哪些机场和航站楼?",
      fr: "Quels aéroports et terminaux couvrez-vous?",
      de: "Welche Flughäfen und Terminals decken Sie ab?",
    },
    answer: {
      en: "We serve both Dubai International Airport (DXB), all terminals, and Al Maktoum International Airport (DWC), with meet-and-greet and name-sign pickup in the arrivals hall.",
      ar: "نخدم مطار دبي الدولي (DXB) بجميع صالاته، بالإضافة إلى مطار آل مكتوم الدولي (DWC)، مع خدمة الاستقبال الشخصي وحمل لافتة الاسم في صالة الوصول.",
      ru: "Мы обслуживаем международный аэропорт Дубая (DXB), все терминалы, а также международный аэропорт Аль-Мактум (DWC), с персональной встречей и табличкой с именем в зале прилёта.",
      zh: "我们提供迪拜国际机场(DXB)全部航站楼及阿勒马克图姆国际机场(DWC)的接送服务,并在到达大厅提供举牌迎接服务。",
      fr: "Nous desservons l'aéroport international de Dubaï (DXB), tous terminaux confondus, ainsi que l'aéroport international Al Maktoum (DWC), avec accueil personnalisé et pancarte nominative dans le hall d'arrivée.",
      de: "Wir bedienen den Flughafen Dubai International (DXB), alle Terminals, sowie den Al Maktoum International Airport (DWC), mit persönlichem Empfang und Namensschild in der Ankunftshalle.",
    },
  },
  {
    question: {
      en: "Can we set up a corporate account?",
      ar: "هل يمكننا إنشاء حساب للشركات؟",
      ru: "Можем ли мы открыть корпоративный счёт?",
      zh: "我们可以开设企业账户吗?",
      fr: "Pouvons-nous ouvrir un compte entreprise?",
      de: "Können wir ein Firmenkonto einrichten?",
    },
    answer: {
      en: "Yes, we set up standing corporate accounts with monthly invoicing, priority booking, and a dedicated account contact for HR and travel teams — ideal for regular business travel or staff transport.",
      ar: "نعم، نقوم بإنشاء حسابات دائمة للشركات مع فوترة شهرية، وأولوية في الحجز، وجهة اتصال مخصصة لفرق الموارد البشرية والسفر - وهو الخيار المثالي للسفر التجاري المنتظم أو نقل الموظفين.",
      ru: "Да, мы открываем постоянные корпоративные счета с ежемесячным выставлением счетов, приоритетным бронированием и выделенным контактным лицом для HR и travel-отделов — идеально подходит для регулярных деловых поездок или перевозки сотрудников.",
      zh: "可以,我们提供长期企业账户服务,包括按月开具发票、优先预订以及为人力资源和差旅团队指定专属客户经理——非常适合定期商务出行或员工用车。",
      fr: "Oui, nous mettons en place des comptes entreprise permanents avec facturation mensuelle, réservation prioritaire et un contact dédié pour les équipes RH et voyages — idéal pour les déplacements professionnels réguliers ou le transport du personnel.",
      de: "Ja, wir richten dauerhafte Firmenkonten mit monatlicher Rechnungsstellung, bevorzugter Buchung und einem festen Ansprechpartner für HR- und Reiseteams ein — ideal für regelmäßige Geschäftsreisen oder Mitarbeitertransporte.",
    },
  },
  {
    question: {
      en: "What is your cancellation policy?",
      ar: "ما هي سياسة الإلغاء لديكم؟",
      ru: "Какова ваша политика отмены?",
      zh: "贵公司的取消政策是怎样的?",
      fr: "Quelle est votre politique d'annulation?",
      de: "Wie lautet Ihre Stornierungsrichtlinie?",
    },
    answer: {
      en: "Most bookings can be cancelled or rescheduled free of charge up to 12 hours before pickup. Later cancellations may incur a fee — full terms are confirmed at the time of booking.",
      ar: "يمكن إلغاء أو إعادة جدولة معظم الحجوزات مجانًا حتى 12 ساعة قبل موعد الانطلاق. قد يترتب على الإلغاء بعد ذلك رسوم - ويتم تأكيد الشروط الكاملة عند الحجز.",
      ru: "Большинство бронирований можно бесплатно отменить или перенести не позднее чем за 12 часов до подачи автомобиля. При более поздней отмене может взиматься плата — полные условия подтверждаются при бронировании.",
      zh: "大多数预订可在接送前12小时免费取消或改期。逾期取消可能产生费用——具体条款将在预订时确认。",
      fr: "La plupart des réservations peuvent être annulées ou reportées gratuitement jusqu'à 12 heures avant la prise en charge. Les annulations tardives peuvent entraîner des frais — les conditions complètes sont confirmées au moment de la réservation.",
      de: "Die meisten Buchungen können bis zu 12 Stunden vor der Abholung kostenlos storniert oder umgebucht werden. Spätere Stornierungen können eine Gebühr nach sich ziehen — die vollständigen Bedingungen werden bei der Buchung bestätigt.",
    },
  },
  {
    question: {
      en: "What payment methods do you accept?",
      ar: "ما هي طرق الدفع التي تقبلونها؟",
      ru: "Какие способы оплаты вы принимаете?",
      zh: "贵公司接受哪些付款方式?",
      fr: "Quels moyens de paiement acceptez-vous?",
      de: "Welche Zahlungsmethoden akzeptieren Sie?",
    },
    answer: {
      en: "We accept all major credit and debit cards, bank transfer, and cash on request. Corporate accounts are billed via monthly invoice.",
      ar: "نقبل جميع بطاقات الائتمان والخصم الرئيسية، والتحويل البنكي، والدفع نقدًا عند الطلب. يتم إصدار فواتير شهرية لحسابات الشركات.",
      ru: "Мы принимаем все основные кредитные и дебетовые карты, банковский перевод, а также наличные по запросу. Корпоративным счетам выставляется ежемесячный счёт.",
      zh: "我们接受各大信用卡及借记卡、银行转账,并可应要求接受现金支付。企业账户将按月开具发票结算。",
      fr: "Nous acceptons toutes les principales cartes de crédit et de débit, les virements bancaires et les espèces sur demande. Les comptes entreprise sont facturés mensuellement.",
      de: "Wir akzeptieren alle gängigen Kredit- und Debitkarten, Banküberweisung und auf Wunsch Barzahlung. Firmenkonten werden per monatlicher Rechnung abgerechnet.",
    },
  },
  {
    question: {
      en: "Which areas of Dubai and the UAE do you serve?",
      ar: "ما هي مناطق دبي والإمارات التي تخدمونها؟",
      ru: "Какие районы Дубая и ОАЭ вы обслуживаете?",
      zh: "贵公司服务覆盖迪拜及阿联酋哪些区域?",
      fr: "Quelles zones de Dubaï et des Émirats desservez-vous?",
      de: "Welche Gebiete in Dubai und den VAE bedienen Sie?",
    },
    answer: {
      en: "We operate across all of Dubai — Downtown, Dubai Marina, Palm Jumeirah, Business Bay, and beyond — as well as intercity trips to Abu Dhabi, Sharjah, and other Emirates on request.",
      ar: "نعمل في جميع أنحاء دبي - وسط المدينة، ودبي مارينا، ونخلة جميرا، وخليج الأعمال، وما وراءها - بالإضافة إلى الرحلات بين المدن إلى أبوظبي والشارقة والإمارات الأخرى عند الطلب.",
      ru: "Мы работаем по всему Дубаю — Даунтаун, Дубай Марина, Палм Джумейра, Бизнес Бэй и другие районы, — а также предлагаем междугородние поездки в Абу-Даби, Шарджу и другие эмираты по запросу.",
      zh: "我们的服务覆盖迪拜全境——市中心、迪拜码头、朱美拉棕榈岛、商业湾等区域——同时可应要求提供前往阿布扎比、沙迦及其他酋长国的城际出行服务。",
      fr: "Nous opérons dans tout Dubaï — Downtown, Dubai Marina, Palm Jumeirah, Business Bay et au-delà — ainsi que pour des trajets intervilles vers Abu Dhabi, Sharjah et d'autres émirats sur demande.",
      de: "Wir sind in ganz Dubai tätig — Downtown, Dubai Marina, Palm Jumeirah, Business Bay und darüber hinaus — sowie für Fahrten zwischen den Städten nach Abu Dhabi, Sharjah und andere Emirate auf Anfrage.",
    },
  },
  {
    question: {
      en: "Are your chauffeurs licensed and background-checked?",
      ar: "هل سائقوكم مرخصون وخاضعون للتحقق من السجلات؟",
      ru: "Есть ли у ваших шофёров лицензии и проверка биографии?",
      zh: "贵公司司机是否持有执照并经过背景审查?",
      fr: "Vos chauffeurs sont-ils agréés et leurs antécédents vérifiés?",
      de: "Sind Ihre Chauffeure lizenziert und überprüft?",
    },
    answer: {
      en: "Yes. Every chauffeur holds a valid UAE commercial driving license, passes a background check, and is trained in professional etiquette, discretion, and defensive driving.",
      ar: "نعم. يحمل كل سائق رخصة قيادة تجارية سارية المفعول في دولة الإمارات، ويجتاز التحقق من السجلات، ويتم تدريبه على آداب السلوك المهني والكتمان والقيادة الدفاعية.",
      ru: "Да. Каждый шофёр имеет действующие коммерческие водительские права ОАЭ, проходит проверку биографических данных и обучен профессиональному этикету, конфиденциальности и защитному вождению.",
      zh: "是的。每位司机均持有有效的阿联酋商业驾驶执照,通过背景审查,并接受专业礼仪、保密意识及防御性驾驶培训。",
      fr: "Oui. Chaque chauffeur détient un permis de conduire commercial des Émirats arabes unis valide, fait l'objet d'une vérification des antécédents et est formé à l'étiquette professionnelle, à la discrétion et à la conduite préventive.",
      de: "Ja. Jeder Chauffeur besitzt eine gültige gewerbliche Fahrerlaubnis der VAE, durchläuft eine Hintergrundprüfung und wird in professioneller Etikette, Diskretion und vorausschauendem Fahren geschult.",
    },
  },
  {
    question: {
      en: "How much luggage can each vehicle carry?",
      ar: "كم عدد الأمتعة التي يمكن أن تحملها كل سيارة؟",
      ru: "Сколько багажа вмещает каждый автомобиль?",
      zh: "每辆车可容纳多少行李?",
      fr: "Quelle quantité de bagages chaque véhicule peut-il transporter?",
      de: "Wie viel Gepäck passt in die einzelnen Fahrzeuge?",
    },
    answer: {
      en: "Sedans typically hold 2–3 standard suitcases plus carry-ons, SUVs 3–4, and vans up to 8. Let us know your luggage count when booking and we'll recommend the right vehicle.",
      ar: "تتسع سيارات السيدان عادة لـ 2-3 حقائب قياسية بالإضافة إلى حقائب اليد، وسيارات الدفع الرباعي 3-4، والحافلات حتى 8 حقائب. أخبرونا بعدد أمتعتكم عند الحجز وسنوصي بالسيارة المناسبة.",
      ru: "Седаны обычно вмещают 2–3 стандартных чемодана плюс ручную кладь, внедорожники — 3–4, а микроавтобусы — до 8. Сообщите нам количество багажа при бронировании, и мы порекомендуем подходящий автомобиль.",
      zh: "轿车通常可容纳2-3件标准行李箱及随身行李,SUV可容纳3-4件,商务车最多可容纳8件。预订时请告知行李数量,我们将为您推荐合适的车型。",
      fr: "Les berlines contiennent généralement 2 à 3 valises standard plus bagages à main, les SUV 3 à 4, et les minibus jusqu'à 8. Indiquez-nous votre nombre de bagages lors de la réservation et nous vous recommanderons le véhicule adapté.",
      de: "Limousinen fassen in der Regel 2–3 Standardkoffer plus Handgepäck, SUVs 3–4, und Vans bis zu 8. Teilen Sie uns bei der Buchung Ihre Gepäckmenge mit, und wir empfehlen das passende Fahrzeug.",
    },
  },
  {
    question: {
      en: "Are child seats available?",
      ar: "هل تتوفر مقاعد للأطفال؟",
      ru: "Есть ли детские кресла?",
      zh: "是否提供儿童安全座椅?",
      fr: "Des sièges enfants sont-ils disponibles?",
      de: "Sind Kindersitze verfügbar?",
    },
    answer: {
      en: "Yes, infant, toddler, and booster seats are available on request at no extra charge — just mention the child's age when booking so we fit the correct seat.",
      ar: "نعم، تتوفر مقاعد الرضع والأطفال الصغار ومقاعد الرفع عند الطلب دون أي رسوم إضافية - فقط أخبرونا بعمر الطفل عند الحجز لنقوم بتركيب المقعد المناسب.",
      ru: "Да, детские кресла для младенцев, малышей и бустеры предоставляются по запросу бесплатно — просто укажите возраст ребёнка при бронировании, и мы установим подходящее кресло.",
      zh: "是的,我们可应要求提供婴儿座椅、幼儿座椅及增高垫,且不收取额外费用——预订时请告知孩子的年龄,以便我们配备合适的座椅。",
      fr: "Oui, des sièges bébé, enfant et rehausseurs sont disponibles sur demande sans frais supplémentaires — indiquez simplement l'âge de l'enfant lors de la réservation afin que nous installions le siège adapté.",
      de: "Ja, Babyschalen, Kindersitze und Sitzerhöhungen sind auf Anfrage kostenlos erhältlich — teilen Sie uns bei der Buchung einfach das Alter des Kindes mit, damit wir den passenden Sitz bereitstellen.",
    },
  },
  {
    question: {
      en: "Can I book a trip with multiple stops?",
      ar: "هل يمكنني حجز رحلة بعدة محطات؟",
      ru: "Могу ли я забронировать поездку с несколькими остановками?",
      zh: "我可以预订多个停靠点的行程吗?",
      fr: "Puis-je réserver un trajet avec plusieurs arrêts?",
      de: "Kann ich eine Fahrt mit mehreren Stopps buchen?",
    },
    answer: {
      en: "Absolutely. Multi-stop itineraries are common for corporate travel, city touring, and events — let your chauffeur or our booking team know your planned stops in advance.",
      ar: "بالتأكيد. تُعد خطط السير متعددة المحطات شائعة في السفر التجاري وجولات المدينة والفعاليات - أخبروا سائقكم أو فريق الحجز لدينا بالمحطات المخطط لها مسبقًا.",
      ru: "Разумеется. Маршруты с несколькими остановками распространены для деловых поездок, экскурсий по городу и мероприятий — сообщите вашему шофёру или нашей команде бронирования о запланированных остановках заранее.",
      zh: "当然可以。多站点行程在商务出行、市区观光及活动中十分常见——请提前告知司机或我们的预订团队您计划的停靠点。",
      fr: "Absolument. Les itinéraires à plusieurs arrêts sont courants pour les voyages d'affaires, les visites de la ville et les événements — informez votre chauffeur ou notre équipe de réservation de vos arrêts prévus à l'avance.",
      de: "Selbstverständlich. Routen mit mehreren Stopps sind bei Geschäftsreisen, Stadtbesichtigungen und Veranstaltungen üblich — teilen Sie Ihrem Chauffeur oder unserem Buchungsteam Ihre geplanten Stopps im Voraus mit.",
    },
  },
  {
    question: {
      en: "How far in advance should I book?",
      ar: "ما هي المدة المناسبة للحجز مسبقًا؟",
      ru: "За сколько времени нужно бронировать?",
      zh: "需要提前多久预订?",
      fr: "Combien de temps à l'avance dois-je réserver?",
      de: "Wie weit im Voraus sollte ich buchen?",
    },
    answer: {
      en: "We recommend at least 24 hours ahead for standard transfers, and 2–3 weeks ahead for weddings, events, or peak season. Same-day bookings are often possible — WhatsApp us to check availability.",
      ar: "ننصح بالحجز قبل 24 ساعة على الأقل للرحلات العادية، وقبل 2-3 أسابيع لحفلات الزفاف والفعاليات أو موسم الذروة. الحجز في نفس اليوم ممكن غالبًا - تواصلوا معنا عبر واتساب للتحقق من التوفر.",
      ru: "Мы рекомендуем бронировать минимум за 24 часа для стандартных трансферов и за 2–3 недели для свадеб, мероприятий или пикового сезона. Бронирование в тот же день часто возможно — напишите нам в WhatsApp, чтобы уточнить наличие.",
      zh: "我们建议标准接送服务至少提前24小时预订,婚礼、活动或旺季则建议提前2至3周预订。当天预订通常也可安排——请通过WhatsApp联系我们确认车辆是否可用。",
      fr: "Nous recommandons de réserver au moins 24 heures à l'avance pour les transferts standards, et 2 à 3 semaines à l'avance pour les mariages, événements ou haute saison. Les réservations le jour même sont souvent possibles — contactez-nous sur WhatsApp pour vérifier les disponibilités.",
      de: "Wir empfehlen, Standardtransfers mindestens 24 Stunden im Voraus zu buchen und für Hochzeiten, Veranstaltungen oder die Hochsaison 2–3 Wochen im Voraus. Buchungen am selben Tag sind oft möglich — schreiben Sie uns auf WhatsApp, um die Verfügbarkeit zu prüfen.",
    },
  },
  {
    question: {
      en: "Do you handle wedding and event transportation?",
      ar: "هل تتولون تنسيق النقل لحفلات الزفاف والفعاليات؟",
      ru: "Организуете ли вы транспорт для свадеб и мероприятий?",
      zh: "贵公司是否提供婚礼及活动用车服务?",
      fr: "Assurez-vous le transport pour les mariages et événements?",
      de: "Übernehmen Sie den Transport für Hochzeiten und Veranstaltungen?",
    },
    answer: {
      en: "Yes — from a single bridal car to a fully coordinated convoy for the wedding party and guests, plus multi-vehicle fleets for conferences and galas. Every wedding or event booking includes a timing rehearsal with your planner.",
      ar: "نعم - بدءًا من سيارة زفاف واحدة وصولاً إلى موكب منسق بالكامل لموكب العروسين والضيوف، بالإضافة إلى أساطيل متعددة السيارات للمؤتمرات وحفلات الاستقبال. يتضمن كل حجز لحفل زفاف أو فعالية بروفة توقيت مع منسق الحفل الخاص بكم.",
      ru: "Да — от одного свадебного автомобиля до полностью скоординированного кортежа для свадебной процессии и гостей, а также автопарков из нескольких автомобилей для конференций и торжественных приёмов. Каждое бронирование для свадьбы или мероприятия включает репетицию тайминга с вашим организатором.",
      zh: "是的——从单辆婚车到为婚礼车队及宾客精心安排的完整车队,再到为会议及晚宴提供的多车型车队,我们均可提供服务。每一次婚礼或活动预订都包含与您的策划人员进行的时间流程演练。",
      fr: "Oui — d'une simple voiture de mariée à un cortège entièrement coordonné pour le cortège nuptial et les invités, ainsi que des flottes multi-véhicules pour conférences et galas. Chaque réservation de mariage ou d'événement inclut une répétition du timing avec votre organisateur.",
      de: "Ja — von einem einzelnen Hochzeitsauto bis hin zu einer vollständig koordinierten Kolonne für das Hochzeitspaar und die Gäste, sowie Fahrzeugflotten für Konferenzen und Galas. Jede Hochzeits- oder Eventbuchung beinhaltet eine Zeitplan-Probe mit Ihrem Planer.",
    },
  },
  {
    question: {
      en: "Is your service available 24/7?",
      ar: "هل خدمتكم متوفرة على مدار الساعة طوال أيام الأسبوع؟",
      ru: "Ваш сервис работает круглосуточно?",
      zh: "贵公司是否提供全天候服务?",
      fr: "Votre service est-il disponible 24h/24 et 7j/7?",
      de: "Ist Ihr Service rund um die Uhr verfügbar?",
    },
    answer: {
      en: "Yes, chauffeurs and vehicles are available around the clock, including early flights, late-night events, and last-minute bookings.",
      ar: "نعم، السائقون والسيارات متوفرون على مدار الساعة، بما في ذلك رحلات الطيران المبكرة والفعاليات الليلية والحجوزات في اللحظة الأخيرة.",
      ru: "Да, шофёры и автомобили доступны круглосуточно, включая ранние рейсы, поздние вечерние мероприятия и бронирования в последний момент.",
      zh: "是的,我们的司机及车辆全天候待命,涵盖清晨航班、深夜活动及临时预订需求。",
      fr: "Oui, chauffeurs et véhicules sont disponibles à toute heure, y compris pour les vols matinaux, les événements tardifs et les réservations de dernière minute.",
      de: "Ja, Chauffeure und Fahrzeuge stehen rund um die Uhr zur Verfügung, einschließlich früher Flüge, später Abendveranstaltungen und kurzfristiger Buchungen.",
    },
  },
];

/** Resolves the FAQ list to plain, locale-specific strings for rendering. */
export function getServicesFaqs(locale: Locale): { question: string; answer: string }[] {
  return SERVICES_FAQS.map((faq) => ({
    question: faq.question[locale],
    answer: faq.answer[locale],
  }));
}

import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/i18n-types";

export interface FAQ {
  question: Localized;
  answer: Localized;
}

export const FAQS: FAQ[] = [
  {
    question: {
      en: "How far in advance should I book a chauffeur in Dubai?",
      ar: "ما هي المدة المناسبة لحجز سائق خاص في دبي؟",
      ru: "За сколько времени нужно бронировать шофёра в Дубае?",
      zh: "在迪拜预订专属司机需要提前多久?",
      fr: "Combien de temps à l'avance dois-je réserver un chauffeur à Dubaï?",
      de: "Wie weit im Voraus sollte ich einen Chauffeur in Dubai buchen?",
    },
    answer: {
      en: "We recommend booking at least 24 hours ahead for standard transfers, and 3–5 days ahead for weddings, events, or peak seasons such as public holidays. Same-day and last-minute bookings are often possible — WhatsApp us to check availability.",
      ar: "ننصح بالحجز قبل 24 ساعة على الأقل للرحلات العادية، وقبل 3-5 أيام لحفلات الزفاف والفعاليات أو المواسم المزدحمة مثل العطلات الرسمية. الحجوزات في نفس اليوم أو في اللحظة الأخيرة ممكنة غالبًا - تواصلوا معنا عبر واتساب للتحقق من التوفر.",
      ru: "Рекомендуем бронировать минимум за 24 часа для стандартных поездок и за 3–5 дней для свадеб, мероприятий или пиковых периодов, таких как государственные праздники. Бронирование в тот же день и в последний момент часто возможно — напишите нам в WhatsApp, чтобы уточнить наличие.",
      zh: "我们建议标准接送服务至少提前24小时预订,婚礼、活动或公共假期等旺季则建议提前3至5天。当天预订及临时预订通常也可安排——请通过WhatsApp联系我们确认车辆是否可用。",
      fr: "Nous recommandons de réserver au moins 24 heures à l'avance pour les trajets standards, et 3 à 5 jours à l'avance pour les mariages, événements ou périodes de forte affluence comme les jours fériés. Les réservations le jour même ou de dernière minute sont souvent possibles — contactez-nous sur WhatsApp pour vérifier les disponibilités.",
      de: "Wir empfehlen, Standardfahrten mindestens 24 Stunden im Voraus zu buchen und für Hochzeiten, Veranstaltungen oder Stoßzeiten wie Feiertage 3–5 Tage im Voraus. Buchungen am selben Tag oder kurzfristig sind oft möglich — schreiben Sie uns auf WhatsApp, um die Verfügbarkeit zu prüfen.",
    },
  },
  {
    question: {
      en: "Do you track flights for airport transfers?",
      ar: "هل تتابعون رحلات الطيران لخدمة الاستقبال من المطار؟",
      ru: "Отслеживаете ли вы рейсы для трансферов из аэропорта?",
      zh: "机场接送服务是否会追踪航班信息?",
      fr: "Suivez-vous les vols pour les transferts aéroport?",
      de: "Verfolgen Sie Flüge für Flughafentransfers?",
    },
    answer: {
      en: "Yes. Every airport transfer includes live flight tracking, so your chauffeur adjusts pickup time automatically for early or delayed arrivals at no extra charge.",
      ar: "نعم. تشمل كل عملية استقبال من المطار متابعة مباشرة لرحلة الطيران، بحيث يقوم سائقكم بتعديل وقت الاستقبال تلقائيًا في حال الوصول المبكر أو المتأخر دون أي رسوم إضافية.",
      ru: "Да. Каждый трансфер из аэропорта включает отслеживание рейса в реальном времени, поэтому ваш шофёр автоматически корректирует время встречи при раннем или задержанном прибытии без дополнительной платы.",
      zh: "是的。每次机场接送服务都包含实时航班追踪,司机会根据航班提前或延误情况自动调整接机时间,不收取任何额外费用。",
      fr: "Oui. Chaque transfert aéroport inclut un suivi de vol en temps réel, afin que votre chauffeur ajuste automatiquement l'heure de prise en charge en cas d'arrivée anticipée ou retardée, sans frais supplémentaires.",
      de: "Ja. Jeder Flughafentransfer beinhaltet eine Live-Flugverfolgung, sodass Ihr Chauffeur die Abholzeit bei früher oder verspäteter Ankunft automatisch anpasst — ohne Aufpreis.",
    },
  },
  {
    question: {
      en: "What vehicles are available in your fleet?",
      ar: "ما هي السيارات المتوفرة في أسطولكم؟",
      ru: "Какие автомобили доступны в вашем автопарке?",
      zh: "贵公司车队有哪些车型可供选择?",
      fr: "Quels véhicules sont disponibles dans votre flotte?",
      de: "Welche Fahrzeuge stehen in Ihrer Flotte zur Verfügung?",
    },
    answer: {
      en: "Our fleet includes the Mercedes S-Class, Mercedes V-Class, BMW 7 Series, Cadillac Escalade, Range Rover Autobiography, and Rolls-Royce Phantom — covering executive sedans, SUVs, group vans, and ultra-luxury vehicles.",
      ar: "يضم أسطولنا مرسيدس S-Class، ومرسيدس V-Class، وBMW الفئة السابعة، وكاديلاك إسكاليد، ورينج روفر أوتوبيوغرافي، ورولز رويس فانتوم - وتشمل سيارات سيدان تنفيذية، وسيارات دفع رباعي، وحافلات صغيرة للمجموعات، وسيارات فاخرة للغاية.",
      ru: "Наш автопарк включает Mercedes S-Class, Mercedes V-Class, BMW 7 Series, Cadillac Escalade, Range Rover Autobiography и Rolls-Royce Phantom — от представительских седанов и внедорожников до микроавтобусов для групп и автомобилей класса ультра-люкс.",
      zh: "我们的车队包括奔驰S级、奔驰V级、宝马7系、凯迪拉克凯雷德、路虎揽胜行政版以及劳斯莱斯幻影——涵盖行政轿车、豪华SUV、团体商务车及顶级奢华车型。",
      fr: "Notre flotte comprend la Mercedes Classe S, la Mercedes Classe V, la BMW Série 7, la Cadillac Escalade, la Range Rover Autobiography et la Rolls-Royce Phantom — couvrant berlines de direction, SUV, minibus de groupe et véhicules ultra-luxe.",
      de: "Unsere Flotte umfasst die Mercedes S-Klasse, die Mercedes V-Klasse, den BMW 7er, den Cadillac Escalade, den Range Rover Autobiography und den Rolls-Royce Phantom — von Business-Limousinen über SUVs und Gruppenvans bis hin zu Ultra-Luxusfahrzeugen.",
    },
  },
  {
    question: {
      en: "Do you offer hourly or full-day chauffeur hire?",
      ar: "هل تقدمون خدمة استئجار سائق بالساعة أو ليوم كامل؟",
      ru: "Предоставляете ли вы услуги почасовой или полнодневной аренды шофёра?",
      zh: "是否提供按小时或全天包车服务?",
      fr: "Proposez-vous une location de chauffeur à l'heure ou à la journée?",
      de: "Bieten Sie stundenweise oder ganztägige Chauffeurdienste an?",
    },
    answer: {
      en: "Yes, chauffeurs can be booked by the hour, for a half-day, or for a full day — ideal for business meetings, city touring, or multi-stop itineraries where you need the car to wait.",
      ar: "نعم، يمكن حجز السائقين بالساعة، أو لنصف يوم، أو ليوم كامل - وهو الخيار المثالي لاجتماعات العمل، أو جولات المدينة، أو خطط السير متعددة المحطات التي تتطلب انتظار السيارة.",
      ru: "Да, шофёра можно забронировать на час, на полдня или на весь день — это идеально подходит для деловых встреч, экскурсий по городу или маршрутов с несколькими остановками, где автомобиль должен ждать.",
      zh: "是的,司机服务可按小时、半天或全天预订——非常适合商务会议、市区观光或需要车辆等候的多站行程。",
      fr: "Oui, les chauffeurs peuvent être réservés à l'heure, pour une demi-journée ou une journée complète — idéal pour les réunions d'affaires, la visite de la ville ou les itinéraires à plusieurs arrêts où le véhicule doit attendre.",
      de: "Ja, Chauffeure können stundenweise, für einen halben Tag oder einen ganzen Tag gebucht werden — ideal für Geschäftstermine, Stadtbesichtigungen oder Routen mit mehreren Stopps, bei denen das Fahrzeug warten soll.",
    },
  },
  {
    question: {
      en: "Are your chauffeurs licensed and insured?",
      ar: "هل سائقوكم مرخصون ومؤمَّنون؟",
      ru: "Есть ли у ваших шофёров лицензии и страховка?",
      zh: "贵公司司机是否持有执照并投保?",
      fr: "Vos chauffeurs sont-ils agréés et assurés?",
      de: "Sind Ihre Chauffeure lizenziert und versichert?",
    },
    answer: {
      en: "All Apex chauffeurs hold valid UAE commercial driving licenses, undergo background checks, and are trained in professional etiquette. Every vehicle carries full commercial insurance.",
      ar: "يحمل جميع سائقي Apex رخص قيادة تجارية سارية المفعول في دولة الإمارات، ويخضعون للتحقق من السجلات، ويتم تدريبهم على آداب السلوك المهني. كما تحمل كل سيارة تأمينًا تجاريًا شاملاً.",
      ru: "Все шофёры Apex имеют действующие коммерческие водительские права ОАЭ, проходят проверку биографических данных и обучены профессиональному этикету. Каждый автомобиль имеет полную коммерческую страховку.",
      zh: "Apex的所有司机均持有有效的阿联酋商业驾驶执照,经过背景审查,并接受专业礼仪培训。每辆车均投保全面的商业保险。",
      fr: "Tous les chauffeurs Apex détiennent un permis de conduire commercial des Émirats arabes unis valide, font l'objet d'une vérification des antécédents et sont formés à l'étiquette professionnelle. Chaque véhicule bénéficie d'une assurance commerciale complète.",
      de: "Alle Apex-Chauffeure verfügen über eine gültige gewerbliche Fahrerlaubnis der VAE, werden einer Hintergrundprüfung unterzogen und in professioneller Etikette geschult. Jedes Fahrzeug ist umfassend gewerblich versichert.",
    },
  },
  {
    question: {
      en: "Can I book for multiple stops or a custom itinerary?",
      ar: "هل يمكنني الحجز لعدة محطات أو خط سير مخصص؟",
      ru: "Могу ли я забронировать поездку с несколькими остановками или индивидуальным маршрутом?",
      zh: "我可以预订多个停靠点或定制行程吗?",
      fr: "Puis-je réserver plusieurs arrêts ou un itinéraire sur mesure?",
      de: "Kann ich mehrere Stopps oder eine individuelle Route buchen?",
    },
    answer: {
      en: "Absolutely. Let us know your planned stops and timing when booking, or discuss it directly with your chauffeur — corporate and event bookings often include multi-stop routing as standard.",
      ar: "بالتأكيد. أخبرونا بالمحطات المخطط لها وتوقيتها عند الحجز، أو ناقشوا ذلك مباشرة مع سائقكم - غالبًا ما تتضمن حجوزات الشركات والفعاليات مسارات متعددة المحطات كخيار قياسي.",
      ru: "Разумеется. Сообщите нам о планируемых остановках и времени при бронировании или обсудите это напрямую с вашим шофёром — корпоративные и праздничные заказы часто по умолчанию включают маршруты с несколькими остановками.",
      zh: "当然可以。预订时请告知我们计划的停靠点和时间安排,或直接与司机沟通——企业及活动预订通常默认包含多站点路线服务。",
      fr: "Absolument. Indiquez-nous vos arrêts et horaires prévus lors de la réservation, ou discutez-en directement avec votre chauffeur — les réservations d'entreprise et d'événements incluent souvent un itinéraire à plusieurs arrêts en standard.",
      de: "Selbstverständlich. Teilen Sie uns bei der Buchung Ihre geplanten Stopps und Zeiten mit oder besprechen Sie dies direkt mit Ihrem Chauffeur — Firmen- und Eventbuchungen beinhalten häufig standardmäßig Routen mit mehreren Stopps.",
    },
  },
];

/** Resolves the FAQ list to plain, locale-specific strings for rendering. */
export function getFaqs(locale: Locale): { question: string; answer: string }[] {
  return FAQS.map((faq) => ({
    question: faq.question[locale],
    answer: faq.answer[locale],
  }));
}

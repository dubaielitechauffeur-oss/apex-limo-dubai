import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/i18n-types";

export interface PopularRoute {
  /** Location name — proper noun, stays Latin script across all locales. */
  from: string;
  /** Location name — proper noun, stays Latin script across all locales. */
  to: string;
  duration: Localized<string>;
}

export interface LocationFAQ {
  question: Localized;
  answer: Localized;
}

export interface LocationImage {
  src: string;
  alt: Localized;
}

export interface Location {
  slug: string;
  /** Proper noun — kept in Latin script across all locales by design. */
  name: string;
  tagline: Localized;
  heroSubtitle: Localized;
  shortDescription: Localized;
  longDescription: Localized<string[]>;
  isAirport: boolean;
  popularRoutes: PopularRoute[];
  whyChoose: Localized<string[]>;
  faqs: LocationFAQ[];
  /** Landmark proper nouns — kept in Latin script across all locales. */
  landmarks: string[];
  /** Card image for the /locations listing page. */
  image: LocationImage;
  /** Optional desktop-only override for this location's detail-page hero
   *  background, shown at >=768px width. Falls back to `image` when unset. */
  heroDesktopImage?: LocationImage;
  /** Optional mobile-only override for this location's detail-page hero
   *  background, shown below 768px width. Falls back to `image` when unset.
   *  Independent of `heroDesktopImage` — either can be set without the
   *  other, and neither affects `image` itself (still used elsewhere, e.g.
   *  the /locations listing card and this page's FAQ background). */
  heroMobileImage?: LocationImage;
  /** Optional CSS object-position for the hero background (e.g. "80% center").
   *  Applied via inline style, not a Tailwind class, since this file isn't
   *  in Tailwind's content scan. Defaults to "center" when unset. */
  heroObjectPosition?: string;
  /** Short 2-3 word chips shown on the homepage location card (not full sentences). */
  tags: Localized<string[]>;
}

export const LOCATIONS: Location[] = [
  {
    slug: "dubai-marina",
    name: "Dubai Marina",
    tags: {
      en: ["Luxury Hotels", "Private Transfers", "VIP Pickups"],
      ar: ["فنادق فاخرة", "نقل خاص", "استقبال VIP"],
      ru: ["Роскошные отели", "Частные трансферы", "VIP-встречи"],
      zh: ["豪华酒店", "私人接送", "贵宾接待"],
      fr: ["Hôtels de luxe", "Transferts privés", "Accueil VIP"],
      de: ["Luxushotels", "Private Transfers", "VIP-Empfang"],
    },
    image: {
      src: "/images/locations/dubai-marina.webp",
      alt: {
        en: "Aerial view of Dubai Marina at sunset with the Cayan Tower and marina waterfront",
        ar: "منظر جوي لمرسى دبي عند الغروب مع برج كايان وواجهة المرسى المائية",
        ru: "Вид с воздуха на Dubai Marina на закате с башней Cayan Tower и набережной марины",
        zh: "迪拜码头日落航拍,可见凯扬塔(Cayan Tower)与码头水岸",
        fr: "Vue aérienne de Dubai Marina au coucher du soleil avec la Cayan Tower et le front de mer de la marina",
        de: "Luftaufnahme von Dubai Marina bei Sonnenuntergang mit dem Cayan Tower und der Marina-Uferpromenade",
      },
    },
    heroDesktopImage: {
      src: "/images/locations/dubai-marina-hero-desktop.webp",
      alt: {
        en: "Dubai Marina skyline viewed from the water, with the Marina's towers under a clear teal sky",
        ar: "أفق مرسى دبي كما يُرى من الماء، مع أبراج المرسى تحت سماء صافية زرقاء مخضرة",
        ru: "Панорама Dubai Marina, вид с воды — башни марины на фоне ясного бирюзового неба",
        zh: "从海面眺望迪拜码头天际线,码头高楼群矗立在晴朗的蓝绿色天空下",
        fr: "Skyline de Dubai Marina vu depuis l'eau, avec les tours de la marina sous un ciel bleu turquoise dégagé",
        de: "Skyline von Dubai Marina vom Wasser aus gesehen, mit den Türmen der Marina unter klarem türkisfarbenem Himmel",
      },
    },
    heroMobileImage: {
      src: "/images/locations/dubai-marina-hero-mobile.webp",
      alt: {
        en: "Aerial dusk view of Dubai Marina's towers, waterway, and yacht-filled harbor",
        ar: "منظر جوي عند الغسق لأبراج مرسى دبي والممر المائي والميناء المليء باليخوت",
        ru: "Вид с воздуха в сумерках на башни Dubai Marina, канал и гавань, заполненную яхтами",
        zh: "黄昏航拍迪拜码头高楼、水道及停满游艇的港湾",
        fr: "Vue aérienne au crépuscule des tours de Dubai Marina, du chenal et du port rempli de yachts",
        de: "Luftaufnahme von Dubai Marina in der Dämmerung mit den Türmen, der Wasserstraße und dem mit Yachten gefüllten Hafen",
      },
    },
    tagline: {
      en: "Waterfront living, door-to-door service",
      ar: "حياة على الواجهة المائية، وخدمة من الباب إلى الباب",
      ru: "Жизнь у воды, сервис от двери до двери",
      zh: "水岸生活,门到门专属服务",
      fr: "La vie en bord de mer, un service porte-à-porte",
      de: "Leben am Wasser, Service von Tür zu Tür",
    },
    heroSubtitle: {
      en: "Chauffeur-driven transport across Dubai Marina — hotel pickups, dinner reservations, and DXB transfers in a premium vehicle.",
      ar: "تنقل بسائق خاص في جميع أنحاء مرسى دبي — استقبال من الفنادق، ومواعيد العشاء، ونقل من وإلى مطار دبي الدولي (DXB) بسيارة فاخرة.",
      ru: "Трансфер с личным водителем по Dubai Marina — встреча у отеля, поездки на ужин и трансферы в аэропорт DXB на премиальном автомобиле.",
      zh: "迪拜码头全境专属司机接送服务——酒店接送、晚宴预约,以及乘坐豪华座驾往返迪拜国际机场(DXB)。",
      fr: "Transport avec chauffeur privé dans tout Dubai Marina — prises en charge à l'hôtel, réservations de dîner et transferts vers DXB à bord d'un véhicule haut de gamme.",
      de: "Chauffeurservice in ganz Dubai Marina — Hotelabholungen, Abendessen-Termine und Transfers zum DXB in einem Premiumfahrzeug.",
    },
    shortDescription: {
      en: "Reliable chauffeur service throughout Dubai Marina, from hotel pickups to airport transfers.",
      ar: "خدمة سائق خاص موثوقة في جميع أنحاء مرسى دبي، من الاستقبال من الفنادق إلى النقل من وإلى المطار.",
      ru: "Надёжный сервис шофёра по всей территории Dubai Marina — от встречи у отеля до трансфера в аэропорт.",
      zh: "覆盖迪拜码头全境的可靠专属司机服务,从酒店接送到机场接驳一应俱全。",
      fr: "Service de chauffeur fiable dans tout Dubai Marina, des prises en charge à l'hôtel aux transferts aéroport.",
      de: "Zuverlässiger Chauffeurservice in ganz Dubai Marina — von Hotelabholungen bis zu Flughafentransfers.",
    },
    longDescription: {
      en: [
        "Dubai Marina's waterfront towers and cluster of five-star hotels make it one of Dubai's busiest pickup zones. Apex chauffeurs know the designated pickup point for every tower along the Marina — from Cayan Tower to the JW Marriott Marquis and Marina Walk — so bookings run smoothly instead of circling for a taxi, even on a busy weekend night.",
        "Airport transfers are the most-booked trip out of the Marina, typically 25–35 minutes to DXB with live flight tracking on arrivals and a realistic buffer for departures. Business travelers commuting into DIFC or Business Bay, and standing corporate accounts based at Marina hotels, get the same fixed-price, punctual standard.",
        "Leisure is where the Marina shines — dinner along Marina Walk, an evening at a yacht club, or a Skydive Dubai booking all suit hourly hire, with the car waiting nearby. Palm Jumeirah and JBR are both under 15 minutes away, making a multi-stop evening easy. Fleet choice ranges from an S-Class or 7 Series for business to a Range Rover or Rolls-Royce for a special night out.",
      ],
      ar: [
        "تجعل أبراج مرسى دبي الواقعة على الواجهة المائية، إلى جانب مجموعة الفنادق الخمس نجوم، من المنطقة واحدة من أكثر مناطق الاستقبال ازدحامًا في دبي. يعرف سائقو Apex نقطة الاستقبال المخصصة لكل برج على طول المرسى — من برج كايان إلى فندق JW Marriott Marquis وممشى المارينا — بحيث تسير الحجوزات بسلاسة بدلاً من الدوران بحثًا عن سيارة أجرة، حتى في ليلة نهاية أسبوع مزدحمة.",
        "تُعد رحلات المطار الأكثر حجزًا من المرسى، وتستغرق عادةً من 25 إلى 35 دقيقة إلى مطار دبي الدولي (DXB) مع تتبع مباشر للرحلات عند الوصول وهامش زمني واقعي للمغادرة. يحصل المسافرون من رجال الأعمال المتوجهون إلى مركز دبي المالي العالمي أو الخليج التجاري، وكذلك حسابات الشركات الدائمة المتمركزة في فنادق المرسى، على نفس معيار السعر الثابت والالتزام بالمواعيد.",
        "تتألق المارينا في الرحلات الترفيهية — عشاء على طول ممشى المارينا، أو أمسية في نادي لليخوت، أو حجز تجربة القفز المظلي في دبي، كلها تناسب الاستئجار بالساعة مع انتظار السيارة على مقربة. تبعد كل من نخلة جميرا وجي بي آر أقل من 15 دقيقة، ما يجعل أمسية بعدة محطات أمرًا سهلاً. يتراوح اختيار الأسطول بين إس-كلاس أو سيريز 7 للأعمال، ورينج روفر أو رولز رويس لأمسية مميزة.",
      ],
      ru: [
        "Прибрежные башни Dubai Marina и скопление пятизвёздочных отелей делают этот район одной из самых оживлённых зон посадки в Дубае. Шофёры Apex знают точное место посадки у каждой башни вдоль марины — от Cayan Tower до JW Marriott Marquis и Marina Walk, — поэтому бронирование проходит гладко, а не превращается в поиски такси даже в загруженный вечер выходного дня.",
        "Трансфер в аэропорт — самая частая поездка из марины: обычно 25–35 минут до DXB, с отслеживанием рейса в реальном времени при прилёте и реалистичным запасом времени при вылете. Деловые путешественники, направляющиеся в DIFC или Business Bay, а также постоянные корпоративные клиенты из отелей марины получают тот же стандарт — фиксированную цену и пунктуальность.",
        "Именно в развлекательных поездках марина раскрывается по-настоящему — ужин вдоль Marina Walk, вечер в яхт-клубе или прыжок с парашютом Skydive Dubai — всё это отлично подходит для почасовой аренды, когда машина ждёт неподалёку. Palm Jumeirah и JBR находятся менее чем в 15 минутах, что делает вечер с несколькими остановками лёгким. Выбор автопарка — от S-Class или 7 Series для деловых поездок до Range Rover или Rolls-Royce для особого вечера.",
      ],
      zh: [
        "迪拜码头林立的滨水高楼与五星级酒店群,使其成为迪拜最繁忙的接客区域之一。Apex司机熟悉码头沿线每一栋大楼的指定接客点——从凯扬塔到JW万豪侯爵酒店及码头步行街——即使在周末繁忙的夜晚,预订行程也能顺利进行,无需绕圈寻找出租车。",
        "机场接送是码头区预订最多的行程,通常前往DXB机场需25至35分钟,抵达航班实时追踪,出发航班则预留合理缓冲时间。无论是前往迪拜国际金融中心或商业湾通勤的商务旅客,还是常驻码头酒店的企业长期客户,都享有同样固定价格、准时可靠的服务标准。",
        "码头区的休闲魅力尤为突出——无论是码头步行街的晚餐、游艇俱乐部的夜晚,还是迪拜跳伞预约,均适合按小时包车,座驾就在附近等候。棕榈岛与JBR车程均在15分钟以内,轻松安排一晚多站行程。车型可选S级或7系商务座驾,亦可选择揽胜或劳斯莱斯,尽显特别夜晚的格调。",
      ],
      fr: [
        "Les tours en bord de mer de Dubai Marina et sa concentration d'hôtels cinq étoiles en font l'une des zones de prise en charge les plus fréquentées de Dubaï. Les chauffeurs Apex connaissent le point de prise en charge désigné pour chaque tour le long de la marina — de la Cayan Tower au JW Marriott Marquis et à Marina Walk — de sorte que les réservations se déroulent sans accroc, sans tourner en rond à la recherche d'un taxi, même un soir de week-end chargé.",
        "Les transferts aéroport sont le trajet le plus réservé au départ de la Marina, généralement 25 à 35 minutes jusqu'à DXB, avec suivi de vol en direct pour les arrivées et une marge réaliste pour les départs. Les voyageurs d'affaires se rendant au DIFC ou à Business Bay, ainsi que les comptes d'entreprise permanents basés dans les hôtels de la Marina, bénéficient du même standard : prix fixe et ponctualité.",
        "C'est dans les loisirs que la Marina brille vraiment — un dîner le long de Marina Walk, une soirée dans un yacht club ou une réservation Skydive Dubai se prêtent parfaitement à la location à l'heure, avec la voiture qui attend à proximité. Palm Jumeirah et JBR sont toutes deux à moins de 15 minutes, ce qui facilite une soirée à plusieurs étapes. Le choix de flotte va d'une Classe S ou Série 7 pour les affaires à une Range Rover ou une Rolls-Royce pour une soirée spéciale.",
      ],
      de: [
        "Die Türme von Dubai Marina direkt am Wasser und die Ansammlung von Fünf-Sterne-Hotels machen die Gegend zu einer der belebtesten Abholzonen Dubais. Apex-Chauffeure kennen den genauen Abholpunkt für jeden Turm entlang der Marina — vom Cayan Tower über das JW Marriott Marquis bis zur Marina Walk —, sodass Buchungen reibungslos ablaufen, statt an einem belebten Wochenendabend nach einem Taxi zu suchen.",
        "Flughafentransfers sind die meistgebuchte Fahrt ab der Marina, in der Regel 25–35 Minuten bis zum DXB, mit Live-Flugverfolgung bei Ankünften und einem realistischen Zeitpuffer für Abflüge. Geschäftsreisende, die ins DIFC oder nach Business Bay pendeln, sowie feste Firmenkunden mit Sitz in Marina-Hotels erhalten denselben pünktlichen Festpreis-Standard.",
        "Bei Freizeitfahrten zeigt die Marina ihre beste Seite — ein Abendessen entlang der Marina Walk, ein Abend im Yachtclub oder eine Skydive-Dubai-Buchung eignen sich hervorragend für die Stundenmiete, während der Wagen in der Nähe wartet. Palm Jumeirah und JBR sind beide unter 15 Minuten entfernt, was einen Abend mit mehreren Stopps einfach macht. Die Fahrzeugauswahl reicht von einer S-Klasse oder 7er-Reihe für Geschäftliches bis zu einem Range Rover oder Rolls-Royce für einen besonderen Abend.",
      ],
    },
    isAirport: false,
    popularRoutes: [
      {
        from: "Dubai Marina",
        to: "Dubai International Airport (DXB)",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
      {
        from: "Dubai Marina",
        to: "Downtown Dubai",
        duration: { en: "~25 min", ar: "~25 دقيقة", ru: "~25 мин", zh: "~25分钟", fr: "~25 min", de: "~25 Min." },
      },
      {
        from: "Dubai Marina",
        to: "Palm Jumeirah",
        duration: { en: "~15 min", ar: "~15 دقيقة", ru: "~15 мин", zh: "~15分钟", fr: "~15 min", de: "~15 Min." },
      },
      {
        from: "Dubai Marina",
        to: "Business Bay",
        duration: { en: "~25 min", ar: "~25 دقيقة", ru: "~25 мин", zh: "~25分钟", fr: "~25 min", de: "~25 Min." },
      },
      {
        from: "Dubai Marina",
        to: "JBR",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
    ],
    whyChoose: {
      en: [
        "Drivers know the exact designated pickup point for every Marina tower and hotel entrance",
        "Fast, direct access to Sheikh Zayed Road for both airport and city transfers",
        "Fixed pricing that holds regardless of Marina traffic or a busy event night",
        "Equally available for a standing daily commute and a one-off dinner booking",
        "Hourly hire lets the car wait between stops along Marina Walk's restaurants and venues",
        "Genuinely familiar with weekend and event-night congestion around the promenade and marina",
      ],
      ar: [
        "يعرف السائقون نقطة الاستقبال المخصصة بدقة لكل برج ومدخل فندق في المارينا",
        "وصول سريع ومباشر إلى شارع الشيخ زايد لكل من رحلات المطار والمدينة",
        "أسعار ثابتة لا تتغير بغض النظر عن ازدحام المارينا أو ليلة فعالية مزدحمة",
        "متاحة بالتساوي للتنقل اليومي المنتظم وحجز عشاء لمرة واحدة",
        "يتيح الاستئجار بالساعة انتظار السيارة بين المحطات على طول مطاعم وأماكن ممشى المارينا",
        "معرفة حقيقية بازدحام عطلات نهاية الأسبوع وليالي الفعاليات حول الممشى والمارينا",
      ],
      ru: [
        "Водители точно знают место посадки у каждой башни и входа в отель в марине",
        "Быстрый прямой выезд на Sheikh Zayed Road для трансферов как в аэропорт, так и по городу",
        "Фиксированная цена не меняется независимо от пробок в марине или загруженного вечера с мероприятием",
        "Одинаково удобно и для регулярных ежедневных поездок, и для разового заказа на ужин",
        "Почасовая аренда позволяет машине ждать между остановками у ресторанов и заведений Marina Walk",
        "Хорошо знакомы с заторами по выходным и в вечера мероприятий вокруг променада и марины",
      ],
      zh: [
        "司机熟知码头每栋大楼及酒店入口的指定接客点",
        "快速直达谢赫扎耶德路,机场与市区接送均便捷高效",
        "无论码头交通拥堵或活动夜晚多繁忙,价格始终保持固定不变",
        "无论是日常固定通勤,还是单次晚宴预订,均可提供同等优质服务",
        "按小时包车服务可让座驾在码头步行街各餐厅与场所间的停留期间随时等候",
        "对海滨长廊及码头区周末与活动夜晚的拥堵状况了如指掌",
      ],
      fr: [
        "Les chauffeurs connaissent le point de prise en charge exact pour chaque tour et entrée d'hôtel de la Marina",
        "Accès rapide et direct à Sheikh Zayed Road pour les transferts vers l'aéroport comme vers la ville",
        "Un tarif fixe qui reste inchangé, quelle que soit la circulation dans la Marina ou une soirée d'événement chargée",
        "Aussi disponible pour un trajet quotidien régulier que pour une réservation ponctuelle pour un dîner",
        "La location à l'heure permet à la voiture d'attendre entre les arrêts le long des restaurants et lieux de Marina Walk",
        "Une connaissance approfondie des embouteillages du week-end et des soirées d'événements autour de la promenade et de la marina",
      ],
      de: [
        "Fahrer kennen den genauen Abholpunkt für jeden Marina-Turm und jeden Hoteleingang",
        "Schneller, direkter Zugang zur Sheikh Zayed Road für Flughafen- und Stadttransfers",
        "Festpreise, die unabhängig vom Verkehr in der Marina oder einem verkehrsreichen Eventabend gelten",
        "Gleichermaßen verfügbar für den täglichen Pendelverkehr wie für eine einmalige Dinner-Buchung",
        "Die Stundenmiete lässt den Wagen zwischen den Stopps an den Restaurants und Locations der Marina Walk warten",
        "Mit dem Verkehrsaufkommen an Wochenenden und Eventabenden rund um Promenade und Marina bestens vertraut",
      ],
    },
    faqs: [
      {
        question: {
          en: "Do you pick up from Dubai Marina hotels?",
          ar: "هل تقومون بالاستقبال من فنادق مرسى دبي؟",
          ru: "Вы забираете гостей из отелей Dubai Marina?",
          zh: "你们提供迪拜码头酒店接送服务吗?",
          fr: "Assurez-vous la prise en charge depuis les hôtels de Dubai Marina ?",
          de: "Holen Sie auch von Hotels in Dubai Marina ab?",
        },
        answer: {
          en: "Yes, we cover every hotel and residential tower in Dubai Marina, including designated lobby and valet pickup points.",
          ar: "نعم، نغطي كل فندق وبرج سكني في مرسى دبي، بما في ذلك نقاط الاستقبال المخصصة في اللوبي وخدمة صف السيارات.",
          ru: "Да, мы обслуживаем каждый отель и жилую башню в Dubai Marina, включая назначенные точки посадки в лобби и у валет-паркинга.",
          zh: "是的,我们覆盖迪拜码头的每一家酒店及住宅大楼,包括大堂及代客泊车指定接客点。",
          fr: "Oui, nous couvrons chaque hôtel et tour résidentielle de Dubai Marina, y compris les points de prise en charge désignés au lobby et au service voiturier.",
          de: "Ja, wir decken jedes Hotel und jeden Wohnturm in Dubai Marina ab, einschließlich der vorgesehenen Abholpunkte in der Lobby und am Voiturier-Service.",
        },
      },
      {
        question: {
          en: "How long is the drive from Dubai Marina to DXB?",
          ar: "كم تستغرق الرحلة من مرسى دبي إلى مطار دبي الدولي (DXB)؟",
          ru: "Сколько ехать от Dubai Marina до DXB?",
          zh: "从迪拜码头到DXB机场车程多久?",
          fr: "Combien de temps dure le trajet entre Dubai Marina et DXB ?",
          de: "Wie lange dauert die Fahrt von Dubai Marina zum DXB?",
        },
        answer: {
          en: "Typically 30–35 minutes depending on traffic; we build in a buffer and track your flight for departures.",
          ar: "عادةً من 30 إلى 35 دقيقة حسب حركة المرور؛ ونضيف هامشًا زمنيًا ونتابع رحلتك الجوية بالنسبة للمغادرة.",
          ru: "Обычно 30–35 минут в зависимости от трафика; мы закладываем запас времени и отслеживаем ваш рейс перед вылетом.",
          zh: "通常需30至35分钟,视路况而定;我们会预留缓冲时间,并为您的出发航班进行追踪。",
          fr: "Généralement 30 à 35 minutes selon la circulation ; nous prévoyons une marge et suivons votre vol pour les départs.",
          de: "Je nach Verkehr in der Regel 30–35 Minuten; wir planen einen Zeitpuffer ein und verfolgen Ihren Flug bei Abflügen.",
        },
      },
      {
        question: {
          en: "Can I book a chauffeur for a night out in the Marina?",
          ar: "هل يمكنني حجز سائق لأمسية في المارينا؟",
          ru: "Могу ли я заказать шофёра для вечера в марине?",
          zh: "我可以预订司机陪同在码头区度过夜晚吗?",
          fr: "Puis-je réserver un chauffeur pour une soirée dans la Marina ?",
          de: "Kann ich einen Chauffeur für einen Abend in der Marina buchen?",
        },
        answer: {
          en: "Yes, hourly hire is available for dinners, events, or an evening moving between venues.",
          ar: "نعم، الاستئجار بالساعة متاح لحفلات العشاء أو الفعاليات أو أمسية تتنقل فيها بين عدة أماكن.",
          ru: "Да, почасовая аренда доступна для ужинов, мероприятий или вечера с перемещением между несколькими заведениями.",
          zh: "可以,按小时包车服务适用于晚宴、活动,或往返多个场所的夜晚行程。",
          fr: "Oui, la location à l'heure est disponible pour les dîners, événements ou une soirée avec plusieurs lieux à visiter.",
          de: "Ja, die Stundenmiete steht für Abendessen, Veranstaltungen oder einen Abend mit mehreren Stationen zur Verfügung.",
        },
      },
      {
        question: {
          en: "Is waiting time included with the booking?",
          ar: "هل وقت الانتظار مشمول في الحجز؟",
          ru: "Включено ли время ожидания в стоимость бронирования?",
          zh: "预订是否包含等候时间?",
          fr: "Le temps d'attente est-il inclus dans la réservation ?",
          de: "Ist die Wartezeit in der Buchung enthalten?",
        },
        answer: {
          en: "Yes, your chauffeur waits with the vehicle — no need to arrange separate parking.",
          ar: "نعم، ينتظر سائقك مع السيارة — لا حاجة لترتيب موقف سيارات منفصل.",
          ru: "Да, ваш шофёр ждёт вместе с автомобилем — отдельно организовывать парковку не нужно.",
          zh: "是的,您的司机会与车辆一同等候——无需另行安排停车。",
          fr: "Oui, votre chauffeur attend avec le véhicule — pas besoin d'organiser un stationnement séparé.",
          de: "Ja, Ihr Chauffeur wartet mit dem Fahrzeug — ein separater Parkplatz muss nicht organisiert werden.",
        },
      },
      {
        question: {
          en: "Do you provide daily commute service for Marina residents working in DIFC or Business Bay?",
          ar: "هل تقدمون خدمة تنقل يومي لسكان المارينا العاملين في مركز دبي المالي العالمي أو الخليج التجاري؟",
          ru: "Предоставляете ли вы ежедневный трансфер для жителей марины, работающих в DIFC или Business Bay?",
          zh: "是否为在DIFC或商业湾工作的码头区居民提供日常通勤服务?",
          fr: "Proposez-vous un service de trajet quotidien pour les résidents de la Marina travaillant au DIFC ou à Business Bay ?",
          de: "Bieten Sie einen täglichen Pendelservice für Marina-Bewohner an, die im DIFC oder in Business Bay arbeiten?",
        },
        answer: {
          en: "Yes, many Marina residents use Apex for a standing daily or weekly commute into the business districts, billed the same as any recurring booking.",
          ar: "نعم، يستخدم العديد من سكان المارينا خدمة Apex للتنقل اليومي أو الأسبوعي المنتظم إلى الأحياء التجارية، وتُحتسب الفوترة كأي حجز متكرر.",
          ru: "Да, многие жители марины пользуются Apex для регулярных ежедневных или еженедельных поездок в деловые районы — оплата как за любое повторяющееся бронирование.",
          zh: "是的,许多码头区居民选择Apex提供的固定每日或每周通勤服务前往商业区,计费方式与其他常规预订相同。",
          fr: "Oui, de nombreux résidents de la Marina utilisent Apex pour un trajet quotidien ou hebdomadaire régulier vers les quartiers d'affaires, facturé comme toute réservation récurrente.",
          de: "Ja, viele Marina-Bewohner nutzen Apex für ein festes tägliches oder wöchentliches Pendeln in die Geschäftsviertel, abgerechnet wie jede wiederkehrende Buchung.",
        },
      },
      {
        question: {
          en: "Can you time a pickup around a Skydive Dubai booking?",
          ar: "هل يمكنكم تنسيق موعد الاستقبال مع حجز تجربة القفز المظلي في دبي؟",
          ru: "Можете ли вы согласовать время подачи машины с бронированием Skydive Dubai?",
          zh: "能否根据迪拜跳伞预约时间安排接送?",
          fr: "Pouvez-vous planifier une prise en charge autour d'une réservation Skydive Dubai ?",
          de: "Können Sie eine Abholung rund um eine Skydive-Dubai-Buchung timen?",
        },
        answer: {
          en: "Yes, we coordinate pickup and return timing around Skydive Dubai bookings and other Marina-based activities on request.",
          ar: "نعم، ننسق مواعيد الاستقبال والعودة مع حجوزات القفز المظلي في دبي وغيرها من الأنشطة في المارينا عند الطلب.",
          ru: "Да, по запросу мы согласовываем время подачи и возврата с бронированием Skydive Dubai и другими мероприятиями в районе марины.",
          zh: "可以,我们可根据要求协调接送及返程时间,配合Skydive Dubai预约及其他码头区活动安排。",
          fr: "Oui, nous coordonnons les horaires de prise en charge et de retour autour des réservations Skydive Dubai et d'autres activités dans la Marina, sur demande.",
          de: "Ja, wir stimmen Abhol- und Rückkehrzeiten auf Anfrage mit Skydive-Dubai-Buchungen und anderen Aktivitäten in der Marina ab.",
        },
      },
      {
        question: {
          en: "Can I book a chauffeur for a full day exploring the Marina and nearby areas?",
          ar: "هل يمكنني حجز سائق ليوم كامل لاستكشاف المارينا والمناطق المجاورة؟",
          ru: "Можно ли забронировать шофёра на целый день для осмотра марины и близлежащих районов?",
          zh: "可以预订司机陪同一整天探索码头区及周边地区吗?",
          fr: "Puis-je réserver un chauffeur pour une journée complète afin d'explorer la Marina et ses environs ?",
          de: "Kann ich einen Chauffeur für einen ganzen Tag buchen, um die Marina und die Umgebung zu erkunden?",
        },
        answer: {
          en: "Yes, full-day hourly hire is popular here — the same car and driver can cover the Marina, JBR, and Palm Jumeirah in one booking.",
          ar: "نعم، الاستئجار بالساعة ليوم كامل شائع هنا — يمكن لنفس السيارة والسائق تغطية المارينا وجي بي آر ونخلة جميرا في حجز واحد.",
          ru: "Да, аренда на полный день здесь очень популярна — один и тот же автомобиль и водитель могут охватить марину, JBR и Palm Jumeirah в рамках одного бронирования.",
          zh: "可以,全天按小时包车在此十分受欢迎——同一辆车与司机可在一次预订中覆盖码头区、JBR及棕榈岛。",
          fr: "Oui, la location à l'heure pour une journée complète est très demandée ici — la même voiture et le même chauffeur peuvent couvrir la Marina, JBR et Palm Jumeirah en une seule réservation.",
          de: "Ja, die ganztägige Stundenmiete ist hier beliebt — derselbe Wagen und Fahrer können Marina, JBR und Palm Jumeirah in einer einzigen Buchung abdecken.",
        },
      },
      {
        question: {
          en: "Do you serve the newer towers and developments along the Marina promenade?",
          ar: "هل تخدمون الأبراج والمشاريع الأحدث على طول ممشى المارينا؟",
          ru: "Обслуживаете ли вы новые башни и застройки вдоль променада марины?",
          zh: "是否为码头长廊沿线新建的大楼和项目提供服务?",
          fr: "Desservez-vous les tours et projets plus récents le long de la promenade de la Marina ?",
          de: "Bedienen Sie auch die neueren Türme und Projekte entlang der Marina-Promenade?",
        },
        answer: {
          en: "Yes, we keep pace with new towers as they open along the Marina and confirm exact pickup points before your first booking.",
          ar: "نعم، نواكب الأبراج الجديدة فور افتتاحها على طول المارينا ونؤكد نقاط الاستقبال الدقيقة قبل حجزك الأول.",
          ru: "Да, мы отслеживаем открытие новых башен вдоль марины и уточняем точное место посадки перед вашим первым бронированием.",
          zh: "是的,我们会随着码头沿线新大楼的落成持续更新覆盖范围,并在您首次预订前确认准确的接客地点。",
          fr: "Oui, nous suivons l'ouverture des nouvelles tours le long de la Marina et confirmons les points de prise en charge exacts avant votre première réservation.",
          de: "Ja, wir halten mit neu eröffneten Türmen entlang der Marina Schritt und bestätigen die genauen Abholpunkte vor Ihrer ersten Buchung.",
        },
      },
    ],
    landmarks: ["Marina Walk", "Cayan Tower", "JW Marriott Marquis", "Dubai Marina Mall", "Skydive Dubai", "Marina Yacht Club"],
  },
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    tags: {
      en: ["Resorts", "Luxury Villas", "Airport Transfers"],
      ar: ["منتجعات", "فلل فاخرة", "نقل من وإلى المطار"],
      ru: ["Курорты", "Роскошные виллы", "Трансферы в аэропорт"],
      zh: ["度假村", "豪华别墅", "机场接送"],
      fr: ["Resorts", "Villas de luxe", "Transferts aéroport"],
      de: ["Resorts", "Luxusvillen", "Flughafentransfers"],
    },
    image: {
      src: "/images/locations/palm-jumeirah.webp",
      alt: {
        en: "Luxury resort courtyard and pool lined with palm trees on Palm Jumeirah at dusk",
        ar: "فناء منتجع فاخر ومسبح محاط بأشجار النخيل في نخلة جميرا عند الغسق",
        ru: "Двор роскошного курорта и бассейн, окружённый пальмами, на Palm Jumeirah в сумерках",
        zh: "黄昏时分棕榈岛豪华度假村庭院及棕榈树环绕的泳池",
        fr: "Cour et piscine d'un resort de luxe bordées de palmiers sur Palm Jumeirah au crépuscule",
        de: "Innenhof und Pool eines Luxusresorts, gesäumt von Palmen, auf Palm Jumeirah in der Dämmerung",
      },
    },
    tagline: {
      en: "Island access, without the wait",
      ar: "الوصول إلى الجزيرة، دون انتظار",
      ru: "Доступ на остров без ожидания",
      zh: "畅行棕榈岛,无需等待",
      fr: "L'accès à l'île, sans attente",
      de: "Zugang zur Insel, ganz ohne Wartezeit",
    },
    heroSubtitle: {
      en: "Private chauffeur service to and from Palm Jumeirah's hotels, villas, and beach clubs.",
      ar: "خدمة سائق خاص من وإلى فنادق وفلل ونوادي شاطئية في نخلة جميرا.",
      ru: "Частный шофёрский сервис до и от отелей, вилл и пляжных клубов Palm Jumeirah.",
      zh: "提供往返棕榈岛各大酒店、别墅及海滩俱乐部的私人专属司机服务。",
      fr: "Service de chauffeur privé vers et depuis les hôtels, villas et clubs de plage de Palm Jumeirah.",
      de: "Privater Chauffeurservice zu und von den Hotels, Villen und Beach Clubs von Palm Jumeirah.",
    },
    shortDescription: {
      en: "Discreet chauffeur transport for Palm Jumeirah villas, resorts, and beachfront events.",
      ar: "نقل خاص وسري لفلل ومنتجعات نخلة جميرا والفعاليات على الشاطئ.",
      ru: "Незаметный шофёрский трансфер для вилл, курортов и пляжных мероприятий Palm Jumeirah.",
      zh: "为棕榈岛别墅、度假村及海滨活动提供低调周到的专属司机接送服务。",
      fr: "Transport discret avec chauffeur pour les villas, resorts et événements en bord de mer de Palm Jumeirah.",
      de: "Diskreter Chauffeurtransport für Villen, Resorts und Beachfront-Events auf Palm Jumeirah.",
    },
    longDescription: {
      en: [
        "Palm Jumeirah's villas and beachfront resorts sit along a single access road, so a pre-booked chauffeur avoids the uncertainty of a taxi at the gate. Apex drivers know the Palm's fronds, resort entrances, and villa community security well, whether the pickup is deep on a frond or right on the trunk near Atlantis.",
        "Airport transfers run around 35 minutes to DXB, with flight tracking and a realistic buffer built in for the extra trunk-road distance. The Palm is also one of Dubai's leading wedding destinations — Apex regularly coordinates Rolls-Royce Phantom bookings and guest convoys for resorts along the crescent.",
        "Leisure bookings dominate here: dinner at a destination restaurant, a beach club day, or an evening moving between The Pointe and Palm West Beach. Dubai Marina and JBR are about 15 minutes down the trunk road, easy to combine with a Palm dinner in one hourly booking. Fleet ranges from the Rolls-Royce Phantom for occasions to the usual S-Class and Range Rover for everyday transfers.",
      ],
      ar: [
        "تقع فلل ومنتجعات نخلة جميرا الشاطئية على طول طريق وصول واحد، لذا فإن حجز سائق مسبقًا يجنّبك عدم اليقين المرتبط بانتظار سيارة أجرة عند البوابة. يعرف سائقو Apex جيدًا سعفات النخلة، ومداخل المنتجعات، وأنظمة أمن مجتمعات الفلل، سواء كان الاستقبال في عمق إحدى السعفات أو مباشرة على الجذع بالقرب من أتلانتس.",
        "تستغرق رحلات المطار حوالي 35 دقيقة إلى مطار دبي الدولي (DXB)، مع تتبع الرحلة الجوية وهامش زمني واقعي يأخذ في الاعتبار مسافة الجذع الإضافية. تُعد النخلة أيضًا واحدة من أبرز وجهات حفلات الزفاف في دبي — وتنسّق Apex بانتظام حجوزات رولز رويس فانتوم ومواكب الضيوف للمنتجعات على طول الهلال.",
        "تهيمن الحجوزات الترفيهية هنا: عشاء في مطعم وجهة مميزة، أو يوم في نادٍ شاطئي، أو أمسية تتنقل بين ذا بوينت وشاطئ بالم ويست. تبعد مرسى دبي وجي بي آر حوالي 15 دقيقة على طول طريق الجذع، ويسهل الجمع بينهما وبين عشاء في النخلة ضمن حجز واحد بالساعة. يتراوح الأسطول بين رولز رويس فانتوم للمناسبات، وإس-كلاس ورينج روفر المعتادين للتنقلات اليومية.",
      ],
      ru: [
        "Виллы и пляжные курорты Palm Jumeirah расположены вдоль единственной подъездной дороги, поэтому заранее забронированный шофёр избавляет от неопределённости с такси у ворот. Водители Apex хорошо знают «ветви» Пальмы, входы курортов и системы охраны вилл — независимо от того, находится ли точка посадки глубоко на одной из «ветвей» или прямо на стволе у Atlantis.",
        "Трансфер в аэропорт занимает около 35 минут до DXB, с отслеживанием рейса и реалистичным запасом времени с учётом дополнительного расстояния по стволовой дороге. Пальма также одно из ведущих свадебных направлений Дубая — Apex регулярно организует бронирование Rolls-Royce Phantom и кортежи гостей для курортов вдоль полумесяца.",
        "Здесь преобладают развлекательные заказы: ужин в знаковом ресторане, день в пляжном клубе или вечер с перемещением между The Pointe и Palm West Beach. Dubai Marina и JBR находятся примерно в 15 минутах по стволовой дороге — легко совместить с ужином на Пальме в рамках одного почасового бронирования. Автопарк — от Rolls-Royce Phantom для особых случаев до привычных S-Class и Range Rover для повседневных трансферов.",
      ],
      zh: [
        "棕榈岛的别墅与海滨度假村沿唯一一条主干道分布,因此提前预订司机可避免在大门口等候出租车的不确定性。Apex司机熟悉棕榈岛各分支、度假村入口及别墅社区的安保流程,无论接客点位于某条分支深处,还是靠近亚特兰蒂斯酒店(Atlantis)的主干道上。",
        "机场接送车程约35分钟抵达DXB机场,系统会追踪航班信息,并为主干道的额外距离预留合理缓冲时间。棕榈岛也是迪拜首屈一指的婚礼胜地之一——Apex经常协调劳斯莱斯幻影(Rolls-Royce Phantom)预订及沿新月区各度假村的宾客车队安排。",
        "休闲预订在此占主导地位:在特色餐厅享用晚餐、在海滩俱乐部度过一天,或在The Pointe与Palm West Beach之间往返的夜晚。迪拜码头与JBR沿主干道车程约15分钟,可轻松在一次按小时预订中与棕榈岛晚餐行程结合。车型可选劳斯莱斯幻影用于特殊场合,或S级、揽胜等常规车型用于日常接送。",
      ],
      fr: [
        "Les villas et resorts en bord de mer de Palm Jumeirah se trouvent le long d'une seule route d'accès, si bien qu'un chauffeur réservé à l'avance évite l'incertitude d'un taxi à la grille. Les chauffeurs Apex connaissent bien les frondes de la Palm, les entrées des resorts et la sécurité des communautés de villas, que la prise en charge se situe au fond d'une fronde ou directement sur le tronc près d'Atlantis.",
        "Les transferts aéroport durent environ 35 minutes jusqu'à DXB, avec suivi de vol et une marge réaliste intégrée pour la distance supplémentaire du tronc. La Palm est aussi l'une des principales destinations de mariage à Dubaï — Apex coordonne régulièrement des réservations de Rolls-Royce Phantom et des convois d'invités pour les resorts le long du croissant.",
        "Les réservations de loisirs dominent ici : dîner dans un restaurant de destination, une journée en club de plage, ou une soirée entre The Pointe et Palm West Beach. Dubai Marina et JBR sont à environ 15 minutes le long du tronc, faciles à combiner avec un dîner sur la Palm en une seule réservation à l'heure. La flotte va de la Rolls-Royce Phantom pour les occasions spéciales à la Classe S et au Range Rover habituels pour les transferts quotidiens.",
      ],
      de: [
        "Die Villen und Strandresorts von Palm Jumeirah liegen an einer einzigen Zufahrtsstraße, sodass ein vorab gebuchter Chauffeur die Unsicherheit eines Taxis am Tor vermeidet. Apex-Fahrer kennen die Fronds der Palm, die Resort-Eingänge und die Sicherheitsabläufe der Villengemeinschaften genau — egal ob die Abholung tief auf einem Frond oder direkt am Stamm nahe Atlantis stattfindet.",
        "Flughafentransfers dauern etwa 35 Minuten bis zum DXB, mit Flugverfolgung und einem realistischen Zeitpuffer für die zusätzliche Strecke auf der Stammstraße. Die Palm ist zudem eines von Dubais führenden Hochzeitsziele — Apex koordiniert regelmäßig Rolls-Royce-Phantom-Buchungen und Gästekonvois für Resorts entlang des Bogens.",
        "Freizeitbuchungen dominieren hier: Abendessen in einem Destination-Restaurant, ein Tag im Beach Club oder ein Abend zwischen The Pointe und Palm West Beach. Dubai Marina und JBR liegen etwa 15 Minuten entlang der Stammstraße entfernt und lassen sich leicht mit einem Abendessen auf der Palm in einer Stundenbuchung kombinieren. Die Flotte reicht vom Rolls-Royce Phantom für besondere Anlässe bis zu S-Klasse und Range Rover für alltägliche Transfers.",
      ],
    },
    isAirport: false,
    popularRoutes: [
      {
        from: "Palm Jumeirah",
        to: "Dubai International Airport (DXB)",
        duration: { en: "~35 min", ar: "~35 دقيقة", ru: "~35 мин", zh: "~35分钟", fr: "~35 min", de: "~35 Min." },
      },
      {
        from: "Palm Jumeirah",
        to: "Dubai Marina",
        duration: { en: "~15 min", ar: "~15 دقيقة", ru: "~15 мин", zh: "~15分钟", fr: "~15 min", de: "~15 Min." },
      },
      {
        from: "Palm Jumeirah",
        to: "Downtown Dubai",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
      {
        from: "Palm Jumeirah",
        to: "JBR",
        duration: { en: "~15 min", ar: "~15 دقيقة", ru: "~15 мин", zh: "~15分钟", fr: "~15 min", de: "~15 Min." },
      },
      {
        from: "Palm Jumeirah",
        to: "Business Bay",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
    ],
    whyChoose: {
      en: [
        "Drivers genuinely familiar with Palm frond access roads and villa security gates",
        "A preferred choice for Palm resort weddings and coordinated guest events",
        "Discreet, punctual pickups for both villa residents and hotel guests",
        "Coordinated multi-vehicle convoys for resort events along the crescent",
        "Realistic timing that accounts for the trunk road's added driving distance",
        "Well suited to combining a Palm resort dinner with a Marina or JBR nightcap",
      ],
      ar: [
        "سائقون على دراية حقيقية بطرق الوصول لسعفات النخلة وبوابات أمن الفلل",
        "الخيار المفضل لحفلات زفاف منتجعات النخلة والفعاليات المنسقة للضيوف",
        "استقبال سري ودقيق في المواعيد لكل من سكان الفلل ونزلاء الفنادق",
        "مواكب منسقة متعددة السيارات لفعاليات المنتجعات على طول الهلال",
        "توقيت واقعي يأخذ في الاعتبار مسافة القيادة الإضافية على طريق الجذع",
        "مناسبة تمامًا للجمع بين عشاء في منتجع النخلة وسهرة ختامية في المارينا أو جي بي آر",
      ],
      ru: [
        "Водители хорошо знают подъездные дороги к «ветвям» Пальмы и охраняемые ворота вилл",
        "Предпочтительный выбор для свадеб на курортах Пальмы и организованных гостевых мероприятий",
        "Незаметная, пунктуальная подача как для жителей вилл, так и для гостей отелей",
        "Организованные кортежи из нескольких автомобилей для курортных мероприятий вдоль полумесяца",
        "Реалистичный расчёт времени с учётом дополнительного расстояния по стволовой дороге",
        "Отлично подходит для сочетания ужина на курорте Пальмы с завершением вечера в марине или JBR",
      ],
      zh: [
        "司机对棕榈岛各分支通道及别墅安保门岗有真正的熟悉度",
        "棕榈岛度假村婚礼及宾客统筹活动的首选服务",
        "为别墅住户及酒店宾客提供低调、准时的接送服务",
        "为新月区度假村活动提供统一协调的多车队服务",
        "行程时间估算充分考虑主干道额外行驶距离,真实可靠",
        "非常适合将棕榈岛度假村晚餐与码头区或JBR的夜宵行程相结合",
      ],
      fr: [
        "Des chauffeurs véritablement familiers avec les routes d'accès aux frondes de la Palm et les portails de sécurité des villas",
        "Un choix privilégié pour les mariages dans les resorts de la Palm et les événements coordonnés pour les invités",
        "Des prises en charge discrètes et ponctuelles, aussi bien pour les résidents de villas que pour les clients d'hôtel",
        "Des convois coordonnés à plusieurs véhicules pour les événements de resort le long du croissant",
        "Un timing réaliste qui tient compte de la distance de conduite supplémentaire sur le tronc",
        "Idéal pour combiner un dîner dans un resort de la Palm avec un dernier verre à la Marina ou à JBR",
      ],
      de: [
        "Fahrer, die mit den Zufahrtsstraßen zu den Palm-Fronds und den Sicherheitstoren der Villen wirklich vertraut sind",
        "Eine bevorzugte Wahl für Hochzeiten in Palm-Resorts und koordinierte Gästeveranstaltungen",
        "Diskrete, pünktliche Abholungen sowohl für Villenbewohner als auch für Hotelgäste",
        "Koordinierte Konvois mit mehreren Fahrzeugen für Resort-Events entlang des Bogens",
        "Realistische Zeitplanung, die die zusätzliche Fahrstrecke der Stammstraße berücksichtigt",
        "Bestens geeignet, um ein Abendessen im Palm-Resort mit einem Absacker in der Marina oder in JBR zu verbinden",
      ],
    },
    faqs: [
      {
        question: {
          en: "Do you provide chauffeur service to Palm Jumeirah villas?",
          ar: "هل تقدمون خدمة سائق إلى فلل نخلة جميرا؟",
          ru: "Предоставляете ли вы услуги шофёра для вилл Palm Jumeirah?",
          zh: "你们是否为棕榈岛别墅提供司机服务?",
          fr: "Proposez-vous un service de chauffeur pour les villas de Palm Jumeirah ?",
          de: "Bieten Sie einen Chauffeurservice zu den Villen auf Palm Jumeirah an?",
        },
        answer: {
          en: "Yes, we regularly serve private villas on the Palm, coordinating access through community security gates.",
          ar: "نعم، نخدم بانتظام الفلل الخاصة في النخلة، وننسق الدخول عبر بوابات أمن المجتمع.",
          ru: "Да, мы регулярно обслуживаем частные виллы на Пальме, согласовывая проезд через охраняемые ворота комплекса.",
          zh: "是的,我们定期为棕榈岛私人别墅提供服务,并协调经由社区安保门岗的通行。",
          fr: "Oui, nous desservons régulièrement les villas privées de la Palm, en coordonnant l'accès via les portails de sécurité de la communauté.",
          de: "Ja, wir bedienen regelmäßig private Villen auf der Palm und koordinieren den Zugang über die Sicherheitstore der Wohnanlage.",
        },
      },
      {
        question: {
          en: "Can you arrange transport for a Palm Jumeirah wedding?",
          ar: "هل يمكنكم ترتيب النقل لحفل زفاف في نخلة جميرا؟",
          ru: "Можете ли вы организовать транспорт для свадьбы на Palm Jumeirah?",
          zh: "可以为棕榈岛婚礼安排交通吗?",
          fr: "Pouvez-vous organiser le transport pour un mariage à Palm Jumeirah ?",
          de: "Können Sie den Transport für eine Hochzeit auf Palm Jumeirah organisieren?",
        },
        answer: {
          en: "Yes, the Palm is one of our most requested wedding destinations — we coordinate the Rolls-Royce Phantom and guest convoys for resorts along the crescent.",
          ar: "نعم، تُعد النخلة واحدة من أكثر وجهات الزفاف طلبًا لدينا — ننسق رولز رويس فانتوم ومواكب الضيوف للمنتجعات على طول الهلال.",
          ru: "Да, Пальма — одно из самых востребованных свадебных направлений у нас — мы организуем Rolls-Royce Phantom и кортежи гостей для курортов вдоль полумесяца.",
          zh: "可以,棕榈岛是我们最受欢迎的婚礼目的地之一——我们负责协调劳斯莱斯幻影及沿新月区各度假村的宾客车队。",
          fr: "Oui, la Palm est l'une de nos destinations de mariage les plus demandées — nous coordonnons la Rolls-Royce Phantom et les convois d'invités pour les resorts le long du croissant.",
          de: "Ja, die Palm ist eines unserer meistgefragten Hochzeitsziele — wir koordinieren den Rolls-Royce Phantom und Gästekonvois für Resorts entlang des Bogens.",
        },
      },
      {
        question: {
          en: "How far is Palm Jumeirah from the airport?",
          ar: "كم تبعد نخلة جميرا عن المطار؟",
          ru: "Как далеко находится Palm Jumeirah от аэропорта?",
          zh: "棕榈岛距离机场有多远?",
          fr: "À quelle distance se trouve Palm Jumeirah de l'aéroport ?",
          de: "Wie weit ist Palm Jumeirah vom Flughafen entfernt?",
        },
        answer: {
          en: "Around 35 minutes to DXB depending on traffic, and longer to DWC.",
          ar: "حوالي 35 دقيقة إلى مطار دبي الدولي (DXB) حسب حركة المرور، وأطول إلى مطار آل مكتوم الدولي (DWC).",
          ru: "Около 35 минут до DXB в зависимости от трафика, и дольше до DWC.",
          zh: "视路况而定,前往DXB机场约需35分钟,前往DWC机场则需更长时间。",
          fr: "Environ 35 minutes jusqu'à DXB selon la circulation, et plus longtemps jusqu'à DWC.",
          de: "Je nach Verkehr etwa 35 Minuten bis zum DXB, und länger bis zum DWC.",
        },
      },
      {
        question: {
          en: "Do you serve Atlantis and the Palm resorts?",
          ar: "هل تخدمون أتلانتس ومنتجعات النخلة؟",
          ru: "Обслуживаете ли вы Atlantis и курорты Пальмы?",
          zh: "是否为亚特兰蒂斯酒店及棕榈岛各度假村提供服务?",
          fr: "Desservez-vous Atlantis et les resorts de la Palm ?",
          de: "Bedienen Sie Atlantis und die Resorts der Palm?",
        },
        answer: {
          en: "Yes, we cover all major hotels and resorts on Palm Jumeirah.",
          ar: "نعم، نغطي جميع الفنادق والمنتجعات الرئيسية في نخلة جميرا.",
          ru: "Да, мы обслуживаем все крупные отели и курорты на Palm Jumeirah.",
          zh: "是的,我们覆盖棕榈岛所有主要酒店与度假村。",
          fr: "Oui, nous couvrons tous les grands hôtels et resorts de Palm Jumeirah.",
          de: "Ja, wir decken alle wichtigen Hotels und Resorts auf Palm Jumeirah ab.",
        },
      },
      {
        question: {
          en: "Can I book a chauffeur for a beach club or resort dinner on the Palm?",
          ar: "هل يمكنني حجز سائق لنادٍ شاطئي أو عشاء منتجع في النخلة؟",
          ru: "Можно ли заказать шофёра для пляжного клуба или ужина на курорте Пальмы?",
          zh: "可以预订司机陪同前往棕榈岛的海滩俱乐部或度假村晚餐吗?",
          fr: "Puis-je réserver un chauffeur pour un club de plage ou un dîner en resort sur la Palm ?",
          de: "Kann ich einen Chauffeur für einen Beach Club oder ein Resort-Dinner auf der Palm buchen?",
        },
        answer: {
          en: "Yes, hourly hire is popular here — the car waits at the resort and is ready whenever you finish dinner or a beach club day.",
          ar: "نعم، الاستئجار بالساعة شائع هنا — تنتظر السيارة عند المنتجع وتكون جاهزة عند انتهائك من العشاء أو يوم في النادي الشاطئي.",
          ru: "Да, почасовая аренда здесь очень популярна — машина ждёт у курорта и готова, как только вы закончите ужин или день в пляжном клубе.",
          zh: "可以,按小时包车服务在此十分受欢迎——车辆会在度假村等候,待您结束晚餐或海滩俱乐部行程后随时可用。",
          fr: "Oui, la location à l'heure est populaire ici — la voiture attend au resort et est prête dès que vous terminez le dîner ou une journée au club de plage.",
          de: "Ja, die Stundenmiete ist hier beliebt — der Wagen wartet im Resort und steht bereit, sobald Ihr Abendessen oder Ihr Tag im Beach Club endet.",
        },
      },
      {
        question: {
          en: "Is it possible to combine a Palm dinner with a Marina visit in one booking?",
          ar: "هل يمكن الجمع بين عشاء في النخلة وزيارة المارينا في حجز واحد؟",
          ru: "Можно ли совместить ужин на Пальме с посещением марины в рамках одного бронирования?",
          zh: "能否在一次预订中结合棕榈岛晚餐与码头区行程?",
          fr: "Est-il possible de combiner un dîner sur la Palm avec une visite à la Marina en une seule réservation ?",
          de: "Ist es möglich, ein Abendessen auf der Palm mit einem Besuch der Marina in einer Buchung zu kombinieren?",
        },
        answer: {
          en: "Yes, an hourly booking easily covers a Palm resort dinner followed by a stop in Dubai Marina or JBR, both around 15 minutes away.",
          ar: "نعم، يغطي الحجز بالساعة بسهولة عشاء في منتجع النخلة يتبعه توقف في مرسى دبي أو جي بي آر، ويبعد كلاهما حوالي 15 دقيقة.",
          ru: "Да, почасовое бронирование легко покрывает ужин на курорте Пальмы с последующей остановкой в Dubai Marina или JBR — оба места примерно в 15 минутах езды.",
          zh: "可以,按小时预订可轻松涵盖棕榈岛度假村晚餐,随后前往车程约15分钟的迪拜码头或JBR。",
          fr: "Oui, une réservation à l'heure couvre facilement un dîner en resort sur la Palm suivi d'un arrêt à Dubai Marina ou à JBR, tous deux à environ 15 minutes.",
          de: "Ja, eine Stundenbuchung deckt problemlos ein Abendessen im Palm-Resort ab, gefolgt von einem Stopp in Dubai Marina oder JBR — beide etwa 15 Minuten entfernt.",
        },
      },
      {
        question: {
          en: "Do you provide transport for corporate events hosted at Palm resorts?",
          ar: "هل تقدمون النقل لفعاليات الشركات المقامة في منتجعات النخلة؟",
          ru: "Предоставляете ли вы транспорт для корпоративных мероприятий в курортах на Пальме?",
          zh: "是否为棕榈岛度假村举办的企业活动提供交通服务?",
          fr: "Assurez-vous le transport pour les événements d'entreprise organisés dans les resorts de la Palm ?",
          de: "Bieten Sie Transport für Firmenveranstaltungen in Palm-Resorts an?",
        },
        answer: {
          en: "Yes, we handle guest transport and executive transfers for corporate functions and conferences hosted at Palm Jumeirah resorts.",
          ar: "نعم، نتولى نقل الضيوف ونقل التنفيذيين لفعاليات الشركات والمؤتمرات المقامة في منتجعات نخلة جميرا.",
          ru: "Да, мы организуем трансфер гостей и руководителей для корпоративных мероприятий и конференций в курортах Palm Jumeirah.",
          zh: "是的,我们负责棕榈岛度假村举办的企业活动及会议的宾客交通与高管接送安排。",
          fr: "Oui, nous gérons le transport des invités et les transferts pour cadres lors d'événements d'entreprise et de conférences organisés dans les resorts de Palm Jumeirah.",
          de: "Ja, wir übernehmen den Gästetransport und Executive-Transfers für Firmenveranstaltungen und Konferenzen in den Resorts von Palm Jumeirah.",
        },
      },
      {
        question: {
          en: "How far ahead should we book a Palm Jumeirah wedding convoy?",
          ar: "قبل كم من الوقت يجب أن نحجز موكب زفاف في نخلة جميرا؟",
          ru: "За сколько времени нужно бронировать свадебный кортеж на Palm Jumeirah?",
          zh: "预订棕榈岛婚礼车队应提前多久?",
          fr: "Combien de temps à l'avance devons-nous réserver un convoi de mariage à Palm Jumeirah ?",
          de: "Wie weit im Voraus sollten wir einen Hochzeitskonvoi auf Palm Jumeirah buchen?",
        },
        answer: {
          en: "We recommend 2–3 weeks minimum, since wedding dates and popular vehicles like the Rolls-Royce Phantom are reserved well in advance.",
          ar: "نوصي بأسبوعين إلى ثلاثة أسابيع كحد أدنى، حيث يتم حجز تواريخ الزفاف والسيارات الشائعة مثل رولز رويس فانتوم مسبقًا بوقت كافٍ.",
          ru: "Мы рекомендуем минимум 2–3 недели, поскольку даты свадеб и популярные автомобили, такие как Rolls-Royce Phantom, бронируются заблаговременно.",
          zh: "建议至少提前2至3周预订,因为婚礼日期及劳斯莱斯幻影等热门车型通常提前很久就已被预订。",
          fr: "Nous recommandons un minimum de 2 à 3 semaines, car les dates de mariage et les véhicules prisés comme la Rolls-Royce Phantom sont réservés bien à l'avance.",
          de: "Wir empfehlen mindestens 2–3 Wochen im Voraus, da Hochzeitstermine und gefragte Fahrzeuge wie der Rolls-Royce Phantom frühzeitig reserviert werden.",
        },
      },
      {
        question: {
          en: "Can you provide a chauffeur for a day trip that includes both Palm resorts and the Marina?",
          ar: "هل يمكنكم توفير سائق ليوم يشمل زيارة منتجعات النخلة والمارينا معًا؟",
          ru: "Можете ли вы предоставить шофёра для поездки, включающей и курорты Пальмы, и марину?",
          zh: "能否安排司机陪同一天内同时游览棕榈岛度假村与码头区?",
          fr: "Pouvez-vous fournir un chauffeur pour une excursion incluant à la fois les resorts de la Palm et la Marina ?",
          de: "Können Sie einen Chauffeur für einen Tagesausflug bereitstellen, der sowohl Palm-Resorts als auch die Marina umfasst?",
        },
        answer: {
          en: "Yes, an hourly or full-day booking can easily combine a Palm resort visit with time in Dubai Marina, both a short drive apart.",
          ar: "نعم، يمكن للحجز بالساعة أو ليوم كامل الجمع بسهولة بين زيارة منتجع في النخلة ووقت في مرسى دبي، حيث تفصل بينهما مسافة قيادة قصيرة.",
          ru: "Да, почасовое или полнодневное бронирование легко сочетает посещение курорта на Пальме со временем в Dubai Marina — их разделяет короткая поездка.",
          zh: "可以,按小时或全天预订均可轻松结合棕榈岛度假村行程与迪拜码头时光,两地车程较短。",
          fr: "Oui, une réservation à l'heure ou pour la journée peut facilement combiner une visite dans un resort de la Palm avec du temps à Dubai Marina, les deux étant à peu de distance.",
          de: "Ja, eine Stunden- oder Ganztagesbuchung lässt sich problemlos mit einem Besuch im Palm-Resort und Zeit in Dubai Marina kombinieren — beide liegen nur eine kurze Fahrt voneinander entfernt.",
        },
      },
    ],
    landmarks: ["Atlantis The Palm", "Palm West Beach", "The Pointe", "Nakheel Mall", "Palm Jumeirah Boardwalk", "Club Vista Mare"],
  },
  {
    slug: "downtown-dubai",
    name: "Downtown Dubai",
    tags: {
      en: ["Burj Khalifa", "Dubai Mall", "Executive Travel"],
      ar: ["برج خليفة", "دبي مول", "تنقل تنفيذي"],
      ru: ["Бурдж-Халифа", "Dubai Mall", "Деловые поездки"],
      zh: ["哈利法塔", "迪拜购物中心", "高管出行"],
      fr: ["Burj Khalifa", "Dubai Mall", "Voyages d'affaires"],
      de: ["Burj Khalifa", "Dubai Mall", "Geschäftsreisen"],
    },
    image: {
      src: "/images/locations/downtown-dubai.webp",
      alt: {
        en: "Aerial night view of Burj Khalifa, The Address Downtown, and Dubai Fountain",
        ar: "منظر جوي ليلي لبرج خليفة وفندق The Address Downtown ونافورة دبي",
        ru: "Ночной вид с воздуха на Бурдж-Халифа, The Address Downtown и Dubai Fountain",
        zh: "哈利法塔、The Address Downtown酒店及迪拜喷泉夜景航拍",
        fr: "Vue aérienne nocturne du Burj Khalifa, de The Address Downtown et de la Dubai Fountain",
        de: "Nächtliche Luftaufnahme von Burj Khalifa, The Address Downtown und dem Dubai Fountain",
      },
    },
    heroDesktopImage: {
      src: "/images/locations/downtown-dubai-hero-desktop.webp",
      alt: {
        en: "Panoramic night skyline of Downtown Dubai with the Burj Khalifa illuminated above the waterfront",
        ar: "أفق ليلي بانورامي لوسط مدينة دبي مع برج خليفة مضاءً فوق الواجهة المائية",
        ru: "Панорамный ночной горизонт Downtown Dubai с освещённой Бурдж-Халифа над набережной",
        zh: "迪拜市中心全景夜空,哈利法塔在水岸上空熠熠生辉",
        fr: "Skyline panoramique nocturne de Downtown Dubai avec le Burj Khalifa illuminé au-dessus du front de mer",
        de: "Nächtliches Panorama der Skyline von Downtown Dubai mit dem beleuchteten Burj Khalifa über der Uferpromenade",
      },
    },
    tagline: {
      en: "The city's front door",
      ar: "بوابة المدينة الرئيسية",
      ru: "Парадный вход города",
      zh: "城市的门户中心",
      fr: "La porte d'entrée de la ville",
      de: "Die Eingangstür der Stadt",
    },
    heroSubtitle: {
      en: "Chauffeur service around Burj Khalifa, Dubai Mall, and Downtown's hotels and residences.",
      ar: "خدمة سائق خاص حول برج خليفة ودبي مول وفنادق ومساكن وسط المدينة.",
      ru: "Шофёрский сервис у Бурдж-Халифа, Dubai Mall и отелей и резиденций Downtown.",
      zh: "为哈利法塔、迪拜购物中心及市中心各大酒店与住宅提供专属司机服务。",
      fr: "Service de chauffeur autour du Burj Khalifa, du Dubai Mall et des hôtels et résidences de Downtown.",
      de: "Chauffeurservice rund um Burj Khalifa, Dubai Mall sowie die Hotels und Residenzen von Downtown.",
    },
    shortDescription: {
      en: "Chauffeur transport across Downtown Dubai, coordinated with hotel and venue pickup points.",
      ar: "نقل بسائق خاص في جميع أنحاء وسط مدينة دبي، منسق مع نقاط الاستقبال في الفنادق والأماكن.",
      ru: "Шофёрский трансфер по Downtown Dubai, согласованный с точками посадки у отелей и площадок.",
      zh: "覆盖迪拜市中心的专属司机接送服务,与各酒店及场所的接客点紧密协调。",
      fr: "Transport avec chauffeur dans tout Downtown Dubai, coordonné avec les points de prise en charge des hôtels et lieux.",
      de: "Chauffeurtransport in ganz Downtown Dubai, abgestimmt auf die Abholpunkte von Hotels und Veranstaltungsorten.",
    },
    longDescription: {
      en: [
        "Downtown Dubai packs the Burj Khalifa, Dubai Mall, and a dense cluster of five-star hotels within a few minutes of each other — along with valet-only tower access and heavy Dubai Fountain event traffic. Apex chauffeurs know the entry points and current fountain-show schedule, so a pickup here doesn't cost you fifteen minutes before the car even moves.",
        "Airport transfers are among the fastest in the city, typically around 20 minutes to DXB, with the same flight tracking and departure buffer as every Apex booking. Downtown's proximity to DIFC makes it a hub for executive travel — teams moving between DIFC meetings and Downtown hotels rely on chauffeurs who know both districts' access and parking.",
        "Leisure here centers on the area's own landmarks: dinner overlooking the Burj Khalifa, an evening at Dubai Opera, or a Dubai Mall shopping trip — all well suited to hourly hire. Business Bay is 10 minutes away, and Dubai Marina or Palm Jumeirah are 25–30 minutes out. Fleet choice spans S-Class and 7 Series sedans to Range Rover and Rolls-Royce for the area's more photogenic evenings.",
      ],
      ar: [
        "يجمع وسط مدينة دبي برج خليفة ودبي مول ومجموعة كثيفة من الفنادق الخمس نجوم على بعد دقائق من بعضها البعض — إلى جانب وصول الأبراج المخصص لخدمة صف السيارات فقط وحركة مرور كثيفة بسبب فعاليات نافورة دبي. يعرف سائقو Apex نقاط الدخول وجدول عروض النافورة الحالي، بحيث لا يكلفك الاستقبال هنا خمس عشرة دقيقة قبل أن تتحرك السيارة أصلاً.",
        "تُعد رحلات المطار من بين الأسرع في المدينة، وتستغرق عادةً حوالي 20 دقيقة إلى مطار دبي الدولي (DXB)، مع نفس تتبع الرحلة الجوية وهامش المغادرة الزمني المعتمد في كل حجز مع Apex. يجعل قرب وسط المدينة من مركز دبي المالي العالمي المنطقة مركزًا للتنقل التنفيذي — تعتمد الفرق المتنقلة بين اجتماعات مركز دبي المالي وفنادق وسط المدينة على سائقين يعرفون طرق الوصول ومواقف السيارات في كلا الحيين.",
        "يتمحور الجانب الترفيهي هنا حول معالم المنطقة نفسها: عشاء بإطلالة على برج خليفة، أو أمسية في دار أوبرا دبي، أو رحلة تسوق في دبي مول — وكلها تناسب الاستئجار بالساعة. يبعد الخليج التجاري 10 دقائق، بينما تبعد مرسى دبي أو نخلة جميرا من 25 إلى 30 دقيقة. يمتد اختيار الأسطول من سيارات إس-كلاس وسيريز 7 إلى رينج روفر ورولز رويس لأمسيات المنطقة الأكثر تصويرًا.",
      ],
      ru: [
        "В Downtown Dubai в нескольких минутах друг от друга сосредоточены Бурдж-Халифа, Dubai Mall и плотный кластер пятизвёздочных отелей — наряду с доступом к башням только через валет-паркинг и плотным трафиком во время шоу Dubai Fountain. Шофёры Apex знают точки входа и текущее расписание фонтанного шоу, поэтому посадка здесь не отнимает у вас пятнадцать минут ещё до того, как машина тронется.",
        "Трансферы в аэропорт — одни из самых быстрых в городе, обычно около 20 минут до DXB, с тем же отслеживанием рейса и запасом времени на вылет, что и в любом бронировании Apex. Близость Downtown к DIFC делает его центром деловых поездок — команды, перемещающиеся между встречами в DIFC и отелями Downtown, полагаются на шофёров, знающих подъезды и парковки обоих районов.",
        "Развлекательная составляющая здесь сосредоточена вокруг местных достопримечательностей: ужин с видом на Бурдж-Халифа, вечер в Dubai Opera или шопинг-поездка в Dubai Mall — всё это отлично подходит для почасовой аренды. Business Bay находится в 10 минутах, а Dubai Marina или Palm Jumeirah — в 25–30 минутах. Выбор автопарка — от седанов S-Class и 7 Series до Range Rover и Rolls-Royce для самых фотогеничных вечеров района.",
      ],
      zh: [
        "迪拜市中心将哈利法塔、迪拜购物中心及密集的五星级酒店群汇聚于几分钟车程之内——同时也伴随着仅限代客泊车的高楼出入方式,以及迪拜喷泉活动带来的繁忙交通。Apex司机熟悉各入口及当前喷泉表演时间表,确保您在此接客时,不会在车辆启动前就先耗费十五分钟。",
        "机场接送是全市最快捷的路线之一,通常前往DXB机场仅需约20分钟,并享有与Apex其他预订相同的航班追踪与出发缓冲时间。市中心毗邻迪拜国际金融中心,使其成为高管出行的枢纽——往返于DIFC会议与市中心酒店之间的团队,依赖熟悉两大片区通行与停车方式的司机。",
        "此处的休闲活动围绕当地地标展开:俯瞰哈利法塔的晚餐、迪拜歌剧院的夜晚,或迪拜购物中心的购物之旅——均非常适合按小时包车。商业湾车程10分钟,迪拜码头或棕榈岛车程约25至30分钟。车型选择涵盖S级与7系轿车,乃至揽胜与劳斯莱斯,尽显该区域更具画面感的夜晚。",
      ],
      fr: [
        "Downtown Dubai regroupe le Burj Khalifa, le Dubai Mall et une concentration dense d'hôtels cinq étoiles à quelques minutes les uns des autres — avec un accès aux tours réservé au voiturier et une circulation dense lors des événements de la Dubai Fountain. Les chauffeurs Apex connaissent les points d'accès et l'horaire actuel du spectacle des fontaines, afin qu'une prise en charge ici ne vous coûte pas quinze minutes avant même que la voiture ne démarre.",
        "Les transferts aéroport comptent parmi les plus rapides de la ville, environ 20 minutes jusqu'à DXB, avec le même suivi de vol et la même marge de départ que pour toute réservation Apex. La proximité de Downtown avec le DIFC en fait un pôle de voyages d'affaires — les équipes se déplaçant entre réunions au DIFC et hôtels de Downtown comptent sur des chauffeurs connaissant l'accès et le stationnement des deux quartiers.",
        "Les loisirs ici se concentrent sur les monuments du quartier lui-même : un dîner avec vue sur le Burj Khalifa, une soirée au Dubai Opera, ou une séance de shopping au Dubai Mall — tout cela se prête bien à la location à l'heure. Business Bay est à 10 minutes, et Dubai Marina ou Palm Jumeirah à 25-30 minutes. Le choix de flotte va des berlines Classe S et Série 7 à la Range Rover et à la Rolls-Royce pour les soirées les plus photogéniques du quartier.",
      ],
      de: [
        "Downtown Dubai vereint Burj Khalifa, Dubai Mall und eine dichte Ansammlung von Fünf-Sterne-Hotels innerhalb weniger Minuten Entfernung voneinander — zusammen mit reinem Voiturier-Zugang zu den Türmen und starkem Verkehr durch Dubai-Fountain-Events. Apex-Chauffeure kennen die Zufahrtspunkte und den aktuellen Zeitplan der Fontänenshow, sodass eine Abholung hier nicht schon fünfzehn Minuten kostet, bevor sich der Wagen überhaupt bewegt.",
        "Flughafentransfers gehören zu den schnellsten der Stadt, in der Regel etwa 20 Minuten bis zum DXB, mit derselben Flugverfolgung und demselben Abflugpuffer wie bei jeder Apex-Buchung. Die Nähe von Downtown zum DIFC macht die Gegend zu einem Zentrum für Geschäftsreisen — Teams, die zwischen DIFC-Terminen und Downtown-Hotels pendeln, verlassen sich auf Chauffeure, die Zufahrt und Parken in beiden Vierteln kennen.",
        "Freizeitaktivitäten hier drehen sich um die eigenen Wahrzeichen der Gegend: ein Abendessen mit Blick auf den Burj Khalifa, ein Abend in der Dubai Opera oder ein Einkaufsbummel durch die Dubai Mall — alles bestens geeignet für die Stundenmiete. Business Bay ist 10 Minuten entfernt, Dubai Marina oder Palm Jumeirah 25–30 Minuten. Die Fahrzeugauswahl reicht von S-Klasse- und 7er-Limousinen bis zu Range Rover und Rolls-Royce für die fotogensten Abende der Gegend.",
      ],
    },
    isAirport: false,
    popularRoutes: [
      {
        from: "Downtown Dubai",
        to: "Dubai International Airport (DXB)",
        duration: { en: "~20 min", ar: "~20 دقيقة", ru: "~20 мин", zh: "~20分钟", fr: "~20 min", de: "~20 Min." },
      },
      {
        from: "Downtown Dubai",
        to: "Business Bay",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
      {
        from: "Downtown Dubai",
        to: "Dubai Marina",
        duration: { en: "~25 min", ar: "~25 دقيقة", ru: "~25 мин", zh: "~25分钟", fr: "~25 min", de: "~25 Min." },
      },
      {
        from: "Downtown Dubai",
        to: "Palm Jumeirah",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
      {
        from: "Downtown Dubai",
        to: "DIFC",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
    ],
    whyChoose: {
      en: [
        "Coordinated pickup points arranged directly with major hotel concierge teams",
        "One of the fastest routings to DXB from anywhere in central Dubai",
        "Real experience navigating Downtown's event, fountain-show, and plaza traffic",
        "A popular choice for DIFC and Dubai Mall business meetings alike",
        "Chauffeurs track the current fountain-show schedule to avoid avoidable delays",
        "Central location makes combining Downtown with several other areas straightforward",
      ],
      ar: [
        "نقاط استقبال منسقة تُرتب مباشرة مع فرق الكونسيرج في الفنادق الكبرى",
        "أحد أسرع الطرق إلى مطار دبي الدولي (DXB) من أي مكان في وسط دبي",
        "خبرة حقيقية في التعامل مع حركة مرور الفعاليات وعروض النافورة والساحات في وسط المدينة",
        "خيار شائع لاجتماعات الأعمال في مركز دبي المالي العالمي ودبي مول على حد سواء",
        "يتابع السائقون جدول عروض النافورة الحالي لتجنب أي تأخير يمكن تفاديه",
        "يجعل الموقع المركزي الجمع بين وسط المدينة وعدة مناطق أخرى أمرًا سهلاً",
      ],
      ru: [
        "Согласованные точки посадки, организованные напрямую с консьерж-службами крупных отелей",
        "Один из самых быстрых маршрутов до DXB из любой точки центрального Дубая",
        "Реальный опыт навигации в условиях трафика от мероприятий, фонтанного шоу и площадей Downtown",
        "Популярный выбор как для деловых встреч в DIFC, так и в Dubai Mall",
        "Шофёры отслеживают текущее расписание фонтанного шоу, чтобы избежать ненужных задержек",
        "Центральное расположение упрощает сочетание Downtown с несколькими другими районами",
      ],
      zh: [
        "与各大酒店礼宾团队直接协调的接客点安排",
        "从迪拜中心任何位置前往DXB机场最快捷的路线之一",
        "在应对市中心活动、喷泉表演及广场交通方面拥有真正的实战经验",
        "同样是DIFC与迪拜购物中心商务会议的热门之选",
        "司机实时掌握喷泉表演时间表,避免不必要的延误",
        "得益于中心位置,轻松将市中心与其他多个区域行程结合安排",
      ],
      fr: [
        "Points de prise en charge coordonnés directement avec les équipes de conciergerie des grands hôtels",
        "L'un des itinéraires les plus rapides vers DXB depuis n'importe où dans le centre de Dubaï",
        "Une véritable expérience de navigation dans la circulation liée aux événements, au spectacle des fontaines et aux places de Downtown",
        "Un choix apprécié aussi bien pour les réunions d'affaires au DIFC qu'au Dubai Mall",
        "Les chauffeurs suivent l'horaire actuel du spectacle des fontaines pour éviter les retards évitables",
        "L'emplacement central facilite la combinaison de Downtown avec plusieurs autres quartiers",
      ],
      de: [
        "Koordinierte Abholpunkte, direkt mit den Concierge-Teams großer Hotels abgestimmt",
        "Eine der schnellsten Routen zum DXB von überall im Zentrum Dubais",
        "Echte Erfahrung im Umgang mit Event-, Fontänenshow- und Platzverkehr in Downtown",
        "Eine beliebte Wahl sowohl für Geschäftstermine im DIFC als auch in der Dubai Mall",
        "Chauffeure verfolgen den aktuellen Zeitplan der Fontänenshow, um vermeidbare Verzögerungen zu umgehen",
        "Die zentrale Lage macht die Kombination von Downtown mit mehreren anderen Gegenden unkompliziert",
      ],
    },
    faqs: [
      {
        question: {
          en: "Do you serve Downtown Dubai hotels and DIFC?",
          ar: "هل تخدمون فنادق وسط مدينة دبي ومركز دبي المالي العالمي؟",
          ru: "Обслуживаете ли вы отели Downtown Dubai и DIFC?",
          zh: "是否为迪拜市中心酒店及DIFC提供服务?",
          fr: "Desservez-vous les hôtels de Downtown Dubai et le DIFC ?",
          de: "Bedienen Sie Hotels in Downtown Dubai und das DIFC?",
        },
        answer: {
          en: "Yes, we cover Downtown hotels, DIFC offices, and the Dubai Mall area with coordinated pickup points.",
          ar: "نعم، نغطي فنادق وسط المدينة ومكاتب مركز دبي المالي العالمي ومنطقة دبي مول بنقاط استقبال منسقة.",
          ru: "Да, мы обслуживаем отели Downtown, офисы DIFC и район Dubai Mall с согласованными точками посадки.",
          zh: "是的,我们通过统一协调的接客点覆盖市中心酒店、DIFC办公区及迪拜购物中心区域。",
          fr: "Oui, nous couvrons les hôtels de Downtown, les bureaux du DIFC et la zone du Dubai Mall avec des points de prise en charge coordonnés.",
          de: "Ja, wir decken Downtown-Hotels, DIFC-Büros und die Dubai-Mall-Gegend mit koordinierten Abholpunkten ab.",
        },
      },
      {
        question: {
          en: "How far is Downtown Dubai from DXB?",
          ar: "كم تبعد وسط مدينة دبي عن مطار دبي الدولي؟",
          ru: "Как далеко находится Downtown Dubai от DXB?",
          zh: "迪拜市中心距离DXB机场有多远?",
          fr: "À quelle distance se trouve Downtown Dubai de DXB ?",
          de: "Wie weit ist Downtown Dubai vom DXB entfernt?",
        },
        answer: {
          en: "Approximately 20 minutes under normal traffic — one of the shortest airport routes in the city.",
          ar: "حوالي 20 دقيقة في ظل حركة مرور عادية — أحد أقصر طرق المطار في المدينة.",
          ru: "Примерно 20 минут при обычном трафике — один из самых коротких маршрутов до аэропорта в городе.",
          zh: "正常路况下约需20分钟——是全市前往机场最短的路线之一。",
          fr: "Environ 20 minutes en circulation normale — l'un des trajets aéroport les plus courts de la ville.",
          de: "Bei normalem Verkehr etwa 20 Minuten — eine der kürzesten Flughafenrouten der Stadt.",
        },
      },
      {
        question: {
          en: "Can you handle pickups during Dubai Fountain shows or events?",
          ar: "هل يمكنكم التعامل مع الاستقبال أثناء عروض نافورة دبي أو الفعاليات؟",
          ru: "Можете ли вы организовать посадку во время шоу Dubai Fountain или мероприятий?",
          zh: "在迪拜喷泉表演或活动期间能否安排接送?",
          fr: "Pouvez-vous gérer les prises en charge pendant les spectacles de la Dubai Fountain ou les événements ?",
          de: "Können Sie Abholungen während der Dubai-Fountain-Shows oder Veranstaltungen durchführen?",
        },
        answer: {
          en: "Yes, our chauffeurs plan around Downtown's event traffic and fountain-show closures.",
          ar: "نعم، يخطط سائقونا مسبقًا للتعامل مع حركة مرور الفعاليات وإغلاقات عروض النافورة في وسط المدينة.",
          ru: "Да, наши шофёры планируют маршрут с учётом трафика от мероприятий и перекрытий во время фонтанного шоу в Downtown.",
          zh: "可以,我们的司机会提前规划,以应对市中心活动交通及喷泉表演期间的封路情况。",
          fr: "Oui, nos chauffeurs anticipent la circulation liée aux événements et les fermetures pendant le spectacle des fontaines à Downtown.",
          de: "Ja, unsere Chauffeure planen den Event-Verkehr und die Sperrungen während der Fontänenshow in Downtown mit ein.",
        },
      },
      {
        question: {
          en: "Do you offer hourly hire for Downtown business meetings?",
          ar: "هل تقدمون الاستئجار بالساعة لاجتماعات الأعمال في وسط المدينة؟",
          ru: "Предлагаете ли вы почасовую аренду для деловых встреч в Downtown?",
          zh: "是否为市中心商务会议提供按小时包车服务?",
          fr: "Proposez-vous la location à l'heure pour les réunions d'affaires à Downtown ?",
          de: "Bieten Sie eine Stundenmiete für Geschäftstermine in Downtown an?",
        },
        answer: {
          en: "Yes, hourly and half-day hire are available for moving between DIFC and Downtown meetings.",
          ar: "نعم، الاستئجار بالساعة ونصف اليوم متاحان للتنقل بين اجتماعات مركز دبي المالي العالمي ووسط المدينة.",
          ru: "Да, доступна почасовая аренда и аренда на полдня для перемещения между встречами в DIFC и Downtown.",
          zh: "可以,按小时或半天包车均可用于往返DIFC与市中心的各项会议。",
          fr: "Oui, la location à l'heure et à la demi-journée est disponible pour se déplacer entre les réunions au DIFC et à Downtown.",
          de: "Ja, Stunden- und Halbtagsmiete stehen für das Pendeln zwischen Terminen im DIFC und in Downtown zur Verfügung.",
        },
      },
      {
        question: {
          en: "Can you combine a Downtown dinner booking with a trip to Business Bay?",
          ar: "هل يمكن الجمع بين حجز عشاء في وسط المدينة ورحلة إلى الخليج التجاري؟",
          ru: "Можно ли совместить бронирование ужина в Downtown с поездкой в Business Bay?",
          zh: "能否将市中心晚餐预订与商业湾行程结合安排?",
          fr: "Pouvez-vous combiner une réservation pour un dîner à Downtown avec un trajet vers Business Bay ?",
          de: "Können Sie eine Dinner-Buchung in Downtown mit einer Fahrt nach Business Bay kombinieren?",
        },
        answer: {
          en: "Yes, Business Bay is around 10 minutes away, so combining a Downtown evening with a Business Bay stop works well within one hourly booking.",
          ar: "نعم، يبعد الخليج التجاري حوالي 10 دقائق، لذا فإن الجمع بين أمسية في وسط المدينة وتوقف في الخليج التجاري يعمل بشكل جيد ضمن حجز واحد بالساعة.",
          ru: "Да, Business Bay находится примерно в 10 минутах, поэтому сочетание вечера в Downtown с остановкой в Business Bay отлично работает в рамках одного почасового бронирования.",
          zh: "可以,商业湾车程约10分钟,因此在一次按小时预订中将市中心夜晚行程与商业湾行程结合安排十分方便。",
          fr: "Oui, Business Bay est à environ 10 minutes, donc combiner une soirée à Downtown avec un arrêt à Business Bay fonctionne bien dans une seule réservation à l'heure.",
          de: "Ja, Business Bay ist etwa 10 Minuten entfernt, sodass sich ein Downtown-Abend mit einem Stopp in Business Bay gut in einer Stundenbuchung kombinieren lässt.",
        },
      },
      {
        question: {
          en: "Do valet-only towers in Downtown cause pickup delays?",
          ar: "هل تسبب الأبراج المخصصة لخدمة صف السيارات فقط في وسط المدينة تأخيرًا في الاستقبال؟",
          ru: "Вызывают ли задержки посадки башни Downtown, где доступен только валет-паркинг?",
          zh: "市中心仅限代客泊车的大楼是否会造成接客延误?",
          fr: "Les tours réservées au voiturier à Downtown causent-elles des retards de prise en charge ?",
          de: "Verursachen reine Voiturier-Türme in Downtown Verzögerungen bei der Abholung?",
        },
        answer: {
          en: "Not usually — our chauffeurs already know the valet arrangements and access points for Downtown's major towers and hotels.",
          ar: "ليس عادةً — يعرف سائقونا بالفعل ترتيبات خدمة صف السيارات ونقاط الدخول للأبراج والفنادق الرئيسية في وسط المدينة.",
          ru: "Обычно нет — наши шофёры уже знают порядок работы валет-паркинга и точки доступа к основным башням и отелям Downtown.",
          zh: "通常不会——我们的司机已熟悉市中心主要大楼与酒店的代客泊车安排及出入口。",
          fr: "En général non — nos chauffeurs connaissent déjà les dispositifs de voiturier et les points d'accès des grandes tours et hôtels de Downtown.",
          de: "In der Regel nicht — unsere Chauffeure kennen bereits die Voiturier-Abläufe und Zugangspunkte der wichtigsten Türme und Hotels in Downtown.",
        },
      },
      {
        question: {
          en: "Can you arrange a chauffeur for a Dubai Opera performance or Souk Al Bahar dinner?",
          ar: "هل يمكنكم ترتيب سائق لعرض في دار أوبرا دبي أو عشاء في سوق البحار؟",
          ru: "Можете ли вы организовать шофёра для представления в Dubai Opera или ужина в Souk Al Bahar?",
          zh: "能否为迪拜歌剧院演出或苏克阿尔巴哈晚餐安排司机?",
          fr: "Pouvez-vous organiser un chauffeur pour un spectacle au Dubai Opera ou un dîner à Souk Al Bahar ?",
          de: "Können Sie einen Chauffeur für eine Vorstellung in der Dubai Opera oder ein Dinner im Souk Al Bahar organisieren?",
        },
        answer: {
          en: "Yes, we regularly handle evening bookings around Dubai Opera and Souk Al Bahar, timed to fit performance schedules and dinner reservations.",
          ar: "نعم، نتعامل بانتظام مع حجوزات مسائية حول دار أوبرا دبي وسوق البحار، بتوقيت يتناسب مع جداول العروض وحجوزات العشاء.",
          ru: "Да, мы регулярно организуем вечерние поездки к Dubai Opera и Souk Al Bahar, согласовывая время с расписанием представлений и бронированием ужина.",
          zh: "可以,我们经常处理围绕迪拜歌剧院及苏克阿尔巴哈的夜间预订,并根据演出时间表及晚餐预约合理安排接送时间。",
          fr: "Oui, nous gérons régulièrement des réservations en soirée autour du Dubai Opera et de Souk Al Bahar, calées sur les horaires de spectacle et les réservations de dîner.",
          de: "Ja, wir übernehmen regelmäßig Abendbuchungen rund um die Dubai Opera und den Souk Al Bahar, abgestimmt auf Vorstellungszeiten und Dinner-Reservierungen.",
        },
      },
      {
        question: {
          en: "Do you offer a full-day booking covering both Downtown and DIFC meetings?",
          ar: "هل تقدمون حجزًا ليوم كامل يغطي اجتماعات في وسط المدينة ومركز دبي المالي العالمي معًا؟",
          ru: "Предлагаете ли вы бронирование на полный день, охватывающее встречи и в Downtown, и в DIFC?",
          zh: "是否提供涵盖市中心与DIFC会议的全天预订服务?",
          fr: "Proposez-vous une réservation à la journée couvrant à la fois les réunions à Downtown et au DIFC ?",
          de: "Bieten Sie eine Ganztagesbuchung an, die sowohl Termine in Downtown als auch im DIFC abdeckt?",
        },
        answer: {
          en: "Yes, a full-day booking comfortably covers both, given the short 10-minute distance between Downtown and DIFC.",
          ar: "نعم، يغطي الحجز ليوم كامل كليهما بسهولة، نظرًا للمسافة القصيرة التي تبلغ 10 دقائق بين وسط المدينة ومركز دبي المالي العالمي.",
          ru: "Да, полнодневное бронирование удобно охватывает оба места, учитывая короткое расстояние в 10 минут между Downtown и DIFC.",
          zh: "可以,鉴于市中心与DIFC之间车程仅10分钟,全天预订可轻松兼顾两地行程。",
          fr: "Oui, une réservation à la journée couvre confortablement les deux, étant donné la courte distance de 10 minutes entre Downtown et le DIFC.",
          de: "Ja, eine Ganztagesbuchung deckt beides bequem ab, da Downtown und DIFC nur 10 Minuten voneinander entfernt liegen.",
        },
      },
      {
        question: {
          en: "Can you arrange a chauffeur for a Burj Khalifa observation deck visit?",
          ar: "هل يمكنكم ترتيب سائق لزيارة منصة المشاهدة في برج خليفة؟",
          ru: "Можете ли вы организовать шофёра для посещения смотровой площадки Бурдж-Халифа?",
          zh: "能否为哈利法塔观景台参观安排司机?",
          fr: "Pouvez-vous organiser un chauffeur pour une visite de l'observatoire du Burj Khalifa ?",
          de: "Können Sie einen Chauffeur für einen Besuch der Aussichtsplattform des Burj Khalifa organisieren?",
        },
        answer: {
          en: "Yes, we regularly time pickups and drop-offs around Burj Khalifa observation deck bookings, coordinating with entry time slots on request.",
          ar: "نعم، ننسق بانتظام مواعيد الاستقبال والتوصيل حول حجوزات منصة مشاهدة برج خليفة، بالتنسيق مع فترات الدخول الزمنية عند الطلب.",
          ru: "Да, мы регулярно согласовываем время подачи и высадки с бронированием смотровой площадки Бурдж-Халифа, координируя со временными слотами входа по запросу.",
          zh: "可以,我们经常根据哈利法塔观景台预订时间协调接送安排,并可根据要求配合入场时段。",
          fr: "Oui, nous calons régulièrement les prises en charge et déposes autour des réservations de l'observatoire du Burj Khalifa, en coordination avec les créneaux d'entrée sur demande.",
          de: "Ja, wir stimmen Abholungen und Ablieferungen regelmäßig auf Buchungen der Burj-Khalifa-Aussichtsplattform ab und koordinieren auf Anfrage mit den Eintrittszeitfenstern.",
        },
      },
      {
        question: {
          en: "Do you serve visitors staying at Downtown hotels for a multi-day trip?",
          ar: "هل تخدمون الزوار المقيمين في فنادق وسط المدينة لرحلة متعددة الأيام؟",
          ru: "Обслуживаете ли вы гостей, проживающих в отелях Downtown, во время многодневной поездки?",
          zh: "是否为入住市中心酒店、进行多日行程的访客提供服务?",
          fr: "Desservez-vous les visiteurs séjournant dans les hôtels de Downtown pour un voyage de plusieurs jours ?",
          de: "Betreuen Sie Besucher, die für eine mehrtägige Reise in Downtown-Hotels wohnen?",
        },
        answer: {
          en: "Yes, Downtown hotel guests frequently use Apex for the full length of their stay — airport transfer, daily sightseeing, and departure, all on one account.",
          ar: "نعم، يستخدم نزلاء فنادق وسط المدينة خدمة Apex بشكل متكرر طوال فترة إقامتهم — النقل من المطار وجولات المشاهدة اليومية والمغادرة، كل ذلك ضمن حساب واحد.",
          ru: "Да, гости отелей Downtown часто пользуются Apex на протяжении всего пребывания — трансфер из аэропорта, ежедневные экскурсии и отъезд, всё в рамках одного счёта.",
          zh: "是的,市中心酒店住客经常在整个逗留期间使用Apex服务——机场接送、每日观光及送机,均可纳入同一账户统一安排。",
          fr: "Oui, les clients des hôtels de Downtown utilisent fréquemment Apex pendant toute la durée de leur séjour — transfert aéroport, visites quotidiennes et départ, le tout sur un seul compte.",
          de: "Ja, Gäste von Downtown-Hotels nutzen Apex häufig für die gesamte Dauer ihres Aufenthalts — Flughafentransfer, tägliche Besichtigungen und Abreise, alles über ein Konto.",
        },
      },
    ],
    landmarks: ["Burj Khalifa", "The Dubai Mall", "Dubai Opera", "DIFC", "Dubai Fountain", "Souk Al Bahar"],
  },
  {
    slug: "business-bay",
    name: "Business Bay",
    tags: {
      en: ["Corporate Travel", "Business Meetings", "Executive Chauffeurs"],
      ar: ["تنقل الشركات", "اجتماعات الأعمال", "سائقون تنفيذيون"],
      ru: ["Деловые поездки", "Бизнес-встречи", "Шофёры для руководителей"],
      zh: ["企业出行", "商务会议", "高管专属司机"],
      fr: ["Voyages d'entreprise", "Réunions d'affaires", "Chauffeurs exécutifs"],
      de: ["Firmenreisen", "Geschäftstermine", "Executive-Chauffeure"],
    },
    image: {
      src: "/images/locations/business-bay.webp",
      alt: {
        en: "Burj Khalifa and Business Bay skyline at dusk, viewed from the Dubai Water Canal bridge",
        ar: "برج خليفة وأفق الخليج التجاري عند الغسق، كما يُرى من جسر قناة دبي المائية",
        ru: "Бурдж-Халифа и горизонт Business Bay в сумерках, вид с моста Dubai Water Canal",
        zh: "黄昏时分从迪拜水运河大桥眺望哈利法塔与商业湾天际线",
        fr: "Burj Khalifa et skyline de Business Bay au crépuscule, vus depuis le pont du Dubai Water Canal",
        de: "Burj Khalifa und die Skyline von Business Bay in der Dämmerung, Blick von der Dubai-Water-Canal-Brücke",
      },
    },
    tagline: {
      en: "Built for the working day",
      ar: "مصمم ليوم العمل",
      ru: "Создан для рабочего дня",
      zh: "为高效工作日而生",
      fr: "Conçu pour la journée de travail",
      de: "Gemacht für den Arbeitstag",
    },
    heroSubtitle: {
      en: "Dependable chauffeur transport for Business Bay's offices, towers, and waterfront hotels.",
      ar: "نقل بسائق خاص موثوق لمكاتب وأبراج وفنادق الخليج التجاري الواقعة على الواجهة المائية.",
      ru: "Надёжный шофёрский трансфер для офисов, башен и прибрежных отелей Business Bay.",
      zh: "为商业湾各写字楼、大厦及水岸酒店提供可靠的专属司机接送服务。",
      fr: "Transport avec chauffeur fiable pour les bureaux, tours et hôtels en bord d'eau de Business Bay.",
      de: "Zuverlässiger Chauffeurtransport für die Büros, Türme und Wasserfront-Hotels von Business Bay.",
    },
    shortDescription: {
      en: "Corporate-focused chauffeur service across Business Bay's offices and waterfront hotels.",
      ar: "خدمة سائق خاص موجهة للشركات في جميع أنحاء مكاتب وفنادق الخليج التجاري الواقعة على الواجهة المائية.",
      ru: "Шофёрский сервис для бизнеса в офисах и прибрежных отелях Business Bay.",
      zh: "专为商业湾写字楼及水岸酒店打造的企业专属司机服务。",
      fr: "Service de chauffeur orienté entreprise dans les bureaux et hôtels en bord d'eau de Business Bay.",
      de: "Auf Unternehmen ausgerichteter Chauffeurservice für die Büros und Wasserfront-Hotels von Business Bay.",
    },
    longDescription: {
      en: [
        "Business Bay's dense grid of office towers sits beside Downtown Dubai, making it one of the city's busiest corporate pickup zones. Meeting schedules run tight and traffic on Al Abraj Street and Marasi Drive can be unpredictable, so every booking gets a realistic timing buffer rather than an optimistic estimate.",
        "Airport transfers run around 20 minutes to DXB via Sheikh Zayed Road. This is where most of our standing corporate accounts are based — daily executive commutes, roadshow logistics between towers, and airport transfers bookending international trips, frequently billed on monthly invoicing rather than per trip.",
        "Leisure bookings are smaller in volume but real — waterfront dinners along Bay Avenue and the Dubai Canal are popular with hotel guests. Business Bay sits minutes from Downtown and DIFC, ideal for full-day bookings spanning several districts. Fleet leans toward S-Class and 7 Series for daily commutes, with V-Class and Escalade for team roadshows and a Rolls-Royce available for VIP arrivals.",
      ],
      ar: [
        "تقع الشبكة الكثيفة من أبراج المكاتب في الخليج التجاري بجوار وسط مدينة دبي، ما يجعلها واحدة من أكثر مناطق استقبال الشركات ازدحامًا في المدينة. تسير جداول الاجتماعات بشكل مكثف، وقد تكون حركة المرور على شارع الأبراج وطريق مرسى غير متوقعة، لذا يحصل كل حجز على هامش زمني واقعي بدلاً من تقدير متفائل.",
        "تستغرق رحلات المطار حوالي 20 دقيقة إلى مطار دبي الدولي (DXB) عبر شارع الشيخ زايد. هنا يتمركز معظم حسابات شركاتنا الدائمة — التنقل التنفيذي اليومي، ولوجستيات الجولات الترويجية بين الأبراج، ورحلات المطار التي تؤطر الرحلات الدولية، وغالبًا ما تُفوتر شهريًا بدلاً من كل رحلة على حدة.",
        "الحجوزات الترفيهية أقل حجمًا لكنها حقيقية — عشاء على الواجهة المائية على طول باي أفينيو وقناة دبي شائع بين نزلاء الفنادق. يقع الخليج التجاري على بعد دقائق من وسط المدينة ومركز دبي المالي العالمي، وهو مثالي للحجوزات ليوم كامل تمتد عبر عدة أحياء. يميل الأسطول نحو إس-كلاس وسيريز 7 للتنقلات اليومية، مع V-كلاس وإسكاليد لجولات الفرق الترويجية، ورولز رويس متاحة لوصول كبار الشخصيات.",
      ],
      ru: [
        "Плотная сеть офисных башен Business Bay расположена рядом с Downtown Dubai, что делает район одной из самых оживлённых корпоративных зон посадки в городе. Расписание встреч плотное, а трафик на Al Abraj Street и Marasi Drive может быть непредсказуемым, поэтому каждое бронирование получает реалистичный временной запас, а не оптимистичную оценку.",
        "Трансфер в аэропорт занимает около 20 минут до DXB через Sheikh Zayed Road. Именно здесь базируется большинство наших постоянных корпоративных клиентов — ежедневные поездки руководителей, логистика роуд-шоу между башнями и трансферы в аэропорт для международных поездок, часто с ежемесячным выставлением счетов вместо оплаты за каждую поездку.",
        "Развлекательных заказов меньше, но они есть — ужины у воды вдоль Bay Avenue и Dubai Canal популярны среди гостей отелей. Business Bay находится в нескольких минутах от Downtown и DIFC — идеально для полнодневных бронирований, охватывающих несколько районов. Автопарк тяготеет к S-Class и 7 Series для ежедневных поездок, V-Class и Escalade для роуд-шоу команд, а Rolls-Royce доступен для VIP-прибытий.",
      ],
      zh: [
        "商业湾密集的写字楼群紧邻迪拜市中心,是全市最繁忙的企业接客区域之一。会议日程紧凑,Al Abraj街与Marasi Drive的交通状况可能难以预测,因此每次预订都会预留切实合理的缓冲时间,而非过于乐观的预估。",
        "经谢赫扎耶德路前往DXB机场的接送车程约20分钟。我们大多数长期企业客户均常驻于此——包括日常高管通勤、各大厦间路演物流,以及衔接国际出差的机场接送,通常按月开具发票,而非逐次计费。",
        "休闲预订数量较少但确实存在——沿Bay Avenue与迪拜运河的水岸晚餐深受酒店住客欢迎。商业湾距市中心及DIFC仅数分钟车程,非常适合横跨多个区域的全天预订。车队配置以S级与7系用于日常通勤为主,V级及凯雷德(Escalade)用于团队路演,并可提供劳斯莱斯用于贵宾接待。",
      ],
      fr: [
        "La grille dense de tours de bureaux de Business Bay se trouve à côté de Downtown Dubai, ce qui en fait l'une des zones de prise en charge d'entreprise les plus fréquentées de la ville. Les emplois du temps des réunions sont serrés et la circulation sur Al Abraj Street et Marasi Drive peut être imprévisible, c'est pourquoi chaque réservation bénéficie d'une marge de temps réaliste plutôt que d'une estimation optimiste.",
        "Les transferts aéroport durent environ 20 minutes jusqu'à DXB via Sheikh Zayed Road. C'est ici que sont basés la plupart de nos comptes d'entreprise permanents — trajets quotidiens de cadres, logistique de roadshows entre les tours, et transferts aéroport encadrant les voyages internationaux, souvent facturés mensuellement plutôt que par trajet.",
        "Les réservations de loisirs sont moins nombreuses mais bien réelles — les dîners en bord d'eau le long de Bay Avenue et du Dubai Canal sont appréciés des clients d'hôtel. Business Bay se trouve à quelques minutes de Downtown et du DIFC, idéal pour des réservations à la journée couvrant plusieurs quartiers. La flotte penche vers la Classe S et la Série 7 pour les trajets quotidiens, avec Classe V et Escalade pour les roadshows d'équipe, et une Rolls-Royce disponible pour les arrivées VIP.",
      ],
      de: [
        "Das dichte Netz an Bürotürmen in Business Bay liegt direkt neben Downtown Dubai und macht die Gegend zu einer der belebtesten Firmen-Abholzonen der Stadt. Terminpläne sind eng getaktet, und der Verkehr auf der Al Abraj Street und dem Marasi Drive kann unvorhersehbar sein — daher erhält jede Buchung einen realistischen Zeitpuffer statt einer optimistischen Schätzung.",
        "Flughafentransfers dauern über die Sheikh Zayed Road etwa 20 Minuten bis zum DXB. Hier sind die meisten unserer festen Firmenkunden ansässig — tägliches Pendeln von Führungskräften, Roadshow-Logistik zwischen den Türmen und Flughafentransfers, die internationale Reisen einrahmen, häufig mit monatlicher statt fahrtbezogener Abrechnung.",
        "Freizeitbuchungen sind seltener, aber real — Wasserfront-Dinner entlang der Bay Avenue und des Dubai Canal sind bei Hotelgästen beliebt. Business Bay liegt nur Minuten von Downtown und DIFC entfernt, ideal für Ganztagesbuchungen über mehrere Stadtteile hinweg. Die Flotte setzt für den täglichen Pendelverkehr vor allem auf S-Klasse und 7er-Reihe, mit V-Klasse und Escalade für Team-Roadshows sowie einem Rolls-Royce für VIP-Ankünfte.",
      ],
    },
    isAirport: false,
    popularRoutes: [
      {
        from: "Business Bay",
        to: "Dubai International Airport (DXB)",
        duration: { en: "~20 min", ar: "~20 دقيقة", ru: "~20 мин", zh: "~20分钟", fr: "~20 min", de: "~20 Min." },
      },
      {
        from: "Business Bay",
        to: "Downtown Dubai",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
      {
        from: "Business Bay",
        to: "Dubai Marina",
        duration: { en: "~25 min", ar: "~25 دقيقة", ru: "~25 мин", zh: "~25分钟", fr: "~25 min", de: "~25 Min." },
      },
      {
        from: "Business Bay",
        to: "DIFC",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
      {
        from: "Business Bay",
        to: "Palm Jumeirah",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
    ],
    whyChoose: {
      en: [
        "Realistic timing built specifically around Business Bay's own traffic patterns",
        "A preferred choice for corporate accounts running daily executive transport",
        "Fast, direct connections to DIFC, Downtown, and Sheikh Zayed Road",
        "Monthly invoicing available for standing business accounts of any size",
        "Well suited to full-day bookings that combine several nearby business districts",
        "Genuinely familiar with Bay Avenue and Dubai Canal evening bookings",
      ],
      ar: [
        "توقيت واقعي مصمم خصيصًا وفقًا لأنماط حركة المرور الخاصة بالخليج التجاري",
        "الخيار المفضل لحسابات الشركات التي تدير تنقل تنفيذي يومي",
        "اتصالات سريعة ومباشرة بمركز دبي المالي العالمي ووسط المدينة وشارع الشيخ زايد",
        "فوترة شهرية متاحة لحسابات الأعمال الدائمة من أي حجم",
        "مناسب تمامًا للحجوزات ليوم كامل التي تجمع بين عدة أحياء تجارية قريبة",
        "معرفة حقيقية بحجوزات المساء في باي أفينيو وقناة دبي",
      ],
      ru: [
        "Реалистичный расчёт времени, разработанный специально с учётом трафика Business Bay",
        "Предпочтительный выбор для корпоративных клиентов с ежедневными поездками руководителей",
        "Быстрые прямые маршруты к DIFC, Downtown и Sheikh Zayed Road",
        "Ежемесячное выставление счетов доступно для постоянных бизнес-аккаунтов любого размера",
        "Отлично подходит для полнодневных бронирований, объединяющих несколько соседних деловых районов",
        "Хорошо знакомы с вечерними заказами на Bay Avenue и Dubai Canal",
      ],
      zh: [
        "专为商业湾自身交通模式量身定制的真实合理行程时间",
        "日常高管出行企业客户的首选服务",
        "快速直达DIFC、市中心及谢赫扎耶德路",
        "适用于任何规模的长期商务账户,提供按月开票服务",
        "非常适合横跨多个邻近商业区的全天预订",
        "对Bay Avenue及迪拜运河的夜间预订需求了如指掌",
      ],
      fr: [
        "Un timing réaliste conçu spécifiquement autour des schémas de circulation propres à Business Bay",
        "Un choix privilégié pour les comptes d'entreprise gérant des trajets quotidiens de cadres",
        "Des connexions rapides et directes vers le DIFC, Downtown et Sheikh Zayed Road",
        "Facturation mensuelle disponible pour les comptes d'entreprise permanents de toute taille",
        "Idéal pour les réservations à la journée combinant plusieurs quartiers d'affaires voisins",
        "Une connaissance authentique des réservations en soirée à Bay Avenue et au Dubai Canal",
      ],
      de: [
        "Realistische Zeitplanung, die speziell auf die Verkehrsmuster von Business Bay zugeschnitten ist",
        "Eine bevorzugte Wahl für Firmenkunden mit täglichem Executive-Transport",
        "Schnelle, direkte Verbindungen zu DIFC, Downtown und der Sheikh Zayed Road",
        "Monatliche Abrechnung für feste Geschäftskonten jeder Größe verfügbar",
        "Bestens geeignet für Ganztagesbuchungen, die mehrere nahe gelegene Geschäftsviertel verbinden",
        "Wirklich vertraut mit Abendbuchungen an der Bay Avenue und am Dubai Canal",
      ],
    },
    faqs: [
      {
        question: {
          en: "Do you offer daily chauffeur service for Business Bay offices?",
          ar: "هل تقدمون خدمة سائق يومية لمكاتب الخليج التجاري؟",
          ru: "Предлагаете ли вы ежедневный шофёрский сервис для офисов Business Bay?",
          zh: "是否为商业湾写字楼提供每日司机服务?",
          fr: "Proposez-vous un service de chauffeur quotidien pour les bureaux de Business Bay ?",
          de: "Bieten Sie einen täglichen Chauffeurservice für Büros in Business Bay an?",
        },
        answer: {
          en: "Yes, many of our corporate accounts are based in Business Bay with daily or recurring bookings.",
          ar: "نعم، يتمركز العديد من حسابات شركاتنا في الخليج التجاري بحجوزات يومية أو متكررة.",
          ru: "Да, многие наши корпоративные клиенты базируются в Business Bay с ежедневными или регулярными бронированиями.",
          zh: "是的,我们许多企业客户常驻商业湾,并设有每日或常规预订。",
          fr: "Oui, beaucoup de nos comptes d'entreprise sont basés à Business Bay avec des réservations quotidiennes ou récurrentes.",
          de: "Ja, viele unserer Firmenkunden sind in Business Bay ansässig und haben tägliche oder wiederkehrende Buchungen.",
        },
      },
      {
        question: {
          en: "How long does it take to reach DXB from Business Bay?",
          ar: "كم من الوقت يستغرق الوصول إلى مطار دبي الدولي من الخليج التجاري؟",
          ru: "Сколько времени занимает дорога до DXB из Business Bay?",
          zh: "从商业湾到DXB机场需要多长时间?",
          fr: "Combien de temps faut-il pour atteindre DXB depuis Business Bay ?",
          de: "Wie lange dauert es von Business Bay zum DXB?",
        },
        answer: {
          en: "Around 20 minutes under normal conditions, given Business Bay's proximity to Sheikh Zayed Road.",
          ar: "حوالي 20 دقيقة في الظروف العادية، نظرًا لقرب الخليج التجاري من شارع الشيخ زايد.",
          ru: "Около 20 минут в обычных условиях, учитывая близость Business Bay к Sheikh Zayed Road.",
          zh: "在正常状况下约需20分钟,得益于商业湾邻近谢赫扎耶德路。",
          fr: "Environ 20 minutes dans des conditions normales, étant donné la proximité de Business Bay avec Sheikh Zayed Road.",
          de: "Unter normalen Bedingungen etwa 20 Minuten, dank der Nähe von Business Bay zur Sheikh Zayed Road.",
        },
      },
      {
        question: {
          en: "Can you set up a corporate account for our Business Bay office?",
          ar: "هل يمكنكم إنشاء حساب شركة لمكتبنا في الخليج التجاري؟",
          ru: "Можете ли вы создать корпоративный аккаунт для нашего офиса в Business Bay?",
          zh: "能否为我们位于商业湾的办公室开设企业账户?",
          fr: "Pouvez-vous créer un compte entreprise pour notre bureau à Business Bay ?",
          de: "Können Sie ein Firmenkonto für unser Büro in Business Bay einrichten?",
        },
        answer: {
          en: "Yes, we set up standing corporate accounts with monthly invoicing for teams based in Business Bay.",
          ar: "نعم، ننشئ حسابات شركات دائمة بفوترة شهرية للفرق المتمركزة في الخليج التجاري.",
          ru: "Да, мы создаём постоянные корпоративные аккаунты с ежемесячным выставлением счетов для команд, базирующихся в Business Bay.",
          zh: "是的,我们为常驻商业湾的团队设立长期企业账户,并提供按月开票服务。",
          fr: "Oui, nous créons des comptes d'entreprise permanents avec facturation mensuelle pour les équipes basées à Business Bay.",
          de: "Ja, wir richten feste Firmenkonten mit monatlicher Abrechnung für Teams in Business Bay ein.",
        },
      },
      {
        question: {
          en: "Do you cover both towers and waterfront hotels in Business Bay?",
          ar: "هل تغطون كلاً من الأبراج والفنادق على الواجهة المائية في الخليج التجاري؟",
          ru: "Обслуживаете ли вы и башни, и прибрежные отели в Business Bay?",
          zh: "是否同时覆盖商业湾的写字楼与水岸酒店?",
          fr: "Couvrez-vous à la fois les tours et les hôtels en bord d'eau à Business Bay ?",
          de: "Decken Sie sowohl Türme als auch Wasserfront-Hotels in Business Bay ab?",
        },
        answer: {
          en: "Yes, we serve the full Business Bay area, including office towers and hotels along the canal.",
          ar: "نعم، نخدم منطقة الخليج التجاري بالكامل، بما في ذلك أبراج المكاتب والفنادق على طول القناة.",
          ru: "Да, мы обслуживаем весь район Business Bay, включая офисные башни и отели вдоль канала.",
          zh: "是的,我们覆盖整个商业湾区域,包括写字楼及运河沿岸酒店。",
          fr: "Oui, nous desservons l'ensemble de la zone de Business Bay, y compris les tours de bureaux et les hôtels le long du canal.",
          de: "Ja, wir bedienen das gesamte Gebiet von Business Bay, einschließlich Bürotürmen und Hotels entlang des Kanals.",
        },
      },
      {
        question: {
          en: "Can you handle a day combining meetings in Business Bay, Downtown, and DIFC?",
          ar: "هل يمكنكم التعامل مع يوم يجمع اجتماعات في الخليج التجاري ووسط المدينة ومركز دبي المالي العالمي؟",
          ru: "Можете ли вы организовать день со встречами в Business Bay, Downtown и DIFC?",
          zh: "能否安排一天内兼顾商业湾、市中心及DIFC的多场会议?",
          fr: "Pouvez-vous gérer une journée combinant des réunions à Business Bay, Downtown et au DIFC ?",
          de: "Können Sie einen Tag mit Terminen in Business Bay, Downtown und im DIFC koordinieren?",
        },
        answer: {
          en: "Yes, a full-day booking comfortably covers all three, since they sit within about 10 minutes of each other.",
          ar: "نعم، يغطي الحجز ليوم كامل الثلاثة بسهولة، حيث تقع على بعد حوالي 10 دقائق من بعضها البعض.",
          ru: "Да, полнодневное бронирование удобно охватывает все три района, поскольку они находятся примерно в 10 минутах друг от друга.",
          zh: "可以,三地车程互相约10分钟,全天预订可轻松兼顾。",
          fr: "Oui, une réservation à la journée couvre confortablement les trois, car ils se trouvent à environ 10 minutes les uns des autres.",
          de: "Ja, eine Ganztagesbuchung deckt alle drei bequem ab, da sie etwa 10 Minuten voneinander entfernt liegen.",
        },
      },
      {
        question: {
          en: "Is Bay Avenue a common pickup point for evening bookings?",
          ar: "هل يُعد باي أفينيو نقطة استقبال شائعة للحجوزات المسائية؟",
          ru: "Является ли Bay Avenue распространённой точкой посадки для вечерних заказов?",
          zh: "Bay Avenue是否为夜间预订常见的接客地点?",
          fr: "Bay Avenue est-il un point de prise en charge courant pour les réservations en soirée ?",
          de: "Ist die Bay Avenue ein häufiger Abholpunkt für Abendbuchungen?",
        },
        answer: {
          en: "Yes, dinner and evening bookings along Bay Avenue and the Dubai Canal are common, and our chauffeurs know the area's specific access points.",
          ar: "نعم، حجوزات العشاء والأمسيات على طول باي أفينيو وقناة دبي شائعة، ويعرف سائقونا نقاط الدخول المحددة للمنطقة.",
          ru: "Да, заказы на ужин и вечерние поездки вдоль Bay Avenue и Dubai Canal распространены, и наши шофёры знают точные точки доступа в этом районе.",
          zh: "是的,沿Bay Avenue及迪拜运河的晚餐及夜间预订十分常见,我们的司机熟悉该区域的具体出入口。",
          fr: "Oui, les réservations pour dîner et en soirée le long de Bay Avenue et du Dubai Canal sont courantes, et nos chauffeurs connaissent les points d'accès spécifiques de la zone.",
          de: "Ja, Dinner- und Abendbuchungen entlang der Bay Avenue und des Dubai Canal sind üblich, und unsere Chauffeure kennen die spezifischen Zugangspunkte der Gegend.",
        },
      },
      {
        question: {
          en: "Do you serve offices in Dubai Design District near Business Bay?",
          ar: "هل تخدمون المكاتب في حي دبي للتصميم بالقرب من الخليج التجاري؟",
          ru: "Обслуживаете ли вы офисы в Dubai Design District рядом с Business Bay?",
          zh: "是否为商业湾附近迪拜设计区的办公室提供服务?",
          fr: "Desservez-vous les bureaux du Dubai Design District près de Business Bay ?",
          de: "Bedienen Sie Büros im Dubai Design District in der Nähe von Business Bay?",
        },
        answer: {
          en: "Yes, we cover Dubai Design District as part of the wider Business Bay area, including recurring pickups for teams based there.",
          ar: "نعم، نغطي حي دبي للتصميم كجزء من منطقة الخليج التجاري الأوسع، بما في ذلك الاستقبال المتكرر للفرق المتمركزة هناك.",
          ru: "Да, мы обслуживаем Dubai Design District как часть более широкого района Business Bay, включая регулярную посадку для базирующихся там команд.",
          zh: "是的,我们将迪拜设计区纳入更广泛的商业湾服务范围,包括为常驻该区域的团队提供常规接送。",
          fr: "Oui, nous couvrons le Dubai Design District dans le cadre de la zone élargie de Business Bay, y compris les prises en charge récurrentes pour les équipes qui y sont basées.",
          de: "Ja, wir decken den Dubai Design District als Teil des weiteren Gebiets von Business Bay ab, einschließlich wiederkehrender Abholungen für dort ansässige Teams.",
        },
      },
      {
        question: {
          en: "Can you handle a roadshow moving between several Business Bay towers in one morning?",
          ar: "هل يمكنكم إدارة جولة ترويجية تتنقل بين عدة أبراج في الخليج التجاري في صباح واحد؟",
          ru: "Можете ли вы организовать роуд-шоу с перемещением между несколькими башнями Business Bay за одно утро?",
          zh: "能否安排一上午内在商业湾多栋大厦间往返的路演行程?",
          fr: "Pouvez-vous gérer un roadshow se déplaçant entre plusieurs tours de Business Bay en une seule matinée ?",
          de: "Können Sie eine Roadshow koordinieren, die an einem Vormittag zwischen mehreren Business-Bay-Türmen wechselt?",
        },
        answer: {
          en: "Yes, roadshow logistics between towers is one of the most common bookings we run for Business Bay corporate accounts.",
          ar: "نعم، تُعد لوجستيات الجولات الترويجية بين الأبراج واحدة من أكثر الحجوزات شيوعًا التي ندير من أجل حسابات شركات الخليج التجاري.",
          ru: "Да, логистика роуд-шоу между башнями — один из самых распространённых заказов, которые мы выполняем для корпоративных клиентов Business Bay.",
          zh: "可以,大厦间路演物流是我们为商业湾企业客户处理的最常见预订类型之一。",
          fr: "Oui, la logistique de roadshow entre les tours est l'une des réservations les plus courantes que nous gérons pour les comptes d'entreprise de Business Bay.",
          de: "Ja, die Roadshow-Logistik zwischen den Türmen gehört zu den häufigsten Buchungen, die wir für Firmenkunden in Business Bay abwickeln.",
        },
      },
      {
        question: {
          en: "Do you provide chauffeur service for guests staying at Business Bay's waterfront hotels?",
          ar: "هل تقدمون خدمة سائق لنزلاء الفنادق المقيمين على الواجهة المائية في الخليج التجاري؟",
          ru: "Предоставляете ли вы шофёрский сервис для гостей, проживающих в прибрежных отелях Business Bay?",
          zh: "是否为入住商业湾水岸酒店的宾客提供司机服务?",
          fr: "Proposez-vous un service de chauffeur pour les clients séjournant dans les hôtels en bord d'eau de Business Bay ?",
          de: "Bieten Sie einen Chauffeurservice für Gäste an, die in den Wasserfront-Hotels von Business Bay wohnen?",
        },
        answer: {
          en: "Yes, hotel guests along the Dubai Canal use Apex for both business travel and leisure bookings during their stay, with the same fixed pricing.",
          ar: "نعم، يستخدم نزلاء الفنادق على طول قناة دبي خدمة Apex لكل من التنقل التجاري والحجوزات الترفيهية خلال إقامتهم، بنفس الأسعار الثابتة.",
          ru: "Да, гости отелей вдоль Dubai Canal используют Apex как для деловых поездок, так и для отдыха во время пребывания — с теми же фиксированными ценами.",
          zh: "是的,迪拜运河沿岸酒店住客在逗留期间使用Apex服务处理商务出行及休闲预订,均享有同样的固定价格。",
          fr: "Oui, les clients d'hôtel le long du Dubai Canal utilisent Apex aussi bien pour les déplacements professionnels que pour les réservations de loisirs pendant leur séjour, au même tarif fixe.",
          de: "Ja, Hotelgäste entlang des Dubai Canal nutzen Apex während ihres Aufenthalts sowohl für Geschäftsreisen als auch für Freizeitbuchungen, zum gleichen Festpreis.",
        },
      },
      {
        question: {
          en: "Is parking or valet handled at Business Bay office towers?",
          ar: "هل يتم التعامل مع مواقف السيارات أو خدمة صف السيارات في أبراج مكاتب الخليج التجاري؟",
          ru: "Организована ли парковка или валет-паркинг у офисных башен Business Bay?",
          zh: "商业湾写字楼是否设有停车或代客泊车安排?",
          fr: "Le stationnement ou le voiturier sont-ils gérés au niveau des tours de bureaux de Business Bay ?",
          de: "Werden Parken oder Voiturier-Service an den Bürotürmen von Business Bay organisiert?",
        },
        answer: {
          en: "Our chauffeurs already know the valet and drop-off arrangements at Business Bay's major towers, so pickups run smoothly without guesswork.",
          ar: "يعرف سائقونا بالفعل ترتيبات خدمة صف السيارات والتوصيل في الأبراج الرئيسية للخليج التجاري، بحيث يسير الاستقبال بسلاسة دون تخمين.",
          ru: "Наши шофёры уже знают порядок работы валет-паркинга и высадки у основных башен Business Bay, поэтому посадка проходит гладко, без догадок.",
          zh: "我们的司机已熟悉商业湾主要大厦的代客泊车及落客安排,确保接送顺利进行,无需猜测。",
          fr: "Nos chauffeurs connaissent déjà les dispositifs de voiturier et de dépose au niveau des grandes tours de Business Bay, ce qui permet des prises en charge fluides, sans incertitude.",
          de: "Unsere Chauffeure kennen bereits die Voiturier- und Absetzregelungen an den wichtigsten Türmen von Business Bay, sodass Abholungen reibungslos und ohne Rätselraten ablaufen.",
        },
      },
      {
        question: {
          en: "Can Business Bay corporate accounts include occasional airport pickups for visiting clients?",
          ar: "هل يمكن أن تشمل حسابات شركات الخليج التجاري استقبالات مطار عرضية للعملاء الزائرين؟",
          ru: "Могут ли корпоративные аккаунты Business Bay включать разовую встречу в аэропорту для приезжающих клиентов?",
          zh: "商业湾企业账户是否可包含偶尔为来访客户提供的机场接送服务?",
          fr: "Les comptes d'entreprise de Business Bay peuvent-ils inclure des prises en charge aéroport occasionnelles pour des clients de passage ?",
          de: "Können Business-Bay-Firmenkonten gelegentliche Flughafenabholungen für Besuchskunden umfassen?",
        },
        answer: {
          en: "Yes, visiting client pickups are commonly added to an existing Business Bay corporate account and billed on the same monthly invoice.",
          ar: "نعم، تُضاف استقبالات العملاء الزائرين بشكل شائع إلى حساب شركة قائم في الخليج التجاري وتُفوتر ضمن نفس الفاتورة الشهرية.",
          ru: "Да, встречи приезжающих клиентов обычно добавляются к существующему корпоративному аккаунту Business Bay и оплачиваются по тому же ежемесячному счёту.",
          zh: "可以,来访客户的接送服务通常可添加至现有商业湾企业账户,并计入同一份月度账单。",
          fr: "Oui, les prises en charge de clients de passage sont couramment ajoutées à un compte d'entreprise Business Bay existant et facturées sur la même facture mensuelle.",
          de: "Ja, Abholungen für Besuchskunden werden üblicherweise einem bestehenden Business-Bay-Firmenkonto hinzugefügt und über dieselbe monatliche Rechnung abgerechnet.",
        },
      },
    ],
    landmarks: ["Bay Avenue", "Dubai Canal", "JW Marriott Marquis Business Bay", "Marasi Business Bay", "Dubai Design District"],
  },
  {
    slug: "jbr",
    name: "JBR",
    tags: {
      en: ["Luxury Residences", "VIP Transportation", "Leisure Travel"],
      ar: ["مساكن فاخرة", "نقل VIP", "سفر ترفيهي"],
      ru: ["Роскошные резиденции", "VIP-транспорт", "Досуг и путешествия"],
      zh: ["豪华住宅", "贵宾专车", "休闲出行"],
      fr: ["Résidences de luxe", "Transport VIP", "Voyages de loisirs"],
      de: ["Luxusresidenzen", "VIP-Transport", "Freizeitreisen"],
    },
    image: {
      src: "/images/locations/jbr.webp",
      alt: {
        en: "JBR beach at sunset with Ain Dubai observation wheel in the background",
        ar: "شاطئ جي بي آر عند الغروب مع عين دبي في الخلفية",
        ru: "Пляж JBR на закате с колесом обозрения Ain Dubai на фоне",
        zh: "JBR海滩日落景色,迪拜观景摩天轮(Ain Dubai)矗立于背景之中",
        fr: "Plage de JBR au coucher du soleil avec la grande roue Ain Dubai en arrière-plan",
        de: "JBR-Strand bei Sonnenuntergang mit dem Riesenrad Ain Dubai im Hintergrund",
      },
    },
    heroDesktopImage: {
      src: "/images/locations/jbr-hero.webp",
      alt: {
        en: "Sunset at JBR beach with Ain Dubai observation wheel and The Beach promenade",
        ar: "غروب الشمس على شاطئ جي بي آر مع عين دبي وممشى ذا بيتش",
        ru: "Закат на пляже JBR с колесом обозрения Ain Dubai и променадом The Beach",
        zh: "JBR海滩日落,迪拜观景摩天轮与The Beach海滨长廊相映成景",
        fr: "Coucher de soleil sur la plage de JBR avec la grande roue Ain Dubai et la promenade The Beach",
        de: "Sonnenuntergang am JBR-Strand mit dem Riesenrad Ain Dubai und der Promenade The Beach",
      },
    },
    heroMobileImage: {
      src: "/images/locations/jbr-hero.webp",
      alt: {
        en: "Sunset at JBR beach with Ain Dubai observation wheel and The Beach promenade",
        ar: "غروب الشمس على شاطئ جي بي آر مع عين دبي وممشى ذا بيتش",
        ru: "Закат на пляже JBR с колесом обозрения Ain Dubai и променадом The Beach",
        zh: "JBR海滩日落,迪拜观景摩天轮与The Beach海滨长廊相映成景",
        fr: "Coucher de soleil sur la plage de JBR avec la grande roue Ain Dubai et la promenade The Beach",
        de: "Sonnenuntergang am JBR-Strand mit dem Riesenrad Ain Dubai und der Promenade The Beach",
      },
    },
    heroObjectPosition: "80% center",
    tagline: {
      en: "Beachfront pickups, made simple",
      ar: "استقبال من الواجهة الشاطئية، بمنتهى البساطة",
      ru: "Посадка на берегу — просто и удобно",
      zh: "海滨接送,轻松简单",
      fr: "Prises en charge en bord de mer, en toute simplicité",
      de: "Abholungen direkt am Strand — ganz einfach",
    },
    heroSubtitle: {
      en: "Chauffeur service along JBR's beachfront towers, The Walk, and The Beach.",
      ar: "خدمة سائق خاص على طول أبراج جي بي آر الشاطئية وذا ووك وذا بيتش.",
      ru: "Шофёрский сервис вдоль пляжных башен JBR, The Walk и The Beach.",
      zh: "为JBR海滨高楼、The Walk及The Beach提供专属司机服务。",
      fr: "Service de chauffeur le long des tours en bord de mer de JBR, The Walk et The Beach.",
      de: "Chauffeurservice entlang der Strandtürme von JBR, The Walk und The Beach.",
    },
    shortDescription: {
      en: "Chauffeur transport across Jumeirah Beach Residence, timed around The Walk and The Beach.",
      ar: "نقل بسائق خاص في جميع أنحاء جميرا بيتش ريزيدنس، بتوقيت يتناسب مع ذا ووك وذا بيتش.",
      ru: "Шофёрский трансфер по всей территории Jumeirah Beach Residence, синхронизированный с The Walk и The Beach.",
      zh: "覆盖Jumeirah Beach Residence全境的专属司机接送服务,行程时间围绕The Walk及The Beach合理安排。",
      fr: "Transport avec chauffeur dans tout Jumeirah Beach Residence, adapté aux horaires de The Walk et The Beach.",
      de: "Chauffeurtransport in ganz Jumeirah Beach Residence, zeitlich abgestimmt auf The Walk und The Beach.",
    },
    longDescription: {
      en: [
        "JBR's beachfront towers and The Walk promenade draw both residents and visitors, and pickup logistics can be tricky during peak evening hours. Apex chauffeurs know the designated pickup bay for every JBR tower and coordinate timing around beachfront events and weekend crowds.",
        "Airport transfers run around 30 minutes to DXB, slightly longer than neighbouring Dubai Marina due to the beachfront road layout, with the same flight tracking and departure buffer as every booking. Business travelers based in JBR's residential towers get the same punctual standard for their daily commute.",
        "Leisure is the majority of what we're booked for here — The Walk's restaurants, The Beach's daytime scene, and evenings that easily extend to Bluewaters Island and Ain Dubai, just across the water. Dubai Marina is 10 minutes away. Fleet choice is flexible: an S-Class or 7 Series for transfers, a Range Rover or more distinctive vehicle for a beachfront evening out.",
      ],
      ar: [
        "تجذب أبراج جي بي آر الشاطئية وممشى ذا ووك كلاً من السكان والزوار، وقد تكون لوجستيات الاستقبال معقدة خلال ساعات المساء الذروة. يعرف سائقو Apex موقف الاستقبال المخصص لكل برج في جي بي آر وينسقون التوقيت حول فعاليات الواجهة الشاطئية وازدحام عطلة نهاية الأسبوع.",
        "تستغرق رحلات المطار حوالي 30 دقيقة إلى مطار دبي الدولي (DXB)، أطول قليلاً من مرسى دبي المجاورة بسبب تصميم الطريق الشاطئي، مع نفس تتبع الرحلة الجوية وهامش المغادرة المعتمد في كل حجز. يحصل المسافرون من رجال الأعمال المقيمين في أبراج جي بي آر السكنية على نفس معيار الالتزام بالمواعيد لتنقلهم اليومي.",
        "يمثل الترفيه غالبية ما يتم حجزه هنا — مطاعم ذا ووك، ومشهد النهار في ذا بيتش، وأمسيات تمتد بسهولة إلى جزيرة بلوواترز وعين دبي، عبر الماء مباشرة. تبعد مرسى دبي 10 دقائق. اختيار الأسطول مرن: إس-كلاس أو سيريز 7 للتنقلات، أو رينج روفر أو سيارة أكثر تميزًا لأمسية على الواجهة الشاطئية.",
      ],
      ru: [
        "Пляжные башни JBR и променад The Walk привлекают и жителей, и гостей, а логистика посадки может усложняться в часы пик по вечерам. Шофёры Apex знают назначенное место посадки у каждой башни JBR и согласовывают время с учётом пляжных мероприятий и наплыва людей по выходным.",
        "Трансфер в аэропорт занимает около 30 минут до DXB — немного дольше, чем из соседней Dubai Marina, из-за особенностей прибрежной дорожной сети, с тем же отслеживанием рейса и запасом времени на вылет, что и в любом бронировании. Деловые путешественники, проживающие в жилых башнях JBR, получают тот же пунктуальный стандарт для ежедневных поездок.",
        "Здесь мы в основном принимаем заказы на отдых — рестораны The Walk, дневная атмосфера The Beach и вечера, которые легко продолжаются на Bluewaters Island и Ain Dubai, прямо через воду. Dubai Marina находится в 10 минутах. Выбор автопарка гибкий: S-Class или 7 Series для трансферов, Range Rover или более примечательный автомобиль для вечера на берегу.",
      ],
      zh: [
        "JBR的海滨高楼与The Walk长廊吸引着居民与游客,晚间高峰时段的接客物流可能颇具挑战。Apex司机熟悉JBR每栋大楼的指定接客区,并根据海滨活动及周末人流合理协调接送时间。",
        "机场接送车程约30分钟抵达DXB机场,受海滨道路布局影响,略长于邻近的迪拜码头,但同样享有航班追踪与出发缓冲时间保障。常驻JBR住宅大楼的商务人士,日常通勤同样享有准时可靠的服务标准。",
        "此处预订以休闲行程为主——The Walk的各式餐厅、The Beach的日间风光,以及轻松延伸至隔水相望的蓝水岛(Bluewaters Island)与迪拜观景摩天轮的夜晚。迪拜码头车程仅10分钟。车型选择灵活多样:S级或7系适合接送行程,揽胜或更具个性的车型则适合海滨之夜出行。",
      ],
      fr: [
        "Les tours en bord de mer de JBR et la promenade The Walk attirent à la fois résidents et visiteurs, et la logistique de prise en charge peut se compliquer aux heures de pointe en soirée. Les chauffeurs Apex connaissent la baie de prise en charge désignée pour chaque tour de JBR et coordonnent les horaires en fonction des événements en bord de mer et de l'affluence du week-end.",
        "Les transferts aéroport durent environ 30 minutes jusqu'à DXB, un peu plus longtemps que depuis la voisine Dubai Marina en raison de la configuration des routes côtières, avec le même suivi de vol et la même marge de départ que pour toute réservation. Les voyageurs d'affaires basés dans les tours résidentielles de JBR bénéficient du même standard de ponctualité pour leur trajet quotidien.",
        "Les loisirs représentent la majorité de nos réservations ici — les restaurants de The Walk, l'ambiance de jour de The Beach, et des soirées qui s'étendent facilement jusqu'à Bluewaters Island et Ain Dubai, juste de l'autre côté de l'eau. Dubai Marina est à 10 minutes. Le choix de flotte est flexible : une Classe S ou Série 7 pour les transferts, une Range Rover ou un véhicule plus singulier pour une soirée en bord de mer.",
      ],
      de: [
        "Die Strandtürme von JBR und die Promenade The Walk ziehen sowohl Bewohner als auch Besucher an, und die Abhollogistik kann in den abendlichen Stoßzeiten anspruchsvoll sein. Apex-Chauffeure kennen die vorgesehene Abholbucht für jeden JBR-Turm und stimmen das Timing auf Strand-Events und Wochenendandrang ab.",
        "Flughafentransfers dauern etwa 30 Minuten bis zum DXB — etwas länger als aus dem benachbarten Dubai Marina, bedingt durch die Straßenführung an der Strandpromenade, mit derselben Flugverfolgung und demselben Abflugpuffer wie bei jeder Buchung. Geschäftsreisende mit Wohnsitz in den JBR-Wohntürmen erhalten für ihren täglichen Pendelverkehr denselben pünktlichen Standard.",
        "Freizeitfahrten machen hier den Großteil unserer Buchungen aus — die Restaurants der The Walk, das Tagesflair von The Beach und Abende, die sich mühelos bis zu Bluewaters Island und Ain Dubai gleich auf der anderen Seite des Wassers ausdehnen. Dubai Marina ist 10 Minuten entfernt. Die Fahrzeugauswahl ist flexibel: eine S-Klasse oder 7er-Reihe für Transfers, ein Range Rover oder ein markanteres Fahrzeug für einen Abend am Strand.",
      ],
    },
    isAirport: false,
    popularRoutes: [
      {
        from: "JBR",
        to: "Dubai International Airport (DXB)",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
      {
        from: "JBR",
        to: "Dubai Marina",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
      {
        from: "JBR",
        to: "Palm Jumeirah",
        duration: { en: "~15 min", ar: "~15 دقيقة", ru: "~15 мин", zh: "~15分钟", fr: "~15 min", de: "~15 Min." },
      },
      {
        from: "JBR",
        to: "Downtown Dubai",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
      {
        from: "JBR",
        to: "Bluewaters Island",
        duration: { en: "~10 min", ar: "~10 دقائق", ru: "~10 мин", zh: "~10分钟", fr: "~10 min", de: "~10 Min." },
      },
    ],
    whyChoose: {
      en: [
        "Chauffeurs know the designated pickup bay for every individual JBR tower",
        "Timing genuinely built around The Walk and The Beach's peak evening crowds",
        "Quick, direct access to neighbouring Dubai Marina and Palm Jumeirah",
        "Equally available for beach days, dinner bookings, and airport transfers",
        "Comfortable combining a Walk dinner with a Bluewaters Island or Ain Dubai visit",
        "Genuinely familiar with weekend beachfront congestion and event-related road closures",
      ],
      ar: [
        "يعرف السائقون موقف الاستقبال المخصص لكل برج فردي في جي بي آر",
        "توقيت مصمم فعليًا حول ازدحام المساء الذروة في ذا ووك وذا بيتش",
        "وصول سريع ومباشر إلى مرسى دبي المجاورة ونخلة جميرا",
        "متاحة بالتساوي لأيام الشاطئ وحجوزات العشاء ورحلات المطار",
        "سهولة الجمع بين عشاء في ذا ووك وزيارة جزيرة بلوواترز أو عين دبي",
        "معرفة حقيقية بازدحام الواجهة الشاطئية في عطلة نهاية الأسبوع وإغلاقات الطرق المرتبطة بالفعاليات",
      ],
      ru: [
        "Шофёры знают назначенное место посадки у каждой отдельной башни JBR",
        "Время маршрута действительно рассчитано с учётом вечернего наплыва людей на The Walk и The Beach",
        "Быстрый прямой доступ к соседним Dubai Marina и Palm Jumeirah",
        "Одинаково удобно для пляжных дней, заказов на ужин и трансферов в аэропорт",
        "Удобно совмещать ужин на The Walk с посещением Bluewaters Island или Ain Dubai",
        "Хорошо знакомы с заторами на набережной по выходным и перекрытиями дорог из-за мероприятий",
      ],
      zh: [
        "司机熟知JBR每一栋独立大楼的指定接客区",
        "行程时间充分考虑The Walk与The Beach晚间高峰人流",
        "快速直达邻近的迪拜码头与棕榈岛",
        "无论是海滩日、晚餐预订还是机场接送,均可提供同等优质服务",
        "轻松将The Walk晚餐与蓝水岛或迪拜观景摩天轮之旅结合安排",
        "对周末海滨拥堵及活动相关封路情况了如指掌",
      ],
      fr: [
        "Les chauffeurs connaissent la baie de prise en charge désignée pour chaque tour individuelle de JBR",
        "Un timing véritablement construit autour de l'affluence des heures de pointe en soirée à The Walk et The Beach",
        "Un accès rapide et direct aux voisins Dubai Marina et Palm Jumeirah",
        "Aussi disponible pour les journées à la plage, les réservations pour dîner et les transferts aéroport",
        "Facile de combiner un dîner à The Walk avec une visite à Bluewaters Island ou Ain Dubai",
        "Une connaissance authentique des embouteillages du week-end en bord de mer et des fermetures de routes liées aux événements",
      ],
      de: [
        "Chauffeure kennen die vorgesehene Abholbucht für jeden einzelnen JBR-Turm",
        "Zeitplanung, die wirklich auf das abendliche Besucheraufkommen an The Walk und The Beach abgestimmt ist",
        "Schneller, direkter Zugang zum benachbarten Dubai Marina und Palm Jumeirah",
        "Gleichermaßen verfügbar für Strandtage, Dinner-Buchungen und Flughafentransfers",
        "Bequeme Kombination aus einem Dinner an der Walk und einem Besuch von Bluewaters Island oder Ain Dubai",
        "Wirklich vertraut mit Wochenend-Staus an der Strandpromenade und eventbedingten Straßensperrungen",
      ],
    },
    faqs: [
      {
        question: {
          en: "Do you pick up directly from JBR towers?",
          ar: "هل تقومون بالاستقبال مباشرة من أبراج جي بي آر؟",
          ru: "Забираете ли вы гостей прямо из башен JBR?",
          zh: "是否直接从JBR大楼提供接送服务?",
          fr: "Assurez-vous la prise en charge directement depuis les tours de JBR ?",
          de: "Holen Sie direkt von den JBR-Türmen ab?",
        },
        answer: {
          en: "Yes, our chauffeurs use the designated pickup bays for each JBR tower and coordinate timing in advance.",
          ar: "نعم، يستخدم سائقونا مواقف الاستقبال المخصصة لكل برج في جي بي آر وينسقون التوقيت مسبقًا.",
          ru: "Да, наши шофёры используют назначенные места посадки у каждой башни JBR и заранее согласовывают время.",
          zh: "是的,我们的司机会使用JBR每栋大楼的指定接客区,并提前协调好接送时间。",
          fr: "Oui, nos chauffeurs utilisent les baies de prise en charge désignées pour chaque tour de JBR et coordonnent les horaires à l'avance.",
          de: "Ja, unsere Chauffeure nutzen die vorgesehenen Abholbuchten für jeden JBR-Turm und stimmen das Timing im Voraus ab.",
        },
      },
      {
        question: {
          en: "Is JBR close to Dubai Marina?",
          ar: "هل يقع جي بي آر بالقرب من مرسى دبي؟",
          ru: "Находится ли JBR близко к Dubai Marina?",
          zh: "JBR距离迪拜码头近吗?",
          fr: "JBR est-il proche de Dubai Marina ?",
          de: "Liegt JBR nahe an Dubai Marina?",
        },
        answer: {
          en: "Yes, JBR sits right next to Dubai Marina, around a 10-minute drive.",
          ar: "نعم، يقع جي بي آر مباشرة بجوار مرسى دبي، على بعد حوالي 10 دقائق بالسيارة.",
          ru: "Да, JBR находится прямо рядом с Dubai Marina, примерно в 10 минутах езды.",
          zh: "是的,JBR紧邻迪拜码头,车程约10分钟。",
          fr: "Oui, JBR se trouve juste à côté de Dubai Marina, à environ 10 minutes en voiture.",
          de: "Ja, JBR liegt direkt neben Dubai Marina, etwa 10 Fahrminuten entfernt.",
        },
      },
      {
        question: {
          en: "Can I book a chauffeur for a beach day in JBR?",
          ar: "هل يمكنني حجز سائق ليوم شاطئ في جي بي آر؟",
          ru: "Можно ли заказать шофёра для пляжного дня в JBR?",
          zh: "可以预订司机陪同在JBR度过海滩日吗?",
          fr: "Puis-je réserver un chauffeur pour une journée à la plage à JBR ?",
          de: "Kann ich einen Chauffeur für einen Strandtag in JBR buchen?",
        },
        answer: {
          en: "Yes, hourly hire is available if you'd like the car to wait while you spend time at The Beach or The Walk.",
          ar: "نعم، الاستئجار بالساعة متاح إذا رغبت في أن تنتظر السيارة أثناء قضاء الوقت في ذا بيتش أو ذا ووك.",
          ru: "Да, доступна почасовая аренда, если вы хотите, чтобы машина ждала, пока вы проводите время на The Beach или The Walk.",
          zh: "可以,如您希望在The Beach或The Walk停留期间车辆等候,可选择按小时包车服务。",
          fr: "Oui, la location à l'heure est disponible si vous souhaitez que la voiture attende pendant que vous passez du temps à The Beach ou The Walk.",
          de: "Ja, die Stundenmiete steht zur Verfügung, wenn der Wagen warten soll, während Sie Zeit an The Beach oder The Walk verbringen.",
        },
      },
      {
        question: {
          en: "How far is JBR from the airport?",
          ar: "كم يبعد جي بي آر عن المطار؟",
          ru: "Как далеко JBR находится от аэропорта?",
          zh: "JBR距离机场有多远?",
          fr: "À quelle distance se trouve JBR de l'aéroport ?",
          de: "Wie weit ist JBR vom Flughafen entfernt?",
        },
        answer: {
          en: "Approximately 30 minutes to DXB under normal traffic conditions.",
          ar: "حوالي 30 دقيقة إلى مطار دبي الدولي في ظل ظروف مرور عادية.",
          ru: "Примерно 30 минут до DXB при обычных условиях движения.",
          zh: "正常路况下前往DXB机场约需30分钟。",
          fr: "Environ 30 minutes jusqu'à DXB dans des conditions de circulation normales.",
          de: "Bei normalem Verkehr etwa 30 Minuten bis zum DXB.",
        },
      },
      {
        question: {
          en: "Can you combine a JBR dinner with a visit to Bluewaters Island?",
          ar: "هل يمكن الجمع بين عشاء في جي بي آر وزيارة جزيرة بلوواترز؟",
          ru: "Можно ли совместить ужин в JBR с посещением Bluewaters Island?",
          zh: "能否将JBR晚餐与蓝水岛之旅结合安排?",
          fr: "Pouvez-vous combiner un dîner à JBR avec une visite à Bluewaters Island ?",
          de: "Können Sie ein Dinner in JBR mit einem Besuch von Bluewaters Island kombinieren?",
        },
        answer: {
          en: "Yes, Bluewaters is around 10 minutes from JBR, and an hourly booking easily covers both destinations in one evening.",
          ar: "نعم، تبعد بلوواترز حوالي 10 دقائق عن جي بي آر، ويغطي الحجز بالساعة بسهولة كلتا الوجهتين في أمسية واحدة.",
          ru: "Да, Bluewaters находится примерно в 10 минутах от JBR, и почасовое бронирование легко охватывает оба места за один вечер.",
          zh: "可以,蓝水岛距JBR车程约10分钟,一次按小时预订即可轻松在一晚内兼顾两地行程。",
          fr: "Oui, Bluewaters est à environ 10 minutes de JBR, et une réservation à l'heure couvre facilement les deux destinations en une soirée.",
          de: "Ja, Bluewaters ist etwa 10 Minuten von JBR entfernt, und eine Stundenbuchung deckt beide Ziele problemlos an einem Abend ab.",
        },
      },
      {
        question: {
          en: "Do weekend crowds on The Walk cause pickup delays?",
          ar: "هل يسبب ازدحام عطلة نهاية الأسبوع في ذا ووك تأخيرًا في الاستقبال؟",
          ru: "Вызывает ли наплыв людей по выходным на The Walk задержки посадки?",
          zh: "The Walk周末人流是否会造成接客延误?",
          fr: "L'affluence du week-end sur The Walk cause-t-elle des retards de prise en charge ?",
          de: "Verursacht der Wochenendandrang auf The Walk Verzögerungen bei der Abholung?",
        },
        answer: {
          en: "Our chauffeurs plan for weekend and evening congestion around The Walk, using access roads that stay clearer during peak hours.",
          ar: "يخطط سائقونا للازدحام في عطلة نهاية الأسبوع والمساء حول ذا ووك، باستخدام طرق وصول تبقى أقل ازدحامًا خلال ساعات الذروة.",
          ru: "Наши шофёры заранее планируют маршрут с учётом заторов по выходным и вечерами на The Walk, используя подъездные дороги, которые остаются свободнее в часы пик.",
          zh: "我们的司机会提前规划,应对The Walk周末及夜间的拥堵状况,选择高峰时段相对通畅的通道。",
          fr: "Nos chauffeurs anticipent les embouteillages du week-end et du soir autour de The Walk, en empruntant des routes d'accès qui restent plus dégagées aux heures de pointe.",
          de: "Unsere Chauffeure planen den Wochenend- und Abendverkehr rund um The Walk ein und nutzen Zufahrtsstraßen, die zu Stoßzeiten freier bleiben.",
        },
      },
      {
        question: {
          en: "Can you arrange a chauffeur for a ride on Ain Dubai?",
          ar: "هل يمكنكم ترتيب سائق لتجربة عين دبي؟",
          ru: "Можете ли вы организовать шофёра для катания на Ain Dubai?",
          zh: "能否为搭乘迪拜观景摩天轮安排司机?",
          fr: "Pouvez-vous organiser un chauffeur pour un tour sur Ain Dubai ?",
          de: "Können Sie einen Chauffeur für eine Fahrt mit dem Ain Dubai organisieren?",
        },
        answer: {
          en: "Yes, we regularly time pickups and drop-offs around Ain Dubai bookings, coordinating with the wheel's own arrival and departure flow.",
          ar: "نعم، ننسق بانتظام مواعيد الاستقبال والتوصيل حول حجوزات عين دبي، بالتنسيق مع تدفق الوصول والمغادرة الخاص بالعجلة.",
          ru: "Да, мы регулярно согласовываем время подачи и высадки с бронированием Ain Dubai, координируя с потоком прибытия и отправления самого колеса.",
          zh: "可以,我们经常根据迪拜观景摩天轮预订时间协调接送安排,配合摩天轮自身的到达与离场流程。",
          fr: "Oui, nous calons régulièrement les prises en charge et déposes autour des réservations Ain Dubai, en coordination avec le flux d'arrivée et de départ de la grande roue.",
          de: "Ja, wir stimmen Abholungen und Ablieferungen regelmäßig auf Ain-Dubai-Buchungen ab und koordinieren mit dem Ankunfts- und Abfahrtsfluss des Riesenrads selbst.",
        },
      },
      {
        question: {
          en: "Do you offer transport for residents living in JBR's residential towers?",
          ar: "هل تقدمون النقل لسكان أبراج جي بي آر السكنية؟",
          ru: "Предлагаете ли вы транспорт для жителей жилых башен JBR?",
          zh: "是否为JBR住宅大楼居民提供交通服务?",
          fr: "Proposez-vous un transport pour les résidents vivant dans les tours résidentielles de JBR ?",
          de: "Bieten Sie Transport für Bewohner der JBR-Wohntürme an?",
        },
        answer: {
          en: "Yes, JBR residents use Apex for both daily commutes to work and evening trips, with chauffeurs familiar with each tower's pickup bay.",
          ar: "نعم، يستخدم سكان جي بي آر خدمة Apex لكل من التنقل اليومي للعمل والرحلات المسائية، مع سائقين على دراية بموقف الاستقبال الخاص بكل برج.",
          ru: "Да, жители JBR используют Apex как для ежедневных поездок на работу, так и для вечерних выездов — с шофёрами, знакомыми с местом посадки у каждой башни.",
          zh: "是的,JBR居民使用Apex服务处理日常上班通勤及夜间出行,司机熟悉每栋大楼的接客区位置。",
          fr: "Oui, les résidents de JBR utilisent Apex aussi bien pour les trajets quotidiens au travail que pour les sorties en soirée, avec des chauffeurs connaissant la baie de prise en charge de chaque tour.",
          de: "Ja, JBR-Bewohner nutzen Apex sowohl für den täglichen Arbeitsweg als auch für Abendfahrten, mit Chauffeuren, die die Abholbucht jedes Turms kennen.",
        },
      },
      {
        question: {
          en: "Can you book a chauffeur for visiting family staying at a JBR hotel?",
          ar: "هل يمكن حجز سائق لأفراد عائلة زائرين مقيمين في فندق في جي بي آر؟",
          ru: "Можно ли заказать шофёра для приезжающих родственников, проживающих в отеле JBR?",
          zh: "能否为入住JBR酒店的来访亲属预订司机?",
          fr: "Peut-on réserver un chauffeur pour de la famille en visite séjournant dans un hôtel de JBR ?",
          de: "Kann man einen Chauffeur für zu Besuch kommende Familienangehörige buchen, die in einem JBR-Hotel wohnen?",
        },
        answer: {
          en: "Yes, we regularly handle transport for visitors staying at JBR beachfront hotels, from airport transfers to daily sightseeing bookings.",
          ar: "نعم، نتعامل بانتظام مع نقل الزوار المقيمين في فنادق جي بي آر الشاطئية، من رحلات المطار إلى حجوزات المشاهدة اليومية.",
          ru: "Да, мы регулярно организуем транспорт для гостей, проживающих в пляжных отелях JBR — от трансферов из аэропорта до ежедневных экскурсий.",
          zh: "是的,我们经常为入住JBR海滨酒店的访客安排交通服务,涵盖从机场接送到每日观光预订的各类需求。",
          fr: "Oui, nous gérons régulièrement le transport des visiteurs séjournant dans les hôtels en bord de mer de JBR, des transferts aéroport aux réservations de visites quotidiennes.",
          de: "Ja, wir übernehmen regelmäßig den Transport für Besucher in den Strandhotels von JBR, von Flughafentransfers bis zu täglichen Besichtigungsbuchungen.",
        },
      },
      {
        question: {
          en: "Is it easy to book a same-day chauffeur while already in JBR?",
          ar: "هل من السهل حجز سائق في نفس اليوم أثناء التواجد في جي بي آر بالفعل؟",
          ru: "Легко ли заказать шофёра в тот же день, уже находясь в JBR?",
          zh: "已身处JBR时,能否轻松预订当日司机服务?",
          fr: "Est-il facile de réserver un chauffeur le jour même en étant déjà à JBR ?",
          de: "Ist es einfach, während des Aufenthalts in JBR noch am selben Tag einen Chauffeur zu buchen?",
        },
        answer: {
          en: "Yes, same-day bookings are straightforward via WhatsApp or our website — most are confirmed within minutes for pickups anywhere along the beachfront.",
          ar: "نعم، حجوزات نفس اليوم بسيطة عبر واتساب أو موقعنا الإلكتروني — يتم تأكيد معظمها خلال دقائق للاستقبال من أي مكان على طول الواجهة الشاطئية.",
          ru: "Да, бронирование в тот же день легко оформить через WhatsApp или наш сайт — большинство заявок подтверждаются в течение нескольких минут для посадки в любой точке набережной.",
          zh: "可以,通过WhatsApp或我们的网站即可轻松完成当日预订——大多数订单可在数分钟内确认,接客地点可为海滨沿线任意位置。",
          fr: "Oui, les réservations le jour même sont simples via WhatsApp ou notre site web — la plupart sont confirmées en quelques minutes pour une prise en charge n'importe où le long du front de mer.",
          de: "Ja, Buchungen am selben Tag sind über WhatsApp oder unsere Website unkompliziert — die meisten werden innerhalb weniger Minuten für Abholungen entlang der gesamten Strandpromenade bestätigt.",
        },
      },
    ],
    landmarks: ["The Walk JBR", "The Beach", "Bluewaters Island", "Ain Dubai", "JBR Beachfront"],
  },
  {
    slug: "dubai-international-airport-dxb",
    name: "Dubai International Airport (DXB)",
    tags: {
      en: ["Meet & Greet", "Flight Tracking", "Executive Pickup"],
      ar: ["استقبال شخصي", "تتبع الرحلات", "استقبال تنفيذي"],
      ru: ["Встреча в аэропорту", "Отслеживание рейсов", "VIP-встреча"],
      zh: ["专人接机", "航班追踪", "高管接送"],
      fr: ["Accueil personnalisé", "Suivi de vol", "Prise en charge exécutive"],
      de: ["Meet & Greet", "Flugverfolgung", "Executive-Abholung"],
    },
    image: {
      src: "/images/locations/dubai-international-airport-dxb.webp",
      alt: {
        en: "Emirates aircraft lined up at Dubai International Airport terminal",
        ar: "طائرات طيران الإمارات مصطفة عند صالة مطار دبي الدولي",
        ru: "Самолёты Emirates выстроились у терминала аэропорта Dubai International",
        zh: "阿联酋航空客机整齐停靠于迪拜国际机场航站楼",
        fr: "Avions Emirates alignés au terminal de l'aéroport international de Dubaï",
        de: "Emirates-Flugzeuge aufgereiht am Terminal des Dubai International Airport",
      },
    },
    tagline: {
      en: "Meet-and-greet, every arrival",
      ar: "استقبال شخصي، لكل وصول",
      ru: "Персональная встреча при каждом прилёте",
      zh: "每一次抵达,专人接机",
      fr: "Accueil personnalisé, à chaque arrivée",
      de: "Meet & Greet bei jeder Ankunft",
    },
    heroSubtitle: {
      en: "Chauffeur-driven transfers to and from Dubai International Airport, with live flight tracking on every booking.",
      ar: "نقل بسائق خاص من وإلى مطار دبي الدولي، مع تتبع مباشر للرحلات الجوية في كل حجز.",
      ru: "Трансферы с личным водителем до и от Dubai International Airport, с отслеживанием рейса в реальном времени в каждом бронировании.",
      zh: "提供往返迪拜国际机场的专属司机接送服务,每笔预订均配备航班实时追踪。",
      fr: "Transferts avec chauffeur privé vers et depuis l'aéroport international de Dubaï, avec suivi de vol en direct pour chaque réservation.",
      de: "Chauffeurgesteuerte Transfers zum und vom Dubai International Airport, mit Live-Flugverfolgung bei jeder Buchung.",
    },
    shortDescription: {
      en: "Meet-and-greet airport transfers to and from DXB, covering all three terminals.",
      ar: "نقل مطار باستقبال شخصي من وإلى مطار دبي الدولي، يغطي جميع الصالات الثلاث.",
      ru: "Трансферы с персональной встречей до и от DXB, охватывающие все три терминала.",
      zh: "提供往返DXB机场的专人接机服务,覆盖全部三座航站楼。",
      fr: "Transferts aéroport avec accueil personnalisé vers et depuis DXB, couvrant les trois terminaux.",
      de: "Meet-and-Greet-Flughafentransfers zum und vom DXB, alle drei Terminals abgedeckt.",
    },
    longDescription: {
      en: [
        "DXB is one of the busiest airports in the world, and a smooth arrival depends on details most services skip — knowing your terminal, tracking delays automatically, and having a chauffeur already positioned before you land. Apex covers all three DXB terminals with meet-and-greet service and name signage on every arrival.",
        "Business travel through DXB is a major share of what we handle — executives need a fast, discreet transfer straight to a Downtown or Business Bay hotel, and standing corporate accounts often route all international travel through the same driver pool and billing. Leisure travelers get equal attention, with a Rolls-Royce Phantom available to make an arrival part of the occasion.",
        "Downtown Dubai and Business Bay are both about 20 minutes from DXB, Dubai Marina and JBR around 30, and Palm Jumeirah roughly 35 given the added trunk-road distance. Departures get the same care, timed around your specific terminal and airline's check-in patterns, confirmed with you the evening before — with fixed pricing and 24/7 availability regardless of when your flight lands.",
      ],
      ar: [
        "يُعد مطار دبي الدولي (DXB) واحدًا من أكثر المطارات ازدحامًا في العالم، ويعتمد الوصول السلس على تفاصيل تتجاهلها معظم الخدمات — معرفة صالتك، وتتبع التأخيرات تلقائيًا، ووجود سائق متمركز بالفعل قبل هبوطك. تغطي Apex جميع صالات مطار دبي الدولي الثلاث بخدمة استقبال شخصي ولافتة تحمل اسمك في كل وصول.",
        "يشكل السفر التجاري عبر مطار دبي الدولي حصة كبيرة مما نتعامل معه — يحتاج التنفيذيون إلى نقل سريع وسري مباشرة إلى فندق في وسط المدينة أو الخليج التجاري، وغالبًا ما توجّه حسابات الشركات الدائمة كل السفر الدولي عبر نفس مجموعة السائقين والفوترة. يحظى المسافرون الترفيهيون باهتمام مماثل، مع توفر رولز رويس فانتوم لجعل الوصول جزءًا من المناسبة.",
        "يبعد كل من وسط مدينة دبي والخليج التجاري حوالي 20 دقيقة عن مطار دبي الدولي، بينما تبعد مرسى دبي وجي بي آر حوالي 30 دقيقة، ونخلة جميرا حوالي 35 دقيقة نظرًا للمسافة الإضافية على طريق الجذع. تحظى رحلات المغادرة بنفس العناية، بتوقيت يتناسب مع صالتك المحددة وأنماط تسجيل الوصول لشركة طيرانك، ويُؤكد معك في مساء اليوم السابق — بأسعار ثابتة وتوافر على مدار الساعة طوال أيام الأسبوع بغض النظر عن موعد هبوط رحلتك.",
      ],
      ru: [
        "DXB — один из самых загруженных аэропортов в мире, и гладкое прибытие зависит от деталей, которые большинство сервисов упускают: знание вашего терминала, автоматическое отслеживание задержек и шофёр, уже находящийся на месте до вашей посадки. Apex обслуживает все три терминала DXB с персональной встречей и табличкой с именем при каждом прилёте.",
        "Деловые поездки через DXB составляют значительную часть нашей работы — руководителям нужен быстрый, незаметный трансфер прямо в отель Downtown или Business Bay, а постоянные корпоративные клиенты часто направляют все международные поездки через один и тот же пул водителей с единым выставлением счетов. Путешественникам, отдыхающим, уделяется не меньше внимания — доступен Rolls-Royce Phantom, чтобы сделать прибытие частью торжества.",
        "Downtown Dubai и Business Bay находятся примерно в 20 минутах от DXB, Dubai Marina и JBR — около 30, а Palm Jumeirah — примерно 35 минут с учётом дополнительного расстояния по стволовой дороге. Вылетам уделяется такое же внимание — время рассчитывается с учётом вашего конкретного терминала и порядка регистрации авиакомпании, подтверждается с вами накануне вечером — с фиксированной ценой и доступностью 24/7 независимо от времени посадки вашего рейса.",
      ],
      zh: [
        "DXB是全球最繁忙的机场之一,顺畅的抵达体验取决于大多数服务商忽略的细节——准确掌握您的航站楼、自动追踪航班延误,并确保司机在您降落前已就位等候。Apex覆盖DXB全部三座航站楼,每次抵达均提供专人接机及姓名接机牌服务。",
        "经由DXB的商务出行占我们业务的很大比重——高管需要快速、低调地直达市中心或商业湾酒店,而长期企业客户通常将所有国际差旅纳入同一司机团队及统一账单管理。休闲旅客同样享有周到关照,可选用劳斯莱斯幻影,让抵达本身成为旅程亮点的一部分。",
        "迪拜市中心与商业湾距DXB车程均约20分钟,迪拜码头与JBR约30分钟,棕榈岛因主干道额外距离约需35分钟。出发行程同样细致安排,根据您具体的航站楼及所属航空公司的值机习惯合理规划时间,并于前一晚与您确认——全天候24小时提供固定价格服务,无论航班何时降落均一视同仁。",
      ],
      fr: [
        "DXB est l'un des aéroports les plus fréquentés au monde, et une arrivée fluide dépend de détails que la plupart des services négligent — connaître votre terminal, suivre automatiquement les retards, et avoir un chauffeur déjà positionné avant votre atterrissage. Apex couvre les trois terminaux de DXB avec un service d'accueil personnalisé et une pancarte à votre nom à chaque arrivée.",
        "Les voyages d'affaires via DXB représentent une part importante de notre activité — les cadres ont besoin d'un transfert rapide et discret directement vers un hôtel de Downtown ou de Business Bay, et les comptes d'entreprise permanents font souvent transiter tous leurs voyages internationaux par le même pool de chauffeurs et la même facturation. Les voyageurs de loisirs reçoivent la même attention, avec une Rolls-Royce Phantom disponible pour faire de l'arrivée un moment de l'occasion elle-même.",
        "Downtown Dubai et Business Bay sont tous deux à environ 20 minutes de DXB, Dubai Marina et JBR à environ 30 minutes, et Palm Jumeirah environ 35 minutes compte tenu de la distance supplémentaire du tronc. Les départs bénéficient du même soin, calés sur votre terminal spécifique et les habitudes d'enregistrement de votre compagnie aérienne, confirmés avec vous la veille au soir — avec un tarif fixe et une disponibilité 24h/24 et 7j/7, quelle que soit l'heure d'atterrissage de votre vol.",
      ],
      de: [
        "Der DXB ist einer der verkehrsreichsten Flughäfen der Welt, und eine reibungslose Ankunft hängt von Details ab, die die meisten Dienste übersehen — das Wissen um Ihr Terminal, die automatische Verfolgung von Verspätungen und ein Chauffeur, der bereits vor Ihrer Landung positioniert ist. Apex deckt alle drei DXB-Terminals mit Meet-and-Greet-Service und Namensschild bei jeder Ankunft ab.",
        "Geschäftsreisen über den DXB machen einen großen Teil unseres Geschäfts aus — Führungskräfte benötigen einen schnellen, diskreten Transfer direkt zu einem Hotel in Downtown oder Business Bay, und feste Firmenkunden leiten internationale Reisen oft über denselben Fahrerpool und dieselbe Abrechnung. Freizeitreisende erhalten die gleiche Aufmerksamkeit, mit einem Rolls-Royce Phantom, der die Ankunft selbst zu einem Teil des Anlasses macht.",
        "Downtown Dubai und Business Bay sind beide etwa 20 Minuten vom DXB entfernt, Dubai Marina und JBR etwa 30, und Palm Jumeirah aufgrund der zusätzlichen Strecke auf der Stammstraße etwa 35 Minuten. Abflüge erhalten die gleiche Sorgfalt, zeitlich abgestimmt auf Ihr spezifisches Terminal und die Check-in-Gewohnheiten Ihrer Fluggesellschaft, am Vorabend mit Ihnen bestätigt — mit Festpreisen und 24/7-Verfügbarkeit, unabhängig davon, wann Ihr Flug landet.",
      ],
    },
    isAirport: true,
    popularRoutes: [
      {
        from: "DXB Airport",
        to: "Downtown Dubai",
        duration: { en: "~20 min", ar: "~20 دقيقة", ru: "~20 мин", zh: "~20分钟", fr: "~20 min", de: "~20 Min." },
      },
      {
        from: "DXB Airport",
        to: "Business Bay",
        duration: { en: "~20 min", ar: "~20 دقيقة", ru: "~20 мин", zh: "~20分钟", fr: "~20 min", de: "~20 Min." },
      },
      {
        from: "DXB Airport",
        to: "Dubai Marina",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
      {
        from: "DXB Airport",
        to: "Palm Jumeirah",
        duration: { en: "~35 min", ar: "~35 دقيقة", ru: "~35 мин", zh: "~35分钟", fr: "~35 min", de: "~35 Min." },
      },
      {
        from: "DXB Airport",
        to: "JBR",
        duration: { en: "~30 min", ar: "~30 دقيقة", ru: "~30 мин", zh: "~30分钟", fr: "~30 min", de: "~30 Min." },
      },
    ],
    whyChoose: {
      en: [
        "Full coverage across all three DXB terminals, for arrivals and departures alike",
        "Live flight tracking adjusts your pickup time automatically for any delay",
        "Genuine meet-and-greet service with name signage in the arrivals hall",
        "Realistic departure timing based on your specific terminal and airline",
        "Distinctive arrival vehicles available for honeymoons and milestone celebration trips",
        "Coordinated multi-vehicle pickups available for delegations and larger group arrivals",
      ],
      ar: [
        "تغطية كاملة عبر جميع صالات مطار دبي الدولي الثلاث، للوصول والمغادرة على حد سواء",
        "يعدّل تتبع الرحلات المباشر موعد استقبالك تلقائيًا مع أي تأخير",
        "خدمة استقبال شخصي حقيقية مع لافتة تحمل اسمك في صالة الوصول",
        "توقيت مغادرة واقعي بناءً على صالتك المحددة وشركة طيرانك",
        "سيارات وصول مميزة متاحة لرحلات شهر العسل ومناسبات الاحتفال بالإنجازات",
        "استقبالات منسقة متعددة السيارات متاحة للوفود ووصول المجموعات الكبيرة",
      ],
      ru: [
        "Полное покрытие всех трёх терминалов DXB — как для прилётов, так и для вылетов",
        "Отслеживание рейса в реальном времени автоматически корректирует время подачи при любой задержке",
        "Настоящая персональная встреча с табличкой с именем в зале прилёта",
        "Реалистичный расчёт времени вылета с учётом конкретного терминала и авиакомпании",
        "Доступны эксклюзивные автомобили для медового месяца и празднования знаковых событий",
        "Организованная встреча несколькими автомобилями для делегаций и крупных групп",
      ],
      zh: [
        "全面覆盖DXB全部三座航站楼,抵达与出发行程均可提供服务",
        "航班实时追踪,自动根据任何延误调整接机时间",
        "在到达大厅提供真正的专人接机及姓名接机牌服务",
        "根据您具体的航站楼及航空公司合理规划出发行程时间",
        "为蜜月旅行及重要庆典行程提供独具风格的接机车型",
        "为代表团及大型团体抵达提供统一协调的多车接送服务",
      ],
      fr: [
        "Couverture complète des trois terminaux de DXB, tant pour les arrivées que pour les départs",
        "Le suivi de vol en direct ajuste automatiquement votre heure de prise en charge en cas de retard",
        "Un véritable service d'accueil personnalisé avec pancarte nominative dans le hall des arrivées",
        "Un timing de départ réaliste basé sur votre terminal et votre compagnie aérienne spécifiques",
        "Des véhicules d'arrivée distinctifs disponibles pour les voyages de noces et les célébrations d'étapes importantes",
        "Des prises en charge coordonnées à plusieurs véhicules disponibles pour les délégations et les arrivées de grands groupes",
      ],
      de: [
        "Volle Abdeckung aller drei DXB-Terminals, für Ankünfte wie Abflüge gleichermaßen",
        "Live-Flugverfolgung passt Ihre Abholzeit bei jeder Verspätung automatisch an",
        "Echter Meet-and-Greet-Service mit Namensschild in der Ankunftshalle",
        "Realistische Abflugzeiten basierend auf Ihrem spezifischen Terminal und Ihrer Fluggesellschaft",
        "Besondere Ankunftsfahrzeuge für Flitterwochen und Feiern zu besonderen Anlässen verfügbar",
        "Koordinierte Abholungen mit mehreren Fahrzeugen für Delegationen und größere Gruppenankünfte verfügbar",
      ],
    },
    faqs: [
      {
        question: {
          en: "Which DXB terminals do you cover?",
          ar: "أي صالات مطار دبي الدولي تغطونها؟",
          ru: "Какие терминалы DXB вы обслуживаете?",
          zh: "你们覆盖DXB哪些航站楼?",
          fr: "Quels terminaux de DXB couvrez-vous ?",
          de: "Welche DXB-Terminals decken Sie ab?",
        },
        answer: {
          en: "All three DXB terminals — Terminal 1, 2, and 3 — are covered for both arrivals and departures.",
          ar: "جميع صالات مطار دبي الدولي الثلاث — الصالة 1 و2 و3 — مغطاة لكل من الوصول والمغادرة.",
          ru: "Обслуживаются все три терминала DXB — Терминал 1, 2 и 3 — как для прилётов, так и для вылетов.",
          zh: "DXB全部三座航站楼——1号、2号及3号航站楼——均涵盖抵达与出发服务。",
          fr: "Les trois terminaux de DXB — Terminal 1, 2 et 3 — sont couverts pour les arrivées comme pour les départs.",
          de: "Alle drei DXB-Terminals — Terminal 1, 2 und 3 — werden für Ankünfte und Abflüge abgedeckt.",
        },
      },
      {
        question: {
          en: "What if my flight into DXB is delayed?",
          ar: "ماذا لو تأخرت رحلتي إلى مطار دبي الدولي؟",
          ru: "Что если мой рейс в DXB задержится?",
          zh: "如果我的DXB航班延误怎么办?",
          fr: "Que se passe-t-il si mon vol vers DXB est retardé ?",
          de: "Was passiert, wenn mein Flug zum DXB Verspätung hat?",
        },
        answer: {
          en: "We track your flight automatically and adjust your pickup time at no extra charge.",
          ar: "نتابع رحلتك تلقائيًا ونعدّل موعد استقبالك دون أي رسوم إضافية.",
          ru: "Мы автоматически отслеживаем ваш рейс и бесплатно корректируем время подачи.",
          zh: "我们会自动追踪您的航班,并免费调整接机时间。",
          fr: "Nous suivons votre vol automatiquement et ajustons votre heure de prise en charge sans frais supplémentaires.",
          de: "Wir verfolgen Ihren Flug automatisch und passen Ihre Abholzeit ohne Aufpreis an.",
        },
      },
      {
        question: {
          en: "How early should I be picked up for a DXB departure?",
          ar: "متى يجب أن يتم استقبالي مبكرًا لمغادرة من مطار دبي الدولي؟",
          ru: "За сколько времени меня должны забрать перед вылетом из DXB?",
          zh: "从DXB出发,应提前多久安排接送?",
          fr: "Combien de temps à l'avance dois-je être pris en charge pour un départ depuis DXB ?",
          de: "Wie früh sollte ich für einen Abflug ab DXB abgeholt werden?",
        },
        answer: {
          en: "We build in a buffer based on your terminal and airline's typical check-in times, confirmed with you the evening before.",
          ar: "نضيف هامشًا زمنيًا بناءً على صالتك وأوقات تسجيل الوصول المعتادة لشركة طيرانك، ونؤكد ذلك معك في مساء اليوم السابق.",
          ru: "Мы закладываем запас времени с учётом вашего терминала и типичного времени регистрации вашей авиакомпании, подтверждая это с вами накануне вечером.",
          zh: "我们会根据您的航站楼及所属航空公司通常的值机时间预留缓冲,并于前一晚与您确认具体安排。",
          fr: "Nous prévoyons une marge basée sur votre terminal et les horaires d'enregistrement habituels de votre compagnie aérienne, confirmée avec vous la veille au soir.",
          de: "Wir planen einen Zeitpuffer basierend auf Ihrem Terminal und den üblichen Check-in-Zeiten Ihrer Fluggesellschaft ein, bestätigt am Vorabend mit Ihnen.",
        },
      },
      {
        question: {
          en: "Do you offer meet-and-greet service at DXB?",
          ar: "هل تقدمون خدمة الاستقبال الشخصي في مطار دبي الدولي؟",
          ru: "Предлагаете ли вы услугу персональной встречи в DXB?",
          zh: "你们在DXB是否提供专人接机服务?",
          fr: "Proposez-vous un service d'accueil personnalisé à DXB ?",
          de: "Bieten Sie einen Meet-and-Greet-Service am DXB an?",
        },
        answer: {
          en: "Yes, your chauffeur waits in the arrivals hall with name signage and helps with luggage.",
          ar: "نعم، ينتظر سائقك في صالة الوصول بلافتة تحمل اسمك ويساعد في حمل الأمتعة.",
          ru: "Да, ваш шофёр ждёт в зале прилёта с табличкой с именем и помогает с багажом.",
          zh: "是的,您的司机会在到达大厅举牌等候,并协助搬运行李。",
          fr: "Oui, votre chauffeur vous attend dans le hall des arrivées avec une pancarte à votre nom et vous aide avec vos bagages.",
          de: "Ja, Ihr Chauffeur wartet mit Namensschild in der Ankunftshalle und hilft beim Gepäck.",
        },
      },
      {
        question: {
          en: "Can you arrange a special vehicle for a honeymoon or celebration arrival?",
          ar: "هل يمكنكم ترتيب سيارة مميزة لوصول شهر عسل أو احتفال؟",
          ru: "Можете ли вы предоставить особый автомобиль для медового месяца или праздничного прибытия?",
          zh: "能否为蜜月旅行或庆典抵达安排特别车型?",
          fr: "Pouvez-vous organiser un véhicule spécial pour une arrivée de lune de miel ou de célébration ?",
          de: "Können Sie ein besonderes Fahrzeug für eine Flitterwochen- oder Feieranreise organisieren?",
        },
        answer: {
          en: "Yes, a Rolls-Royce Phantom can be arranged for arrivals where the vehicle itself is part of the occasion.",
          ar: "نعم، يمكن ترتيب رولز رويس فانتوم للوصول حيث تكون السيارة نفسها جزءًا من المناسبة.",
          ru: "Да, для прибытий, где сам автомобиль становится частью торжества, можно организовать Rolls-Royce Phantom.",
          zh: "可以,若希望座驾本身成为旅程亮点的一部分,可安排劳斯莱斯幻影接机。",
          fr: "Oui, une Rolls-Royce Phantom peut être organisée pour les arrivées où le véhicule lui-même fait partie de l'occasion.",
          de: "Ja, für Ankünfte, bei denen das Fahrzeug selbst Teil des Anlasses ist, kann ein Rolls-Royce Phantom arrangiert werden.",
        },
      },
      {
        question: {
          en: "Can you coordinate pickups for a group arriving on the same or different flights?",
          ar: "هل يمكنكم تنسيق الاستقبال لمجموعة تصل على نفس الرحلة أو رحلات مختلفة؟",
          ru: "Можете ли вы скоординировать встречу группы, прибывающей одним или разными рейсами?",
          zh: "能否协调接送乘坐同一航班或不同航班抵达的团队?",
          fr: "Pouvez-vous coordonner les prises en charge pour un groupe arrivant sur le même vol ou des vols différents ?",
          de: "Können Sie Abholungen für eine Gruppe koordinieren, die mit demselben oder unterschiedlichen Flügen ankommt?",
        },
        answer: {
          en: "Yes, we regularly coordinate multi-vehicle pickups for delegations and groups arriving together or across a cluster of flights.",
          ar: "نعم، ننسق بانتظام استقبالات متعددة السيارات للوفود والمجموعات الواصلة معًا أو عبر مجموعة من الرحلات.",
          ru: "Да, мы регулярно координируем встречу несколькими автомобилями для делегаций и групп, прибывающих вместе или несколькими рейсами.",
          zh: "可以,我们经常为共同抵达或分批乘坐多个航班的代表团及团体协调多车接机服务。",
          fr: "Oui, nous coordonnons régulièrement des prises en charge multi-véhicules pour des délégations et des groupes arrivant ensemble ou sur plusieurs vols.",
          de: "Ja, wir koordinieren regelmäßig Abholungen mit mehreren Fahrzeugen für Delegationen und Gruppen, die gemeinsam oder über mehrere Flüge verteilt ankommen.",
        },
      },
      {
        question: {
          en: "Do you offer transfers for transiting or connecting passengers with a long layover?",
          ar: "هل تقدمون نقلاً للمسافرين العابرين أو ذوي رحلات الربط الذين لديهم توقف طويل؟",
          ru: "Предлагаете ли вы трансферы для транзитных пассажиров с длительной стыковкой?",
          zh: "是否为长时间中转或转机的旅客提供接送服务?",
          fr: "Proposez-vous des transferts pour les passagers en transit ou en correspondance avec une longue escale ?",
          de: "Bieten Sie Transfers für Transit- oder Anschlusspassagiere mit langem Aufenthalt an?",
        },
        answer: {
          en: "Yes, transiting passengers with a long enough layover often book a transfer into the city and back — just let us know your full itinerary when booking.",
          ar: "نعم، غالبًا ما يحجز المسافرون العابرون الذين لديهم توقف طويل بما يكفي نقلاً إلى المدينة والعودة — فقط أخبرنا بخط سيرك الكامل عند الحجز.",
          ru: "Да, транзитные пассажиры с достаточно длительной стыковкой часто заказывают трансфер в город и обратно — просто сообщите нам весь маршрут при бронировании.",
          zh: "可以,中转时间充裕的旅客通常会预订往返市区的接送服务——预订时请告知我们您完整的行程安排。",
          fr: "Oui, les passagers en transit avec une escale suffisamment longue réservent souvent un transfert vers la ville et retour — indiquez-nous simplement votre itinéraire complet lors de la réservation.",
          de: "Ja, Transitpassagiere mit ausreichend langem Aufenthalt buchen häufig einen Transfer in die Stadt und zurück — teilen Sie uns bei der Buchung einfach Ihre vollständige Reiseroute mit.",
        },
      },
      {
        question: {
          en: "How does pricing work for a DXB transfer compared to other airport services?",
          ar: "كيف تعمل التسعيرة لنقل مطار دبي الدولي مقارنة بخدمات المطار الأخرى؟",
          ru: "Как формируется цена на трансфер DXB по сравнению с другими аэропортовыми услугами?",
          zh: "DXB接送服务与其他机场服务相比,定价方式有何不同?",
          fr: "Comment fonctionne la tarification pour un transfert DXB par rapport à d'autres services aéroport ?",
          de: "Wie funktioniert die Preisgestaltung für einen DXB-Transfer im Vergleich zu anderen Flughafendiensten?",
        },
        answer: {
          en: "Pricing is fixed and quoted up front regardless of traffic or minor delays, so there's no surge pricing or metered surprise at the end of the trip.",
          ar: "التسعير ثابت ويُذكر مسبقًا بغض النظر عن حركة المرور أو التأخيرات البسيطة، لذا لا توجد زيادة في الأسعار أو مفاجأة في العداد في نهاية الرحلة.",
          ru: "Цена фиксированная и указывается заранее независимо от трафика или небольших задержек, поэтому никаких наценок или сюрпризов на счётчике в конце поездки.",
          zh: "无论路况或轻微延误,价格均为固定预先报价,行程结束时不会出现涨价或计价器带来的意外费用。",
          fr: "Le tarif est fixe et communiqué à l'avance, quelle que soit la circulation ou les retards mineurs, donc pas de majoration ni de surprise au compteur à la fin du trajet.",
          de: "Der Preis ist fest und wird im Voraus genannt, unabhängig von Verkehr oder kleineren Verspätungen — keine Preiserhöhung und keine Taxameter-Überraschung am Ende der Fahrt.",
        },
      },
      {
        question: {
          en: "Can I book a DXB transfer for very early morning or overnight flights?",
          ar: "هل يمكنني حجز نقل مطار دبي الدولي لرحلات الصباح الباكر جدًا أو الليلية؟",
          ru: "Можно ли забронировать трансфер DXB на очень ранний утренний или ночной рейс?",
          zh: "可以预订DXB接送服务用于清晨或深夜航班吗?",
          fr: "Puis-je réserver un transfert DXB pour des vols très tôt le matin ou de nuit ?",
          de: "Kann ich einen DXB-Transfer für sehr frühe Morgen- oder Nachtflüge buchen?",
        },
        answer: {
          en: "Yes, DXB transfers are available 24/7 at the same fixed pricing, whether your flight lands at 3 a.m. or departs at midnight.",
          ar: "نعم، تتوفر نقلات مطار دبي الدولي على مدار الساعة طوال أيام الأسبوع بنفس السعر الثابت، سواء هبطت رحلتك الساعة 3 صباحًا أو غادرت عند منتصف الليل.",
          ru: "Да, трансферы DXB доступны 24/7 по той же фиксированной цене — независимо от того, приземляется ли ваш рейс в 3 часа ночи или вылетает в полночь.",
          zh: "可以,DXB接送服务全天24小时提供,价格保持一致,无论您的航班是凌晨3点降落还是午夜起飞。",
          fr: "Oui, les transferts DXB sont disponibles 24h/24 et 7j/7 au même tarif fixe, que votre vol atterrisse à 3 h du matin ou décolle à minuit.",
          de: "Ja, DXB-Transfers sind rund um die Uhr zum gleichen Festpreis verfügbar, egal ob Ihr Flug um 3 Uhr morgens landet oder um Mitternacht abfliegt.",
        },
      },
    ],
    landmarks: ["Terminal 1", "Terminal 2", "Terminal 3", "Dubai Duty Free", "DXB Arrivals Hall"],
  },
];

function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}

export interface PlainLocationImage {
  src: string;
  alt: string;
}

export interface PlainLocation {
  slug: string;
  name: string;
  tagline: string;
  heroSubtitle: string;
  shortDescription: string;
  longDescription: string[];
  isAirport: boolean;
  popularRoutes: { from: string; to: string; duration: string }[];
  whyChoose: string[];
  faqs: { question: string; answer: string }[];
  landmarks: string[];
  image: PlainLocationImage;
  heroDesktopImage?: PlainLocationImage;
  heroMobileImage?: PlainLocationImage;
  heroObjectPosition?: string;
  tags: string[];
}

export function localizeLocation(location: Location, locale: Locale): PlainLocation {
  return {
    slug: location.slug,
    name: location.name,
    tagline: pick(location.tagline, locale),
    heroSubtitle: pick(location.heroSubtitle, locale),
    shortDescription: pick(location.shortDescription, locale),
    longDescription: pick(location.longDescription, locale),
    isAirport: location.isAirport,
    popularRoutes: location.popularRoutes.map((route) => ({
      from: route.from,
      to: route.to,
      duration: pick(route.duration, locale),
    })),
    whyChoose: pick(location.whyChoose, locale),
    faqs: location.faqs.map((faq) => ({
      question: pick(faq.question, locale),
      answer: pick(faq.answer, locale),
    })),
    landmarks: location.landmarks,
    image: { src: location.image.src, alt: pick(location.image.alt, locale) },
    heroDesktopImage: location.heroDesktopImage
      ? { src: location.heroDesktopImage.src, alt: pick(location.heroDesktopImage.alt, locale) }
      : undefined,
    heroMobileImage: location.heroMobileImage
      ? { src: location.heroMobileImage.src, alt: pick(location.heroMobileImage.alt, locale) }
      : undefined,
    heroObjectPosition: location.heroObjectPosition,
    tags: pick(location.tags, locale),
  };
}

export function getAllLocations(locale: Locale): PlainLocation[] {
  return LOCATIONS.map((location) => localizeLocation(location, locale));
}

export function getLocationBySlug(slug: string, locale: Locale): PlainLocation | undefined {
  const location = LOCATIONS.find((l) => l.slug === slug);
  return location ? localizeLocation(location, locale) : undefined;
}

import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/i18n-types";

export type FleetCategory = "Sedan" | "SUV" | "Van" | "Ultra-Luxury";

export interface VehicleFAQ {
  question: Localized;
  answer: Localized;
}

export interface VehicleImage {
  src: string;
  alt: Localized;
}

/**
 * Real photography for a vehicle, in the exact order the photos should be
 * shown. Optional — vehicles without this field fall back to the existing
 * icon/gradient treatment, so adding photos for one vehicle never affects
 * the others. Index 0 is always the primary/hero image (used for the fleet
 * card cover and the vehicle detail page hero); any remaining entries are
 * gallery images shown in the same order they appear in the array.
 */
export type VehicleImages = VehicleImage[];

/**
 * Chauffeur-hire rates in AED shown on the homepage fleet carousel.
 *
 * ⚠️ PLACEHOLDER VALUES — the figures currently in this file are sample
 * prices based on typical Dubai chauffeur market rates, added for layout
 * review only. Replace every value with confirmed Apex Limo pricing
 * before treating them as real quotes.
 */
export interface VehicleRates {
  /** Full-day hire (10 hours), AED */
  tenHours: number;
  /** Half-day hire (5 hours), AED */
  fiveHours: number;
  /** Hourly hire (1 hour), AED */
  oneHour: number;
  /** Airport transfer (one way), AED */
  airport: number;
  /** Each additional hour beyond a booked package, AED */
  extraHour: number;
  /** Surcharge for an additional city/emirate on the same booking, AED */
  additionalCity: number;
}

export interface FleetVehicle {
  slug: string;
  /** Proper noun — kept unchanged across all locales by requirement. */
  name: string;
  /** Manufacturer label, e.g. "Rolls-Royce" — proper noun, invariant. */
  brand: string;
  /** Model name without the brand, e.g. "Phantom" — proper noun, invariant. */
  model: string;
  /** See VehicleRates — currently PLACEHOLDER sample figures. */
  rates: VehicleRates;
  category: FleetCategory;
  /** Marks a fully electric vehicle — orthogonal to `category` (a Tesla is
   *  still a "SUV" or "Sedan" body style), used only to power the
   *  /fleet/electric category listing. */
  isElectric?: boolean;
  tagline: Localized;
  description: Localized;
  longDescription: Localized;
  passengers: number;
  luggage: number;
  idealFor: Localized;
  features: Localized<string[]>;
  whyChoose: Localized<string[]>;
  faqs: VehicleFAQ[];
  images?: VehicleImages;
  /**
   * Tasteful luxury status badge shown on the Fleet listing card — set on a
   * handful of standout vehicles only, not every entry, so it stays a
   * meaningful signal rather than clutter. e.g. "Executive Favorite",
   * "VIP Choice", "Most Popular", "Corporate Preferred", "Wedding Favorite".
   */
  badge?: Localized;
  /**
   * Marks an entry added to reach full fleet-listing coverage ahead of
   * real photography/copy being finalized. Placeholder vehicles render
   * with the existing icon/gradient gallery fallback (no `images`) and a
   * small "Preview" badge — swap in real photos and this flag can be
   * removed. Not rendered anywhere as a claim about vehicle availability.
   */
  isPlaceholder?: boolean;
}

export const FLEET: FleetVehicle[] = [
  {
    slug: "mercedes-maybach-s-class",
    brand: "Mercedes-Maybach",
    model: "S-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 5000, fiveHours: 3000, oneHour: 800, airport: 1000, extraHour: 650, additionalCity: 650 },
    images: [
      {
        src: "/images/fleet/mercedes-maybach-s-class/mercedes-maybach-s-class-1.png",
        alt: {
          en: "Two-tone white and black Mercedes-Maybach S-Class front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لمرسيدس مايباخ S-Class بلونين أبيض وأسود في صالة عرض بأرضية رخامية",
          ru: "Двухцветный бело-чёрный Mercedes-Maybach S-Class спереди сбоку в шоуруме с мраморным полом",
          zh: "黑白双色梅赛德斯迈巴赫S级前四分之三视角,置身大理石地面展厅",
          fr: "Mercedes-Maybach Classe S bicolore blanc et noir vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Zweifarbige Mercedes-Maybach S-Klasse in Weiß und Schwarz in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/mercedes-maybach-s-class/mercedes-maybach-s-class-2.png",
        alt: {
          en: "Mercedes-Maybach S-Class rear cabin with cognac diamond-quilted leather and reclining seat",
          ar: "المقصورة الخلفية لمرسيدس مايباخ S-Class بجلد مبطن على شكل ماسي بلون الكونياك ومقعد قابل للاستلقاء",
          ru: "Задний салон Mercedes-Maybach S-Class с кожей цвета коньяк в ромбовидной стёжке и раскладным сиденьем",
          zh: "梅赛德斯迈巴赫S级后舱,干邑色菱形绗缝真皮及可放倒座椅",
          fr: "Habitacle arrière de la Mercedes-Maybach Classe S en cuir matelassé losange cognac avec siège inclinable",
          de: "Fondkabine der Mercedes-Maybach S-Klasse mit rautengestepptem Cognac-Leder und Liegesitz",
        },
      },
      {
        src: "/images/fleet/mercedes-maybach-s-class/mercedes-maybach-s-class-3.png",
        alt: {
          en: "Mercedes-Maybach S-Class rear headrest pillows and polished centre divider with ambient lighting",
          ar: "وسائد مساند الرأس الخلفية في مرسيدس مايباخ S-Class وفاصل أوسط مصقول مع إضاءة محيطية",
          ru: "Подушки подголовников и полированный центральный разделитель Mercedes-Maybach S-Class с атмосферной подсветкой",
          zh: "梅赛德斯迈巴赫S级后排头枕软垫及抛光中央隔断,配氛围灯光",
          fr: "Coussins d appuie-tête arrière de la Mercedes-Maybach Classe S et séparation centrale polie avec éclairage d ambiance",
          de: "Kopfstützenkissen im Fond der Mercedes-Maybach S-Klasse und polierter Mitteltrenner mit Ambientebeleuchtung",
        },
      },
    ],    name: "Mercedes-Maybach S-Class",
    category: "Ultra-Luxury",
    tagline: {
      en: "Maybach-level hush and presence",
      ar: "هدوء وحضور بمستوى مايباخ",
      ru: "Тишина и статус уровня Maybach",
      zh: "迈巴赫级的静谧与气场",
      fr: "Le silence et la présence, version Maybach",
      de: "Ruhe und Präsenz auf Maybach-Niveau",
    },
    description: {
      en: "The most exclusive sedan in the fleet — extended rear legroom, reclining executive seats, and a cabin engineered for complete calm on longer journeys.",
      ar: "السيارة الأكثر تميزًا في الأسطول — مساحة إضافية للأرجل في المقاعد الخلفية، ومقاعد تنفيذية قابلة للإمالة، ومقصورة مصممة لتوفير هدوء تام في الرحلات الطويلة.",
      ru: "Самый эксклюзивный седан в автопарке — увеличенное пространство для ног сзади, откидывающиеся представительские сиденья и салон, созданный для полного спокойствия в долгих поездках.",
      zh: "车队中最尊贵的轿车——后排腿部空间更为宽敞,配备可躺式行政座椅,座舱专为长途旅程的极致宁静而设计。",
      fr: "La berline la plus exclusive de la flotte — espace pour les jambes à l'arrière accru, sièges executive inclinables et habitacle conçu pour un calme absolu sur les longs trajets.",
      de: "Die exklusivste Limousine der Flotte — zusätzlicher Beinraum im Fond, verstellbare Executive-Sitze und eine Kabine, die auf vollkommene Ruhe bei längeren Fahrten ausgelegt ist.",
    },
    longDescription: {
      en: "The Maybach S-Class takes everything that makes the S-Class the executive standard and elevates it further — an extended wheelbase, fully reclining rear executive seats, and cabin insulation tuned for near-total silence. Every journey is chauffeur-driven, so you step in and the outside world simply falls away: adjust your individual climate zone, draw the privacy curtains, and let the Burmester sound system fill the cabin at whatever volume suits the moment. It's reserved for clients who want the very top of the fleet — the vehicle of choice for signature executive arrivals, high-profile guests, and journeys where nothing about the ride should compete for attention. Bespoke welcome amenities and a dedicated professional chauffeur are included as standard, not an upgrade.",
      ar: "تأخذ مايباخ S-Class كل ما يجعل من S-Class المعيار التنفيذي وترتقي به أكثر — قاعدة عجلات ممتدة، ومقاعد تنفيذية خلفية قابلة للإمالة الكاملة، وعزل للمقصورة مضبوط لتحقيق هدوء شبه تام. كل رحلة تتم بسائق خاص، فما إن تدخل حتى يتلاشى العالم الخارجي ببساطة: اضبطوا منطقة التحكم الفردية بدرجة الحرارة، واسحبوا ستائر الخصوصية، ودعوا نظام الصوت Burmester يملأ المقصورة بأي مستوى صوت يناسب اللحظة. إنها مخصصة للعملاء الراغبين في الحصول على قمة الأسطول — السيارة المفضلة للوصولات التنفيذية المميزة، وكبار الضيوف، والرحلات التي يجب ألا يزاحم فيها أي شيء آخر انتباهكم عن الرحلة نفسها. تُقدَّم وسائل الترحيب المخصصة وسائق خاص محترف كجزء أساسي، لا كترقية إضافية.",
      ru: "Maybach S-Class берёт всё, что делает S-Class эталоном представительского класса, и поднимает планку ещё выше — увеличенная колёсная база, полностью откидывающиеся задние представительские сиденья и звукоизоляция салона, настроенная почти на полную тишину. Каждая поездка проходит с личным водителем, поэтому стоит вам сесть в машину — и внешний мир просто исчезает: настройте свою индивидуальную климат-зону, задёрните шторки приватности и позвольте акустической системе Burmester наполнить салон звуком той громкости, что подходит моменту. Этот автомобиль зарезервирован для клиентов, желающих получить самое лучшее из автопарка — выбор для знаковых представительских прибытий, высокопоставленных гостей и поездок, где ничто не должно отвлекать внимание от самой поездки. Индивидуальные приветственные подарки и личный профессиональный шофёр включены по умолчанию, а не как дополнительная опция.",
      zh: "迈巴赫S级将S级作为行政标准的一切特质进一步升华——加长轴距、可完全躺平的后排行政座椅,以及经过精心调校、近乎全静音的座舱隔音效果。每一次出行均配有专属司机,您只需上车,外界的一切便随之淡去:调节您的独立温区、拉上隐私窗帘,让柏林之声(Burmester)音响系统以适合当下氛围的音量充盈整个座舱。这款车型专为追求车队巅峰体验的客户而设,是重要行政抵达、贵宾接待以及那些不容任何干扰的旅程的首选座驾。定制欢迎礼遇与专属专业司机均为标准配置,而非额外升级项目。",
      fr: "La Maybach Classe S reprend tout ce qui fait de la Classe S la référence executive et l'élève encore davantage — un empattement allongé, des sièges executive arrière entièrement inclinables et une insulation d'habitacle calibrée pour un silence quasi total. Chaque trajet se fait avec chauffeur, si bien qu'à peine installé, le monde extérieur s'efface simplement : ajustez votre zone climatique individuelle, tirez les rideaux d'intimité et laissez le système audio Burmester emplir l'habitacle au volume qui convient à l'instant. Elle est réservée aux clients recherchant le sommet de la flotte — le véhicule de choix pour les arrivées executive marquantes, les invités de marque et les trajets où rien ne doit détourner l'attention du voyage lui-même. Des attentions de bienvenue sur mesure et un chauffeur professionnel dédié sont inclus en standard, non en option.",
      de: "Die Maybach S-Klasse nimmt alles, was die S-Klasse zum Executive-Standard macht, und hebt es noch weiter an — ein verlängerter Radstand, voll verstellbare hintere Executive-Sitze und eine Kabinendämmung, die auf nahezu vollständige Stille abgestimmt ist. Jede Fahrt erfolgt mit Chauffeur, sodass die Außenwelt beim Einsteigen einfach verschwindet: Stellen Sie Ihre individuelle Klimazone ein, ziehen Sie die Sichtschutzvorhänge zu, und lassen Sie das Burmester-Soundsystem die Kabine mit der zur jeweiligen Stimmung passenden Lautstärke füllen. Sie ist Kunden vorbehalten, die das Beste der gesamten Flotte wünschen — das Fahrzeug der Wahl für bedeutende Executive-Ankünfte, hochkarätige Gäste und Fahrten, bei denen nichts von der Fahrt selbst ablenken soll. Maßgeschneiderte Willkommensaufmerksamkeiten und ein dedizierter professioneller Chauffeur sind Standard, kein Upgrade.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Signature executive arrivals",
      ar: "وصولات تنفيذية مميزة",
      ru: "Знаковые представительские прибытия",
      zh: "标志性行政抵达",
      fr: "Arrivées executive marquantes",
      de: "Bedeutende Executive-Ankünfte",
    },
    features: {
      en: [
        "Fully reclining rear executive seats",
        "Extended rear legroom",
        "Burmester premium sound system",
        "Rear-seat climate control",
        "Bespoke welcome amenities",
      ],
      ar: [
        "مقاعد تنفيذية خلفية قابلة للإمالة الكاملة",
        "مساحة إضافية للأرجل في المقاعد الخلفية",
        "نظام صوت Burmester الفاخر",
        "تحكم بدرجة حرارة المقاعد الخلفية",
        "وسائل ترحيب مخصصة",
      ],
      ru: [
        "Полностью откидывающиеся задние представительские сиденья",
        "Увеличенное пространство для ног сзади",
        "Премиальная акустическая система Burmester",
        "Климат-контроль задних сидений",
        "Индивидуальные приветственные подарки",
      ],
      zh: [
        "后排行政座椅可完全躺平",
        "后排腿部空间加长",
        "柏林之声(Burmester)高级音响系统",
        "后排座椅独立温控",
        "定制欢迎礼遇",
      ],
      fr: [
        "Sièges executive arrière entièrement inclinables",
        "Espace pour les jambes à l'arrière accru",
        "Système audio premium Burmester",
        "Climatisation des sièges arrière",
        "Attentions de bienvenue sur mesure",
      ],
      de: [
        "Voll verstellbare hintere Executive-Sitze",
        "Zusätzlicher Beinraum im Fond",
        "Premium-Soundsystem von Burmester",
        "Klimatisierung der Rücksitze",
        "Maßgeschneiderte Willkommensaufmerksamkeiten",
      ],
    },
    whyChoose: {
      en: [
        "The quietest, most spacious cabin in the fleet",
        "Fully reclining rear seats for genuinely restful longer journeys",
        "Reserved for clients seeking the most exclusive sedan available",
        "A natural choice for high-profile executive arrivals",
      ],
      ar: [
        "أهدأ وأرحب مقصورة في الأسطول",
        "مقاعد خلفية قابلة للإمالة الكاملة لرحلات طويلة مريحة حقًا",
        "مخصصة للعملاء الباحثين عن أكثر سيارة سيدان تميزًا متاحة",
        "خيار طبيعي للوصولات التنفيذية البارزة",
      ],
      ru: [
        "Самый тихий и просторный салон в автопарке",
        "Полностью откидывающиеся задние сиденья для по-настоящему комфортного отдыха в долгих поездках",
        "Зарезервирован для клиентов, ищущих самый эксклюзивный седан из доступных",
        "Естественный выбор для значимых представительских прибытий",
      ],
      zh: [
        "车队中最静谧、最宽敞的座舱",
        "后排座椅可完全躺平,让长途旅程真正得以放松休息",
        "专为寻求车队中最尊贵轿车的客户而设",
        "重要行政抵达的自然之选",
      ],
      fr: [
        "L'habitacle le plus silencieux et le plus spacieux de la flotte",
        "Sièges arrière entièrement inclinables pour des trajets longs véritablement reposants",
        "Réservée aux clients recherchant la berline la plus exclusive disponible",
        "Un choix naturel pour les arrivées executive marquantes",
      ],
      de: [
        "Die leiseste, geräumigste Kabine der Flotte",
        "Voll verstellbare Rücksitze für wirklich erholsame längere Fahrten",
        "Vorbehalten Kunden, die die exklusivste verfügbare Limousine suchen",
        "Eine natürliche Wahl für bedeutende Executive-Ankünfte",
      ],
    },
    faqs: [
      {
        question: {
          en: "How is the Maybach S-Class different from the standard S-Class?",
          ar: "ما الفرق بين مايباخ S-Class وفئة S-Class العادية؟",
          ru: "Чем Maybach S-Class отличается от стандартного S-Class?",
          zh: "迈巴赫S级与标准S级有何不同?",
          fr: "En quoi la Maybach Classe S diffère-t-elle de la Classe S standard ?",
          de: "Wie unterscheidet sich die Maybach S-Klasse von der Standard-S-Klasse?",
        },
        answer: {
          en: "The Maybach adds an extended wheelbase, fully reclining rear executive seats, and additional sound insulation for an even quieter, more spacious ride.",
          ar: "تضيف مايباخ قاعدة عجلات ممتدة، ومقاعد تنفيذية خلفية قابلة للإمالة الكاملة، وعزلًا صوتيًا إضافيًا لرحلة أكثر هدوءًا واتساعًا.",
          ru: "Maybach добавляет увеличенную колёсную базу, полностью откидывающиеся задние представительские сиденья и дополнительную звукоизоляцию для ещё более тихой и просторной поездки.",
          zh: "迈巴赫车型增加了加长轴距、可完全躺平的后排行政座椅以及额外的隔音处理,带来更静谧、更宽敞的乘坐体验。",
          fr: "La Maybach ajoute un empattement allongé, des sièges executive arrière entièrement inclinables et une insonorisation supplémentaire pour un trajet encore plus silencieux et spacieux.",
          de: "Die Maybach bietet einen verlängerten Radstand, voll verstellbare hintere Executive-Sitze und zusätzliche Schalldämmung für eine noch leisere, geräumigere Fahrt.",
        },
      },
      {
        question: {
          en: "Is the Maybach S-Class available for airport transfers?",
          ar: "هل مايباخ S-Class متاحة لرحلات المطار؟",
          ru: "Доступен ли Maybach S-Class для трансферов из аэропорта?",
          zh: "迈巴赫S级是否可用于机场接送?",
          fr: "La Maybach Classe S est-elle disponible pour les transferts aéroport ?",
          de: "Ist die Maybach S-Klasse für Flughafentransfers verfügbar?",
        },
        answer: {
          en: "Yes, with the same live flight tracking and meet-and-greet service as the rest of the fleet.",
          ar: "نعم، مع نفس خدمة تتبع الرحلات المباشر والاستقبال الشخصي المتوفرة في باقي الأسطول.",
          ru: "Да, с тем же отслеживанием рейса в реальном времени и персональной встречей, что и для остального автопарка.",
          zh: "可以,并享有与车队其他车型相同的航班实时追踪与专人接机服务。",
          fr: "Oui, avec le même suivi de vol en direct et le même service d'accueil personnalisé que le reste de la flotte.",
          de: "Ja, mit derselben Live-Flugverfolgung und demselben Meet-and-Greet-Service wie der Rest der Flotte.",
        },
      },
      {
        question: {
          en: "How far in advance should I book the Maybach S-Class?",
          ar: "قبل كم من الوقت يجب حجز مايباخ S-Class؟",
          ru: "За сколько времени нужно бронировать Maybach S-Class?",
          zh: "应提前多久预订迈巴赫S级?",
          fr: "Combien de temps à l'avance dois-je réserver la Maybach Classe S ?",
          de: "Wie weit im Voraus sollte ich die Maybach S-Klasse buchen?",
        },
        answer: {
          en: "As our most exclusive sedan, we recommend booking at least a few days ahead where possible to guarantee availability.",
          ar: "بصفتها أكثر سيارة سيدان تميزًا لدينا، نوصي بالحجز قبل بضعة أيام على الأقل حيثما أمكن لضمان التوفر.",
          ru: "Как наш самый эксклюзивный седан, мы рекомендуем бронировать как минимум за несколько дней, где это возможно, чтобы гарантировать наличие.",
          zh: "作为我们最尊贵的轿车车型,建议尽可能提前至少几天预订,以确保车辆可用。",
          fr: "Étant notre berline la plus exclusive, nous recommandons de réserver au moins quelques jours à l'avance dans la mesure du possible pour garantir la disponibilité.",
          de: "Als unsere exklusivste Limousine empfehlen wir, wenn möglich mindestens einige Tage im Voraus zu buchen, um die Verfügbarkeit zu garantieren.",
        },
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "rolls-royce-phantom",
    badge: {
      en: "Wedding Favorite",
      ar: "الأفضل لحفلات الزفاف",
      ru: "Выбор для свадеб",
      zh: "婚礼首选",
      fr: "Favori pour mariages",
      de: "Hochzeitsfavorit",
    },
    brand: "Rolls-Royce",
    model: "Phantom Extended Wheelbase",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 9500, fiveHours: 5500, oneHour: 1500, airport: 2000, extraHour: 1200, additionalCity: 1200 },
    images: [
      {
        src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-1.png",
        alt: {
          en: "White Rolls-Royce Phantom front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لرولز رويس فانتوم البيضاء في صالة عرض بأرضية رخامية",
          ru: "Белый Rolls-Royce Phantom спереди сбоку в шоуруме с мраморным полом",
          zh: "白色劳斯莱斯幻影前四分之三视角,置身大理石地面展厅",
          fr: "Rolls-Royce Phantom blanche vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Weißer Rolls-Royce Phantom in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-2.png",
        alt: {
          en: "Rolls-Royce Phantom rear cabin in cream and black leather beneath a starlight headliner",
          ar: "المقصورة الخلفية لرولز رويس فانتوم بجلد كريمي وأسود أسفل سقف النجوم المضيء",
          ru: "Задний салон Rolls-Royce Phantom из кремовой и чёрной кожи под звёздным потолком",
          zh: "劳斯莱斯幻影后舱,米色与黑色真皮,上方为星光顶篷",
          fr: "Habitacle arrière de la Rolls-Royce Phantom en cuir crème et noir sous un ciel étoilé",
          de: "Fondkabine des Rolls-Royce Phantom in cremefarbenem und schwarzem Leder unter einem Sternenhimmel",
        },
      },
      {
        src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-3.webp",
        alt: {
          en: "Rolls-Royce Phantom rear console drinks cabinet with crystal glasses and decanter",
          ar: "خزانة المشروبات في الكونسول الخلفي لرولز رويس فانتوم مع كؤوس كريستال ودورق",
          ru: "Бар в задней консоли Rolls-Royce Phantom с хрустальными бокалами и графином",
          zh: "劳斯莱斯幻影后排中控台酒柜,配水晶酒杯及醒酒器",
          fr: "Bar de la console arrière de la Rolls-Royce Phantom avec verres en cristal et carafe",
          de: "Getränkefach in der Fondkonsole des Rolls-Royce Phantom mit Kristallgläsern und Karaffe",
        },
      },
    ],    name: "Rolls-Royce Phantom Extended Wheelbase",
    category: "Ultra-Luxury",
    tagline: {
      en: "The pinnacle of arrival",
      ar: "قمة الوصول",
      ru: "Вершина эффектного прибытия",
      zh: "抵达艺术的巅峰",
      fr: "Le summum de l'arrivée",
      de: "Der Gipfel der Ankunft",
    },
    description: {
      en: "The most prestigious way to arrive in Dubai — reserved for weddings, milestone occasions, and clients who expect nothing less than the finest.",
      ar: "الطريقة الأكثر رفعة للوصول في دبي — مخصصة لحفلات الزفاف والمناسبات المميزة والعملاء الذين لا يقبلون بأقل من الأرقى.",
      ru: "Самый престижный способ прибыть в Дубай — зарезервирован для свадеб, знаковых событий и клиентов, ожидающих исключительно самого лучшего.",
      zh: "在迪拜最尊贵的抵达方式——专为婚礼、重要庆典及只接受至臻品质的客户而设。",
      fr: "La façon la plus prestigieuse d'arriver à Dubaï — réservée aux mariages, aux occasions marquantes et aux clients qui n'attendent rien de moins que l'excellence.",
      de: "Die prestigeträchtigste Art, in Dubai anzukommen — vorbehalten Hochzeiten, besonderen Anlässen und Kunden, die nichts als das Feinste erwarten.",
    },
    longDescription: {
      en: "There's a reason the Phantom remains shorthand for arriving in style. Handcrafted, deliberate, and unmistakable, it's reserved for moments where the vehicle itself becomes part of the occasion — a wedding, an anniversary, a milestone worth marking properly. Settle into the rear cabin and look up at the signature starlight headliner, or reach for a chilled glass from the onboard champagne compartment as your chauffeur, dressed in formal attire, handles every detail of the drive. Red carpet service is available on request for ceremonies and arrivals where presentation matters as much as comfort. Because the Phantom is our most requested vehicle for weddings and milestone dates, availability is genuinely limited — we recommend securing your date well ahead of time.",
      ar: "هناك سبب يجعل الفانتوم لا تزال الرمز المختصر للوصول بأناقة. سيارة مصنوعة يدويًا، مدروسة التفاصيل، ولا تُخطئها العين، وهي مخصصة للحظات التي تصبح فيها السيارة نفسها جزءًا من المناسبة — حفل زفاف، ذكرى سنوية، أو مناسبة مهمة تستحق الاحتفاء الحقيقي بها. استقروا في المقصورة الخلفية وارفعوا أنظاركم إلى سقف النجوم المميز، أو مدوا أيديكم لكأس مبرد من حجيرة الشمبانيا المدمجة بينما يتولى سائقكم، بزيه الرسمي، كل تفصيل من تفاصيل القيادة. تتوفر خدمة السجادة الحمراء عند الطلب للحفلات والوصولات التي يهم فيها المظهر بقدر أهمية الراحة. ولأن الفانتوم هي السيارة الأكثر طلبًا لدينا لحفلات الزفاف والمناسبات المهمة، فإن التوفر محدود فعليًا — نوصي بحجز موعدكم مسبقًا بوقت كافٍ.",
      ru: "Есть причина, по которой Phantom остаётся синонимом эффектного прибытия. Созданный вручную, продуманный до мелочей и безошибочно узнаваемый, он предназначен для моментов, где сам автомобиль становится частью торжества — свадьбы, годовщины, важной вехи, которую стоит отметить по-настоящему. Устройтесь в заднем салоне и посмотрите вверх на фирменный звёздный потолок или возьмите охлаждённый бокал из встроенного отделения для шампанского, пока ваш шофёр в официальном костюме занимается всеми деталями поездки. Услуга красной ковровой дорожки доступна по запросу для церемоний и прибытий, где презентация важна не меньше комфорта. Поскольку Phantom — наш самый востребованный автомобиль для свадеб и важных дат, доступность действительно ограничена — рекомендуем заранее закрепить за собой нужную дату.",
      zh: "幻影之所以始终是优雅抵达的代名词,自有其原因。手工打造、精雕细琢、辨识度极高,专为座驾本身成为庆典一部分的时刻而生——婚礼、周年纪念,或任何值得郑重庆祝的重要时刻。在后舱落座,抬头即可欣赏标志性的星空顶棚,或从车载香槟柜中取出一杯冰镇香槟,而您身着正装的司机则会妥善处理行程的每一个细节。对于礼仪重于一切、形象与舒适同样重要的仪式与抵达场合,可应要求提供红毯礼遇服务。由于幻影是我们婚礼及重要庆典最受欢迎的车型,车辆可用性确实有限——建议尽早锁定您的用车日期。",
      fr: "Il y a une raison pour laquelle la Phantom reste synonyme d'arrivée avec panache. Fabriquée à la main, réfléchie dans chaque détail et immédiatement reconnaissable, elle est réservée aux moments où le véhicule lui-même fait partie de l'occasion — un mariage, un anniversaire, une étape à marquer comme il se doit. Installez-vous dans l'habitacle arrière et levez les yeux vers le ciel étoilé emblématique, ou saisissez une coupe fraîche dans la réserve à champagne intégrée pendant que votre chauffeur, en tenue formelle, s'occupe de chaque détail du trajet. Un service tapis rouge est disponible sur demande pour les cérémonies et arrivées où la présentation compte autant que le confort. La Phantom étant notre véhicule le plus demandé pour les mariages et dates marquantes, la disponibilité est véritablement limitée — nous recommandons de réserver votre date bien à l'avance.",
      de: "Es gibt einen Grund, warum der Phantom nach wie vor der Inbegriff einer stilvollen Ankunft ist. Handgefertigt, durchdacht und unverwechselbar, ist er für Momente reserviert, in denen das Fahrzeug selbst Teil des Anlasses wird — eine Hochzeit, ein Jubiläum, ein Meilenstein, der angemessen gewürdigt werden soll. Lassen Sie sich im Fond nieder und blicken Sie hinauf zum charakteristischen Sternenhimmel, oder greifen Sie zu einem gekühlten Glas aus dem eingebauten Champagnerfach, während Ihr Chauffeur in formeller Kleidung jedes Detail der Fahrt übernimmt. Roter-Teppich-Service ist auf Anfrage für Zeremonien und Ankünfte verfügbar, bei denen die Präsentation ebenso zählt wie der Komfort. Da der Phantom unser meistgefragtes Fahrzeug für Hochzeiten und besondere Termine ist, ist die Verfügbarkeit tatsächlich begrenzt — wir empfehlen, Ihren Termin frühzeitig zu sichern.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Weddings & signature occasions",
      ar: "حفلات الزفاف والمناسبات المميزة",
      ru: "Свадьбы и знаковые события",
      zh: "婚礼与重要庆典",
      fr: "Mariages et occasions marquantes",
      de: "Hochzeiten & besondere Anlässe",
    },
    features: {
      en: [
        "Handcrafted leather interior",
        "Starlight headliner",
        "Chauffeur in formal attire",
        "Red carpet service available",
        "Champagne chilling compartment",
        "Bespoke welcome amenities",
      ],
      ar: [
        "مقصورة جلدية مصنوعة يدويًا",
        "سقف النجوم",
        "سائق بزي رسمي",
        "خدمة السجادة الحمراء متاحة",
        "حجيرة تبريد الشمبانيا",
        "وسائل ترحيب مخصصة",
      ],
      ru: [
        "Салон из кожи ручной выделки",
        "Звёздный потолок",
        "Шофёр в официальном костюме",
        "Доступна услуга красной ковровой дорожки",
        "Отделение для охлаждения шампанского",
        "Индивидуальные приветственные подарки",
      ],
      zh: [
        "手工打造真皮座舱",
        "星空顶棚",
        "司机身着正装",
        "可提供红毯礼遇服务",
        "香槟冰镇储物格",
        "定制欢迎礼遇",
      ],
      fr: [
        "Habitacle en cuir fait à la main",
        "Ciel étoilé",
        "Chauffeur en tenue formelle",
        "Service tapis rouge disponible",
        "Réserve à champagne réfrigérée",
        "Attentions de bienvenue sur mesure",
      ],
      de: [
        "Handgefertigtes Lederinterieur",
        "Sternenhimmel-Dachhimmel",
        "Chauffeur in formeller Kleidung",
        "Roter-Teppich-Service verfügbar",
        "Champagner-Kühlfach",
        "Maßgeschneiderte Willkommensaufmerksamkeiten",
      ],
    },
    whyChoose: {
      en: [
        "The most recognized symbol of luxury arrival in Dubai",
        "Handcrafted interior with a signature starlight headliner",
        "Chauffeur in formal attire with optional red carpet service",
        "Reserved availability — book early to secure wedding dates",
      ],
      ar: [
        "الرمز الأكثر تميزًا للوصول الفاخر في دبي",
        "مقصورة مصنوعة يدويًا مع سقف النجوم المميز",
        "سائق بزي رسمي مع خدمة سجادة حمراء اختيارية",
        "توفر محدود — احجزوا مبكرًا لضمان مواعيد الزفاف",
      ],
      ru: [
        "Самый узнаваемый символ роскошного прибытия в Дубае",
        "Салон ручной работы с фирменным звёздным потолком",
        "Шофёр в официальном костюме с опциональной услугой красной ковровой дорожки",
        "Ограниченная доступность — бронируйте заранее, чтобы закрепить свадебную дату",
      ],
      zh: [
        "迪拜最具辨识度的豪华抵达象征",
        "手工打造座舱,配标志性星空顶棚",
        "司机身着正装,可选红毯礼遇服务",
        "预订有限——请尽早预订以锁定婚礼日期",
      ],
      fr: [
        "Le symbole le plus reconnu d'une arrivée de luxe à Dubaï",
        "Habitacle fait à la main avec ciel étoilé emblématique",
        "Chauffeur en tenue formelle avec service tapis rouge en option",
        "Disponibilité limitée — réservez tôt pour garantir vos dates de mariage",
      ],
      de: [
        "Das anerkannteste Symbol für eine luxuriöse Ankunft in Dubai",
        "Handgefertigtes Interieur mit charakteristischem Sternenhimmel",
        "Chauffeur in formeller Kleidung mit optionalem Roter-Teppich-Service",
        "Begrenzte Verfügbarkeit — frühzeitig buchen, um Hochzeitstermine zu sichern",
      ],
    },
    faqs: [
      {
        question: {
          en: "How far in advance should I book the Rolls-Royce Phantom?",
          ar: "قبل كم من الوقت يجب حجز رولز رويس فانتوم؟",
          ru: "За сколько времени нужно бронировать Rolls-Royce Phantom?",
          zh: "应提前多久预订劳斯莱斯幻影?",
          fr: "Combien de temps à l'avance dois-je réserver la Rolls-Royce Phantom ?",
          de: "Wie weit im Voraus sollte ich den Rolls-Royce Phantom buchen?",
        },
        answer: {
          en: "For weddings and peak dates, we recommend booking at least 2–3 weeks ahead, as the Phantom is our most requested vehicle.",
          ar: "بالنسبة لحفلات الزفاف والمواعيد المزدحمة، نوصي بالحجز قبل أسبوعين إلى ثلاثة أسابيع على الأقل، حيث إن الفانتوم هي السيارة الأكثر طلبًا لدينا.",
          ru: "Для свадеб и пиковых дат мы рекомендуем бронировать как минимум за 2–3 недели, поскольку Phantom — наш самый востребованный автомобиль.",
          zh: "对于婚礼及热门日期,建议至少提前2至3周预订,因为幻影是我们最受欢迎的车型。",
          fr: "Pour les mariages et dates très demandées, nous recommandons de réserver au moins 2 à 3 semaines à l'avance, la Phantom étant notre véhicule le plus demandé.",
          de: "Für Hochzeiten und stark nachgefragte Termine empfehlen wir eine Buchung mindestens 2–3 Wochen im Voraus, da der Phantom unser meistgefragtes Fahrzeug ist.",
        },
      },
      {
        question: {
          en: "Does the Phantom include red carpet service?",
          ar: "هل تشمل الفانتوم خدمة السجادة الحمراء؟",
          ru: "Включена ли в Phantom услуга красной ковровой дорожки?",
          zh: "幻影是否包含红毯礼遇服务?",
          fr: "La Phantom inclut-elle le service tapis rouge ?",
          de: "Ist der Roter-Teppich-Service beim Phantom inbegriffen?",
        },
        answer: {
          en: "Yes, red carpet service is available on request for weddings and special occasions.",
          ar: "نعم، خدمة السجادة الحمراء متاحة عند الطلب لحفلات الزفاف والمناسبات الخاصة.",
          ru: "Да, услуга красной ковровой дорожки доступна по запросу для свадеб и особых мероприятий.",
          zh: "可以,红毯礼遇服务可应婚礼及特殊场合的要求提供。",
          fr: "Oui, le service tapis rouge est disponible sur demande pour les mariages et occasions spéciales.",
          de: "Ja, der Roter-Teppich-Service ist auf Anfrage für Hochzeiten und besondere Anlässe verfügbar.",
        },
      },
      {
        question: {
          en: "Can the Phantom be booked for just a few hours?",
          ar: "هل يمكن حجز الفانتوم لبضع ساعات فقط؟",
          ru: "Можно ли забронировать Phantom всего на несколько часов?",
          zh: "幻影是否可以只预订几个小时?",
          fr: "La Phantom peut-elle être réservée pour seulement quelques heures ?",
          de: "Kann der Phantom nur für ein paar Stunden gebucht werden?",
        },
        answer: {
          en: "Yes, the Phantom can be booked hourly for ceremonies and photo sessions, not only full-day hire.",
          ar: "نعم، يمكن حجز الفانتوم بالساعة للحفلات وجلسات التصوير، وليس فقط للاستئجار ليوم كامل.",
          ru: "Да, Phantom можно забронировать почасово для церемоний и фотосессий, а не только на полный день.",
          zh: "可以,幻影可按小时预订用于仪式及拍摄环节,不仅限于全天租用。",
          fr: "Oui, la Phantom peut être réservée à l'heure pour des cérémonies et séances photo, pas uniquement à la journée.",
          de: "Ja, der Phantom kann stundenweise für Zeremonien und Fotoshootings gebucht werden, nicht nur als Ganztagesmiete.",
        },
      },
    ],
  },
  {
    slug: "mercedes-s-class",
    badge: {
      en: "Executive Favorite",
      ar: "الأفضل تنفيذيًا",
      ru: "Выбор руководителей",
      zh: "行政首选",
      fr: "Favori des cadres",
      de: "Executive-Favorit",
    },
    brand: "Mercedes-Benz",
    model: "S-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 500, extraHour: 300, additionalCity: 300 },
    images: [
      {
        src: "/images/fleet/mercedes-s-class/mercedes-s-class-1.png",
        alt: {
          en: "Black Mercedes-Benz S-Class front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لمرسيدس بنز S-Class السوداء في صالة عرض بأرضية رخامية",
          ru: "Чёрный Mercedes-Benz S-Class спереди сбоку в шоуруме с мраморным полом",
          zh: "黑色梅赛德斯奔驰S级前四分之三视角,置身大理石地面展厅",
          fr: "Mercedes-Benz Classe S noire vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Schwarze Mercedes-Benz S-Klasse in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/mercedes-s-class/mercedes-s-class-2.png",
        alt: {
          en: "Mercedes-Benz S-Class rear cabin in white quilted leather beneath a panoramic roof",
          ar: "المقصورة الخلفية لمرسيدس بنز S-Class بجلد أبيض مبطن أسفل سقف بانورامي",
          ru: "Задний салон Mercedes-Benz S-Class из белой стёганой кожи под панорамной крышей",
          zh: "梅赛德斯奔驰S级后舱,白色绗缝真皮,上方为全景天窗",
          fr: "Habitacle arrière de la Mercedes-Benz Classe S en cuir matelassé blanc sous un toit panoramique",
          de: "Fondkabine der Mercedes-Benz S-Klasse in weißem Steppleder unter einem Panoramadach",
        },
      },
      {
        src: "/images/fleet/mercedes-s-class/mercedes-s-class-3.png",
        alt: {
          en: "Mercedes-Benz S-Class rear seats in cream quilted leather with folding centre armrest",
          ar: "المقاعد الخلفية لمرسيدس بنز S-Class بجلد كريمي مبطن مع مسند ذراع أوسط قابل للطي",
          ru: "Задние сиденья Mercedes-Benz S-Class из кремовой стёганой кожи с откидным центральным подлокотником",
          zh: "梅赛德斯奔驰S级后排座椅,米色绗缝真皮配可折叠中央扶手",
          fr: "Sièges arrière de la Mercedes-Benz Classe S en cuir matelassé crème avec accoudoir central rabattable",
          de: "Rücksitze der Mercedes-Benz S-Klasse in cremefarbenem Steppleder mit klappbarer Mittelarmlehne",
        },
      },
    ],    name: "Mercedes-Benz S-Class",
    category: "Sedan",
    tagline: {
      en: "The executive standard",
      ar: "المعيار التنفيذي",
      ru: "Представительский эталон",
      zh: "行政标准之选",
      fr: "La référence executive",
      de: "Der Executive-Standard",
    },
    description: {
      en: "The definitive choice for airport transfers and business travel — a hushed cabin, exceptional ride comfort, and a presence that reads confidence without excess.",
      ar: "الخيار الأمثل لرحلات المطار والسفر التجاري — مقصورة هادئة، وراحة استثنائية في القيادة، وحضور يعكس الثقة دون مبالغة.",
      ru: "Оптимальный выбор для трансферов из аэропорта и деловых поездок — тихий салон, исключительный комфорт езды и статус, отражающий уверенность без излишеств.",
      zh: "机场接送与商务出行的理想之选——静谧座舱、卓越乘坐舒适度,以及不失分寸、彰显自信的车型气场。",
      fr: "Le choix par excellence pour les transferts aéroport et les voyages d'affaires — un habitacle feutré, un confort de conduite exceptionnel et une présence qui inspire la confiance sans excès.",
      de: "Die naheliegende Wahl für Flughafentransfers und Geschäftsreisen — eine gedämpfte Kabine, außergewöhnlicher Fahrkomfort und eine Präsenz, die Selbstbewusstsein ohne Übertreibung ausstrahlt.",
    },
    longDescription: {
      en: "Step into the S-Class and the outside world simply goes quiet. It remains the reference point for chauffeured business travel in Dubai — engineered ride comfort, whisper-quiet cabin insulation, and enough legroom to take a call or finish a deck before you arrive. Massaging leather seats and rear-seat climate control take the edge off a long day between meetings, while onboard Wi-Fi and privacy glass mean you can work uninterrupted from the moment you get in. It's a neutral, professional presence that suits client-facing arrivals without ever feeling showy, and one of our most consistently available vehicles for same-day airport transfers and last-minute corporate bookings. Bottled water and amenities are provided as standard on every trip.",
      ar: "ما إن تدخلوا سيارة S-Class حتى يخفت العالم الخارجي ببساطة. لا تزال هذه السيارة نقطة المرجعية للسفر التجاري بسائق خاص في دبي — راحة قيادة مصممة بعناية، وعزل صوتي يكاد يكون تامًا، ومساحة كافية للأرجل تتيح لكم إجراء مكالمة أو إنهاء عرض تقديمي قبل الوصول. تخفف المقاعد الجلدية بوظيفة التدليك والتحكم بدرجة حرارة المقاعد الخلفية من وطأة يوم طويل بين الاجتماعات، بينما تتيح شبكة الواي فاي على متن السيارة والزجاج العاكس للخصوصية العمل دون انقطاع من لحظة ركوبكم. إنها حضور محايد ومهني يلائم الوصولات أمام العملاء دون أن يبدو مبالغًا فيه أبدًا، وهي واحدة من أكثر سياراتنا توفرًا باستمرار لرحلات المطار في نفس اليوم وحجوزات الشركات في اللحظات الأخيرة. تُقدَّم المياه المعبأة ووسائل الراحة كخدمة أساسية في كل رحلة.",
      ru: "Стоит сесть в S-Class — и внешний мир просто затихает. Этот автомобиль остаётся эталоном деловых поездок с личным водителем в Дубае — продуманный комфорт езды, звукоизоляция салона почти шёпотом и достаточно места для ног, чтобы успеть позвонить или доделать презентацию до прибытия. Кожаные сиденья с функцией массажа и климат-контроль задних сидений снимают напряжение долгого дня между встречами, а бортовой Wi-Fi и тонированные стёкла позволяют работать без перерыва с момента посадки. Это нейтральный, профессиональный статус, подходящий для встреч с клиентами и никогда не выглядящий показным — один из наших наиболее стабильно доступных автомобилей для трансферов из аэропорта день в день и срочных корпоративных заказов. Бутилированная вода и другие удобства предоставляются по умолчанию в каждой поездке.",
      zh: "踏入S级座舱,外界的喧嚣便随之远去。它始终是迪拜商务专属司机出行的标杆之选——精心调校的乘坐舒适性、近乎无声的座舱隔音,以及充裕的腿部空间,让您在抵达前从容通话或完成演示文稿。带按摩功能的真皮座椅与后排独立温控,可缓解会议间奔波一整天的疲惫,车载WiFi与隐私玻璃更让您从上车那一刻起便可不受打扰地专注工作。这是一种低调而专业的气场,既适合面对客户的抵达场合,又从不显得张扬,也是我们当日机场接送及企业临时预订中最稳定可靠的车型之一。每次行程均标配瓶装水及其他便利用品。",
      fr: "Montez dans la Classe S et le monde extérieur s'apaise instantanément. Elle demeure la référence pour les déplacements professionnels avec chauffeur à Dubaï — un confort de conduite étudié, une insonorisation d'habitacle quasi silencieuse et suffisamment d'espace pour les jambes pour passer un appel ou finaliser une présentation avant d'arriver. Les sièges en cuir massants et la climatisation des sièges arrière atténuent la fatigue d'une longue journée entre réunions, tandis que le Wi-Fi embarqué et les vitres teintées permettent de travailler sans interruption dès l'instant où vous montez. Sa présence neutre et professionnelle convient aux arrivées face aux clients sans jamais paraître ostentatoire, et c'est l'un de nos véhicules les plus systématiquement disponibles pour les transferts aéroport le jour même et les réservations d'entreprise de dernière minute. Eau en bouteille et attentions sont fournies en standard à chaque trajet.",
      de: "Steigen Sie in die S-Klasse ein, und die Außenwelt wird einfach still. Sie bleibt der Bezugspunkt für chauffeurgefahrene Geschäftsreisen in Dubai — durchdachter Fahrkomfort, geflüsterte Kabinendämmung und genug Beinfreiheit, um vor der Ankunft noch zu telefonieren oder eine Präsentation fertigzustellen. Massagesitze aus Leder und Klimatisierung der Rücksitze nehmen einem langen Tag zwischen Terminen die Schärfe, während WLAN an Bord und Sichtschutzverglasung ununterbrochenes Arbeiten ab dem Einsteigen ermöglichen. Es ist eine neutrale, professionelle Präsenz, die sich für kundenwirksame Ankünfte eignet, ohne je aufdringlich zu wirken, und eines unserer zuverlässigsten Fahrzeuge für taggleiche Flughafentransfers und kurzfristige Firmenbuchungen. Wasser in Flaschen und weitere Annehmlichkeiten sind bei jeder Fahrt Standard.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Airport transfers & corporate travel",
      ar: "رحلات المطار والسفر التجاري",
      ru: "Трансферы из аэропорта и деловые поездки",
      zh: "机场接送与企业出行",
      fr: "Transferts aéroport et voyages d'affaires",
      de: "Flughafentransfers & Geschäftsreisen",
    },
    features: {
      en: [
        "Massaging leather seats",
        "Rear-seat climate control",
        "Ambient interior lighting",
        "Onboard Wi-Fi",
        "Bottled water & amenities",
      ],
      ar: [
        "مقاعد جلدية بوظيفة التدليك",
        "تحكم بدرجة حرارة المقاعد الخلفية",
        "إضاءة داخلية محيطية",
        "شبكة واي فاي على متن السيارة",
        "مياه معبأة ووسائل راحة",
      ],
      ru: [
        "Кожаные сиденья с функцией массажа",
        "Климат-контроль задних сидений",
        "Атмосферная внутренняя подсветка",
        "Wi-Fi в салоне",
        "Бутилированная вода и удобства",
      ],
      zh: [
        "带按摩功能真皮座椅",
        "后排座椅独立温控",
        "车内氛围灯光",
        "车载WiFi",
        "瓶装水及便利用品",
      ],
      fr: [
        "Sièges en cuir massants",
        "Climatisation des sièges arrière",
        "Éclairage d'ambiance intérieur",
        "Wi-Fi embarqué",
        "Eau en bouteille & attentions",
      ],
      de: [
        "Massagesitze aus Leder",
        "Klimatisierung der Rücksitze",
        "Ambientebeleuchtung im Innenraum",
        "WLAN an Bord",
        "Wasser in Flaschen & Annehmlichkeiten",
      ],
    },
    whyChoose: {
      en: [
        "The quietest cabin in our fleet — ideal for calls between meetings",
        "Consistently available for same-day airport transfers",
        "A neutral, professional presence for client-facing arrivals",
        "Generous rear legroom, even for tall passengers",
      ],
      ar: [
        "أهدأ مقصورة في أسطولنا — مثالية لإجراء المكالمات بين الاجتماعات",
        "متوفرة باستمرار لرحلات المطار في نفس اليوم",
        "حضور محايد ومهني للوصولات أمام العملاء",
        "مساحة أرجل خلفية واسعة، حتى للركاب طويلي القامة",
      ],
      ru: [
        "Самый тихий салон в нашем автопарке — идеален для звонков между встречами",
        "Стабильно доступен для трансферов из аэропорта день в день",
        "Нейтральный, профессиональный статус для встреч с клиентами",
        "Просторное пространство для ног сзади, даже для высоких пассажиров",
      ],
      zh: [
        "我们车队中最静谧的座舱——非常适合会议间隙通话",
        "持续可用于当日机场接送",
        "低调专业的气场,适合面对客户的抵达场合",
        "后排腿部空间宽敞,即使高个子乘客也能舒适乘坐",
      ],
      fr: [
        "L'habitacle le plus silencieux de notre flotte — idéal pour les appels entre réunions",
        "Systématiquement disponible pour les transferts aéroport le jour même",
        "Une présence neutre et professionnelle pour les arrivées face aux clients",
        "Un espace généreux pour les jambes à l'arrière, même pour les passagers de grande taille",
      ],
      de: [
        "Die leiseste Kabine unserer Flotte — ideal für Telefonate zwischen Terminen",
        "Durchgehend verfügbar für taggleiche Flughafentransfers",
        "Eine neutrale, professionelle Präsenz für kundenwirksame Ankünfte",
        "Großzügiger Beinraum im Fond, selbst für große Passagiere",
      ],
    },
    faqs: [
      {
        question: {
          en: "Is the Mercedes S-Class suitable for airport transfers?",
          ar: "هل تناسب مرسيدس S-Class رحلات المطار؟",
          ru: "Подходит ли Mercedes S-Class для трансферов из аэропорта?",
          zh: "梅赛德斯S级是否适合机场接送?",
          fr: "La Mercedes Classe S convient-elle aux transferts aéroport ?",
          de: "Ist die Mercedes S-Klasse für Flughafentransfers geeignet?",
        },
        answer: {
          en: "Yes — it's our most-booked vehicle for DXB and DWC transfers, with live flight tracking included as standard.",
          ar: "نعم — إنها السيارة الأكثر حجزًا لدينا لرحلات مطار دبي الدولي ومطار آل مكتوم، مع تتبع مباشر للرحلات الجوية كخدمة أساسية.",
          ru: "Да — это самый бронируемый автомобиль для трансферов в DXB и DWC, со стандартным отслеживанием рейса в реальном времени.",
          zh: "可以——它是我们前往DXB与DWC机场预订最多的车型,标配航班实时追踪服务。",
          fr: "Oui — c'est notre véhicule le plus réservé pour les transferts vers DXB et DWC, avec suivi de vol en direct inclus en standard.",
          de: "Ja — sie ist unser meistgebuchtes Fahrzeug für Transfers zum DXB und DWC, mit standardmäßig inkludierter Live-Flugverfolgung.",
        },
      },
      {
        question: {
          en: "How many suitcases fit in the S-Class?",
          ar: "كم عدد حقائب السفر التي تتسع لها S-Class؟",
          ru: "Сколько чемоданов помещается в S-Class?",
          zh: "S级可容纳多少件行李箱?",
          fr: "Combien de valises peut contenir la Classe S ?",
          de: "Wie viele Koffer passen in die S-Klasse?",
        },
        answer: {
          en: "The S-Class comfortably holds 2 standard suitcases plus carry-ons. For more luggage, consider the V-Class or Escalade.",
          ar: "تتسع S-Class بسهولة لحقيبتي سفر قياسيتين بالإضافة إلى حقائب اليد. لمزيد من الأمتعة، يمكنكم اختيار V-Class أو إسكاليد.",
          ru: "S-Class комфортно вмещает 2 стандартных чемодана плюс ручную кладь. Для большего количества багажа рассмотрите V-Class или Escalade.",
          zh: "S级可轻松容纳2件标准行李箱及随身行李。如需更多行李空间,建议选择V级或凯雷德(Escalade)。",
          fr: "La Classe S contient confortablement 2 valises standard plus des bagages à main. Pour plus de bagages, envisagez la Classe V ou l'Escalade.",
          de: "Die S-Klasse fasst bequem 2 Standardkoffer plus Handgepäck. Für mehr Gepäck empfiehlt sich die V-Klasse oder der Escalade.",
        },
      },
      {
        question: {
          en: "Can I book the S-Class for a full day?",
          ar: "هل يمكنني حجز S-Class ليوم كامل؟",
          ru: "Могу ли я забронировать S-Class на весь день?",
          zh: "可以预订S级用一整天吗?",
          fr: "Puis-je réserver la Classe S pour une journée complète ?",
          de: "Kann ich die S-Klasse für einen ganzen Tag buchen?",
        },
        answer: {
          en: "Yes, hourly and full-day hire are both available — select your duration when booking, or mention it in your quote request.",
          ar: "نعم، يتوفر كل من الاستئجار بالساعة وليوم كامل — اختاروا المدة عند الحجز، أو اذكروها في طلب عرض السعر.",
          ru: "Да, доступна как почасовая, так и полнодневная аренда — выберите продолжительность при бронировании или укажите её в запросе расчёта стоимости.",
          zh: "可以,按小时及全天租用均可——预订时选择所需时长,或在报价请求中注明。",
          fr: "Oui, la location à l'heure et à la journée sont toutes deux disponibles — sélectionnez votre durée lors de la réservation, ou mentionnez-la dans votre demande de devis.",
          de: "Ja, sowohl Stunden- als auch Ganztagesmiete sind verfügbar — wählen Sie Ihre Dauer bei der Buchung oder geben Sie sie in Ihrer Angebotsanfrage an.",
        },
      },
    ],
  },
  {
    slug: "range-rover-autobiography",
    badge: {
      en: "VIP Choice",
      ar: "خيار كبار الشخصيات",
      ru: "Выбор VIP",
      zh: "贵宾之选",
      fr: "Choix VIP",
      de: "VIP-Wahl",
    },
    brand: "Range Rover",
    model: "Autobiography",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 3200, fiveHours: 1900, oneHour: 500, airport: 650, extraHour: 400, additionalCity: 400 },
    images: [
      {
        src: "/images/fleet/range-rover-autobiography/range-rover-autobiography-1.png",
        alt: {
          en: "Black Range Rover Autobiography front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لرينج روفر أوتوبيوغرافي السوداء في صالة عرض بأرضية رخامية",
          ru: "Чёрный Range Rover Autobiography спереди сбоку в шоуруме с мраморным полом",
          zh: "黑色路虎揽胜Autobiography前四分之三视角,置身大理石地面展厅",
          fr: "Range Rover Autobiography noir vu de trois-quarts avant dans un showroom au sol en marbre",
          de: "Schwarzer Range Rover Autobiography in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/range-rover-autobiography/range-rover-autobiography-2.png",
        alt: {
          en: "Range Rover Autobiography rear cabin in black leather beneath a panoramic roof",
          ar: "المقصورة الخلفية لرينج روفر أوتوبيوغرافي من الجلد الأسود أسفل سقف بانورامي",
          ru: "Задний салон Range Rover Autobiography из чёрной кожи под панорамной крышей",
          zh: "路虎揽胜Autobiography后舱,黑色真皮,上方为全景天窗",
          fr: "Habitacle arrière du Range Rover Autobiography en cuir noir sous un toit panoramique",
          de: "Fondkabine des Range Rover Autobiography in schwarzem Leder unter einem Panoramadach",
        },
      },
      {
        src: "/images/fleet/range-rover-autobiography/range-rover-autobiography-3.png",
        alt: {
          en: "Range Rover Autobiography rear-seat entertainment screens and climate controls",
          ar: "شاشات الترفيه للمقاعد الخلفية وأدوات التحكم بالمناخ في رينج روفر أوتوبيوغرافي",
          ru: "Экраны развлекательной системы для задних пассажиров и управление климатом Range Rover Autobiography",
          zh: "路虎揽胜Autobiography后排娱乐屏幕及空调控制",
          fr: "Écrans de divertissement des places arrière et commandes de climatisation du Range Rover Autobiography",
          de: "Entertainment-Bildschirme im Fond und Klimabedienung des Range Rover Autobiography",
        },
      },
    ],    name: "Range Rover Autobiography",
    category: "SUV",
    tagline: {
      en: "Effortless, elevated comfort",
      ar: "راحة سلسة ومرتفعة",
      ru: "Непринуждённый, возвышенный комфорт",
      zh: "从容不迫,尊享舒适",
      fr: "Un confort sans effort, à un niveau supérieur",
      de: "Müheloser, gehobener Komfort",
    },
    description: {
      en: "Effortless comfort with genuine capability — a versatile choice for VIP transportation across the city or beyond it.",
      ar: "راحة سلسة مع قدرات حقيقية — خيار متعدد الاستخدامات لنقل كبار الشخصيات داخل المدينة أو خارجها.",
      ru: "Непринуждённый комфорт с подлинными возможностями — универсальный выбор для VIP-транспорта по городу и за его пределами.",
      zh: "从容舒适,实力不凡——无论市区出行还是远途旅程,均是贵宾出行的多功能之选。",
      fr: "Un confort sans effort doublé d'une vraie polyvalence — un choix adaptable pour le transport VIP en ville ou au-delà.",
      de: "Müheloser Komfort mit echter Vielseitigkeit — eine flexible Wahl für VIP-Transport in der Stadt und darüber hinaus.",
    },
    longDescription: {
      en: "The Autobiography combines the comfort of a luxury saloon with the versatility of a true SUV — equally at home on a smooth airport run or an itinerary that strays from the main road. Adjustable air suspension irons out uneven surfaces before they ever reach the cabin, while the panoramic roof and premium Meridian sound system add a sense of space and occasion to longer journeys. Executive rear seating, individual climate control, and onboard Wi-Fi mean it holds its own against any sedan for comfort, with the added flexibility to handle multi-stop itineraries a lower vehicle can't. It's become a favourite for VIP transportation precisely because it offers the presence of an SUV without losing any of the refinement clients expect from Apex Limo.",
      ar: "تجمع أوتوبيوغرافي بين راحة سيارة السيدان الفاخرة وتعدد استخدامات سيارة الدفع الرباعي الحقيقية — تشعر بالراحة نفسها سواء في رحلة مطار سلسة أو في مسار يبتعد عن الطريق الرئيسي. يعمل نظام التعليق الهوائي القابل للتعديل على تسوية الأسطح غير المستوية قبل أن تصل إلى المقصورة، بينما تضيف فتحة السقف البانورامية ونظام الصوت الفاخر Meridian إحساسًا بالاتساع والمناسبة الخاصة للرحلات الطويلة. تعني المقاعد الخلفية التنفيذية والتحكم الفردي بدرجة الحرارة وشبكة الواي فاي على متن السيارة أنها لا تقل راحة عن أي سيارة سيدان، مع مرونة إضافية للتعامل مع مسارات متعددة المحطات لا تستطيع سيارة أكثر انخفاضًا التعامل معها. أصبحت هذه السيارة المفضلة لنقل كبار الشخصيات تحديدًا لأنها توفر حضور سيارة الدفع الرباعي دون أن تفقد أي شيء من الرقي الذي يتوقعه عملاء Apex Limo.",
      ru: "Autobiography сочетает комфорт роскошного седана с универсальностью настоящего внедорожника — одинаково уместен как в плавной поездке в аэропорт, так и на маршруте, уходящем от главной дороги. Регулируемая пневмоподвеска сглаживает неровности покрытия ещё до того, как они достигнут салона, а панорамная крыша и премиальная акустическая система Meridian добавляют ощущение простора и торжественности долгим поездкам. Представительские задние сиденья, индивидуальный климат-контроль и Wi-Fi на борту означают, что по комфорту он не уступает любому седану, с дополнительной гибкостью для маршрутов с несколькими остановками, недоступной более низким автомобилям. Он стал фаворитом для VIP-транспорта именно потому, что предлагает статус внедорожника, не теряя ни капли изысканности, которую клиенты ожидают от Apex Limo.",
      zh: "Autobiography兼具豪华轿车的舒适性与真正SUV的多功能性——无论是从容的机场接送,还是偏离主路的行程安排,皆能从容应对。可调节空气悬挂系统在颠簸抵达座舱之前便已将其化解,全景天窗与高级傲思(Meridian)音响系统更为长途旅程增添了空间感与仪式感。行政后排座椅、独立温控及车载WiFi,使其舒适度丝毫不逊于任何轿车,同时具备处理多站点行程的额外灵活性,这是低底盘车型难以企及的。正因它兼具SUV的气场,又不失Apex Limo客户所期待的那份精致考究,才成为贵宾出行的宠儿。",
      fr: "L'Autobiography allie le confort d'une berline de luxe à la polyvalence d'un véritable SUV — tout aussi à l'aise sur un trajet aéroport en douceur que sur un itinéraire qui s'écarte de la route principale. La suspension pneumatique réglable lisse les surfaces irrégulières avant qu'elles n'atteignent l'habitacle, tandis que le toit panoramique et le système audio premium Meridian ajoutent une sensation d'espace et de solennité aux longs trajets. Les sièges executive arrière, la climatisation individuelle et le Wi-Fi embarqué font qu'elle tient tête à n'importe quelle berline en matière de confort, avec en plus la flexibilité de gérer des itinéraires à plusieurs arrêts qu'un véhicule plus bas ne pourrait pas assurer. Elle est devenue une favorite pour le transport VIP précisément parce qu'elle offre la présence d'un SUV sans jamais perdre le raffinement que les clients attendent d'Apex Limo.",
      de: "Der Autobiography vereint den Komfort einer Luxuslimousine mit der Vielseitigkeit eines echten SUV — ebenso souverän auf einer ruhigen Flughafenfahrt wie auf einer Route abseits der Hauptstraße. Die verstellbare Luftfederung gleicht unebene Fahrbahnen aus, bevor sie die Kabine erreichen, während das Panoramadach und das Premium-Soundsystem von Meridian längeren Fahrten ein Gefühl von Weite und Anlass verleihen. Executive-Rücksitze, individuelle Klimatisierung und WLAN an Bord bedeuten, dass er es komfortmäßig mit jeder Limousine aufnimmt — mit der zusätzlichen Flexibilität, Routen mit mehreren Stopps zu bewältigen, die einem niedrigeren Fahrzeug verwehrt bleiben. Er ist gerade deshalb zum Favoriten für VIP-Transport geworden, weil er die Präsenz eines SUV bietet, ohne auch nur einen Hauch der Raffinesse einzubüßen, die Kunden von Apex Limo erwarten.",
    },
    passengers: 4,
    luggage: 3,
    idealFor: {
      en: "VIP transportation",
      ar: "نقل كبار الشخصيات",
      ru: "VIP-транспорт",
      zh: "贵宾出行",
      fr: "Transport VIP",
      de: "VIP-Transport",
    },
    features: {
      en: [
        "Executive rear seating",
        "Adjustable air suspension",
        "Premium Meridian sound system",
        "Panoramic roof",
        "Climate-controlled cabin",
        "Onboard Wi-Fi",
      ],
      ar: [
        "مقاعد تنفيذية خلفية",
        "نظام تعليق هوائي قابل للتعديل",
        "نظام صوت Meridian الفاخر",
        "فتحة سقف بانورامية",
        "مقصورة مكيفة",
        "شبكة واي فاي على متن السيارة",
      ],
      ru: [
        "Представительские задние сиденья",
        "Регулируемая пневмоподвеска",
        "Премиальная акустическая система Meridian",
        "Панорамная крыша",
        "Салон с климат-контролем",
        "Wi-Fi в салоне",
      ],
      zh: [
        "行政后排座椅",
        "可调节空气悬挂系统",
        "傲思(Meridian)高级音响系统",
        "全景天窗",
        "座舱恒温控制",
        "车载WiFi",
      ],
      fr: [
        "Sièges executive arrière",
        "Suspension pneumatique réglable",
        "Système audio premium Meridian",
        "Toit panoramique",
        "Habitacle climatisé",
        "Wi-Fi embarqué",
      ],
      de: [
        "Hintere Executive-Sitze",
        "Verstellbare Luftfederung",
        "Premium-Soundsystem von Meridian",
        "Panoramadach",
        "Klimatisierte Kabine",
        "WLAN an Bord",
      ],
    },
    whyChoose: {
      en: [
        "Air suspension smooths out any road surface",
        "A more versatile option than a sedan for varied itineraries",
        "Premium Meridian sound system and panoramic roof",
        "A refined, understated alternative to a traditional limousine",
      ],
      ar: [
        "يعمل نظام التعليق الهوائي على تنعيم أي سطح طريق",
        "خيار أكثر تعددًا للاستخدامات من السيدان لمسارات متنوعة",
        "نظام صوت Meridian الفاخر وفتحة سقف بانورامية",
        "بديل راقٍ وغير مبالغ فيه عن الليموزين التقليدية",
      ],
      ru: [
        "Пневмоподвеска сглаживает любое дорожное покрытие",
        "Более универсальный вариант, чем седан, для разнообразных маршрутов",
        "Премиальная акустическая система Meridian и панорамная крыша",
        "Изысканная, сдержанная альтернатива традиционному лимузину",
      ],
      zh: [
        "空气悬挂系统可平顺应对任何路况",
        "相比轿车更具多功能性,适合多样化行程安排",
        "傲思(Meridian)高级音响系统与全景天窗",
        "相较传统豪华轿车,更显精致低调的替代之选",
      ],
      fr: [
        "La suspension pneumatique lisse tous types de revêtements routiers",
        "Une option plus polyvalente qu'une berline pour des itinéraires variés",
        "Système audio premium Meridian et toit panoramique",
        "Une alternative raffinée et discrète à la limousine traditionnelle",
      ],
      de: [
        "Die Luftfederung gleicht jeden Straßenbelag aus",
        "Eine vielseitigere Option als eine Limousine für abwechslungsreiche Routen",
        "Premium-Soundsystem von Meridian und Panoramadach",
        "Eine raffinierte, dezente Alternative zur klassischen Limousine",
      ],
    },
    faqs: [
      {
        question: {
          en: "Is the Range Rover Autobiography good for airport transfers?",
          ar: "هل رينج روفر أوتوبيوغرافي مناسبة لرحلات المطار؟",
          ru: "Хорош ли Range Rover Autobiography для трансферов из аэропорта?",
          zh: "揽胜Autobiography是否适合机场接送?",
          fr: "La Range Rover Autobiography convient-elle aux transferts aéroport ?",
          de: "Ist der Range Rover Autobiography gut für Flughafentransfers geeignet?",
        },
        answer: {
          en: "Yes — it's comfortable for airport transfers and works equally well for city touring or VIP transportation.",
          ar: "نعم — إنها مريحة لرحلات المطار وتعمل بنفس الكفاءة لجولات المدينة أو نقل كبار الشخصيات.",
          ru: "Да — он комфортен для трансферов из аэропорта и одинаково хорошо подходит для городских экскурсий или VIP-транспорта.",
          zh: "可以——它在机场接送方面十分舒适,同样适用于市区游览或贵宾出行。",
          fr: "Oui — elle est confortable pour les transferts aéroport et convient tout aussi bien aux visites en ville ou au transport VIP.",
          de: "Ja — er ist komfortabel für Flughafentransfers und eignet sich ebenso gut für Stadtrundfahrten oder VIP-Transport.",
        },
      },
      {
        question: {
          en: "How much luggage fits in the Range Rover?",
          ar: "كم كمية الأمتعة التي تتسع لها رينج روفر؟",
          ru: "Сколько багажа помещается в Range Rover?",
          zh: "揽胜可容纳多少行李?",
          fr: "Quelle quantité de bagages la Range Rover peut-elle contenir ?",
          de: "Wie viel Gepäck passt in den Range Rover?",
        },
        answer: {
          en: "The Autobiography holds up to 3 pieces of luggage comfortably alongside up to 4 passengers.",
          ar: "تتسع أوتوبيوغرافي بسهولة لما يصل إلى 3 قطع أمتعة مع ما يصل إلى 4 ركاب.",
          ru: "Autobiography комфортно вмещает до 3 единиц багажа вместе с до 4 пассажирами.",
          zh: "Autobiography可在搭载最多4名乘客的同时,舒适容纳最多3件行李。",
          fr: "L'Autobiography contient confortablement jusqu'à 3 bagages avec jusqu'à 4 passagers.",
          de: "Der Autobiography fasst bequem bis zu 3 Gepäckstücke bei bis zu 4 Passagieren.",
        },
      },
      {
        question: {
          en: "Is the Range Rover available with a professional chauffeur?",
          ar: "هل رينج روفر متاحة مع سائق محترف؟",
          ru: "Доступен ли Range Rover с профессиональным шофёром?",
          zh: "揽胜是否配有专业司机?",
          fr: "La Range Rover est-elle disponible avec un chauffeur professionnel ?",
          de: "Ist der Range Rover mit einem professionellen Chauffeur verfügbar?",
        },
        answer: {
          en: "Yes, every booking includes a professionally trained, licensed chauffeur.",
          ar: "نعم، يشمل كل حجز سائقًا مرخصًا ومدربًا باحترافية.",
          ru: "Да, каждое бронирование включает профессионально обученного, лицензированного шофёра.",
          zh: "是的,每次预订均配有经专业培训、持证上岗的司机。",
          fr: "Oui, chaque réservation inclut un chauffeur professionnellement formé et agréé.",
          de: "Ja, jede Buchung beinhaltet einen professionell ausgebildeten, lizenzierten Chauffeur.",
        },
      },
    ],
  },
  {
    slug: "cadillac-escalade",
    brand: "Cadillac",
    model: "Escalade ESV",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2800, fiveHours: 1700, oneHour: 450, airport: 600, extraHour: 350, additionalCity: 350 },
    images: [
      {
        src: "/images/fleet/cadillac-escalade/cadillac-escalade-1.png",
        alt: {
          en: "Black Cadillac Escalade ESV front three-quarter view with chrome grille in a marble-floored showroom",
          ar: "منظر أمامي جانبي لكاديلاك إسكاليد ESV السوداء بشبك أمامي كرومي في صالة عرض بأرضية رخامية",
          ru: "Чёрный Cadillac Escalade ESV спереди сбоку с хромированной решёткой радиатора в шоуруме с мраморным полом",
          zh: "黑色凯迪拉克凯雷德ESV前四分之三视角,镀铬进气格栅,置身大理石地面展厅",
          fr: "Cadillac Escalade ESV noire vue avant trois-quarts avec calandre chromée dans un showroom au sol en marbre",
          de: "Schwarzer Cadillac Escalade ESV in Vorderansicht von schräg vorne mit Chromgrill in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/cadillac-escalade/cadillac-escalade-2.png",
        alt: {
          en: "Cadillac Escalade ESV second-row captain's chair in black leather with contrast piping",
          ar: "مقعد فردي في الصف الثاني بكاديلاك إسكاليد ESV من الجلد الأسود مع حواف بلون مغاير",
          ru: "Капитанское кресло второго ряда Cadillac Escalade ESV из чёрной кожи с контрастным кантом",
          zh: "凯迪拉克凯雷德ESV第二排独立座椅,黑色真皮配撞色滚边",
          fr: "Siège capitaine de deuxième rangée de la Cadillac Escalade ESV en cuir noir avec passepoil contrastant",
          de: "Captain-Seat der zweiten Sitzreihe des Cadillac Escalade ESV in schwarzem Leder mit Kontrastpaspel",
        },
      },
      {
        src: "/images/fleet/cadillac-escalade/cadillac-escalade-3.png",
        alt: {
          en: "Cadillac Escalade ESV rear cabin with second-row captain's chairs and third-row bench seating",
          ar: "المقصورة الخلفية لكاديلاك إسكاليد ESV بمقاعد فردية في الصف الثاني ومقعد طويل في الصف الثالث",
          ru: "Задний салон Cadillac Escalade ESV с капитанскими креслами второго ряда и диваном третьего ряда",
          zh: "凯迪拉克凯雷德ESV后舱,第二排独立座椅及第三排长椅座",
          fr: "Habitacle arrière de la Cadillac Escalade ESV avec sièges capitaine de deuxième rangée et banquette de troisième rangée",
          de: "Fondkabine des Cadillac Escalade ESV mit Captain-Seats der zweiten Reihe und Sitzbank der dritten Reihe",
        },
      },
    ],
    name: "Cadillac Escalade ESV",
    category: "SUV",
    tagline: {
      en: "A bold, commanding presence",
      ar: "حضور جريء ومهيب",
      ru: "Смелый, властный статус",
      zh: "气宇轩昂,气场十足",
      fr: "Une présence audacieuse et imposante",
      de: "Eine kühne, gebieterische Präsenz",
    },
    description: {
      en: "A full-size luxury SUV built for VIP and family travel — commanding road presence with generous room for passengers and luggage alike.",
      ar: "سيارة دفع رباعي فاخرة كاملة الحجم مصممة لنقل كبار الشخصيات والعائلات — حضور طرقي مهيب مع مساحة واسعة للركاب والأمتعة على حد سواء.",
      ru: "Полноразмерный роскошный внедорожник для VIP- и семейных поездок — внушительный дорожный статус с просторным местом как для пассажиров, так и для багажа.",
      zh: "专为贵宾及家庭出行打造的全尺寸豪华SUV——气场强大,同时为乘客与行李提供充裕空间。",
      fr: "Un SUV de luxe pleine grandeur conçu pour les déplacements VIP et familiaux — une présence imposante sur la route avec un espace généreux pour les passagers comme pour les bagages.",
      de: "Ein Luxus-SUV in voller Größe für VIP- und Familienreisen — gebieterische Straßenpräsenz mit großzügigem Platz für Passagiere und Gepäck gleichermaßen.",
    },
    longDescription: {
      en: "The Escalade brings genuine road presence to VIP transportation — a full-size SUV with three rows of leather seating, ideal when the arrival itself needs to make an impression. Its elevated ride height and commanding proportions make it a frequent choice for security-conscious transport and dignitary movements, where size and visibility matter as much as comfort. Three rows of seating comfortably accommodate larger groups or families travelling with luggage, backed by a premium sound system and tinted privacy windows for the rear cabin. A child seat is available on request for family bookings. Whether it's a VIP arrival, an airport run for the whole family, or a group that simply doesn't fit in a sedan, the Escalade delivers without compromise.",
      ar: "تضفي إسكاليد حضورًا طرقيًا حقيقيًا على نقل كبار الشخصيات — سيارة دفع رباعي كاملة الحجم بثلاثة صفوف من المقاعد الجلدية، مثالية عندما يحتاج الوصول نفسه إلى ترك انطباع. يجعلها ارتفاعها المرتفع وتناسقها المهيب خيارًا متكررًا للنقل الحساس أمنيًا وتنقلات كبار الشخصيات، حيث يهم الحجم ووضوح الرؤية بقدر أهمية الراحة. تستوعب الصفوف الثلاثة من المقاعد بسهولة مجموعات أكبر أو عائلات مسافرة بأمتعة، مدعومة بنظام صوت فاخر ونوافذ خصوصية داكنة للمقصورة الخلفية. يتوفر مقعد أطفال عند الطلب للحجوزات العائلية. سواء كان وصولًا لكبار الشخصيات، أو رحلة مطار للعائلة بأكملها، أو مجموعة لا تتسع ببساطة في سيدان، تقدم إسكاليد الحل دون أي تنازل.",
      ru: "Escalade придаёт VIP-транспорту подлинный дорожный статус — полноразмерный внедорожник с тремя рядами кожаных сидений, идеальный, когда само прибытие должно произвести впечатление. Приподнятая посадка и внушительные пропорции делают его частым выбором для транспорта с повышенными требованиями к безопасности и передвижения официальных лиц, где размер и видимость важны не менее комфорта. Три ряда сидений комфортно вмещают большие группы или семьи, путешествующие с багажом, при поддержке премиальной акустической системы и тонированных окон приватности заднего салона. Детское кресло доступно по запросу для семейных бронирований. Будь то VIP-прибытие, поездка в аэропорт для всей семьи или группа, которая просто не помещается в седан, Escalade справляется без компромиссов.",
      zh: "凯雷德为贵宾出行带来真正的道路气场——全尺寸SUV配三排真皮座椅,当抵达本身需要留下深刻印象时,是理想之选。其较高的车身高度与威严的车身比例,使其成为对安保有较高要求的运输及要员出行的常见之选,车身尺寸与可见性在此与舒适度同样重要。三排座椅可轻松容纳携带行李的大型团体或家庭出行,并配备高级音响系统及后舱深色隐私车窗。家庭预订可应要求配备儿童安全座椅。无论是贵宾抵达、举家机场出行,还是轿车无法容纳的团体,凯雷德都能从容满足,毫不妥协。",
      fr: "L'Escalade confère une réelle présence routière au transport VIP — un SUV pleine grandeur avec trois rangées de sièges en cuir, idéal lorsque l'arrivée elle-même doit marquer les esprits. Sa garde au sol élevée et ses proportions imposantes en font un choix fréquent pour les transports soucieux de sécurité et les déplacements de dignitaires, où la taille et la visibilité comptent autant que le confort. Trois rangées de sièges accueillent confortablement des groupes plus importants ou des familles voyageant avec des bagages, soutenues par un système audio premium et des vitres teintées d'intimité pour l'habitacle arrière. Un siège enfant est disponible sur demande pour les réservations familiales. Qu'il s'agisse d'une arrivée VIP, d'un trajet aéroport pour toute la famille, ou d'un groupe qui ne tient tout simplement pas dans une berline, l'Escalade répond présent sans compromis.",
      de: "Der Escalade verleiht dem VIP-Transport echte Straßenpräsenz — ein SUV in voller Größe mit drei Sitzreihen aus Leder, ideal, wenn die Ankunft selbst Eindruck machen soll. Seine erhöhte Sitzposition und gebieterischen Proportionen machen ihn zu einer häufigen Wahl für sicherheitsbewussten Transport und die Beförderung von Würdenträgern, bei denen Größe und Sichtbarkeit ebenso zählen wie Komfort. Drei Sitzreihen bieten bequem Platz für größere Gruppen oder Familien mit Gepäck, unterstützt von einem Premium-Soundsystem und getönten Sichtschutzscheiben für die Fondkabine. Ein Kindersitz ist auf Anfrage für Familienbuchungen erhältlich. Ob VIP-Ankunft, Flughafenfahrt für die ganze Familie oder eine Gruppe, die einfach nicht in eine Limousine passt — der Escalade liefert ohne Kompromisse.",
    },
    passengers: 5,
    luggage: 4,
    idealFor: {
      en: "VIP & family travel",
      ar: "سفر كبار الشخصيات والعائلات",
      ru: "VIP- и семейные поездки",
      zh: "贵宾与家庭出行",
      fr: "Voyages VIP et familiaux",
      de: "VIP- & Familienreisen",
    },
    features: {
      en: [
        "Three-row leather seating",
        "Elevated ride height",
        "Premium sound system",
        "Ample luggage space",
        "Child seat available on request",
      ],
      ar: [
        "مقاعد جلدية بثلاثة صفوف",
        "ارتفاع مرتفع للسيارة",
        "نظام صوت فاخر",
        "مساحة أمتعة واسعة",
        "مقعد أطفال متاح عند الطلب",
      ],
      ru: [
        "Три ряда кожаных сидений",
        "Приподнятая посадка",
        "Премиальная акустическая система",
        "Просторное багажное отделение",
        "Детское кресло по запросу",
      ],
      zh: [
        "三排真皮座椅",
        "较高车身高度",
        "高级音响系统",
        "充裕行李空间",
        "可应要求配备儿童安全座椅",
      ],
      fr: [
        "Sièges en cuir sur trois rangées",
        "Garde au sol élevée",
        "Système audio premium",
        "Grand espace de rangement",
        "Siège enfant disponible sur demande",
      ],
      de: [
        "Dreireihige Ledersitze",
        "Erhöhte Sitzposition",
        "Premium-Soundsystem",
        "Großzügiger Gepäckraum",
        "Kindersitz auf Anfrage erhältlich",
      ],
    },
    whyChoose: {
      en: [
        "Commanding size and presence for VIP arrivals",
        "Three rows accommodate larger groups or families with luggage",
        "Elevated seating position for added comfort and visibility",
        "A frequent choice for security-conscious VIP transportation",
      ],
      ar: [
        "حجم وحضور مهيبان لوصولات كبار الشخصيات",
        "تستوعب الصفوف الثلاثة مجموعات أكبر أو عائلات بأمتعة",
        "وضعية جلوس مرتفعة لراحة ووضوح رؤية إضافيين",
        "خيار متكرر لنقل كبار الشخصيات الحساس أمنيًا",
      ],
      ru: [
        "Внушительный размер и статус для VIP-прибытий",
        "Три ряда вмещают большие группы или семьи с багажом",
        "Приподнятая посадка для дополнительного комфорта и обзора",
        "Частый выбор для VIP-транспорта с повышенными требованиями к безопасности",
      ],
      zh: [
        "尊贵抵达所需的强大车身与气场",
        "三排座椅可容纳携带行李的大型团体或家庭",
        "较高坐姿带来更佳舒适度与视野",
        "对安保要求较高的贵宾出行的常见之选",
      ],
      fr: [
        "Une taille et une présence imposantes pour les arrivées VIP",
        "Trois rangées accueillent des groupes plus importants ou des familles avec bagages",
        "Position assise surélevée pour un confort et une visibilité accrus",
        "Un choix fréquent pour le transport VIP soucieux de sécurité",
      ],
      de: [
        "Gebieterische Größe und Präsenz für VIP-Ankünfte",
        "Drei Sitzreihen bieten Platz für größere Gruppen oder Familien mit Gepäck",
        "Erhöhte Sitzposition für zusätzlichen Komfort und bessere Sicht",
        "Eine häufige Wahl für sicherheitsbewussten VIP-Transport",
      ],
    },
    faqs: [
      {
        question: {
          en: "How many passengers can the Escalade seat?",
          ar: "كم عدد الركاب الذين تتسع لهم إسكاليد؟",
          ru: "Сколько пассажиров вмещает Escalade?",
          zh: "凯雷德最多可搭载多少乘客?",
          fr: "Combien de passagers l'Escalade peut-elle accueillir ?",
          de: "Wie viele Passagiere fasst der Escalade?",
        },
        answer: {
          en: "Up to 5 passengers with full comfort, with three-row seating and generous luggage space.",
          ar: "ما يصل إلى 5 ركاب براحة كاملة، مع مقاعد ثلاثية الصفوف ومساحة أمتعة واسعة.",
          ru: "До 5 пассажиров с полным комфортом, с трёхрядными сиденьями и просторным багажным отделением.",
          zh: "最多可舒适搭载5名乘客,配三排座椅及充裕行李空间。",
          fr: "Jusqu'à 5 passagers en tout confort, avec des sièges sur trois rangées et un grand espace de rangement.",
          de: "Bis zu 5 Passagiere in vollem Komfort, mit dreireihiger Bestuhlung und großzügigem Gepäckraum.",
        },
      },
      {
        question: {
          en: "Is the Escalade suitable for VIP security details?",
          ar: "هل تناسب إسكاليد تفاصيل أمن كبار الشخصيات؟",
          ru: "Подходит ли Escalade для VIP-охраны?",
          zh: "凯雷德是否适合贵宾安保出行?",
          fr: "L'Escalade convient-elle aux dispositifs de sécurité VIP ?",
          de: "Ist der Escalade für VIP-Sicherheitsdetails geeignet?",
        },
        answer: {
          en: "Yes, it's a frequent choice for VIP and dignitary transport where size and presence matter.",
          ar: "نعم، إنها خيار متكرر لنقل كبار الشخصيات والشخصيات الرسمية حيث يهم الحجم والحضور.",
          ru: "Да, это частый выбор для VIP-транспорта и перевозки официальных лиц, где важны размер и статус.",
          zh: "可以,在车身尺寸与气场同样重要的贵宾及要员出行中,它是常见之选。",
          fr: "Oui, c'est un choix fréquent pour le transport VIP et de dignitaires où la taille et la présence comptent.",
          de: "Ja, er ist eine häufige Wahl für VIP- und Würdenträgertransport, bei dem Größe und Präsenz zählen.",
        },
      },
      {
        question: {
          en: "Can I request a child seat in the Escalade?",
          ar: "هل يمكنني طلب مقعد أطفال في إسكاليد؟",
          ru: "Могу ли я запросить детское кресло в Escalade?",
          zh: "可以为凯雷德申请儿童安全座椅吗?",
          fr: "Puis-je demander un siège enfant dans l'Escalade ?",
          de: "Kann ich einen Kindersitz für den Escalade anfragen?",
        },
        answer: {
          en: "Yes, child seats are available on request — note it under special requests when booking.",
          ar: "نعم، مقاعد الأطفال متاحة عند الطلب — يُرجى ذكر ذلك ضمن الطلبات الخاصة عند الحجز.",
          ru: "Да, детские кресла доступны по запросу — укажите это в особых пожеланиях при бронировании.",
          zh: "可以,儿童安全座椅可应要求提供——预订时请在特殊要求中注明。",
          fr: "Oui, les sièges enfant sont disponibles sur demande — précisez-le dans les demandes spéciales lors de la réservation.",
          de: "Ja, Kindersitze sind auf Anfrage erhältlich — bitte bei der Buchung unter besonderen Wünschen angeben.",
        },
      },
    ],
  },
  {
    slug: "mercedes-v-class",
    badge: {
      en: "Most Popular",
      ar: "الأكثر رواجًا",
      ru: "Самый популярный",
      zh: "最受欢迎",
      fr: "Le plus populaire",
      de: "Am beliebtesten",
    },
    brand: "Mercedes-Benz",
    model: "V-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2200, fiveHours: 1300, oneHour: 350, airport: 450, extraHour: 250, additionalCity: 250 },
    images: [
      {
        src: "/images/fleet/mercedes-v-class/mercedes-v-class-1.png",
        alt: {
          en: "Black Mercedes V-Class front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لمرسيدس V-Class السوداء في صالة عرض بأرضية رخامية",
          ru: "Чёрный Mercedes V-Class спереди сбоку в шоуруме с мраморным полом",
          zh: "黑色梅赛德斯V级前四分之三视角,置身大理石地面展厅",
          fr: "Mercedes Classe V noire vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Schwarze Mercedes V-Klasse in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/mercedes-v-class/mercedes-v-class-2.png",
        alt: {
          en: "Mercedes V-Class rear passenger seating in black leather with bottled water in the door holders",
          ar: "مقاعد الركاب الخلفية في مرسيدس V-Class من الجلد الأسود مع مياه معبأة في حاملات الأبواب",
          ru: "Задние пассажирские сиденья Mercedes V-Class из чёрной кожи с бутилированной водой в дверных держателях",
          zh: "梅赛德斯V级后排乘客座椅,黑色真皮,车门杯架内备有瓶装水",
          fr: "Sièges passagers arrière de la Mercedes Classe V en cuir noir avec bouteilles d eau dans les porte-gobelets de portière",
          de: "Fondsitze der Mercedes V-Klasse in schwarzem Leder mit Wasserflaschen in den Türhaltern",
        },
      },
      {
        src: "/images/fleet/mercedes-v-class/mercedes-v-class-3.jpg",
        alt: {
          en: "Mercedes V-Class open boot loaded with five suitcases",
          ar: "صندوق مرسيدس V-Class المفتوح محملاً بخمس حقائب سفر",
          ru: "Открытый багажник Mercedes V-Class, загруженный пятью чемоданами",
          zh: "梅赛德斯V级敞开的后备厢,装载五个行李箱",
          fr: "Coffre ouvert de la Mercedes Classe V chargé de cinq valises",
          de: "Geöffneter Kofferraum der Mercedes V-Klasse mit fünf Koffern beladen",
        },
      },
    ],    name: "Mercedes V-Class",
    category: "Van",
    tagline: {
      en: "Space, styled",
      ar: "مساحة بأسلوب راقٍ",
      ru: "Пространство со стилем",
      zh: "宽敞空间,尽显格调",
      fr: "L'espace, avec style",
      de: "Raum mit Stil",
    },
    description: {
      en: "A spacious, beautifully finished van for group transfers and events — seating for up to six without sacrificing the comfort of a luxury sedan.",
      ar: "حافلة صغيرة واسعة ومصنعة بعناية فائقة لنقل المجموعات والفعاليات — تتسع لستة أشخاص دون التضحية براحة السيدان الفاخرة.",
      ru: "Просторный, безупречно отделанный микроавтобус для групповых трансферов и мероприятий — вмещает до шести человек без потери комфорта, присущего роскошному седану.",
      zh: "宽敞精致的商务车,专为团体接送及活动而设——最多可容纳六人,同时不失豪华轿车般的舒适体验。",
      fr: "Un van spacieux et magnifiquement fini pour les transferts de groupe et les événements — jusqu'à six places sans sacrifier le confort d'une berline de luxe.",
      de: "Ein geräumiger, hochwertig verarbeiteter Van für Gruppentransfers und Veranstaltungen — Platz für bis zu sechs Personen, ohne auf den Komfort einer Luxuslimousine zu verzichten.",
    },
    longDescription: {
      en: "Built for groups who still expect a luxury experience, the V-Class pairs generous cabin space with the fit and finish of a Mercedes flagship. Configurable captain's chairs, individual climate zones, and room for six make it the natural choice for events and family travel alike, without anyone feeling cramped for a longer ride. Sliding doors make loading and unloading effortless at hotel entrances or venue drop-offs, and the dedicated luggage area comfortably holds bags for the whole party — no roof box, no second car. A rear entertainment screen and onboard Wi-Fi help longer transfers pass quickly, while individual reading lights keep things comfortable after dark. For groups landing together or travelling as one party to a wedding or conference, it means one coordinated chauffeured vehicle instead of juggling several sedans.",
      ar: "مصممة للمجموعات التي لا تزال تتوقع تجربة فاخرة، تجمع V-Class بين مساحة مقصورة واسعة وجودة تصنيع تليق بسيارة رائدة من مرسيدس. تجعل المقاعد الفردية القابلة للتهيئة، ومناطق التحكم الفردية بدرجة الحرارة، والمساحة الكافية لستة أشخاص منها الخيار الطبيعي للفعاليات والسفر العائلي على حد سواء، دون أن يشعر أحد بالازدحام في رحلة طويلة. تجعل الأبواب المنزلقة عمليتي التحميل والتفريغ سهلتين عند مداخل الفنادق أو نقاط التوصيل، بينما تستوعب منطقة الأمتعة المخصصة بسهولة حقائب المجموعة بأكملها — دون الحاجة لصندوق سقف أو سيارة ثانية. تساعد شاشة الترفيه الخلفية وشبكة الواي فاي على متن السيارة على جعل الرحلات الطويلة تمر بسرعة، بينما تحافظ إضاءة القراءة الفردية على الراحة بعد حلول الظلام. بالنسبة للمجموعات التي تصل معًا أو تسافر كوفد واحد إلى حفل زفاف أو مؤتمر، فإن ذلك يعني سيارة واحدة منسقة بسائق خاص بدلًا من التعامل مع عدة سيارات سيدان.",
      ru: "Созданный для групп, по-прежнему ожидающих роскошного опыта, V-Class сочетает просторный салон с качеством отделки флагманского Mercedes. Настраиваемые капитанские кресла, индивидуальные климатические зоны и место для шести человек делают его естественным выбором как для мероприятий, так и для семейных поездок, не вызывая ощущения тесноты в долгой поездке. Раздвижные двери делают погрузку и выгрузку лёгкой у входов в отели или на площадках, а специальная зона для багажа удобно вмещает вещи всей компании — без багажника на крыше, без второй машины. Задний развлекательный экран и бортовой Wi-Fi помогают быстрее скоротать долгие трансферы, а индивидуальное освещение для чтения обеспечивает комфорт после наступления темноты. Для групп, прилетающих вместе, или компаний, направляющихся на свадьбу или конференцию, это означает один согласованный автомобиль с шофёром вместо жонглирования несколькими седанами.",
      zh: "V级专为仍期待豪华体验的团体而打造,兼具宽敞的座舱空间与梅赛德斯旗舰车型般的精湛工艺。可灵活配置的独立座椅、独立温区,以及可容纳六人的空间,使其自然成为活动出行与家庭旅行的理想之选,即使长途乘坐也不会感到局促。滑动车门让酒店门口或场地接送的上下车过程轻松自如,专属行李区更可从容容纳全体成员的行李——无需车顶行李箱,也无需第二辆车。后排娱乐屏幕与车载WiFi让较长的接送行程更快过去,独立阅读灯则在夜幕降临后依然保持舒适体验。对于共同抵达或作为一个团队前往婚礼、会议的团体而言,这意味着只需一辆统一协调的专属司机座驾,而无需协调多辆轿车。",
      fr: "Conçue pour les groupes qui attendent malgré tout une expérience de luxe, la Classe V allie un espace habitacle généreux à la finition d'un porte-étendard Mercedes. Des sièges capitaine configurables, des zones climatiques individuelles et une place pour six en font le choix naturel pour les événements comme pour les voyages en famille, sans que personne ne se sente à l'étroit sur un long trajet. Les portes coulissantes facilitent le chargement et le déchargement aux entrées d'hôtel ou aux dépose-minute, et l'espace bagages dédié contient confortablement les bagages de tout le groupe — sans coffre de toit, sans seconde voiture. Un écran de divertissement arrière et le Wi-Fi embarqué aident à faire passer rapidement les longs transferts, tandis que les liseuses individuelles maintiennent le confort après la tombée de la nuit. Pour les groupes arrivant ensemble ou voyageant en une seule troupe vers un mariage ou une conférence, cela signifie un seul véhicule chauffeur coordonné au lieu de jongler avec plusieurs berlines.",
      de: "Für Gruppen konzipiert, die dennoch ein Luxuserlebnis erwarten, verbindet die V-Klasse großzügigen Kabinenraum mit der Verarbeitungsqualität eines Mercedes-Flaggschiffs. Konfigurierbare Captain-Seats, individuelle Klimazonen und Platz für sechs Personen machen sie zur natürlichen Wahl für Veranstaltungen wie Familienreisen gleichermaßen, ohne dass sich bei längeren Fahrten jemand beengt fühlt. Schiebetüren machen das Ein- und Aussteigen an Hoteleingängen oder Veranstaltungsorten mühelos, und der dedizierte Gepäckbereich fasst bequem das Gepäck der ganzen Gruppe — keine Dachbox, kein zweites Fahrzeug nötig. Ein hinterer Entertainment-Bildschirm und WLAN an Bord lassen längere Transfers schneller vergehen, während individuelle Leselichter auch nach Einbruch der Dunkelheit für Komfort sorgen. Für Gruppen, die gemeinsam landen oder als eine Reisegesellschaft zu einer Hochzeit oder Konferenz unterwegs sind, bedeutet das ein koordiniertes Chauffeurfahrzeug statt mehrerer Limousinen zu jonglieren.",
    },
    passengers: 6,
    luggage: 6,
    idealFor: {
      en: "Group transfers & events",
      ar: "نقل المجموعات والفعاليات",
      ru: "Групповые трансферы и мероприятия",
      zh: "团体接送与活动",
      fr: "Transferts de groupe et événements",
      de: "Gruppentransfers & Veranstaltungen",
    },
    features: {
      en: [
        "Configurable captain's chairs",
        "Extra luggage capacity",
        "Rear entertainment screen",
        "Sliding doors for easy access",
        "Onboard Wi-Fi",
        "Individual reading lights",
      ],
      ar: [
        "مقاعد فردية قابلة للتهيئة",
        "سعة أمتعة إضافية",
        "شاشة ترفيه خلفية",
        "أبواب منزلقة لسهولة الدخول",
        "شبكة واي فاي على متن السيارة",
        "إضاءة قراءة فردية",
      ],
      ru: [
        "Настраиваемые капитанские кресла",
        "Дополнительная вместимость багажа",
        "Задний развлекательный экран",
        "Раздвижные двери для лёгкого доступа",
        "Wi-Fi в салоне",
        "Индивидуальное освещение для чтения",
      ],
      zh: [
        "可灵活配置的独立座椅",
        "额外行李容量",
        "后排娱乐屏幕",
        "滑动车门,便于出入",
        "车载WiFi",
        "独立阅读灯",
      ],
      fr: [
        "Sièges capitaine configurables",
        "Capacité de rangement supplémentaire",
        "Écran de divertissement arrière",
        "Portes coulissantes pour un accès facile",
        "Wi-Fi embarqué",
        "Liseuses individuelles",
      ],
      de: [
        "Konfigurierbare Captain-Seats",
        "Zusätzlicher Gepäckraum",
        "Hinterer Entertainment-Bildschirm",
        "Schiebetüren für einfachen Zugang",
        "WLAN an Bord",
        "Individuelle Leselichter",
      ],
    },
    whyChoose: {
      en: [
        "Seats up to 6 without cramming — ideal for families and small groups",
        "Luggage capacity matched to passenger count for full travel parties",
        "Sliding doors make loading and unloading effortless at hotels",
        "One coordinated vehicle instead of multiple sedans",
      ],
      ar: [
        "تتسع لستة أشخاص دون ازدحام — مثالية للعائلات والمجموعات الصغيرة",
        "سعة أمتعة تتناسب مع عدد الركاب لمجموعات السفر الكاملة",
        "تجعل الأبواب المنزلقة التحميل والتفريغ سهلين عند الفنادق",
        "سيارة واحدة منسقة بدلًا من عدة سيارات سيدان",
      ],
      ru: [
        "Вмещает до 6 человек без тесноты — идеально для семей и небольших групп",
        "Вместимость багажа соответствует числу пассажиров для полных туристических групп",
        "Раздвижные двери упрощают погрузку и выгрузку у отелей",
        "Один согласованный автомобиль вместо нескольких седанов",
      ],
      zh: [
        "最多可容纳6人且毫不局促——是家庭及小型团体的理想之选",
        "行李容量与乘客人数相匹配,满足整个出行团队需求",
        "滑动车门让酒店处的上下车与装卸行李轻松自如",
        "一辆统一协调的座驾,无需协调多辆轿车",
      ],
      fr: [
        "Jusqu'à 6 places sans être à l'étroit — idéal pour les familles et petits groupes",
        "Capacité bagages adaptée au nombre de passagers pour des groupes complets",
        "Les portes coulissantes facilitent le chargement et déchargement dans les hôtels",
        "Un seul véhicule coordonné au lieu de plusieurs berlines",
      ],
      de: [
        "Platz für bis zu 6 Personen ohne Enge — ideal für Familien und kleine Gruppen",
        "Gepäckkapazität passend zur Passagierzahl für komplette Reisegesellschaften",
        "Schiebetüren machen Ein- und Ausladen an Hotels mühelos",
        "Ein koordiniertes Fahrzeug statt mehrerer Limousinen",
      ],
    },
    faqs: [
      {
        question: {
          en: "How many passengers fit in the Mercedes V-Class?",
          ar: "كم عدد الركاب الذين تتسع لهم مرسيدس V-Class؟",
          ru: "Сколько пассажиров вмещает Mercedes V-Class?",
          zh: "梅赛德斯V级可容纳多少乘客?",
          fr: "Combien de passagers la Mercedes Classe V peut-elle accueillir ?",
          de: "Wie viele Passagiere fasst die Mercedes V-Klasse?",
        },
        answer: {
          en: "The V-Class comfortably seats up to 6 passengers with individual captain's chairs, plus a dedicated luggage area.",
          ar: "تتسع V-Class بسهولة لما يصل إلى 6 ركاب بمقاعد فردية، بالإضافة إلى منطقة أمتعة مخصصة.",
          ru: "V-Class комфортно вмещает до 6 пассажиров с индивидуальными капитанскими креслами, плюс специальная зона для багажа.",
          zh: "V级可舒适容纳最多6名乘客,配独立座椅及专属行李区。",
          fr: "La Classe V accueille confortablement jusqu'à 6 passagers avec sièges capitaine individuels, plus un espace bagages dédié.",
          de: "Die V-Klasse bietet bequem Platz für bis zu 6 Passagiere mit individuellen Captain-Seats, plus einem eigenen Gepäckbereich.",
        },
      },
      {
        question: {
          en: "Is the V-Class good for airport group transfers?",
          ar: "هل تناسب V-Class نقل المجموعات من المطار؟",
          ru: "Хорош ли V-Class для групповых трансферов из аэропорта?",
          zh: "V级是否适合机场团体接送?",
          fr: "La Classe V convient-elle aux transferts aéroport de groupe ?",
          de: "Ist die V-Klasse gut für Flughafen-Gruppentransfers geeignet?",
        },
        answer: {
          en: "Yes — it's our most popular vehicle for groups landing together at DXB or DWC, keeping everyone in one car.",
          ar: "نعم — إنها السيارة الأكثر رواجًا لدينا للمجموعات الواصلة معًا إلى مطار دبي الدولي أو مطار آل مكتوم، مع إبقاء الجميع في سيارة واحدة.",
          ru: "Да — это наш самый популярный автомобиль для групп, прилетающих вместе в DXB или DWC, позволяющий разместить всех в одной машине.",
          zh: "可以——对于共同抵达DXB或DWC机场的团体而言,它是我们最受欢迎的车型,可让所有人乘坐同一辆车。",
          fr: "Oui — c'est notre véhicule le plus populaire pour les groupes arrivant ensemble à DXB ou DWC, gardant tout le monde dans une seule voiture.",
          de: "Ja — sie ist unser beliebtestes Fahrzeug für Gruppen, die gemeinsam am DXB oder DWC landen, sodass alle in einem Auto bleiben.",
        },
      },
      {
        question: {
          en: "Can the V-Class be booked for events?",
          ar: "هل يمكن حجز V-Class للفعاليات؟",
          ru: "Можно ли забронировать V-Class для мероприятий?",
          zh: "V级是否可用于活动预订?",
          fr: "La Classe V peut-elle être réservée pour des événements ?",
          de: "Kann die V-Klasse für Veranstaltungen gebucht werden?",
        },
        answer: {
          en: "Absolutely. We regularly deploy multiple V-Class vans for conferences and weddings needing coordinated group transport.",
          ar: "بالتأكيد. نقوم بانتظام بتوفير عدة حافلات V-Class للمؤتمرات وحفلات الزفاف التي تتطلب نقل مجموعات منسقًا.",
          ru: "Безусловно. Мы регулярно задействуем несколько микроавтобусов V-Class для конференций и свадеб, требующих согласованного группового транспорта.",
          zh: "当然可以。我们经常为需要统一协调团体交通的会议及婚礼调配多辆V级商务车。",
          fr: "Absolument. Nous déployons régulièrement plusieurs vans Classe V pour des conférences et mariages nécessitant un transport de groupe coordonné.",
          de: "Auf jeden Fall. Wir setzen regelmäßig mehrere V-Klasse-Vans für Konferenzen und Hochzeiten ein, die einen koordinierten Gruppentransport benötigen.",
        },
      },
    ],
  },
  {
    slug: "bmw-7-series",
    badge: {
      en: "Corporate Preferred",
      ar: "المفضلة للشركات",
      ru: "Выбор корпоративных клиентов",
      zh: "企业首选",
      fr: "Préféré des entreprises",
      de: "Firmenfavorit",
    },
    brand: "BMW",
    model: "7 Series",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 500, extraHour: 300, additionalCity: 300 },
    images: [
      {
        src: "/images/fleet/bmw-7-series/bmw-7-series-1.png",
        alt: {
          en: "Black BMW 7 Series front three-quarter view with illuminated grille in a marble-floored showroom",
          ar: "منظر أمامي جانبي لسيارة بي إم دبليو الفئة 7 السوداء بشبك أمامي مضيء في صالة عرض بأرضية رخامية",
          ru: "Чёрный BMW 7 Series спереди сбоку с подсвеченной решёткой радиатора в шоуруме с мраморным полом",
          zh: "黑色宝马7系前四分之三视角,发光进气格栅,置身大理石地面展厅",
          fr: "BMW Série 7 noire vue avant trois-quarts avec calandre illuminée dans un showroom au sol en marbre",
          de: "Schwarzer BMW 7er in Vorderansicht von schräg vorne mit beleuchtetem Kühlergrill in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/bmw-7-series/bmw-7-series-2.png",
        alt: {
          en: "BMW 7 Series rear passenger cabin with cognac quilted leather seating",
          ar: "مقصورة الركاب الخلفية في بي إم دبليو الفئة 7 بمقاعد جلدية مبطنة بلون الكونياك",
          ru: "Задний пассажирский салон BMW 7 Series с сиденьями из стёганой кожи цвета коньяк",
          zh: "宝马7系后排乘客舱,干邑色绗缝真皮座椅",
          fr: "Habitacle arrière de la BMW Série 7 avec sièges en cuir matelassé cognac",
          de: "Fondkabine des BMW 7er mit gesteppten Ledersitzen in Cognac",
        },
      },
      {
        src: "/images/fleet/bmw-7-series/bmw-7-series-3.png",
        alt: {
          en: "BMW 7 Series rear seats with headrest cushions and illuminated rear-door touchscreen controls",
          ar: "المقاعد الخلفية في بي إم دبليو الفئة 7 مع وسائد لمساند الرأس وشاشة لمس مضيئة في الباب الخلفي",
          ru: "Задние сиденья BMW 7 Series с подушками подголовников и подсвеченным сенсорным экраном в двери",
          zh: "宝马7系后排座椅,配头枕软垫及发光车门触控屏",
          fr: "Sièges arrière de la BMW Série 7 avec coussins d'appuie-tête et écran tactile de porte illuminé",
          de: "Rücksitze des BMW 7er mit Kopfstützenkissen und beleuchtetem Touchscreen in der Fondtür",
        },
      },
    ],
    name: "BMW 7 Series",
    category: "Sedan",
    tagline: {
      en: "Refined power",
      ar: "قوة راقية",
      ru: "Утончённая мощь",
      zh: "精致澎湃动力",
      fr: "La puissance raffinée",
      de: "Verfeinerte Kraft",
    },
    description: {
      en: "A dynamic, driver-focused luxury sedan for executives who want business-ready comfort with a sharper edge on the road.",
      ar: "سيارة سيدان فاخرة ديناميكية تركز على تجربة القيادة، لرجال الأعمال الراغبين في راحة جاهزة للعمل مع طابع أكثر حدة على الطريق.",
      ru: "Динамичный, ориентированный на водителя роскошный седан для руководителей, желающих получить готовый к бизнесу комфорт с более острым характером на дороге.",
      zh: "动感十足、以驾驶为导向的豪华轿车,专为追求商务级舒适与更凌厉路感的行政人士而设。",
      fr: "Une berline de luxe dynamique et axée sur la conduite pour les cadres qui souhaitent un confort prêt pour les affaires avec un caractère plus affirmé sur la route.",
      de: "Eine dynamische, fahrerorientierte Luxuslimousine für Führungskräfte, die geschäftstauglichen Komfort mit einem schärferen Charakter auf der Straße wünschen.",
    },
    longDescription: {
      en: "The 7 Series brings a sharper, more dynamic character to executive travel — the same business-ready comfort as our other sedans, with noticeably more presence on the road. Executive lounge seating and the panoramic sky lounge roof give the cabin an open, spacious feel on longer routes, while rear-seat entertainment and onboard Wi-Fi keep you productive or simply unwound between stops. Privacy glass and a premium sound system round out a cabin that's every bit as quiet and comfortable as our other executive sedans, just with a bolder design language and a firmer, more dynamic ride. It's a strong choice for client pickups where visual presence matters, and for executives who want S-Class-level comfort with a distinct, more assertive character.",
      ar: "تضفي الفئة 7 طابعًا أكثر حدة وديناميكية على التنقل التنفيذي — نفس الراحة الجاهزة للعمل التي توفرها سياراتنا السيدان الأخرى، مع حضور أكبر بشكل ملحوظ على الطريق. تمنح مقاعد الصالة التنفيذية وسقف الصالة السماوية البانورامي المقصورة إحساسًا بالانفتاح والاتساع في المسارات الطويلة، بينما يحافظ نظام الترفيه في المقاعد الخلفية وشبكة الواي فاي على متن السيارة على إنتاجيتكم أو استرخائكم ببساطة بين المحطات. يكمل الزجاج العاكس للخصوصية ونظام الصوت الفاخر مقصورة هادئة ومريحة تمامًا كسياراتنا السيدان التنفيذية الأخرى، لكن بلغة تصميم أكثر جرأة وقيادة أكثر رسوخًا وديناميكية. إنها خيار قوي لاستقبال العملاء حيث يهم الحضور البصري، ولرجال الأعمال الراغبين في راحة بمستوى S-Class مع طابع مميز وأكثر جرأة.",
      ru: "7 Series привносит более острый, динамичный характер в представительские поездки — тот же готовый к бизнесу комфорт, что и у наших других седанов, с заметно большим присутствием на дороге. Представительские кресла-лаунж и панорамная стеклянная крыша sky lounge придают салону ощущение открытости и простора на длинных маршрутах, а развлекательная система для задних сидений и бортовой Wi-Fi позволяют оставаться продуктивным или просто расслабиться между остановками. Тонированные стёкла и премиальная акустическая система дополняют салон, столь же тихий и комфортный, как и в других наших представительских седанах, но с более смелым языком дизайна и более упругой, динамичной ездой. Это сильный выбор для встреч с клиентами, где важно визуальное присутствие, и для руководителей, желающих получить комфорт уровня S-Class с отличительным, более напористым характером.",
      zh: "7系为行政出行注入更凌厉、更具动感的气质——与我们其他轿车同等的商务级舒适度,却在路面上展现出更为显著的存在感。行政沙发式座椅与全景天幕式天窗,让座舱在长途行驶中更显开阔宽敞,后排娱乐系统与车载WiFi则让您在停靠间隙保持高效或尽情放松。隐私玻璃与高级音响系统相辅相成,营造出与其他行政轿车同样静谧舒适的座舱氛围,却拥有更大胆的设计语言与更沉稳、更具动感的驾乘质感。对于视觉存在感至关重要的客户接待场合,以及追求S级舒适度却期待更鲜明、更自信气质的行政人士而言,7系都是有力之选。",
      fr: "La Série 7 apporte un caractère plus affûté et dynamique aux déplacements executive — le même confort prêt pour les affaires que nos autres berlines, avec une présence nettement plus marquée sur la route. Les sièges lounge executive et le toit panoramique sky lounge confèrent à l'habitacle une sensation d'ouverture et d'espace sur les longs trajets, tandis que le divertissement aux places arrière et le Wi-Fi embarqué vous permettent de rester productif ou simplement de vous détendre entre deux arrêts. Les vitres teintées et un système audio premium complètent un habitacle tout aussi silencieux et confortable que nos autres berlines executive, mais avec un langage de conception plus audacieux et une conduite plus ferme et dynamique. C'est un choix fort pour les prises en charge de clients où la présence visuelle compte, et pour les cadres qui recherchent un confort de niveau Classe S avec un caractère distinct et plus affirmé.",
      de: "Der 7er verleiht Executive-Reisen einen schärferen, dynamischeren Charakter — denselben geschäftstauglichen Komfort wie unsere anderen Limousinen, mit spürbar mehr Präsenz auf der Straße. Executive-Lounge-Sitze und das Panorama-Sky-Lounge-Dach verleihen der Kabine auf längeren Strecken ein offenes, geräumiges Gefühl, während Fondunterhaltung und WLAN an Bord Sie zwischen den Stopps produktiv oder einfach entspannt halten. Sichtschutzverglasung und ein Premium-Soundsystem runden eine Kabine ab, die ebenso leise und komfortabel ist wie unsere anderen Executive-Limousinen, nur mit kühnerer Formensprache und einer strafferen, dynamischeren Fahrt. Er ist eine starke Wahl für Kundenabholungen, bei denen visuelle Präsenz zählt, und für Führungskräfte, die S-Klasse-Komfort mit einem eigenständigeren, selbstbewussteren Charakter wünschen.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Business travel & meetings",
      ar: "السفر التجاري والاجتماعات",
      ru: "Деловые поездки и встречи",
      zh: "商务出行与会议",
      fr: "Voyages d'affaires et réunions",
      de: "Geschäftsreisen & Termine",
    },
    features: {
      en: [
        "Executive lounge seating",
        "Panoramic sky lounge roof",
        "Premium sound system",
        "Rear-seat entertainment",
        "Onboard Wi-Fi",
      ],
      ar: [
        "مقاعد صالة تنفيذية",
        "سقف صالة سماوية بانورامي",
        "نظام صوت فاخر",
        "نظام ترفيه للمقاعد الخلفية",
        "شبكة واي فاي على متن السيارة",
      ],
      ru: [
        "Представительские кресла-лаунж",
        "Панорамная крыша sky lounge",
        "Премиальная акустическая система",
        "Развлекательная система для задних сидений",
        "Wi-Fi в салоне",
      ],
      zh: [
        "行政沙发式座椅",
        "全景天幕式天窗",
        "高级音响系统",
        "后排娱乐系统",
        "车载WiFi",
      ],
      fr: [
        "Sièges lounge executive",
        "Toit panoramique sky lounge",
        "Système audio premium",
        "Divertissement aux places arrière",
        "Wi-Fi embarqué",
      ],
      de: [
        "Executive-Lounge-Sitze",
        "Panorama-Sky-Lounge-Dach",
        "Premium-Soundsystem",
        "Fondunterhaltung",
        "WLAN an Bord",
      ],
    },
    whyChoose: {
      en: [
        "A more dynamic driving character than a traditional sedan",
        "Panoramic sky lounge roof adds a sense of space on longer routes",
        "Well suited to client pickups where presence matters",
        "Comparable comfort to the S-Class with a distinct design language",
      ],
      ar: [
        "طابع قيادة أكثر ديناميكية من السيدان التقليدية",
        "يضيف سقف الصالة السماوية البانورامي إحساسًا بالاتساع في المسارات الطويلة",
        "مناسبة تمامًا لاستقبال العملاء حيث يهم الحضور",
        "راحة مماثلة لـ S-Class مع لغة تصميم مميزة",
      ],
      ru: [
        "Более динамичный характер вождения, чем у традиционного седана",
        "Панорамная крыша sky lounge добавляет ощущение простора на длинных маршрутах",
        "Хорошо подходит для встреч с клиентами, где важно присутствие",
        "Сопоставимый с S-Class комфорт с отличительным языком дизайна",
      ],
      zh: [
        "较传统轿车更具动感的驾驶质感",
        "全景天幕式天窗为长途行程增添空间感",
        "非常适合注重形象存在感的客户接待场合",
        "舒适度媲美S级,却拥有独树一帜的设计语言",
      ],
      fr: [
        "Un caractère de conduite plus dynamique qu'une berline traditionnelle",
        "Le toit panoramique sky lounge ajoute une sensation d'espace sur les longs trajets",
        "Bien adaptée aux prises en charge de clients où la présence compte",
        "Un confort comparable à la Classe S avec un langage de conception distinct",
      ],
      de: [
        "Ein dynamischerer Fahrcharakter als eine klassische Limousine",
        "Das Panorama-Sky-Lounge-Dach vermittelt auf längeren Strecken ein Gefühl von Weite",
        "Gut geeignet für Kundenabholungen, bei denen Präsenz zählt",
        "Vergleichbarer Komfort zur S-Klasse mit eigenständiger Formensprache",
      ],
    },
    faqs: [
      {
        question: {
          en: "How is the BMW 7 Series different from the S-Class?",
          ar: "ما الفرق بين بي إم دبليو الفئة 7 و S-Class؟",
          ru: "Чем BMW 7 Series отличается от S-Class?",
          zh: "宝马7系与S级有何不同?",
          fr: "En quoi la BMW Série 7 diffère-t-elle de la Classe S ?",
          de: "Wie unterscheidet sich der BMW 7er von der S-Klasse?",
        },
        answer: {
          en: "Both are executive sedans with similar comfort levels — the 7 Series has a sportier ride and design, while the S-Class leans toward maximum cabin quietness.",
          ar: "كلتاهما سيارتا سيدان تنفيذيتان بمستويات راحة متشابهة — تتميز الفئة 7 بقيادة وتصميم أكثر رياضية، بينما تميل S-Class نحو أقصى هدوء للمقصورة.",
          ru: "Оба — представительские седаны со схожим уровнем комфорта: 7 Series отличается более спортивной ездой и дизайном, а S-Class склоняется к максимальной тишине салона.",
          zh: "两者均为舒适度相近的行政轿车——7系拥有更运动化的驾乘感受与设计,而S级则更偏向极致的座舱静谧性。",
          fr: "Les deux sont des berlines executive avec des niveaux de confort similaires — la Série 7 offre une conduite et un design plus sportifs, tandis que la Classe S privilégie un silence d'habitacle maximal.",
          de: "Beide sind Executive-Limousinen mit ähnlichem Komfortniveau — der 7er bietet ein sportlicheres Fahrverhalten und Design, während die S-Klasse auf maximale Kabinenruhe setzt.",
        },
      },
      {
        question: {
          en: "Is the BMW 7 Series available for corporate accounts?",
          ar: "هل بي إم دبليو الفئة 7 متاحة لحسابات الشركات؟",
          ru: "Доступен ли BMW 7 Series для корпоративных клиентов?",
          zh: "宝马7系是否可用于企业账户?",
          fr: "La BMW Série 7 est-elle disponible pour les comptes d'entreprise ?",
          de: "Ist der BMW 7er für Firmenkonten verfügbar?",
        },
        answer: {
          en: "Yes, it's available for standing corporate bookings as well as one-off business travel.",
          ar: "نعم، متاحة لحجوزات الشركات الدائمة وكذلك السفر التجاري لمرة واحدة.",
          ru: "Да, он доступен как для постоянных корпоративных бронирований, так и для разовых деловых поездок.",
          zh: "可以,既可用于长期企业预订,也适用于单次商务出行。",
          fr: "Oui, elle est disponible pour les réservations d'entreprise permanentes ainsi que pour les voyages d'affaires ponctuels.",
          de: "Ja, er ist sowohl für feste Firmenbuchungen als auch für einmalige Geschäftsreisen verfügbar.",
        },
      },
      {
        question: {
          en: "Does the 7 Series include Wi-Fi?",
          ar: "هل تشمل الفئة 7 خدمة الواي فاي؟",
          ru: "Есть ли в 7 Series Wi-Fi?",
          zh: "7系是否配备WiFi?",
          fr: "La Série 7 inclut-elle le Wi-Fi ?",
          de: "Verfügt der 7er über WLAN?",
        },
        answer: {
          en: "Yes, onboard Wi-Fi is included so you can stay connected between meetings.",
          ar: "نعم، شبكة الواي فاي على متن السيارة مشمولة لتبقوا على اتصال بين الاجتماعات.",
          ru: "Да, бортовой Wi-Fi включён, чтобы вы оставались на связи между встречами.",
          zh: "是的,标配车载WiFi,让您在会议之间保持联络畅通。",
          fr: "Oui, le Wi-Fi embarqué est inclus pour rester connecté entre les réunions.",
          de: "Ja, WLAN an Bord ist inbegriffen, damit Sie zwischen Terminen verbunden bleiben.",
        },
      },
    ],
  },
  {
    slug: "lexus-es-300h",
    brand: "Lexus",
    model: "ES 300h",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 1700, fiveHours: 1000, oneHour: 260, airport: 360, extraHour: 210, additionalCity: 210 },
    images: [
      {
        src: "/images/fleet/lexus-es-300h/lexus-es-300h-1.png",
        alt: {
          en: "Silver Lexus ES 300h front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي للكزس ES 300h الفضية في صالة عرض بأرضية رخامية",
          ru: "Серебристый Lexus ES 300h спереди сбоку в шоуруме с мраморным полом",
          zh: "银色雷克萨斯ES 300h前四分之三视角,置身大理石地面展厅",
          fr: "Lexus ES 300h argentée vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Silberner Lexus ES 300h in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/lexus-es-300h/lexus-es-300h-2.png",
        alt: {
          en: "Lexus ES 300h rear cabin in tan leather with folding centre armrest",
          ar: "المقصورة الخلفية للكزس ES 300h من الجلد البني الفاتح مع مسند ذراع أوسط قابل للطي",
          ru: "Задний салон Lexus ES 300h из светло-коричневой кожи с откидным центральным подлокотником",
          zh: "雷克萨斯ES 300h后舱,棕褐色真皮配可折叠中央扶手",
          fr: "Habitacle arrière de la Lexus ES 300h en cuir havane avec accoudoir central rabattable",
          de: "Fondkabine des Lexus ES 300h in hellbraunem Leder mit klappbarer Mittelarmlehne",
        },
      },
      {
        src: "/images/fleet/lexus-es-300h/lexus-es-300h-3.png",
        alt: {
          en: "Lexus ES 300h rear seats with centre armrest control panel",
          ar: "المقاعد الخلفية للكزس ES 300h مع لوحة تحكم في مسند الذراع الأوسط",
          ru: "Задние сиденья Lexus ES 300h с панелью управления в центральном подлокотнике",
          zh: "雷克萨斯ES 300h后排座椅,中央扶手配控制面板",
          fr: "Sièges arrière de la Lexus ES 300h avec panneau de commande dans l accoudoir central",
          de: "Rücksitze des Lexus ES 300h mit Bedienfeld in der Mittelarmlehne",
        },
      },
    ],    name: "Lexus ES 300h",
    category: "Sedan",
    tagline: {
      en: "Quiet, efficient executive comfort",
      ar: "راحة تنفيذية هادئة وموفرة",
      ru: "Тихий, эффективный представительский комфорт",
      zh: "静谧高效的行政级舒适",
      fr: "Un confort executive silencieux et efficace",
      de: "Ruhiger, effizienter Executive-Komfort",
    },
    description: {
      en: "The Lexus ES 300h combines a whisper-quiet hybrid powertrain with a refined, comfortable cabin — an efficient, dependable executive sedan for business travel and airport transfers across Dubai. Its smooth ride and understated elegance suit clients who want genuine comfort and a lower environmental footprint on every chauffeured journey.",
      ar: "تجمع ليكزس ES 300h بين نظام دفع هجين هادئ للغاية ومقصورة راقية ومريحة — سيارة سيدان تنفيذية موفرة وموثوقة للسفر التجاري ورحلات المطار في جميع أنحاء دبي. تناسب قيادتها السلسة وأناقتها الهادئة العملاء الراغبين في راحة حقيقية وبصمة بيئية أقل في كل رحلة بسائق خاص.",
      ru: "Lexus ES 300h сочетает тихий, как шёпот, гибридный силовой агрегат с изысканным, комфортным салоном — эффективный, надёжный представительский седан для деловых поездок и трансферов из аэропорта по всему Дубаю. Его плавный ход и сдержанная элегантность подходят клиентам, желающим получить подлинный комфорт и меньший экологический след в каждой поездке с личным водителем.",
      zh: "雷克萨斯ES 300h将近乎无声的混合动力系统与精致舒适的座舱完美融合——是迪拜商务出行及机场接送中高效可靠的行政轿车之选。其平顺的驾乘质感与低调优雅的气质,适合追求真正舒适体验、并期望每一次专属司机出行都能降低环境足迹的客户。",
      fr: "La Lexus ES 300h associe une motorisation hybride d'un silence absolu à un habitacle raffiné et confortable — une berline executive efficace et fiable pour les voyages d'affaires et les transferts aéroport dans tout Dubaï. Sa conduite souple et son élégance discrète conviennent aux clients qui recherchent un confort authentique et une empreinte environnementale réduite à chaque trajet avec chauffeur.",
      de: "Der Lexus ES 300h verbindet einen flüsterleisen Hybridantrieb mit einer eleganten, komfortablen Kabine — eine effiziente, verlässliche Executive-Limousine für Geschäftsreisen und Flughafentransfers in ganz Dubai. Sein sanftes Fahrverhalten und die dezente Eleganz eignen sich für Kunden, die echten Komfort und einen geringeren ökologischen Fußabdruck bei jeder Chauffeurfahrt wünschen.",
    },
    longDescription: {
      en: "The ES 300h pairs Lexus's renowned reliability with a quiet hybrid drivetrain and a calm, well-appointed cabin — a dependable executive sedan for business travel, airport transfers, and daily corporate accounts. Hybrid-tuned cabin insulation keeps road and engine noise to a minimum, while leather executive seating and rear-seat climate control make even a full day of back-to-back meetings comfortable. Onboard Wi-Fi and privacy glass support clients who prefer to work quietly in transit rather than be seen arriving in something more overt. It's consistently available at short notice, which makes it a practical, cost-efficient choice for standing corporate accounts that need reliable transport day after day — a smooth, efficient option for clients who value genuine comfort over display.",
      ar: "تجمع ES 300h بين موثوقية ليكزس الشهيرة ونظام دفع هجين هادئ ومقصورة هادئة ومجهزة بعناية — سيارة سيدان تنفيذية موثوقة للسفر التجاري ورحلات المطار وحسابات الشركات اليومية. يبقي عزل المقصورة المضبوط هجينيًا ضجيج الطريق والمحرك عند حده الأدنى، بينما تجعل المقاعد التنفيذية الجلدية والتحكم بدرجة حرارة المقاعد الخلفية حتى يوم كامل من الاجتماعات المتتالية مريحًا. تدعم شبكة الواي فاي على متن السيارة والزجاج العاكس للخصوصية العملاء الذين يفضلون العمل بهدوء أثناء التنقل بدلًا من أن يُرَوا وهم يصلون بسيارة أكثر لفتًا للانتباه. إنها متوفرة باستمرار وبإشعار قصير، ما يجعلها خيارًا عمليًا وموفرًا لحسابات الشركات الدائمة التي تحتاج إلى نقل موثوق يومًا بعد يوم — خيار سلس وموفر للعملاء الذين يقدّرون الراحة الحقيقية على المظهر.",
      ru: "ES 300h сочетает знаменитую надёжность Lexus с тихой гибридной трансмиссией и спокойным, хорошо оснащённым салоном — надёжный представительский седан для деловых поездок, трансферов из аэропорта и ежедневных корпоративных заказов. Гибридная звукоизоляция салона сводит к минимуму шум дороги и двигателя, а кожаные представительские сиденья и климат-контроль задних сидений делают комфортным даже целый день непрерывных встреч. Бортовой Wi-Fi и тонированные стёкла поддерживают клиентов, предпочитающих спокойно работать в пути, а не быть замеченными прибывающими на чём-то более броском. Он стабильно доступен по короткому уведомлению, что делает его практичным, экономически эффективным выбором для постоянных корпоративных клиентов, нуждающихся в надёжном транспорте день за днём — плавный, эффективный вариант для клиентов, ценящих подлинный комфорт выше показного блеска.",
      zh: "ES 300h将雷克萨斯闻名遐迩的可靠性与静谧的混合动力系统及沉稳精致的座舱融为一体——是商务出行、机场接送及日常企业账户中值得信赖的行政轿车之选。经混合动力调校的座舱隔音将路噪与引擎噪音降至最低,真皮行政座椅与后排独立温控让即便是排满会议的一整天也倍感舒适。车载WiFi与隐私玻璃满足了那些更愿意在途中安静工作、而非以张扬方式抵达的客户需求。该车型始终能在短时间内调配到位,是需要日复一日可靠交通的长期企业客户经济高效的实用之选——对于重视真实舒适而非外在张扬的客户而言,是平顺高效的理想选择。",
      fr: "L'ES 300h allie la fiabilité réputée de Lexus à une motorisation hybride silencieuse et un habitacle calme et bien équipé — une berline executive fiable pour les voyages d'affaires, les transferts aéroport et les comptes d'entreprise quotidiens. L'insonorisation de l'habitacle, calibrée pour l'hybride, réduit au minimum le bruit de la route et du moteur, tandis que les sièges executive en cuir et la climatisation des sièges arrière rendent confortable même une journée entière de réunions consécutives. Le Wi-Fi embarqué et les vitres teintées conviennent aux clients qui préfèrent travailler tranquillement en déplacement plutôt que d'être vus arriver dans quelque chose de plus voyant. Elle est systématiquement disponible à court préavis, ce qui en fait un choix pratique et économique pour les comptes d'entreprise permanents ayant besoin d'un transport fiable au quotidien — une option souple et efficace pour les clients qui privilégient un confort authentique plutôt que l'ostentation.",
      de: "Der ES 300h vereint die bekannte Zuverlässigkeit von Lexus mit einem leisen Hybridantrieb und einer ruhigen, gut ausgestatteten Kabine — eine verlässliche Executive-Limousine für Geschäftsreisen, Flughafentransfers und tägliche Firmenkonten. Die hybridabgestimmte Kabinendämmung hält Fahr- und Motorgeräusche auf ein Minimum, während Ledersitze im Executive-Stil und die Klimatisierung der Rücksitze selbst einen vollen Tag mit aufeinanderfolgenden Terminen komfortabel machen. WLAN an Bord und Sichtschutzverglasung unterstützen Kunden, die während der Fahrt lieber ruhig arbeiten, statt in etwas Auffälligerem vorzufahren. Er ist durchgehend kurzfristig verfügbar, was ihn zu einer praktischen, kosteneffizienten Wahl für feste Firmenkonten macht, die Tag für Tag verlässlichen Transport benötigen — eine geschmeidige, effiziente Option für Kunden, die echten Komfort der Zurschaustellung vorziehen.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Business travel & eco-conscious executive transfers",
      ar: "السفر التجاري والنقل التنفيذي الواعي بيئيًا",
      ru: "Деловые поездки и экологичные представительские трансферы",
      zh: "商务出行与环保型行政接送",
      fr: "Voyages d'affaires et transferts executive éco-responsables",
      de: "Geschäftsreisen & umweltbewusste Executive-Transfers",
    },
    features: {
      en: [
        "Hybrid-quiet cabin insulation",
        "Leather executive seating",
        "Rear-seat climate control",
        "Onboard Wi-Fi",
        "Bottled water & amenities",
      ],
      ar: [
        "عزل مقصورة هادئ هجينيًا",
        "مقاعد تنفيذية جلدية",
        "تحكم بدرجة حرارة المقاعد الخلفية",
        "شبكة واي فاي على متن السيارة",
        "مياه معبأة ووسائل راحة",
      ],
      ru: [
        "Гибридная звукоизоляция салона",
        "Кожаные представительские сиденья",
        "Климат-контроль задних сидений",
        "Wi-Fi в салоне",
        "Бутилированная вода и удобства",
      ],
      zh: [
        "混合动力静音座舱隔音",
        "真皮行政座椅",
        "后排座椅独立温控",
        "车载WiFi",
        "瓶装水及便利用品",
      ],
      fr: [
        "Insonorisation d'habitacle hybride silencieuse",
        "Sièges executive en cuir",
        "Climatisation des sièges arrière",
        "Wi-Fi embarqué",
        "Eau en bouteille & attentions",
      ],
      de: [
        "Hybrid-leise Kabinendämmung",
        "Ledersitze im Executive-Stil",
        "Klimatisierung der Rücksitze",
        "WLAN an Bord",
        "Wasser in Flaschen & Annehmlichkeiten",
      ],
    },
    whyChoose: {
      en: [
        "A quiet, efficient hybrid ride with genuine Lexus reliability",
        "Understated comfort for clients who prefer a lower profile",
        "Dependable same-day availability for business travel",
        "A cost-efficient option for standing corporate accounts",
      ],
      ar: [
        "قيادة هجينة هادئة وموفرة بموثوقية ليكزس الحقيقية",
        "راحة هادئة للعملاء الذين يفضلون طابعًا أقل بروزًا",
        "توفر موثوق في نفس اليوم للسفر التجاري",
        "خيار موفر لحسابات الشركات الدائمة",
      ],
      ru: [
        "Тихая, эффективная гибридная езда с подлинной надёжностью Lexus",
        "Сдержанный комфорт для клиентов, предпочитающих менее заметный профиль",
        "Надёжная доступность день в день для деловых поездок",
        "Экономически эффективный вариант для постоянных корпоративных клиентов",
      ],
      zh: [
        "静谧高效的混合动力驾乘,尽显雷克萨斯真正的可靠品质",
        "低调舒适,适合偏好内敛风格的客户",
        "商务出行当日调配,值得信赖",
        "长期企业账户的经济高效之选",
      ],
      fr: [
        "Une conduite hybride silencieuse et efficace avec la fiabilité authentique de Lexus",
        "Un confort discret pour les clients qui préfèrent la sobriété",
        "Une disponibilité fiable le jour même pour les voyages d'affaires",
        "Une option économique pour les comptes d'entreprise permanents",
      ],
      de: [
        "Eine leise, effiziente Hybridfahrt mit echter Lexus-Zuverlässigkeit",
        "Dezenter Komfort für Kunden, die ein unauffälligeres Profil bevorzugen",
        "Verlässliche taggleiche Verfügbarkeit für Geschäftsreisen",
        "Eine kosteneffiziente Option für feste Firmenkonten",
      ],
    },
    faqs: [
      {
        question: {
          en: "Is the ES 300h a hybrid?",
          ar: "هل ES 300h سيارة هجينة؟",
          ru: "Является ли ES 300h гибридом?",
          zh: "ES 300h是混合动力车型吗?",
          fr: "L'ES 300h est-elle un véhicule hybride ?",
          de: "Ist der ES 300h ein Hybrid?",
        },
        answer: {
          en: "Yes — it pairs a quiet hybrid powertrain with a refined cabin, offering a smooth ride with a lower environmental footprint.",
          ar: "نعم — تجمع بين نظام دفع هجين هادئ ومقصورة راقية، وتوفر قيادة سلسة ببصمة بيئية أقل.",
          ru: "Да — он сочетает тихий гибридный силовой агрегат с изысканным салоном, обеспечивая плавную езду с меньшим экологическим следом.",
          zh: "是的——它将静音混合动力系统与精致座舱相结合,带来平顺驾乘体验及更低的环境足迹。",
          fr: "Oui — elle associe une motorisation hybride silencieuse à un habitacle raffiné, offrant une conduite souple avec une empreinte environnementale réduite.",
          de: "Ja — er verbindet einen leisen Hybridantrieb mit einer eleganten Kabine und bietet eine sanfte Fahrt mit geringerem ökologischem Fußabdruck.",
        },
      },
      {
        question: {
          en: "Is the ES 300h suitable for airport transfers?",
          ar: "هل تناسب ES 300h رحلات المطار؟",
          ru: "Подходит ли ES 300h для трансферов из аэропорта?",
          zh: "ES 300h是否适合机场接送?",
          fr: "L'ES 300h convient-elle aux transferts aéroport ?",
          de: "Ist der ES 300h für Flughafentransfers geeignet?",
        },
        answer: {
          en: "Yes, with the same live flight tracking and meet-and-greet service as the rest of our sedan fleet.",
          ar: "نعم، مع نفس خدمة تتبع الرحلات المباشر والاستقبال الشخصي المتوفرة في باقي أسطول سياراتنا السيدان.",
          ru: "Да, с тем же отслеживанием рейса в реальном времени и персональной встречей, что и у остального парка седанов.",
          zh: "可以,并享有与我们其他轿车车型相同的航班实时追踪与专人接机服务。",
          fr: "Oui, avec le même suivi de vol en direct et le même service d'accueil personnalisé que le reste de notre flotte de berlines.",
          de: "Ja, mit derselben Live-Flugverfolgung und demselben Meet-and-Greet-Service wie der Rest unserer Limousinenflotte.",
        },
      },
      {
        question: {
          en: "Can I book the ES 300h for a full business day?",
          ar: "هل يمكنني حجز ES 300h ليوم عمل كامل؟",
          ru: "Могу ли я забронировать ES 300h на весь рабочий день?",
          zh: "可以预订ES 300h用于整个商务日吗?",
          fr: "Puis-je réserver l'ES 300h pour une journée d'affaires complète ?",
          de: "Kann ich den ES 300h für einen ganzen Geschäftstag buchen?",
        },
        answer: {
          en: "Yes, hourly and full-day hire are both available on request.",
          ar: "نعم، يتوفر كل من الاستئجار بالساعة وليوم كامل عند الطلب.",
          ru: "Да, доступна как почасовая, так и полнодневная аренда по запросу.",
          zh: "可以,按小时及全天租用均可应要求提供。",
          fr: "Oui, la location à l'heure et à la journée sont toutes deux disponibles sur demande.",
          de: "Ja, sowohl Stunden- als auch Ganztagesmiete sind auf Anfrage verfügbar.",
        },
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "rolls-royce-cullinan-mansory",
    brand: "Rolls-Royce",
    model: "Cullinan Mansory",
    rates: { tenHours: 11000, fiveHours: 6500, oneHour: 1800, airport: 2400, extraHour: 1400, additionalCity: 1400 },
    images: [
      {
        src: "/images/fleet/rolls-royce-cullinan-mansory/rolls-royce-cullinan-mansory-1.png",
        alt: {
          en: "Turquoise Rolls-Royce Cullinan Mansory front three-quarter view outdoors at dusk",
          ar: "منظر أمامي جانبي لرولز رويس كولينان مانسوري بلون فيروزي في الهواء الطلق عند الغسق",
          ru: "Бирюзовый Rolls-Royce Cullinan Mansory спереди сбоку на улице в сумерках",
          zh: "绿松石色劳斯莱斯库里南Mansory前四分之三视角,黄昏时分的户外场景",
          fr: "Rolls-Royce Cullinan Mansory turquoise vue avant trois-quarts en extérieur au crépuscule",
          de: "Türkisfarbener Rolls-Royce Cullinan Mansory in Vorderansicht von schräg vorne im Freien in der Dämmerung",
        },
      },
      {
        src: "/images/fleet/rolls-royce-cullinan-mansory/rolls-royce-cullinan-mansory-2.png",
        alt: {
          en: "Rolls-Royce Cullinan Mansory head-on front view showing the wide-body styling",
          ar: "منظر أمامي مباشر لرولز رويس كولينان مانسوري يظهر التصميم عريض الهيكل",
          ru: "Rolls-Royce Cullinan Mansory анфас, демонстрирующий широкий кузов",
          zh: "劳斯莱斯库里南Mansory正前方视角,展现宽体造型",
          fr: "Rolls-Royce Cullinan Mansory vue de face montrant la carrosserie élargie",
          de: "Rolls-Royce Cullinan Mansory in Frontalansicht mit Breitbau-Karosserie",
        },
      },
      {
        src: "/images/fleet/rolls-royce-cullinan-mansory/rolls-royce-cullinan-mansory-3.png",
        alt: {
          en: "Rolls-Royce Cullinan Mansory with coach doors open showing turquoise and white leather interior",
          ar: "رولز رويس كولينان مانسوري بأبوابها المفتوحة تكشف عن مقصورة جلدية فيروزية وبيضاء",
          ru: "Rolls-Royce Cullinan Mansory с открытыми дверями и бирюзово-белым кожаным салоном",
          zh: "劳斯莱斯库里南Mansory对开门敞开,展示绿松石色与白色真皮内饰",
          fr: "Rolls-Royce Cullinan Mansory portes ouvertes révélant un intérieur en cuir turquoise et blanc",
          de: "Rolls-Royce Cullinan Mansory mit geöffneten Türen und türkis-weißem Lederinterieur",
        },
      },
    ],    name: "Rolls-Royce Cullinan Mansory",
    category: "Ultra-Luxury",
    tagline: {
      en: "Bespoke presence, uncompromising exclusivity",
      ar: "حضور مخصص وحصرية لا تقبل المساومة",
      ru: "Эксклюзивный статус, бескомпромиссная исключительность",
      zh: "定制气场,不妥协的尊崇独享",
      fr: "Une présence sur mesure, une exclusivité sans compromis",
      de: "Maßgeschneiderte Präsenz, kompromisslose Exklusivität",
    },
    description: {
      en: "A widebody, Mansory-customized Rolls-Royce Cullinan — the most exclusive SUV in the fleet, combining Rolls-Royce craftsmanship with bespoke Mansory design for clients who expect the absolute pinnacle of presence.",
      ar: "رولز رويس كولينان بهيكل عريض ومعدّلة من مانسوري — السيارة الرياضية متعددة الاستخدامات الأكثر حصرية في الأسطول، تجمع بين حرفية رولز رويس وتصميم مانسوري المخصص لعملاء يتطلعون إلى القمة المطلقة في الحضور.",
      ru: "Rolls-Royce Cullinan с широким кузовом в исполнении Mansory — самый эксклюзивный внедорожник в парке, сочетающий мастерство Rolls-Royce с эксклюзивным дизайном Mansory для клиентов, ожидающих абсолютной вершины статуса.",
      zh: "经Mansory定制改装的宽体劳斯莱斯库里南——车队中最尊贵独享的SUV,将劳斯莱斯的工艺与Mansory定制设计融为一体,专为追求极致气场的客户打造。",
      fr: "Une Rolls-Royce Cullinan large sur mesure Mansory — le SUV le plus exclusif de la flotte, alliant le savoir-faire Rolls-Royce au design sur mesure Mansory pour une clientèle en quête du summum absolu de la présence.",
      de: "Ein Breitbau-Rolls-Royce Cullinan im Mansory-Design — der exklusivste SUV der Flotte, der Rolls-Royce-Handwerkskunst mit maßgeschneidertem Mansory-Design für Kunden verbindet, die den absoluten Gipfel an Präsenz erwarten.",
    },
    longDescription: {
      en: "The Cullinan Mansory pairs Rolls-Royce's handcrafted luxury with Mansory's bespoke widebody styling — a genuinely rare SUV reserved for clients who want the most exclusive arrival possible. Every detail, from the carbon-fibre accents to the reworked stance, sets it apart from anything else on the road, and from any standard Cullinan you'll see elsewhere in the city. Inside, the signature starlight headliner and handcrafted leather cabin bring full Rolls-Royce VIP amenities together with rear-seat climate control and a premium sound system tuned for a genuinely silent ride. Privacy glass keeps the cabin discreet for high-profile passengers. This is one of the rarest SUVs on Dubai roads, reserved for clients who want an arrival that is unmistakably, deliberately different — book well ahead, as availability is limited.",
      ar: "تجمع كولينان مانسوري بين فخامة رولز رويس المصنوعة يدويًا وتصميم مانسوري العريض المخصص — سيارة رياضية متعددة الاستخدامات نادرة حقًا ومخصصة للعملاء الراغبين في أفخم وصول ممكن. كل تفصيل، من لمسات ألياف الكربون إلى الوقفة المعاد تصميمها، يميزها عن أي شيء آخر على الطريق، وعن أي كولينان عادية تراها في أي مكان آخر بالمدينة. من الداخل، يجمع سقف النجوم المميز والمقصورة الجلدية المصنوعة يدويًا بين وسائل راحة رولز رويس الكاملة لكبار الشخصيات وتحكم بدرجة حرارة المقاعد الخلفية ونظام صوت فاخر مضبوط لقيادة هادئة حقًا. يحافظ الزجاج العاكس للخصوصية على خصوصية المقصورة للركاب البارزين. هذه واحدة من أندر السيارات الرياضية متعددة الاستخدامات على طرق دبي، مخصصة للعملاء الراغبين في وصول مختلف بشكل واضح ومتعمد — يُنصح بالحجز مبكرًا نظرًا لمحدودية التوفر.",
      ru: "Cullinan Mansory сочетает рукотворную роскошь Rolls-Royce с эксклюзивным широким кузовом от Mansory — по-настоящему редкий внедорожник, предназначенный для клиентов, желающих самого эксклюзивного прибытия. Каждая деталь, от карбоновых акцентов до переработанной посадки, выделяет его среди всего остального на дороге и среди любого стандартного Cullinan, который можно увидеть в городе. Внутри фирменный звёздный потолок и салон из кожи ручной выделки объединяют полный набор VIP-удобств Rolls-Royce с климат-контролем задних сидений и премиальной акустической системой, настроенной для по-настоящему тихой поездки. Тонированные стёкла обеспечивают приватность салона для важных пассажиров. Это один из самых редких внедорожников на дорогах Дубая, предназначенный для клиентов, желающих безошибочно, намеренно иного прибытия — рекомендуем бронировать заблаговременно, так как доступность ограничена.",
      zh: "库里南Mansory版将劳斯莱斯手工打造的奢华与Mansory定制宽体造型完美融合——这是一款真正稀有的SUV,专为追求最尊崇抵达体验的客户而设。从碳纤维饰件到重新设计的车身姿态,每一处细节都使其有别于路上的任何其他车辆,也有别于城中随处可见的标准版库里南。车内,标志性星空顶棚与手工真皮座舱将劳斯莱斯的全套贵宾礼遇、后排座椅独立温控及经调校可实现真正静谧驾乘的高级音响系统融为一体。隐私玻璃为身份显赫的乘客保障座舱私密性。这是迪拜路上最稀有的SUV之一,专为渴望与众不同、彰显个性抵达方式的客户打造——由于车辆有限,建议提前预订。",
      fr: "La Cullinan Mansory associe le luxe artisanal de Rolls-Royce au style large sur mesure de Mansory — un SUV véritablement rare, réservé aux clients qui recherchent l'arrivée la plus exclusive possible. Chaque détail, des touches en fibre de carbone à la posture retravaillée, la distingue de tout autre véhicule sur la route, et de toute Cullinan standard que vous croiserez ailleurs dans la ville. À l'intérieur, le ciel étoilé emblématique et l'habitacle en cuir fait à la main réunissent toutes les attentions VIP Rolls-Royce avec la climatisation des sièges arrière et un système audio premium calibré pour une conduite véritablement silencieuse. Les vitres teintées préservent la discrétion de l'habitacle pour des passagers de premier plan. C'est l'un des SUV les plus rares sur les routes de Dubaï, réservé aux clients qui souhaitent une arrivée résolument et délibérément différente — nous recommandons de réserver bien à l'avance, la disponibilité étant limitée.",
      de: "Der Cullinan Mansory verbindet die handgefertigte Rolls-Royce-Luxusqualität mit dem maßgeschneiderten Breitbau-Design von Mansory — ein wahrhaft seltener SUV, der Kunden vorbehalten ist, die die exklusivste Ankunft überhaupt wünschen. Jedes Detail, von den Carbon-Akzenten bis zur neu gestalteten Optik, hebt ihn von allem anderen auf der Straße ab — und von jedem gewöhnlichen Cullinan, den man sonst in der Stadt sieht. Innen vereinen der charakteristische Sternenhimmel-Dachhimmel und die handgefertigte Lederkabine alle VIP-Annehmlichkeiten von Rolls-Royce mit Klimatisierung der Rücksitze und einem Premium-Soundsystem, das auf eine wahrhaft lautlose Fahrt abgestimmt ist. Sichtschutzverglasung wahrt die Diskretion der Kabine für hochrangige Passagiere. Dies ist einer der seltensten SUVs auf Dubais Straßen, vorbehalten Kunden, die eine unverkennbar, bewusst andere Ankunft wünschen — buchen Sie frühzeitig, da die Verfügbarkeit begrenzt ist.",
    },
    passengers: 4,
    luggage: 3,
    idealFor: {
      en: "Ultra-exclusive VIP arrivals",
      ar: "وصولات كبار الشخصيات فائقة الحصرية",
      ru: "Максимально эксклюзивные VIP-прибытия",
      zh: "极致尊享的贵宾抵达",
      fr: "Arrivées VIP ultra-exclusives",
      de: "Ultra-exklusive VIP-Ankünfte",
    },
    features: {
      en: [
        "Handcrafted leather interior",
        "Bespoke Mansory widebody styling",
        "Starlight headliner",
        "Rear-seat climate control",
        "Premium sound system",
      ],
      ar: [
        "مقصورة جلدية مصنوعة يدويًا",
        "تصميم هيكل عريض مخصص من مانسوري",
        "سقف النجوم",
        "تحكم بدرجة حرارة المقاعد الخلفية",
        "نظام صوت فاخر",
      ],
      ru: [
        "Салон из кожи ручной выделки",
        "Эксклюзивный широкий кузов Mansory",
        "Звёздный потолок",
        "Климат-контроль задних сидений",
        "Премиальная акустическая система",
      ],
      zh: [
        "手工打造真皮座舱",
        "Mansory定制宽体造型",
        "星空顶棚",
        "后排座椅独立温控",
        "高级音响系统",
      ],
      fr: [
        "Habitacle en cuir fait à la main",
        "Style large sur mesure Mansory",
        "Ciel étoilé",
        "Climatisation des sièges arrière",
        "Système audio premium",
      ],
      de: [
        "Handgefertigtes Lederinterieur",
        "Maßgeschneidertes Mansory-Breitbau-Design",
        "Sternenhimmel-Dachhimmel",
        "Klimatisierung der Rücksitze",
        "Premium-Soundsystem",
      ],
    },
    whyChoose: {
      en: [
        "The most exclusive SUV in the fleet — genuinely rare on Dubai roads",
        "Bespoke Mansory styling sets it apart from any standard Cullinan",
        "Handcrafted Rolls-Royce interior with full VIP amenities",
        "Reserved for clients who want an unmistakable arrival",
      ],
      ar: [
        "السيارة الرياضية متعددة الاستخدامات الأكثر حصرية في الأسطول — نادرة حقًا على طرق دبي",
        "تصميم مانسوري المخصص يميزها عن أي كولينان عادية",
        "مقصورة رولز رويس المصنوعة يدويًا بوسائل راحة كاملة لكبار الشخصيات",
        "مخصصة للعملاء الراغبين في وصول لا يُخطئه أحد",
      ],
      ru: [
        "Самый эксклюзивный внедорожник в парке — по-настоящему редкий на дорогах Дубая",
        "Эксклюзивный дизайн Mansory выделяет его среди любого стандартного Cullinan",
        "Салон Rolls-Royce ручной работы с полным набором VIP-удобств",
        "Предназначен для клиентов, желающих безошибочно узнаваемого прибытия",
      ],
      zh: [
        "车队中最尊贵独享的SUV——迪拜路上真正稀有的存在",
        "Mansory定制造型使其有别于任何标准版库里南",
        "劳斯莱斯手工座舱,配备全套贵宾礼遇",
        "专为渴望无可比拟抵达体验的客户打造",
      ],
      fr: [
        "Le SUV le plus exclusif de la flotte — véritablement rare sur les routes de Dubaï",
        "Le style sur mesure Mansory le distingue de toute Cullinan standard",
        "Habitacle Rolls-Royce fait à la main avec toutes les attentions VIP",
        "Réservé aux clients qui recherchent une arrivée incontestable",
      ],
      de: [
        "Der exklusivste SUV der Flotte — auf Dubais Straßen wirklich selten",
        "Das maßgeschneiderte Mansory-Design hebt ihn von jedem Standard-Cullinan ab",
        "Handgefertigtes Rolls-Royce-Interieur mit vollem VIP-Komfort",
        "Vorbehalten Kunden, die eine unverwechselbare Ankunft wünschen",
      ],
    },
    faqs: [
      {
        question: {
          en: "How is the Cullinan Mansory different from a standard Cullinan?",
          ar: "كيف تختلف كولينان مانسوري عن كولينان العادية؟",
          ru: "Чем Cullinan Mansory отличается от стандартного Cullinan?",
          zh: "库里南Mansory版与标准版库里南有何不同?",
          fr: "En quoi la Cullinan Mansory diffère-t-elle d'une Cullinan standard ?",
          de: "Wie unterscheidet sich der Cullinan Mansory von einem Standard-Cullinan?",
        },
        answer: {
          en: "The Mansory edition adds a bespoke widebody kit, unique styling details, and additional interior customization on top of the standard Rolls-Royce Cullinan, making it one of the rarest SUVs on the road.",
          ar: "تضيف نسخة مانسوري طقم هيكل عريض مخصص وتفاصيل تصميم فريدة وتخصيصًا داخليًا إضافيًا فوق رولز رويس كولينان العادية، ما يجعلها واحدة من أندر السيارات الرياضية متعددة الاستخدامات على الطريق.",
          ru: "Издание Mansory добавляет эксклюзивный комплект широкого кузова, уникальные стилистические детали и дополнительную индивидуализацию салона поверх стандартного Rolls-Royce Cullinan, что делает его одним из самых редких внедорожников на дороге.",
          zh: "Mansory版本在标准劳斯莱斯库里南基础上,增加了定制宽体套件、独特造型细节及额外内饰定制,使其成为路上最稀有的SUV之一。",
          fr: "L'édition Mansory ajoute un kit large sur mesure, des détails de style uniques et une personnalisation intérieure supplémentaire à la Rolls-Royce Cullinan standard, en faisant l'un des SUV les plus rares sur la route.",
          de: "Die Mansory-Edition ergänzt den Standard-Rolls-Royce-Cullinan um ein maßgeschneidertes Breitbau-Kit, einzigartige Styling-Details und zusätzliche Innenraumanpassungen und macht ihn so zu einem der seltensten SUVs auf der Straße.",
        },
      },
      {
        question: {
          en: "How far in advance should I book the Cullinan Mansory?",
          ar: "قبل كم من الوقت يجب أن أحجز كولينان مانسوري؟",
          ru: "За сколько времени нужно бронировать Cullinan Mansory?",
          zh: "应提前多久预订库里南Mansory版?",
          fr: "Combien de temps à l'avance dois-je réserver la Cullinan Mansory ?",
          de: "Wie weit im Voraus sollte ich den Cullinan Mansory buchen?",
        },
        answer: {
          en: "As our most exclusive SUV, we recommend booking as early as possible to guarantee availability.",
          ar: "بصفتها السيارة الرياضية متعددة الاستخدامات الأكثر حصرية لدينا، نوصي بالحجز في أقرب وقت ممكن لضمان التوفر.",
          ru: "Поскольку это наш самый эксклюзивный внедорожник, рекомендуем бронировать как можно раньше, чтобы гарантировать доступность.",
          zh: "作为我们最尊贵独享的SUV,建议尽早预订以确保车辆可用。",
          fr: "Étant notre SUV le plus exclusif, nous recommandons de réserver le plus tôt possible pour garantir sa disponibilité.",
          de: "Da es sich um unseren exklusivsten SUV handelt, empfehlen wir eine möglichst frühzeitige Buchung, um die Verfügbarkeit zu gewährleisten.",
        },
      },
      {
        question: {
          en: "Is the Cullinan Mansory available for events and arrivals?",
          ar: "هل كولينان مانسوري متاحة للفعاليات والوصولات؟",
          ru: "Доступен ли Cullinan Mansory для мероприятий и торжественных прибытий?",
          zh: "库里南Mansory版是否适用于活动及抵达礼遇?",
          fr: "La Cullinan Mansory est-elle disponible pour les événements et les arrivées ?",
          de: "Ist der Cullinan Mansory für Veranstaltungen und Ankünfte verfügbar?",
        },
        answer: {
          en: "Yes, it's ideal for high-profile arrivals, VIP events, and clients who want the most exclusive SUV presence available.",
          ar: "نعم، إنها مثالية للوصولات البارزة وفعاليات كبار الشخصيات والعملاء الراغبين في أرقى حضور متاح لسيارة رياضية متعددة الاستخدامات.",
          ru: "Да, он идеально подходит для торжественных прибытий, VIP-мероприятий и клиентов, желающих получить самый эксклюзивный статус внедорожника из доступных.",
          zh: "可以,非常适合备受瞩目的抵达场合、贵宾活动,以及追求现有最尊崇SUV气场的客户。",
          fr: "Oui, elle est idéale pour les arrivées de premier plan, les événements VIP et les clients qui recherchent la présence SUV la plus exclusive qui soit.",
          de: "Ja, er ist ideal für hochkarätige Ankünfte, VIP-Veranstaltungen und Kunden, die die exklusivste verfügbare SUV-Präsenz wünschen.",
        },
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "tesla-model-y",
    brand: "Tesla",
    model: "Model Y",
    rates: { tenHours: 2000, fiveHours: 1200, oneHour: 320, airport: 420, extraHour: 230, additionalCity: 230 },
    images: [
      {
        src: "/images/fleet/tesla-model-y/tesla-model-y-1.png",
        alt: {
          en: "White Tesla Model Y front three-quarter view outside a modern building",
          ar: "منظر أمامي جانبي لتسلا موديل Y البيضاء أمام مبنى عصري",
          ru: "Белая Tesla Model Y спереди сбоку у современного здания",
          zh: "白色特斯拉Model Y前四分之三视角,置身现代建筑之外",
          fr: "Tesla Model Y blanche vue avant trois-quarts devant un bâtiment moderne",
          de: "Weißes Tesla Model Y in Vorderansicht von schräg vorne vor einem modernen Gebäude",
        },
      },
      {
        src: "/images/fleet/tesla-model-y/tesla-model-y-2.png",
        alt: {
          en: "Tesla Model Y rear bench seating in black leather",
          ar: "المقعد الخلفي الطويل في تسلا موديل Y من الجلد الأسود",
          ru: "Задний диван Tesla Model Y из чёрной кожи",
          zh: "特斯拉Model Y后排长椅座椅,黑色真皮",
          fr: "Banquette arrière du Tesla Model Y en cuir noir",
          de: "Rücksitzbank des Tesla Model Y in schwarzem Leder",
        },
      },
    ],    name: "Tesla Model Y",
    category: "SUV",
    isElectric: true,
    tagline: {
      en: "Modern, sustainable, effortless",
      ar: "عصرية ومستدامة وسلسة",
      ru: "Современность, экологичность, лёгкость",
      zh: "现代、可持续、从容不迫",
      fr: "Moderne, durable, sans effort",
      de: "Modern, nachhaltig, mühelos",
    },
    description: {
      en: "An all-electric SUV for clients who want a modern, sustainable chauffeured experience — smooth, silent power with a minimalist, tech-forward cabin.",
      ar: "سيارة رياضية متعددة الاستخدامات كهربائية بالكامل لعملاء يبحثون عن تجربة قيادة بسائق خاص عصرية ومستدامة — قوة سلسة وهادئة مع مقصورة بسيطة التصميم وتقنية متقدمة.",
      ru: "Полностью электрический внедорожник для клиентов, которые хотят получить современный, экологичный опыт поездки с личным водителем — плавная, бесшумная мощность и минималистичный, технологичный салон.",
      zh: "这是一款纯电动SUV,专为追求现代、可持续专属司机出行体验的客户打造——平顺静谧的动力,搭配极简科技感座舱。",
      fr: "Un SUV 100 % électrique pour les clients en quête d'une expérience de chauffeur moderne et durable — une puissance douce et silencieuse dans un habitacle minimaliste et technologique.",
      de: "Ein vollelektrischer SUV für Kunden, die ein modernes, nachhaltiges Chauffeurerlebnis wünschen — sanfte, lautlose Kraft in einer minimalistischen, technikorientierten Kabine.",
    },
    longDescription: {
      en: "The Model Y brings a quieter, more sustainable option to the fleet — fully electric power delivery, a spacious minimalist cabin, and Tesla's signature tech-forward interior. There's no engine noise at any speed, just a smooth, silent ride from the moment you pull away, under a panoramic glass roof that keeps the cabin feeling open on shorter city routes. A premium sound system and climate-controlled cabin bring the same everyday comfort as the rest of the fleet, without the environmental footprint of a traditional chauffeur car. It's become a smart choice for eco-conscious clients, corporate accounts with sustainability commitments, and short-to-mid-distance city travel where a quieter, cleaner ride is genuinely part of the appeal rather than an afterthought.",
      ar: "توفر Model Y خيارًا أكثر هدوءًا واستدامة في الأسطول — توصيل طاقة كهربائي بالكامل، ومقصورة واسعة بتصميم بسيط، وتصميم داخلي تقني متقدم يحمل بصمة تيسلا المميزة. لا وجود لضجيج المحرك عند أي سرعة، بل قيادة سلسة وهادئة منذ لحظة الانطلاق، تحت سقف زجاجي بانورامي يمنح المقصورة إحساسًا بالانفتاح في رحلات المدينة القصيرة. يوفر نظام الصوت الفاخر والمقصورة المكيفة نفس الراحة اليومية المتوفرة في باقي الأسطول، دون البصمة البيئية لسيارة تقليدية بسائق خاص. أصبحت خيارًا ذكيًا للعملاء المهتمين بالبيئة، وحسابات الشركات ذات الالتزامات بالاستدامة، والرحلات القصيرة إلى المتوسطة داخل المدينة حيث تُعد القيادة الأكثر هدوءًا ونظافة جزءًا حقيقيًا من الجاذبية وليست أمرًا ثانويًا.",
      ru: "Model Y предлагает более тихий и экологичный вариант в парке — полностью электрическая подача мощности, просторный минималистичный салон и фирменный технологичный интерьер Tesla. Никакого шума двигателя на любой скорости — только плавная, бесшумная езда с момента старта, под панорамной стеклянной крышей, придающей салону ощущение простора на коротких городских маршрутах. Премиальная акустическая система и салон с климат-контролем обеспечивают тот же повседневный комфорт, что и остальной парк, без экологического следа традиционного автомобиля с водителем. Он стал разумным выбором для экологически сознательных клиентов, корпоративных клиентов с обязательствами по устойчивому развитию и поездок на короткие и средние расстояния по городу, где более тихая и чистая поездка — это подлинное преимущество, а не второстепенная деталь.",
      zh: "Model Y为车队带来更安静、更环保的选择——纯电动力输出、宽敞的极简座舱,以及特斯拉标志性的科技感内饰。无论车速多快都听不到引擎噪音,从起步那一刻起便是平顺静谧的驾乘体验,全景玻璃天窗让座舱在城市短途出行中更显通透开阔。高级音响系统与恒温座舱带来与车队其他车型相同的日常舒适感,却没有传统司机用车的环境负担。它已成为环保意识强的客户、具有可持续发展承诺的企业客户,以及中短途城市出行的明智之选——在这些场景中,更安静、更清洁的驾乘体验是真正的吸引力所在,而非附加考量。",
      fr: "La Model Y apporte à la flotte une option plus silencieuse et plus durable — une motricité entièrement électrique, un habitacle minimaliste et spacieux, et l'intérieur technologique caractéristique de Tesla. Aucun bruit de moteur, quelle que soit la vitesse : juste une conduite douce et silencieuse dès le démarrage, sous un toit panoramique en verre qui préserve une sensation d'ouverture sur les trajets urbains plus courts. Un système audio premium et un habitacle climatisé offrent le même confort quotidien que le reste de la flotte, sans l'empreinte environnementale d'un véhicule de chauffeur traditionnel. Elle est devenue un choix judicieux pour les clients soucieux de l'environnement, les comptes d'entreprise engagés dans une démarche de durabilité, et les trajets urbains courts à moyens où une conduite plus silencieuse et plus propre constitue un véritable atout plutôt qu'un simple à-côté.",
      de: "Der Model Y bringt eine leisere, nachhaltigere Option in die Flotte — vollelektrische Kraftübertragung, eine geräumige, minimalistische Kabine und Teslas charakteristisches technikorientiertes Interieur. Bei keiner Geschwindigkeit ist Motorengeräusch zu hören — nur eine sanfte, lautlose Fahrt vom ersten Moment an, unter einem Panorama-Glasdach, das die Kabine auf kürzeren Stadtstrecken offen wirken lässt. Ein Premium-Soundsystem und eine klimatisierte Kabine bieten denselben Alltagskomfort wie der Rest der Flotte, ohne den ökologischen Fußabdruck eines herkömmlichen Chauffeurfahrzeugs. Er hat sich zu einer klugen Wahl für umweltbewusste Kunden, Firmenkonten mit Nachhaltigkeitsverpflichtungen und kurze bis mittlere Strecken in der Stadt entwickelt, bei denen eine leisere, sauberere Fahrt einen echten Reiz darstellt und keine Nebensache ist.",
    },
    passengers: 4,
    luggage: 3,
    idealFor: {
      en: "Eco-conscious city travel & corporate transfers",
      ar: "التنقل الحضري الواعي بيئيًا ونقل الشركات",
      ru: "Экологичные городские поездки и корпоративные трансферы",
      zh: "环保城市出行与企业接送",
      fr: "Trajets urbains éco-responsables et transferts d'entreprise",
      de: "Umweltbewusste Stadtfahrten & Firmentransfers",
    },
    features: {
      en: [
        "All-electric powertrain",
        "Panoramic glass roof",
        "Minimalist tech-forward cabin",
        "Premium sound system",
        "Climate-controlled cabin",
        "Onboard Wi-Fi",
      ],
      ar: [
        "نظام دفع كهربائي بالكامل",
        "سقف زجاجي بانورامي",
        "مقصورة تقنية بتصميم بسيط",
        "نظام صوت فاخر",
        "مقصورة مكيفة",
        "شبكة واي فاي على متن السيارة",
      ],
      ru: [
        "Полностью электрический привод",
        "Панорамная стеклянная крыша",
        "Минималистичный технологичный салон",
        "Премиальная акустическая система",
        "Салон с климат-контролем",
        "Wi-Fi в салоне",
      ],
      zh: [
        "纯电动力系统",
        "全景玻璃天窗",
        "极简科技座舱",
        "高级音响系统",
        "座舱恒温控制",
        "车载WiFi",
      ],
      fr: [
        "Motorisation 100 % électrique",
        "Toit panoramique en verre",
        "Habitacle minimaliste et technologique",
        "Système audio premium",
        "Habitacle climatisé",
        "Wi-Fi embarqué",
      ],
      de: [
        "Rein elektrischer Antrieb",
        "Panorama-Glasdach",
        "Minimalistische, technikorientierte Kabine",
        "Premium-Soundsystem",
        "Klimatisierte Kabine",
        "WLAN an Bord",
      ],
    },
    whyChoose: {
      en: [
        "A genuinely silent, all-electric ride",
        "Sustainable choice without compromising comfort",
        "Spacious cabin with a clean, modern interior",
        "Well suited to city transfers and corporate accounts",
      ],
      ar: [
        "قيادة كهربائية بالكامل وهادئة حقًا",
        "خيار مستدام دون التضحية بالراحة",
        "مقصورة واسعة بتصميم داخلي أنيق وعصري",
        "مناسبة تمامًا لتنقلات المدينة وحسابات الشركات",
      ],
      ru: [
        "По-настоящему бесшумная, полностью электрическая поездка",
        "Экологичный выбор без ущерба для комфорта",
        "Просторный салон с чистым, современным интерьером",
        "Отлично подходит для городских трансферов и корпоративных клиентов",
      ],
      zh: [
        "真正静谧的纯电动驾乘体验",
        "兼顾环保与舒适,无需妥协",
        "宽敞座舱,内饰简洁现代",
        "非常适合城市接送及企业客户",
      ],
      fr: [
        "Une conduite véritablement silencieuse et 100 % électrique",
        "Un choix durable sans compromis sur le confort",
        "Un habitacle spacieux à l'intérieur épuré et moderne",
        "Particulièrement adaptée aux trajets urbains et aux comptes d'entreprise",
      ],
      de: [
        "Eine wirklich lautlose, rein elektrische Fahrt",
        "Nachhaltige Wahl ohne Komforteinbußen",
        "Geräumige Kabine mit klarem, modernem Interieur",
        "Bestens geeignet für Stadttransfers und Firmenkonten",
      ],
    },
    faqs: [
      {
        question: {
          en: "Is the Model Y a fully electric vehicle?",
          ar: "هل Model Y سيارة كهربائية بالكامل؟",
          ru: "Является ли Model Y полностью электрическим автомобилем?",
          zh: "Model Y是纯电动车型吗?",
          fr: "La Model Y est-elle un véhicule entièrement électrique ?",
          de: "Ist der Model Y ein vollelektrisches Fahrzeug?",
        },
        answer: {
          en: "Yes, the Model Y is 100% electric, offering a smooth, silent ride with zero tailpipe emissions.",
          ar: "نعم، Model Y كهربائية بنسبة 100%، وتوفر قيادة سلسة وهادئة بدون أي انبعاثات من العادم.",
          ru: "Да, Model Y на 100% электрический, обеспечивает плавную, бесшумную езду с нулевыми выхлопными выбросами.",
          zh: "是的,Model Y为100%纯电动车型,提供平顺静谧的驾乘体验,尾气零排放。",
          fr: "Oui, la Model Y est 100 % électrique et offre une conduite douce et silencieuse avec zéro émission à l'échappement.",
          de: "Ja, der Model Y ist zu 100 % elektrisch und bietet eine sanfte, lautlose Fahrt ohne Auspuffemissionen.",
        },
      },
      {
        question: {
          en: "Is the Model Y suitable for airport transfers?",
          ar: "هل تناسب Model Y رحلات المطار؟",
          ru: "Подходит ли Model Y для трансферов из аэропорта?",
          zh: "Model Y是否适合机场接送?",
          fr: "La Model Y convient-elle aux transferts aéroport ?",
          de: "Ist der Model Y für Flughafentransfers geeignet?",
        },
        answer: {
          en: "Yes, it's a comfortable, efficient choice for airport transfers and city travel alike.",
          ar: "نعم، إنها خيار مريح وفعال لرحلات المطار والتنقل داخل المدينة على حد سواء.",
          ru: "Да, это удобный и эффективный вариант как для трансферов из аэропорта, так и для поездок по городу.",
          zh: "可以,无论是机场接送还是市内出行,它都是舒适高效的选择。",
          fr: "Oui, c'est un choix confortable et efficace aussi bien pour les transferts aéroport que pour les trajets en ville.",
          de: "Ja, er ist eine komfortable, effiziente Wahl sowohl für Flughafentransfers als auch für Stadtfahrten.",
        },
      },
      {
        question: {
          en: "How much luggage fits in the Model Y?",
          ar: "كم كمية الأمتعة التي تتسع لها Model Y؟",
          ru: "Сколько багажа помещается в Model Y?",
          zh: "Model Y可容纳多少行李?",
          fr: "Quelle quantité de bagages la Model Y peut-elle accueillir ?",
          de: "Wie viel Gepäck passt in den Model Y?",
        },
        answer: {
          en: "The Model Y comfortably holds up to 3 pieces of luggage thanks to its front and rear storage compartments.",
          ar: "تتسع Model Y بشكل مريح لما يصل إلى 3 حقائب بفضل حجيرات التخزين الأمامية والخلفية.",
          ru: "Model Y легко вмещает до 3 единиц багажа благодаря переднему и заднему багажным отделениям.",
          zh: "得益于前后储物空间,Model Y可轻松容纳最多3件行李。",
          fr: "La Model Y accueille confortablement jusqu'à 3 bagages grâce à ses compartiments de rangement avant et arrière.",
          de: "Der Model Y bietet dank vorderem und hinterem Stauraum bequem Platz für bis zu 3 Gepäckstücke.",
        },
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "gmc-yukon-elevation",
    brand: "GMC",
    model: "Yukon Elevation",
    rates: { tenHours: 2400, fiveHours: 1450, oneHour: 380, airport: 520, extraHour: 290, additionalCity: 290 },
    images: [
      {
        src: "/images/fleet/gmc-yukon-elevation/gmc-yukon-elevation-1.png",
        alt: {
          en: "Black GMC Yukon Elevation front three-quarter view at night outside a lit building",
          ar: "منظر أمامي جانبي لجي إم سي يوكون إليفيشن السوداء ليلاً أمام مبنى مضاء",
          ru: "Чёрный GMC Yukon Elevation спереди сбоку ночью у освещённого здания",
          zh: "黑色GMC育空Elevation版前四分之三视角,夜间置身灯光建筑前",
          fr: "GMC Yukon Elevation noir vu de trois-quarts avant, de nuit devant un bâtiment illuminé",
          de: "Schwarzer GMC Yukon Elevation in Vorderansicht von schräg vorne bei Nacht vor einem beleuchteten Gebäude",
        },
      },
      {
        src: "/images/fleet/gmc-yukon-elevation/gmc-yukon-elevation-2.jpg",
        alt: {
          en: "GMC Yukon Elevation front seats in saddle-tan leather with centre console",
          ar: "المقاعد الأمامية في جي إم سي يوكون إليفيشن من الجلد البني الفاتح مع الكونسول الأوسط",
          ru: "Передние сиденья GMC Yukon Elevation из светло-коричневой кожи с центральной консолью",
          zh: "GMC育空Elevation版前排座椅,鞍褐色真皮配中央扶手箱",
          fr: "Sièges avant du GMC Yukon Elevation en cuir havane avec console centrale",
          de: "Vordersitze des GMC Yukon Elevation in sattelbraunem Leder mit Mittelkonsole",
        },
      },
      {
        src: "/images/fleet/gmc-yukon-elevation/gmc-yukon-elevation-3.jpg",
        alt: {
          en: "GMC Yukon Elevation second- and third-row seating in saddle-tan leather",
          ar: "مقاعد الصفين الثاني والثالث في جي إم سي يوكون إليفيشن من الجلد البني الفاتح",
          ru: "Сиденья второго и третьего рядов GMC Yukon Elevation из светло-коричневой кожи",
          zh: "GMC育空Elevation版第二排与第三排座椅,鞍褐色真皮",
          fr: "Sièges de deuxième et troisième rangées du GMC Yukon Elevation en cuir havane",
          de: "Sitze der zweiten und dritten Reihe des GMC Yukon Elevation in sattelbraunem Leder",
        },
      },
    ],
    name: "GMC Yukon Elevation",
    category: "SUV",
    tagline: {
      en: "Bold styling, everyday capability",
      ar: "تصميم جريء وقدرة عملية يومية",
      ru: "Смелый дизайн, повседневная функциональность",
      zh: "硬朗造型,实用可靠",
      fr: "Un style audacieux, une polyvalence au quotidien",
      de: "Kühnes Design, alltagstaugliche Leistungsfähigkeit",
    },
    description: {
      en: "A full-size SUV with a sportier, blacked-out Elevation aesthetic — spacious, capable, and ready for group travel or airport runs.",
      ar: "سيارة رياضية متعددة الاستخدامات بحجم كامل بمظهر Elevation الرياضي الداكن — واسعة وقادرة وجاهزة للتنقل الجماعي أو رحلات المطار.",
      ru: "Полноразмерный внедорожник со спортивной, затемнённой отделкой Elevation — просторный, функциональный и готовый к групповым поездкам или трансферам в аэропорт.",
      zh: "全尺寸SUV,配备更具运动感的黑化Elevation外观套件——空间宽敞、性能可靠,随时可满足团体出行或机场接送需求。",
      fr: "Un SUV grand format à l'esthétique Elevation plus sportive et assombrie — spacieux, polyvalent et prêt pour les déplacements de groupe ou les navettes aéroport.",
      de: "Ein Full-Size-SUV mit sportlicherer, schwarz abgesetzter Elevation-Optik — geräumig, leistungsfähig und bereit für Gruppenreisen oder Flughafenfahrten.",
    },
    longDescription: {
      en: "The Yukon Elevation brings GMC's bold, sport-inspired styling to full-size chauffeured travel — a spacious three-row cabin, a smooth ride, and enough room for passengers and luggage on longer itineraries or group airport transfers. Its blacked-out Elevation trim gives it a sportier, more assertive look than a traditional full-size SUV, without sacrificing any of the practicality larger groups need. Three rows of seating, a climate-controlled cabin, and tinted privacy windows keep everyone comfortable over longer routes, while the elevated ride height and ample luggage space handle multi-stop itineraries with ease. It's a versatile, dependable option for group travel and airport transfers when you want genuine road presence at a slightly more accessible tier than our top-tier SUVs.",
      ar: "تجلب Yukon Elevation تصميم GMC الجريء المستوحى من الطراز الرياضي إلى رحلات السائق الخاص بالحجم الكامل — مقصورة واسعة بثلاثة صفوف، وقيادة سلسة، ومساحة كافية للركاب والأمتعة في الرحلات الطويلة أو نقل المجموعات من وإلى المطار. تمنحها تشطيبات Elevation الداكنة مظهرًا رياضيًا أكثر جرأة مقارنة بسيارة رياضية متعددة الاستخدامات تقليدية بحجم كامل، دون التضحية بأي من العملية التي تحتاجها المجموعات الأكبر. تحافظ صفوف المقاعد الثلاثة والمقصورة المكيفة والنوافذ الداكنة للخصوصية على راحة الجميع في الرحلات الطويلة، بينما يتعامل ارتفاعها المرتفع ومساحة الأمتعة الواسعة بسهولة مع الرحلات متعددة التوقفات. إنها خيار متعدد الاستخدامات وموثوق للتنقل الجماعي ورحلات المطار عندما ترغب في حضور حقيقي على الطريق بمستوى أكثر سهولة قليلاً مقارنة بأعلى فئات سياراتنا الرياضية متعددة الاستخدامات.",
      ru: "Yukon Elevation привносит смелый, спортивно вдохновлённый дизайн GMC в полноразмерные поездки с водителем — просторный трёхрядный салон, плавный ход и достаточно места для пассажиров и багажа в длительных поездках или групповых трансферах в аэропорт. Затемнённая отделка Elevation придаёт ему более спортивный, уверенный вид по сравнению с традиционным полноразмерным внедорожником, не жертвуя при этом практичностью, необходимой большим группам. Три ряда сидений, салон с климат-контролем и тонированные окна приватности обеспечивают комфорт всем пассажирам на длительных маршрутах, а приподнятая посадка и просторное багажное отделение легко справляются с маршрутами с несколькими остановками. Это универсальный, надёжный вариант для групповых поездок и трансферов в аэропорт, когда вам нужен подлинный статус на дороге на чуть более доступном уровне, чем наши внедорожники высшего класса.",
      zh: "Yukon Elevation将GMC大胆的运动化设计理念带入全尺寸专属司机出行体验——宽敞的三排座舱、平顺的驾乘,以及足够容纳乘客与行李的空间,适用于长途行程或团体机场接送。其黑化Elevation套件相比传统全尺寸SUV展现出更具运动感、更强势的外观,同时不牺牲大型团体所需的实用性。三排座椅、恒温座舱及深色隐私车窗让每位乘客在长途旅程中都能保持舒适,而较高的车身高度与充裕的行李空间则能轻松应对多站点行程。当您希望以比顶配SUV更亲民的价位获得真正的道路气场时,它是团体出行与机场接送用途中多功能且可靠的理想之选。",
      fr: "Le Yukon Elevation apporte le style audacieux et sportif de GMC aux trajets avec chauffeur grand format — un habitacle spacieux à trois rangées, une conduite souple et suffisamment d'espace pour les passagers et les bagages sur les itinéraires plus longs ou les transferts aéroport de groupe. Sa finition Elevation assombrie lui confère une allure plus sportive et affirmée qu'un SUV grand format traditionnel, sans sacrifier la praticité dont les grands groupes ont besoin. Trois rangées de sièges, un habitacle climatisé et des vitres teintées assurent le confort de tous sur les longs trajets, tandis que la garde au sol élevée et le généreux espace de rangement gèrent aisément les itinéraires à arrêts multiples. C'est une option polyvalente et fiable pour les déplacements de groupe et les transferts aéroport lorsque vous recherchez une véritable présence sur la route à un niveau légèrement plus accessible que nos SUV haut de gamme.",
      de: "Der Yukon Elevation bringt GMCs kühnes, sportlich inspiriertes Design in Full-Size-Chauffeurfahrten — eine geräumige dreireihige Kabine, ein sanftes Fahrverhalten und genug Platz für Passagiere und Gepäck auf längeren Strecken oder bei Gruppentransfers zum Flughafen. Die schwarz abgesetzte Elevation-Ausstattung verleiht ihm ein sportlicheres, selbstbewussteres Erscheinungsbild als einem klassischen Full-Size-SUV, ohne auf die Praktikabilität zu verzichten, die größere Gruppen benötigen. Drei Sitzreihen, eine klimatisierte Kabine und getönte Sichtschutzscheiben sorgen auf längeren Strecken für den Komfort aller Passagiere, während die erhöhte Sitzposition und der großzügige Gepäckraum Reisen mit mehreren Stopps mühelos bewältigen. Er ist eine vielseitige, verlässliche Option für Gruppenreisen und Flughafentransfers, wenn Sie echte Straßenpräsenz zu einem etwas zugänglicheren Niveau als unsere Top-SUVs wünschen.",
    },
    passengers: 6,
    luggage: 4,
    idealFor: {
      en: "Group travel & airport transfers",
      ar: "التنقل الجماعي ورحلات المطار",
      ru: "Групповые поездки и трансферы в аэропорт",
      zh: "团体出行与机场接送",
      fr: "Déplacements de groupe et transferts aéroport",
      de: "Gruppenreisen & Flughafentransfers",
    },
    features: {
      en: [
        "Three-row seating",
        "Elevated ride height",
        "Premium sound system",
        "Ample luggage space",
        "Climate-controlled cabin",
      ],
      ar: [
        "مقاعد بثلاثة صفوف",
        "ارتفاع مرتفع للسيارة",
        "نظام صوت فاخر",
        "مساحة أمتعة واسعة",
        "مقصورة مكيفة",
      ],
      ru: [
        "Трёхрядная посадка",
        "Приподнятая посадка",
        "Премиальная акустическая система",
        "Просторное багажное отделение",
        "Салон с климат-контролем",
      ],
      zh: [
        "三排座椅",
        "较高车身高度",
        "高级音响系统",
        "充裕行李空间",
        "座舱恒温控制",
      ],
      fr: [
        "Sièges sur trois rangées",
        "Garde au sol élevée",
        "Système audio premium",
        "Grand espace de rangement",
        "Habitacle climatisé",
      ],
      de: [
        "Dreireihige Bestuhlung",
        "Erhöhte Sitzposition",
        "Premium-Soundsystem",
        "Großzügiger Gepäckraum",
        "Klimatisierte Kabine",
      ],
    },
    whyChoose: {
      en: [
        "Bold, sport-inspired styling with everyday practicality",
        "Spacious three-row cabin for larger groups",
        "Dependable capability for longer itineraries",
        "A versatile alternative for mid-sized group travel",
      ],
      ar: [
        "تصميم جريء مستوحى من الطراز الرياضي مع عملية يومية",
        "مقصورة واسعة بثلاثة صفوف للمجموعات الأكبر",
        "قدرة موثوقة للرحلات الطويلة",
        "بديل متعدد الاستخدامات للتنقل الجماعي متوسط الحجم",
      ],
      ru: [
        "Смелый, спортивно вдохновлённый дизайн с повседневной практичностью",
        "Просторный трёхрядный салон для больших групп",
        "Надёжные возможности для длительных маршрутов",
        "Универсальная альтернатива для поездок групп среднего размера",
      ],
      zh: [
        "大胆的运动化设计,兼具日常实用性",
        "宽敞三排座舱,适合大型团体",
        "长途行程中值得信赖的性能表现",
        "适合中型团体出行的多功能之选",
      ],
      fr: [
        "Un style audacieux d'inspiration sportive allié à une praticité quotidienne",
        "Un habitacle spacieux à trois rangées pour les grands groupes",
        "Une fiabilité éprouvée pour les itinéraires plus longs",
        "Une alternative polyvalente pour les déplacements de groupes de taille moyenne",
      ],
      de: [
        "Kühnes, sportlich inspiriertes Design mit alltäglicher Praktikabilität",
        "Geräumige dreireihige Kabine für größere Gruppen",
        "Verlässliche Leistungsfähigkeit für längere Strecken",
        "Eine vielseitige Alternative für Gruppenreisen mittlerer Größe",
      ],
    },
    faqs: [
      {
        question: {
          en: "How does the Yukon Elevation compare to the Escalade?",
          ar: "كيف تقارن Yukon Elevation بإسكاليد؟",
          ru: "Чем Yukon Elevation отличается от Escalade?",
          zh: "Yukon Elevation与凯雷德(Escalade)相比如何?",
          fr: "Comment le Yukon Elevation se compare-t-il à l'Escalade ?",
          de: "Wie schneidet der Yukon Elevation im Vergleich zum Escalade ab?",
        },
        answer: {
          en: "Both are full-size, three-row SUVs. The Escalade leans more upscale in cabin finish, while the Yukon Elevation offers a bolder, sport-inspired look at a more accessible tier.",
          ar: "كلاهما سيارتان رياضيتان متعددتا الاستخدامات بحجم كامل وثلاثة صفوف مقاعد. تميل إسكاليد إلى مستوى أرقى في تشطيبات المقصورة، بينما تقدم Yukon Elevation مظهرًا أكثر جرأة مستوحى من الطراز الرياضي بمستوى أكثر سهولة.",
          ru: "Оба — полноразмерные, трёхрядные внедорожники. Escalade тяготеет к более статусной отделке салона, а Yukon Elevation предлагает более смелый, спортивный облик на более доступном уровне.",
          zh: "两者都是全尺寸三排SUV。凯雷德在座舱内饰上更显高端,而Yukon Elevation则以更亲民的价位提供更大胆、运动感更强的外观。",
          fr: "Les deux sont des SUV grand format à trois rangées. L'Escalade privilégie une finition d'habitacle plus haut de gamme, tandis que le Yukon Elevation offre un look plus audacieux et sportif à un niveau plus accessible.",
          de: "Beide sind Full-Size-SUVs mit drei Sitzreihen. Der Escalade tendiert zu einer edleren Kabinenausstattung, während der Yukon Elevation ein kühneres, sportlich inspiriertes Erscheinungsbild zu einem zugänglicheren Niveau bietet.",
        },
      },
      {
        question: {
          en: "Is the Yukon Elevation good for group airport transfers?",
          ar: "هل Yukon Elevation مناسبة لنقل المجموعات من وإلى المطار؟",
          ru: "Подходит ли Yukon Elevation для групповых трансферов в аэропорт?",
          zh: "Yukon Elevation是否适合团体机场接送?",
          fr: "Le Yukon Elevation est-il adapté aux transferts aéroport de groupe ?",
          de: "Ist der Yukon Elevation gut für Gruppentransfers zum Flughafen geeignet?",
        },
        answer: {
          en: "Yes, its three-row seating and generous luggage space make it well suited to group airport transfers.",
          ar: "نعم، تجعلها مقاعدها الثلاثية الصفوف ومساحة الأمتعة السخية مناسبة تمامًا لنقل المجموعات من وإلى المطار.",
          ru: "Да, трёхрядные сиденья и просторное багажное отделение делают его отлично подходящим для групповых трансферов в аэропорт.",
          zh: "可以,其三排座椅与充裕的行李空间使其非常适合团体机场接送。",
          fr: "Oui, ses sièges sur trois rangées et son généreux espace de rangement en font un choix idéal pour les transferts aéroport de groupe.",
          de: "Ja, die dreireihige Bestuhlung und der großzügige Gepäckraum machen ihn bestens geeignet für Gruppentransfers zum Flughafen.",
        },
      },
      {
        question: {
          en: "Can the Yukon Elevation be booked hourly?",
          ar: "هل يمكن حجز Yukon Elevation بالساعة؟",
          ru: "Можно ли забронировать Yukon Elevation на почасовой основе?",
          zh: "Yukon Elevation可以按小时预订吗?",
          fr: "Le Yukon Elevation peut-il être réservé à l'heure ?",
          de: "Kann der Yukon Elevation stundenweise gebucht werden?",
        },
        answer: {
          en: "Yes, hourly and full-day hire are both available.",
          ar: "نعم، يتوفر كل من الاستئجار بالساعة وليوم كامل.",
          ru: "Да, доступна как почасовая, так и полнодневная аренда.",
          zh: "可以,按小时及全天租用均可提供。",
          fr: "Oui, la location à l'heure et à la journée sont toutes deux disponibles.",
          de: "Ja, sowohl Stunden- als auch Ganztagesmiete sind verfügbar.",
        },
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "tesla-model-3",
    brand: "Tesla",
    model: "Model 3",
    rates: { tenHours: 1800, fiveHours: 1050, oneHour: 270, airport: 370, extraHour: 210, additionalCity: 210 },
    images: [
      {
        src: "/images/fleet/tesla-model-3/tesla-model-3-1.png",
        alt: {
          en: "White Tesla Model 3 front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لتسلا موديل 3 البيضاء في صالة عرض بأرضية رخامية",
          ru: "Белая Tesla Model 3 спереди сбоку в шоуруме с мраморным полом",
          zh: "白色特斯拉Model 3前四分之三视角,置身大理石地面展厅",
          fr: "Tesla Model 3 blanche vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Weißes Tesla Model 3 in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/tesla-model-3/tesla-model-3-2.png",
        alt: {
          en: "Tesla Model 3 rear bench seating in black leather",
          ar: "المقعد الخلفي الطويل في تسلا موديل 3 من الجلد الأسود",
          ru: "Задний диван Tesla Model 3 из чёрной кожи",
          zh: "特斯拉Model 3后排长椅座椅,黑色真皮",
          fr: "Banquette arrière de la Tesla Model 3 en cuir noir",
          de: "Rücksitzbank des Tesla Model 3 in schwarzem Leder",
        },
      },
      {
        src: "/images/fleet/tesla-model-3/tesla-model-3-3.png",
        alt: {
          en: "Tesla Model 3 rear seats with centre console air vents",
          ar: "المقاعد الخلفية في تسلا موديل 3 مع فتحات تهوية في الكونسول الأوسط",
          ru: "Задние сиденья Tesla Model 3 с дефлекторами центральной консоли",
          zh: "特斯拉Model 3后排座椅,配中央扶手箱出风口",
          fr: "Sièges arrière de la Tesla Model 3 avec aérateurs de console centrale",
          de: "Rücksitze des Tesla Model 3 mit Lüftungsdüsen der Mittelkonsole",
        },
      },
    ],    name: "Tesla Model 3",
    category: "Sedan",
    isElectric: true,
    tagline: {
      en: "Quiet, efficient, modern",
      ar: "هادئة وموفرة وعصرية",
      ru: "Тихий, эффективный, современный",
      zh: "静谧、高效、现代",
      fr: "Silencieuse, efficace, moderne",
      de: "Leise, effizient, modern",
    },
    description: {
      en: "A fully electric executive sedan for clients who want a quiet, efficient ride with a clean, modern cabin — ideal for city transfers and corporate travel.",
      ar: "سيارة سيدان تنفيذية كهربائية بالكامل لعملاء يبحثون عن قيادة هادئة وموفرة بمقصورة أنيقة وعصرية — مثالية لتنقلات المدينة والسفر التجاري.",
      ru: "Полностью электрический представительский седан для клиентов, желающих тихую, эффективную поездку с чистым, современным салоном — идеален для городских трансферов и деловых поездок.",
      zh: "这是一款纯电动行政轿车,专为追求静谧高效驾乘体验、简洁现代座舱的客户打造——是城市接送与商务出行的理想之选。",
      fr: "Une berline executive 100 % électrique pour les clients recherchant une conduite silencieuse et efficace dans un habitacle épuré et moderne — idéale pour les trajets urbains et les déplacements professionnels.",
      de: "Eine vollelektrische Executive-Limousine für Kunden, die eine leise, effiziente Fahrt mit einer klaren, modernen Kabine wünschen — ideal für Stadttransfers und Geschäftsreisen.",
    },
    longDescription: {
      en: "The Model 3 brings Tesla's all-electric efficiency to executive sedan travel — a whisper-quiet ride, minimalist interior, and dependable performance for business travel and airport transfers across Dubai. With no engine to idle or rumble at a standstill, the cabin stays genuinely silent from pickup to drop-off, complemented by a clean, tech-forward interior, a premium sound system, and full climate control front and rear. Onboard Wi-Fi and privacy glass make it a practical choice for working during the ride, while its efficiency makes it one of our most cost-effective options for standing corporate accounts that book frequently. A dependable, modern alternative to a traditional executive sedan for clients who want quiet, efficient travel without any compromise on comfort.",
      ar: "تجلب Model 3 كفاءة تيسلا الكهربائية بالكامل إلى رحلات السيدان التنفيذية — قيادة هادئة كالهمس، وتصميم داخلي بسيط، وأداء موثوق للسفر التجاري ورحلات المطار في جميع أنحاء دبي. مع عدم وجود محرك يعمل بصوت مسموع أو يهدر عند التوقف، تبقى المقصورة هادئة حقًا من الاستلام إلى الوصول، مكملة بتصميم داخلي أنيق وتقني متقدم، ونظام صوت فاخر، وتحكم كامل بدرجة الحرارة في المقدمة والخلف. تجعل شبكة الواي فاي على متن السيارة والزجاج العاكس للخصوصية منها خيارًا عمليًا للعمل أثناء الرحلة، بينما تجعل كفاءتها واحدة من أكثر خياراتنا فعالية من حيث التكلفة لحسابات الشركات الدائمة التي تحجز بشكل متكرر. بديل عصري وموثوق لسيدان تنفيذية تقليدية لعملاء يرغبون في سفر هادئ وموفر دون أي تنازل عن الراحة.",
      ru: "Model 3 привносит полностью электрическую эффективность Tesla в представительские седаны — тихую, как шёпот, поездку, минималистичный интерьер и надёжную производительность для деловых поездок и трансферов из аэропорта по всему Дубаю. Поскольку двигателю не нужно работать на холостом ходу или гудеть при остановке, салон остаётся по-настоящему тихим от посадки до высадки, дополняясь чистым, технологичным интерьером, премиальной акустической системой и полным климат-контролем спереди и сзади. Бортовой Wi-Fi и тонированные стёкла делают его практичным выбором для работы в пути, а его эффективность делает его одним из самых экономически выгодных вариантов для постоянных корпоративных клиентов, часто совершающих поездки. Надёжная, современная альтернатива традиционному представительскому седану для клиентов, желающих тихих, эффективных поездок без каких-либо компромиссов в комфорте.",
      zh: "Model 3将特斯拉的纯电效率带入行政轿车出行体验——如耳语般静谧的驾乘、极简内饰,以及在迪拜各地商务出行与机场接送中值得信赖的性能表现。由于没有引擎怠速或停车时的轰鸣声,座舱从接客到送达全程保持真正的静谧,搭配简洁富有科技感的内饰、高级音响系统,以及前后排全面温控。车载WiFi与隐私玻璃使其成为途中办公的实用之选,而其高效性也使其成为频繁预订的长期企业客户中最具成本效益的选择之一。对于追求静谧高效出行、又不愿在舒适度上有任何妥协的客户而言,它是传统行政轿车值得信赖的现代化替代之选。",
      fr: "La Model 3 apporte l'efficacité 100 % électrique de Tesla aux trajets en berline executive — une conduite d'un silence absolu, un intérieur minimaliste et des performances fiables pour les voyages d'affaires et les transferts aéroport dans tout Dubaï. Sans moteur au ralenti ou vrombissant à l'arrêt, l'habitacle reste véritablement silencieux de la prise en charge à la dépose, complété par un intérieur épuré et technologique, un système audio premium et une climatisation complète à l'avant comme à l'arrière. Le Wi-Fi embarqué et les vitres teintées en font un choix pratique pour travailler pendant le trajet, tandis que son efficacité en fait l'une de nos options les plus économiques pour les comptes d'entreprise permanents qui réservent fréquemment. Une alternative moderne et fiable à une berline executive traditionnelle pour les clients qui recherchent des trajets silencieux et efficaces sans aucun compromis sur le confort.",
      de: "Der Model 3 bringt Teslas vollelektrische Effizienz in die Executive-Limousinen-Kategorie — eine flüsterleise Fahrt, ein minimalistisches Interieur und verlässliche Leistung für Geschäftsreisen und Flughafentransfers in ganz Dubai. Da kein Motor im Stand leerläuft oder brummt, bleibt die Kabine von der Abholung bis zum Ziel wirklich lautlos, ergänzt durch ein klares, technikorientiertes Interieur, ein Premium-Soundsystem und vollständige Klimatisierung vorne wie hinten. WLAN an Bord und Sichtschutzverglasung machen ihn zu einer praktischen Wahl, um während der Fahrt zu arbeiten, während seine Effizienz ihn zu einer unserer kosteneffizientesten Optionen für feste Firmenkonten macht, die häufig buchen. Eine verlässliche, moderne Alternative zu einer traditionellen Executive-Limousine für Kunden, die leise, effiziente Fahrten ohne jegliche Komforteinbußen wünschen.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Business travel & eco-conscious transfers",
      ar: "السفر التجاري والتنقلات الواعية بيئيًا",
      ru: "Деловые поездки и экологичные трансферы",
      zh: "商务出行与环保型接送",
      fr: "Voyages d'affaires et transferts éco-responsables",
      de: "Geschäftsreisen & umweltbewusste Transfers",
    },
    features: {
      en: [
        "All-electric powertrain",
        "Minimalist tech-forward cabin",
        "Premium sound system",
        "Climate-controlled cabin",
        "Onboard Wi-Fi",
      ],
      ar: [
        "نظام دفع كهربائي بالكامل",
        "مقصورة تقنية بتصميم بسيط",
        "نظام صوت فاخر",
        "مقصورة مكيفة",
        "شبكة واي فاي على متن السيارة",
      ],
      ru: [
        "Полностью электрический привод",
        "Минималистичный технологичный салон",
        "Премиальная акустическая система",
        "Салон с климат-контролем",
        "Wi-Fi в салоне",
      ],
      zh: [
        "纯电动力系统",
        "极简科技座舱",
        "高级音响系统",
        "座舱恒温控制",
        "车载WiFi",
      ],
      fr: [
        "Motorisation 100 % électrique",
        "Habitacle minimaliste et technologique",
        "Système audio premium",
        "Habitacle climatisé",
        "Wi-Fi embarqué",
      ],
      de: [
        "Rein elektrischer Antrieb",
        "Minimalistische, technikorientierte Kabine",
        "Premium-Soundsystem",
        "Klimatisierte Kabine",
        "WLAN an Bord",
      ],
    },
    whyChoose: {
      en: [
        "A genuinely silent, all-electric ride",
        "Efficient and sustainable without sacrificing comfort",
        "Clean, modern cabin design",
        "A cost-efficient option for standing corporate accounts",
      ],
      ar: [
        "قيادة كهربائية بالكامل وهادئة حقًا",
        "كفاءة واستدامة دون التضحية بالراحة",
        "تصميم مقصورة أنيق وعصري",
        "خيار موفر لحسابات الشركات الدائمة",
      ],
      ru: [
        "По-настоящему бесшумная, полностью электрическая поездка",
        "Эффективность и экологичность без ущерба для комфорта",
        "Чистый, современный дизайн салона",
        "Экономически эффективный вариант для постоянных корпоративных клиентов",
      ],
      zh: [
        "真正静谧的纯电动驾乘体验",
        "高效环保,舒适不打折扣",
        "简洁现代的座舱设计",
        "长期企业账户的经济高效之选",
      ],
      fr: [
        "Une conduite véritablement silencieuse et 100 % électrique",
        "Efficace et durable sans sacrifier le confort",
        "Un design d'habitacle épuré et moderne",
        "Une option économique pour les comptes d'entreprise permanents",
      ],
      de: [
        "Eine wirklich lautlose, rein elektrische Fahrt",
        "Effizient und nachhaltig ohne Komforteinbußen",
        "Klares, modernes Kabinendesign",
        "Eine kosteneffiziente Option für feste Firmenkonten",
      ],
    },
    faqs: [
      {
        question: {
          en: "Is the Model 3 a fully electric vehicle?",
          ar: "هل Model 3 سيارة كهربائية بالكامل؟",
          ru: "Является ли Model 3 полностью электрическим автомобилем?",
          zh: "Model 3是纯电动车型吗?",
          fr: "La Model 3 est-elle un véhicule entièrement électrique ?",
          de: "Ist der Model 3 ein vollelektrisches Fahrzeug?",
        },
        answer: {
          en: "Yes, the Model 3 is 100% electric, offering a quiet, efficient ride.",
          ar: "نعم، Model 3 كهربائية بنسبة 100%، وتوفر قيادة هادئة وموفرة.",
          ru: "Да, Model 3 на 100% электрический, обеспечивает тихую, эффективную езду.",
          zh: "是的,Model 3为100%纯电动车型,提供静谧高效的驾乘体验。",
          fr: "Oui, la Model 3 est 100 % électrique et offre une conduite silencieuse et efficace.",
          de: "Ja, der Model 3 ist zu 100 % elektrisch und bietet eine leise, effiziente Fahrt.",
        },
      },
      {
        question: {
          en: "Is the Model 3 suitable for corporate accounts?",
          ar: "هل تناسب Model 3 حسابات الشركات؟",
          ru: "Подходит ли Model 3 для корпоративных клиентов?",
          zh: "Model 3是否适合企业客户?",
          fr: "La Model 3 convient-elle aux comptes d'entreprise ?",
          de: "Ist der Model 3 für Firmenkonten geeignet?",
        },
        answer: {
          en: "Yes, it's a cost-efficient, dependable option for standing corporate accounts and daily business travel.",
          ar: "نعم، إنها خيار موفر وموثوق لحسابات الشركات الدائمة والسفر التجاري اليومي.",
          ru: "Да, это экономически эффективный, надёжный вариант для постоянных корпоративных клиентов и ежедневных деловых поездок.",
          zh: "可以,它是长期企业账户及日常商务出行经济可靠的理想之选。",
          fr: "Oui, c'est une option économique et fiable pour les comptes d'entreprise permanents et les déplacements professionnels quotidiens.",
          de: "Ja, er ist eine kosteneffiziente, verlässliche Option für feste Firmenkonten und tägliche Geschäftsreisen.",
        },
      },
      {
        question: {
          en: "How much luggage fits in the Model 3?",
          ar: "كم كمية الأمتعة التي تتسع لها Model 3؟",
          ru: "Сколько багажа помещается в Model 3?",
          zh: "Model 3可容纳多少行李?",
          fr: "Quelle quantité de bagages la Model 3 peut-elle accueillir ?",
          de: "Wie viel Gepäck passt in den Model 3?",
        },
        answer: {
          en: "The Model 3 comfortably holds 2 standard suitcases plus carry-ons.",
          ar: "تتسع Model 3 بشكل مريح لحقيبتين قياسيتين بالإضافة إلى حقائب اليد.",
          ru: "Model 3 легко вмещает 2 стандартных чемодана плюс ручную кладь.",
          zh: "Model 3可轻松容纳2件标准行李箱及随身行李。",
          fr: "La Model 3 accueille confortablement 2 valises standard plus des bagages à main.",
          de: "Der Model 3 bietet bequem Platz für 2 Standardkoffer plus Handgepäck.",
        },
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "byd-han",
    brand: "BYD",
    model: "Han",
    rates: { tenHours: 2100, fiveHours: 1250, oneHour: 330, airport: 430, extraHour: 240, additionalCity: 240 },
    // NOTE: byd-han/2.jpg and byd-han/3.jpg in the uploaded folder are a
    // different vehicle's interior (a Rolls-Royce cabin — see the embroidered
    // "R" headrest logo), not the BYD Han. Only the verified exterior hero is
    // used here; add real BYD Han interior/detail photos to this folder and
    // extend this array once available.
    images: [
      {
        src: "/images/fleet/byd-han/byd-han-1.png",
        alt: {
          en: "Silver BYD Han front three-quarter view in a marble-floored showroom",
          ar: "منظر أمامي جانبي لسيارة BYD Han الفضية في صالة عرض بأرضية رخامية",
          ru: "Серебристый BYD Han спереди сбоку в шоуруме с мраморным полом",
          zh: "银色比亚迪汉前四分之三视角,置身大理石地面展厅",
          fr: "BYD Han argentée vue avant trois-quarts dans un showroom au sol en marbre",
          de: "Silberner BYD Han in Vorderansicht von schräg vorne in einem Showroom mit Marmorboden",
        },
      },
      {
        src: "/images/fleet/byd-han/byd-han-2.png",
        alt: {
          en: "BYD Han front cabin with taupe quilted leather seats and centre console",
          ar: "المقصورة الأمامية في BYD Han بمقاعد جلدية مبطنة بلون بني رمادي والكونسول الأوسط",
          ru: "Передний салон BYD Han с сиденьями из стёганой кожи цвета тауп и центральной консолью",
          zh: "比亚迪汉前排座舱,灰褐色绗缝真皮座椅配中央扶手箱",
          fr: "Habitacle avant de la BYD Han avec sièges en cuir matelassé taupe et console centrale",
          de: "Vordere Kabine des BYD Han mit gesteppten Ledersitzen in Taupe und Mittelkonsole",
        },
      },
      {
        src: "/images/fleet/byd-han/byd-han-3.png",
        alt: {
          en: "BYD Han rear bench seating with folding centre armrest and cupholders",
          ar: "المقعد الخلفي في BYD Han مع مسند ذراع أوسط قابل للطي وحاملات أكواب",
          ru: "Задний диван BYD Han с откидным центральным подлокотником и подстаканниками",
          zh: "比亚迪汉后排座椅,配可折叠中央扶手及杯架",
          fr: "Banquette arrière de la BYD Han avec accoudoir central rabattable et porte-gobelets",
          de: "Rücksitzbank des BYD Han mit klappbarer Mittelarmlehne und Getränkehaltern",
        },
      },
    ],
    name: "BYD Han",
    category: "Sedan",
    isElectric: true,
    tagline: {
      en: "Refined electric performance",
      ar: "أداء كهربائي راقٍ",
      ru: "Изысканная электрическая производительность",
      zh: "精致的电动性能",
      fr: "Une performance électrique raffinée",
      de: "Verfeinerte elektrische Leistung",
    },
    description: {
      en: "A flagship all-electric sedan pairing refined comfort with strong performance — a modern alternative for executive travel across Dubai.",
      ar: "سيارة سيدان رائدة كهربائية بالكامل تجمع بين الراحة الراقية والأداء القوي — بديل عصري للسفر التنفيذي في جميع أنحاء دبي.",
      ru: "Флагманский полностью электрический седан, сочетающий изысканный комфорт с мощной производительностью — современная альтернатива для представительских поездок по всему Дубаю.",
      zh: "这是一款旗舰级纯电动轿车,将精致舒适与强劲性能完美结合——是迪拜各地行政出行的现代化替代之选。",
      fr: "Une berline phare 100 % électrique alliant confort raffiné et performances solides — une alternative moderne pour les déplacements executive dans tout Dubaï.",
      de: "Eine elektrische Flaggschiff-Limousine, die verfeinerten Komfort mit starker Leistung verbindet — eine moderne Alternative für Executive-Reisen in ganz Dubai.",
    },
    longDescription: {
      en: "The BYD Han brings flagship-level comfort and all-electric performance to executive chauffeured travel — a well-appointed cabin, smooth ride quality, and dependable range for business travel and airport transfers. Leather executive seating and rear-seat climate control deliver the same standard of comfort as our traditional executive sedans, while the all-electric drivetrain keeps the cabin remarkably quiet at any speed. A premium sound system, onboard Wi-Fi, and privacy glass round out a cabin built for productive, comfortable travel between meetings. As a modern, dependable alternative to traditional combustion-engine executive sedans, it's well suited to corporate accounts and clients who want flagship comfort with a smaller environmental footprint on every trip.",
      ar: "تجلب BYD Han راحة على مستوى السيارات الرائدة وأداءً كهربائيًا بالكامل إلى رحلات السائق الخاص التنفيذية — مقصورة مجهزة بعناية، وجودة قيادة سلسة، ومدى موثوق للسفر التجاري ورحلات المطار. توفر المقاعد التنفيذية الجلدية والتحكم بدرجة حرارة المقاعد الخلفية نفس مستوى الراحة الذي توفره سياراتنا التنفيذية التقليدية، بينما يحافظ نظام الدفع الكهربائي بالكامل على هدوء المقصورة بشكل لافت عند أي سرعة. يكمل نظام الصوت الفاخر وشبكة الواي فاي على متن السيارة والزجاج العاكس للخصوصية مقصورة مصممة لسفر مريح ومنتج بين الاجتماعات. بصفتها بديلاً عصريًا وموثوقًا للسيارات السيدان التنفيذية التقليدية ذات محرك الاحتراق، فهي مناسبة تمامًا لحسابات الشركات والعملاء الراغبين في راحة على مستوى السيارات الرائدة مع بصمة بيئية أصغر في كل رحلة.",
      ru: "BYD Han привносит комфорт флагманского уровня и полностью электрическую производительность в представительские поездки с водителем — хорошо оснащённый салон, плавное качество езды и надёжный запас хода для деловых поездок и трансферов из аэропорта. Кожаные представительские сиденья и климат-контроль задних сидений обеспечивают тот же уровень комфорта, что и наши традиционные представительские седаны, а полностью электрическая трансмиссия сохраняет удивительную тишину в салоне на любой скорости. Премиальная акустическая система, бортовой Wi-Fi и тонированные стёкла дополняют салон, созданный для продуктивных, комфортных поездок между встречами. Будучи современной, надёжной альтернативой традиционным представительским седанам с двигателем внутреннего сгорания, он отлично подходит для корпоративных клиентов и клиентов, желающих получить комфорт флагманского уровня с меньшим экологическим следом в каждой поездке.",
      zh: "BYD汉将旗舰级舒适与纯电性能带入行政专属司机出行体验——精心配置的座舱、平顺的驾乘质感,以及可满足商务出行与机场接送需求的可靠续航。真皮行政座椅与后排座椅独立温控带来与我们传统行政轿车同等的舒适标准,而纯电驱动系统则让座舱在任何车速下都保持出奇的静谧。高级音响系统、车载WiFi及隐私玻璃进一步完善了这一专为会议间高效、舒适出行打造的座舱。作为传统燃油行政轿车现代且可靠的替代之选,它非常适合企业客户及希望在每一次出行中都能享受旗舰级舒适、同时降低环境足迹的客户。",
      fr: "La BYD Han apporte un confort digne d'un modèle phare et des performances 100 % électriques aux trajets executive avec chauffeur — un habitacle bien équipé, une conduite souple et une autonomie fiable pour les voyages d'affaires et les transferts aéroport. Les sièges executive en cuir et la climatisation des sièges arrière offrent le même niveau de confort que nos berlines executive traditionnelles, tandis que la motorisation 100 % électrique maintient l'habitacle remarquablement silencieux à toute vitesse. Un système audio premium, le Wi-Fi embarqué et des vitres teintées complètent un habitacle conçu pour des trajets productifs et confortables entre les réunions. En tant qu'alternative moderne et fiable aux berlines executive traditionnelles à moteur thermique, elle convient parfaitement aux comptes d'entreprise et aux clients qui recherchent un confort digne d'un modèle phare avec une empreinte environnementale réduite à chaque trajet.",
      de: "Der BYD Han bringt Komfort auf Flaggschiff-Niveau und vollelektrische Leistung in Executive-Chauffeurfahrten — eine gut ausgestattete Kabine, sanftes Fahrverhalten und eine verlässliche Reichweite für Geschäftsreisen und Flughafentransfers. Ledersitze im Executive-Stil und die Klimatisierung der Rücksitze bieten denselben Komfortstandard wie unsere traditionellen Executive-Limousinen, während der vollelektrische Antrieb die Kabine bei jeder Geschwindigkeit bemerkenswert leise hält. Ein Premium-Soundsystem, WLAN an Bord und Sichtschutzverglasung vervollständigen eine Kabine, die für produktive, komfortable Fahrten zwischen Terminen konzipiert ist. Als moderne, verlässliche Alternative zu traditionellen Executive-Limousinen mit Verbrennungsmotor eignet er sich hervorragend für Firmenkonten und Kunden, die Flaggschiff-Komfort mit einem geringeren ökologischen Fußabdruck bei jeder Fahrt wünschen.",
    },
    passengers: 3,
    luggage: 2,
    idealFor: {
      en: "Executive travel & corporate transfers",
      ar: "السفر التنفيذي ونقل الشركات",
      ru: "Представительские поездки и корпоративные трансферы",
      zh: "行政出行与企业接送",
      fr: "Voyages executive et transferts d'entreprise",
      de: "Executive-Reisen & Firmentransfers",
    },
    features: {
      en: [
        "All-electric powertrain",
        "Leather executive seating",
        "Rear-seat climate control",
        "Premium sound system",
        "Onboard Wi-Fi",
      ],
      ar: [
        "نظام دفع كهربائي بالكامل",
        "مقاعد تنفيذية جلدية",
        "تحكم بدرجة حرارة المقاعد الخلفية",
        "نظام صوت فاخر",
        "شبكة واي فاي على متن السيارة",
      ],
      ru: [
        "Полностью электрический привод",
        "Кожаные представительские сиденья",
        "Климат-контроль задних сидений",
        "Премиальная акустическая система",
        "Wi-Fi в салоне",
      ],
      zh: [
        "纯电动力系统",
        "真皮行政座椅",
        "后排座椅独立温控",
        "高级音响系统",
        "车载WiFi",
      ],
      fr: [
        "Motorisation 100 % électrique",
        "Sièges executive en cuir",
        "Climatisation des sièges arrière",
        "Système audio premium",
        "Wi-Fi embarqué",
      ],
      de: [
        "Rein elektrischer Antrieb",
        "Ledersitze im Executive-Stil",
        "Klimatisierung der Rücksitze",
        "Premium-Soundsystem",
        "WLAN an Bord",
      ],
    },
    whyChoose: {
      en: [
        "Flagship comfort with all-electric efficiency",
        "Smooth, quiet ride for business travel",
        "A modern alternative to traditional executive sedans",
        "Dependable availability for corporate accounts",
      ],
      ar: [
        "راحة على مستوى السيارات الرائدة مع كفاءة كهربائية بالكامل",
        "قيادة سلسة وهادئة للسفر التجاري",
        "بديل عصري للسيارات السيدان التنفيذية التقليدية",
        "توفر موثوق لحسابات الشركات",
      ],
      ru: [
        "Комфорт флагманского уровня с полностью электрической эффективностью",
        "Плавная, тихая поездка для деловых поездок",
        "Современная альтернатива традиционным представительским седанам",
        "Надёжная доступность для корпоративных клиентов",
      ],
      zh: [
        "旗舰级舒适,搭配纯电高效性能",
        "平顺静谧的驾乘,尽享商务出行",
        "传统行政轿车的现代化替代之选",
        "为企业客户提供可靠的车辆调配",
      ],
      fr: [
        "Un confort digne d'un modèle phare avec l'efficacité du tout électrique",
        "Une conduite souple et silencieuse pour les voyages d'affaires",
        "Une alternative moderne aux berlines executive traditionnelles",
        "Une disponibilité fiable pour les comptes d'entreprise",
      ],
      de: [
        "Flaggschiff-Komfort mit vollelektrischer Effizienz",
        "Sanfte, leise Fahrt für Geschäftsreisen",
        "Eine moderne Alternative zu traditionellen Executive-Limousinen",
        "Verlässliche Verfügbarkeit für Firmenkonten",
      ],
    },
    faqs: [
      {
        question: {
          en: "Is the BYD Han a fully electric vehicle?",
          ar: "هل BYD Han سيارة كهربائية بالكامل؟",
          ru: "Является ли BYD Han полностью электрическим автомобилем?",
          zh: "BYD汉是纯电动车型吗?",
          fr: "La BYD Han est-elle un véhicule entièrement électrique ?",
          de: "Ist der BYD Han ein vollelektrisches Fahrzeug?",
        },
        answer: {
          en: "Yes, the Han is a flagship all-electric sedan offering a smooth, quiet ride.",
          ar: "نعم، Han سيارة سيدان رائدة كهربائية بالكامل توفر قيادة سلسة وهادئة.",
          ru: "Да, Han — это флагманский полностью электрический седан, обеспечивающий плавную, тихую езду.",
          zh: "是的,汉是一款旗舰级纯电动轿车,提供平顺静谧的驾乘体验。",
          fr: "Oui, la Han est une berline phare 100 % électrique offrant une conduite souple et silencieuse.",
          de: "Ja, der Han ist eine elektrische Flaggschiff-Limousine mit sanfter, leiser Fahrt.",
        },
      },
      {
        question: {
          en: "Is the BYD Han suitable for airport transfers?",
          ar: "هل تناسب BYD Han رحلات المطار؟",
          ru: "Подходит ли BYD Han для трансферов из аэропорта?",
          zh: "BYD汉是否适合机场接送?",
          fr: "La BYD Han convient-elle aux transferts aéroport ?",
          de: "Ist der BYD Han für Flughafentransfers geeignet?",
        },
        answer: {
          en: "Yes, with the same professional chauffeur standard and live flight tracking as the rest of the fleet.",
          ar: "نعم، بنفس معايير السائق المحترف وتتبع الرحلات المباشر المتوفرة في باقي الأسطول.",
          ru: "Да, с тем же профессиональным стандартом шофёра и отслеживанием рейса в реальном времени, что и у остального парка.",
          zh: "可以,并享有与车队其他车型相同的专业司机标准与航班实时追踪服务。",
          fr: "Oui, avec le même standard de chauffeur professionnel et le même suivi de vol en direct que le reste de la flotte.",
          de: "Ja, mit demselben professionellen Chauffeurstandard und derselben Live-Flugverfolgung wie der Rest der Flotte.",
        },
      },
      {
        question: {
          en: "Can I book the BYD Han for a full business day?",
          ar: "هل يمكنني حجز BYD Han ليوم عمل كامل؟",
          ru: "Могу ли я забронировать BYD Han на весь рабочий день?",
          zh: "可以预订BYD汉用于整个商务日吗?",
          fr: "Puis-je réserver la BYD Han pour une journée d'affaires complète ?",
          de: "Kann ich den BYD Han für einen ganzen Geschäftstag buchen?",
        },
        answer: {
          en: "Yes, hourly and full-day hire are both available on request.",
          ar: "نعم، يتوفر كل من الاستئجار بالساعة وليوم كامل عند الطلب.",
          ru: "Да, доступна как почасовая, так и полнодневная аренда по запросу.",
          zh: "可以,按小时及全天租用均可应要求提供。",
          fr: "Oui, la location à l'heure et à la journée sont toutes deux disponibles sur demande.",
          de: "Ja, sowohl Stunden- als auch Ganztagesmiete sind auf Anfrage verfügbar.",
        },
      },
    ],
    isPlaceholder: true,
  },
];

function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}

export interface PlainVehicleImage {
  src: string;
  alt: string;
}

export interface PlainFleetVehicle {
  slug: string;
  name: string;
  brand: string;
  model: string;
  rates: VehicleRates;
  category: FleetCategory;
  isElectric?: boolean;
  tagline: string;
  description: string;
  longDescription: string;
  passengers: number;
  luggage: number;
  idealFor: string;
  features: string[];
  whyChoose: string[];
  faqs: { question: string; answer: string }[];
  images?: PlainVehicleImage[];
  badge?: string;
  isPlaceholder?: boolean;
}

export function localizeVehicle(vehicle: FleetVehicle, locale: Locale): PlainFleetVehicle {
  return {
    slug: vehicle.slug,
    name: vehicle.name,
    brand: vehicle.brand,
    model: vehicle.model,
    rates: vehicle.rates,
    category: vehicle.category,
    isElectric: vehicle.isElectric,
    tagline: pick(vehicle.tagline, locale),
    description: pick(vehicle.description, locale),
    longDescription: pick(vehicle.longDescription, locale),
    passengers: vehicle.passengers,
    luggage: vehicle.luggage,
    idealFor: pick(vehicle.idealFor, locale),
    features: pick(vehicle.features, locale),
    whyChoose: pick(vehicle.whyChoose, locale),
    faqs: vehicle.faqs.map((faq) => ({
      question: pick(faq.question, locale),
      answer: pick(faq.answer, locale),
    })),
    images: vehicle.images?.map((image) => ({ src: image.src, alt: pick(image.alt, locale) })),
    badge: vehicle.badge ? pick(vehicle.badge, locale) : undefined,
    isPlaceholder: vehicle.isPlaceholder,
  };
}

/**
 * Display order for vehicle listings — most exclusive tier first, down to
 * the most everyday. Used by getAllVehicles() so every page that lists the
 * fleet (full /fleet page, homepage carousel, "similar vehicles", JSON-LD)
 * shows Ultra-Luxury vehicles (Rolls-Royce, Mercedes-Maybach) up top rather
 * than scattered in FLEET's authoring order.
 */
const CATEGORY_DISPLAY_RANK: Record<FleetCategory, number> = {
  "Ultra-Luxury": 0,
  Sedan: 1,
  SUV: 2,
  Van: 3,
};

export function getAllVehicles(locale: Locale): PlainFleetVehicle[] {
  return FLEET.map((vehicle) => localizeVehicle(vehicle, locale)).sort(
    (a, b) => CATEGORY_DISPLAY_RANK[a.category] - CATEGORY_DISPLAY_RANK[b.category]
  );
}

export function getVehicleBySlug(slug: string, locale: Locale): PlainFleetVehicle | undefined {
  const vehicle = FLEET.find((v) => v.slug === slug);
  return vehicle ? localizeVehicle(vehicle, locale) : undefined;
}

/**
 * Fleet category listing pages (/fleet/sedan, /fleet/suv, /fleet/van,
 * /fleet/ultra-luxury, /fleet/electric) — filters of the same FLEET array
 * above, not a separate data source. "electric" filters on `isElectric`
 * rather than `category` since it cuts across body styles (e.g. a Tesla
 * would be both "SUV" and electric); the other four map directly onto an
 * existing `FleetCategory` value.
 */
export type FleetCategorySlug = "sedan" | "suv" | "van" | "ultra-luxury" | "electric";

export const FLEET_CATEGORY_SLUGS: FleetCategorySlug[] = ["sedan", "suv", "van", "ultra-luxury", "electric"];

// Fails the build immediately if a vehicle's slug ever collides with a
// reserved category slug — such a vehicle would be permanently
// unreachable at /fleet/[vehicle], silently shadowed by the category
// listing at that same URL. Runs once at module load (negligible cost,
// FLEET.length is small); never touches a request path.
const reservedSlugCollision = FLEET.find((vehicle) =>
  (FLEET_CATEGORY_SLUGS as string[]).includes(vehicle.slug)
);
if (reservedSlugCollision) {
  throw new Error(
    `Vehicle slug "${reservedSlugCollision.slug}" collides with a reserved fleet category slug ` +
      `(${FLEET_CATEGORY_SLUGS.join(", ")}). Rename this vehicle's slug in data/fleet.ts — as-is, ` +
      `it would be unreachable at /fleet/${reservedSlugCollision.slug}, shadowed by the category page.`
  );
}

const CATEGORY_SLUG_TO_CATEGORY: Record<Exclude<FleetCategorySlug, "electric">, FleetCategory> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  "ultra-luxury": "Ultra-Luxury",
};

export function isFleetCategorySlug(value: string): value is FleetCategorySlug {
  return (FLEET_CATEGORY_SLUGS as string[]).includes(value);
}

export function getVehiclesByCategorySlug(
  categorySlug: FleetCategorySlug,
  locale: Locale
): PlainFleetVehicle[] {
  const vehicles = getAllVehicles(locale);
  if (categorySlug === "electric") {
    return vehicles.filter((vehicle) => vehicle.isElectric);
  }
  return vehicles.filter((vehicle) => vehicle.category === CATEGORY_SLUG_TO_CATEGORY[categorySlug]);
}

export interface FleetCategoryOccasion {
  title: Localized;
  blurb: Localized;
}

export interface FleetCategoryContent {
  whyChoose: Localized<string[]>;
  occasions: FleetCategoryOccasion[];
  faqs: VehicleFAQ[];
}

/**
 * Editorial content for each /fleet/[category] listing page — "Why Choose",
 * "Occasions", and category-level FAQs — distinct from the per-vehicle
 * whyChoose/faqs above (those describe one vehicle; this describes the
 * category as a whole, e.g. "What SUVs are available in your fleet?").
 */
export const FLEET_CATEGORY_CONTENT: Record<FleetCategorySlug, FleetCategoryContent> = {
  sedan: {
    whyChoose: {
      en: [
        "Refined, late-model interiors for a smooth, quiet ride",
        "Professional, uniformed chauffeurs on every booking",
        "Flexible hourly, half-day, and airport-transfer packages",
        "Trusted for business travel, meetings, and corporate arrivals",
      ],
      ar: [
        "تصميم داخلي أنيق وطراز حديث لرحلة سلسة وهادئة",
        "سائقون محترفون بزي رسمي في كل حجز",
        "باقات مرنة بالساعة ونصف اليوم ونقل المطار",
        "موثوقة للسفر التجاري والاجتماعات والوصولات الرسمية",
      ],
      ru: [
        "Изысканный салон последней модели для плавной, тихой поездки",
        "Профессиональные водители в форме при каждом бронировании",
        "Гибкие пакеты — почасовые, на полдня и трансфер из аэропорта",
        "Надёжный выбор для деловых поездок, встреч и представительских прибытий",
      ],
      zh: [
        "精致的新款车型内饰,带来平顺静谧的乘坐体验",
        "每次预订均配备身着制服的专业司机",
        "灵活的按小时、半天及机场接送套餐",
        "深受信赖,适用于商务出行、会议及企业接待",
      ],
      fr: [
        "Un intérieur raffiné et récent pour un trajet fluide et silencieux",
        "Un chauffeur professionnel en tenue à chaque réservation",
        "Des forfaits flexibles à l'heure, à la demi-journée et pour l'aéroport",
        "Une valeur sûre pour les voyages d'affaires, réunions et arrivées d'entreprise",
      ],
      de: [
        "Elegantes, aktuelles Interieur für eine ruhige, komfortable Fahrt",
        "Professionelle, uniformierte Chauffeure bei jeder Buchung",
        "Flexible Stunden-, Halbtags- und Flughafentransfer-Pakete",
        "Bewährt für Geschäftsreisen, Meetings und geschäftliche Ankünfte",
      ],
    },
    occasions: [
      {
        title: {
          en: "Business & Corporate Travel",
          ar: "السفر التجاري والشركات",
          ru: "Деловые и корпоративные поездки",
          zh: "商务与企业出行",
          fr: "Voyages d'affaires et entreprise",
          de: "Geschäftsreisen & Unternehmen",
        },
        blurb: {
          en: "Client pickups, roadshows, and back-to-back meetings with a chauffeur on standby.",
          ar: "استقبال العملاء والجولات الترويجية والاجتماعات المتتالية مع سائق جاهز للانتظار.",
          ru: "Встречи клиентов, road-show и последовательные встречи с водителем в режиме готовности.",
          zh: "客户接送、路演及连续会议,配备随时待命的司机。",
          fr: "Prise en charge de clients, roadshows et réunions enchaînées avec un chauffeur en attente.",
          de: "Kundenabholungen, Roadshows und aufeinanderfolgende Meetings mit einem Chauffeur in Bereitschaft.",
        },
      },
      {
        title: {
          en: "Airport Transfers",
          ar: "نقل المطار",
          ru: "Трансфер из аэропорта",
          zh: "机场接送",
          fr: "Transferts aéroport",
          de: "Flughafentransfers",
        },
        blurb: {
          en: "Flight tracking and meet-and-greet as standard, so pickup adjusts to your landing time.",
          ar: "تتبع الرحلات والاستقبال الشخصي كمعيار أساسي، بحيث يتكيف الاستلام مع وقت هبوط طائرتكم.",
          ru: "Отслеживание рейса и персональная встреча как стандарт — время подачи подстраивается под ваш прилёт.",
          zh: "标配航班追踪与专人接机服务,接机时间根据您的降落时间灵活调整。",
          fr: "Suivi de vol et accueil personnalisé en standard, la prise en charge s'ajuste à votre heure d'atterrissage.",
          de: "Flugverfolgung und persönlicher Empfang als Standard — die Abholung passt sich Ihrer Landezeit an.",
        },
      },
      {
        title: {
          en: "City & Leisure Rides",
          ar: "التنقل داخل المدينة والترفيه",
          ru: "Городские и досуговые поездки",
          zh: "市内与休闲出行",
          fr: "Trajets urbains et loisirs",
          de: "Stadt- und Freizeitfahrten",
        },
        blurb: {
          en: "Refined point-to-point travel across Dubai for dinners, shopping, and appointments.",
          ar: "تنقل راقٍ من نقطة إلى أخرى في أنحاء دبي لتناول العشاء والتسوق والمواعيد.",
          ru: "Элегантные поездки по Дубаю от точки до точки — ужины, шопинг и встречи.",
          zh: "在迪拜市内进行优雅的点对点出行,适用于晚餐、购物及各类约会。",
          fr: "Des trajets raffinés point à point dans tout Dubaï pour dîners, shopping et rendez-vous.",
          de: "Stilvolle Punkt-zu-Punkt-Fahrten durch Dubai für Abendessen, Einkäufe und Termine.",
        },
      },
      {
        title: {
          en: "Special Occasions",
          ar: "المناسبات الخاصة",
          ru: "Особые случаи",
          zh: "特殊场合",
          fr: "Occasions spéciales",
          de: "Besondere Anlässe",
        },
        blurb: {
          en: "A polished, understated presence for anniversaries, proposals, and celebrations.",
          ar: "حضور أنيق وغير مبالغ فيه للذكرى السنوية وطلبات الزواج والاحتفالات.",
          ru: "Сдержанный, элегантный образ для годовщин, предложений руки и сердца и торжеств.",
          zh: "低调而优雅的气场,适用于周年纪念、求婚及各类庆典。",
          fr: "Une présence élégante et discrète pour anniversaires, demandes en mariage et célébrations.",
          de: "Ein dezenter, eleganter Auftritt für Jubiläen, Heiratsanträge und Feiern.",
        },
      },
    ],
    faqs: [
      {
        question: {
          en: "What sedans are available in your fleet?",
          ar: "ما سيارات السيدان المتوفرة في أسطولكم؟",
          ru: "Какие седаны есть в вашем автопарке?",
          zh: "贵车队提供哪些轿车车型?",
          fr: "Quelles berlines sont disponibles dans votre flotte ?",
          de: "Welche Limousinen sind in Ihrer Flotte verfügbar?",
        },
        answer: {
          en: "Our sedan lineup includes the Mercedes-Benz S-Class and other executive models, each with a professional chauffeur, premium leather interior, and flexible hourly or point-to-point rates.",
          ar: "تشمل تشكيلة السيدان لدينا مرسيدس S-Class وطرازات تنفيذية أخرى، وكل منها مزودة بسائق محترف ومقصورة جلدية فاخرة وأسعار مرنة بالساعة أو من نقطة إلى أخرى.",
          ru: "В нашу линейку седанов входит Mercedes S-Class и другие представительские модели, каждая — с профессиональным водителем, premium кожаным салоном и гибкими почасовыми или точечными тарифами.",
          zh: "我们的轿车阵容包括梅赛德斯S级及其他行政级车型,均配备专业司机、高级真皮内饰,并提供灵活的按小时或点对点收费方式。",
          fr: "Notre gamme de berlines comprend la Mercedes Classe S et d'autres modèles executive, chacune avec un chauffeur professionnel, un intérieur en cuir premium et des tarifs flexibles à l'heure ou point à point.",
          de: "Unser Limousinen-Angebot umfasst die Mercedes S-Klasse und weitere Executive-Modelle, jeweils mit professionellem Chauffeur, hochwertigem Lederinterieur und flexiblen Stunden- oder Punkt-zu-Punkt-Tarifen.",
        },
      },
      {
        question: {
          en: "How many passengers can a sedan accommodate?",
          ar: "كم عدد الركاب الذين يمكن أن تستوعبهم سيارة السيدان؟",
          ru: "Сколько пассажиров вмещает седан?",
          zh: "一辆轿车可容纳多少乘客?",
          fr: "Combien de passagers une berline peut-elle accueillir ?",
          de: "Wie viele Passagiere fasst eine Limousine?",
        },
        answer: {
          en: "Our sedans comfortably seat up to 3 passengers with luggage space for 2 bags, ideal for individual travelers, couples, or small business groups.",
          ar: "تتسع سياراتنا السيدان بشكل مريح لـ3 ركاب مع مساحة أمتعة لحقيبتين، وهي مثالية للمسافرين الأفراد أو الأزواج أو مجموعات العمل الصغيرة.",
          ru: "Наши седаны комфортно вмещают до 3 пассажиров с местом для 2 сумок багажа — идеально для отдельных путешественников, пар или небольших бизнес-групп.",
          zh: "我们的轿车可舒适容纳最多3位乘客,并可存放2件行李,非常适合单人出行、情侣或小型商务团体。",
          fr: "Nos berlines accueillent confortablement jusqu'à 3 passagers avec de la place pour 2 bagages, idéales pour les voyageurs individuels, les couples ou les petits groupes professionnels.",
          de: "Unsere Limousinen bieten komfortabel Platz für bis zu 3 Passagiere mit Gepäckraum für 2 Taschen — ideal für Einzelreisende, Paare oder kleine Geschäftsgruppen.",
        },
      },
      {
        question: {
          en: "When should I choose a sedan over an SUV?",
          ar: "متى يجب أن أختار سيارة سيدان بدلاً من سيارة رياضية متعددة الاستخدامات؟",
          ru: "Когда стоит выбрать седан вместо внедорожника?",
          zh: "何时应选择轿车而非SUV?",
          fr: "Quand choisir une berline plutôt qu'un SUV ?",
          de: "Wann sollte ich eine Limousine statt eines SUV wählen?",
        },
        answer: {
          en: "Sedans suit airport transfers, business travel, and city rides for up to 3 passengers who want a quieter, more refined ride. Choose an SUV for larger groups or extra luggage.",
          ar: "تناسب سيارات السيدان رحلات المطار والسفر التجاري والتنقل داخل المدينة لما يصل إلى 3 ركاب يرغبون في رحلة أكثر هدوءًا ورقيًا. اختاروا سيارة رياضية متعددة الاستخدامات للمجموعات الأكبر أو الأمتعة الإضافية.",
          ru: "Седаны подходят для трансферов из аэропорта, деловых поездок и городских поездок для до 3 пассажиров, которые хотят более тихую и элегантную поездку. Для больших групп или дополнительного багажа выбирайте внедорожник.",
          zh: "轿车适合机场接送、商务出行及市内出行,适用于最多3位追求更安静、更精致乘坐体验的乘客。若人数较多或行李较多,请选择SUV。",
          fr: "Les berlines conviennent aux transferts aéroport, voyages d'affaires et trajets urbains pour jusqu'à 3 passagers recherchant un trajet plus silencieux et raffiné. Optez pour un SUV pour des groupes plus grands ou plus de bagages.",
          de: "Limousinen eignen sich für Flughafentransfers, Geschäftsreisen und Stadtfahrten für bis zu 3 Passagiere, die eine ruhigere, elegantere Fahrt wünschen. Für größere Gruppen oder mehr Gepäck wählen Sie einen SUV.",
        },
      },
      {
        question: {
          en: "Can a sedan be booked for multiple stops?",
          ar: "هل يمكن حجز سيارة سيدان لعدة توقفات؟",
          ru: "Можно ли забронировать седан для нескольких остановок?",
          zh: "轿车可以预订多个停靠点吗?",
          fr: "Une berline peut-elle être réservée pour plusieurs arrêts ?",
          de: "Kann eine Limousine für mehrere Stopps gebucht werden?",
        },
        answer: {
          en: "Yes — sedans can be booked hourly or for half/full-day hire with multiple stops included, ideal for meetings across the city or a day of appointments.",
          ar: "نعم — يمكن حجز سيارات السيدان بالساعة أو لنصف يوم أو يوم كامل مع عدة توقفات مشمولة، وهي مثالية للاجتماعات في أنحاء المدينة أو يوم حافل بالمواعيد.",
          ru: "Да — седаны можно забронировать почасово или на полдня/полный день с несколькими остановками, что идеально для встреч по всему городу или насыщенного дня с делами.",
          zh: "可以——轿车可按小时或半天/全天预订,并可包含多个停靠点,非常适合在市内往返多场会议或安排满满一天的行程。",
          fr: "Oui — les berlines peuvent être réservées à l'heure ou à la demi/journée complète avec plusieurs arrêts inclus, idéal pour des réunions à travers la ville ou une journée chargée en rendez-vous.",
          de: "Ja — Limousinen können stundenweise oder für eine Halbtags-/Ganztagesmiete mit mehreren Stopps gebucht werden, ideal für Meetings quer durch die Stadt oder einen Tag voller Termine.",
        },
      },
    ],
  },
  suv: {
    whyChoose: {
      en: [
        "Spacious, elevated interiors with generous luggage space",
        "Professional chauffeurs for every family or group transfer",
        "Flexible rental options — hourly, half-day, or airport transfer",
        "A commanding presence on Dubai's roads without compromising comfort",
      ],
      ar: [
        "مقصورة فسيحة ومرتفعة مع مساحة واسعة للأمتعة",
        "سائقون محترفون لكل نقل عائلي أو جماعي",
        "خيارات استئجار مرنة — بالساعة أو نصف اليوم أو نقل المطار",
        "حضور مهيب على طرقات دبي دون التضحية بالراحة",
      ],
      ru: [
        "Просторный, высокий салон с щедрым багажным отделением",
        "Профессиональные водители для каждой семейной или групповой поездки",
        "Гибкие варианты аренды — почасово, на полдня или трансфер из аэропорта",
        "Уверенное присутствие на дорогах Дубая без ущерба комфорту",
      ],
      zh: [
        "宽敞挑高的座舱,配备充裕的行李空间",
        "每次家庭或团体接送均配备专业司机",
        "灵活的租用方式——按小时、半天或机场接送",
        "在迪拜街头彰显气场,同时不失舒适",
      ],
      fr: [
        "Intérieur spacieux et surélevé avec un généreux espace bagages",
        "Chauffeur professionnel pour chaque transfert familial ou de groupe",
        "Options de location flexibles — à l'heure, à la demi-journée ou transfert aéroport",
        "Une présence imposante sur les routes de Dubaï sans sacrifier le confort",
      ],
      de: [
        "Geräumiges, erhöhtes Interieur mit großzügigem Gepäckraum",
        "Professionelle Chauffeure für jeden Familien- oder Gruppentransfer",
        "Flexible Mietoptionen — stundenweise, halbtags oder Flughafentransfer",
        "Souveräne Präsenz auf Dubais Straßen ohne Komfortverlust",
      ],
    },
    occasions: [
      {
        title: {
          en: "Family & Group Travel",
          ar: "سفر العائلة والمجموعات",
          ru: "Семейные и групповые поездки",
          zh: "家庭与团体出行",
          fr: "Voyages en famille et en groupe",
          de: "Familien- und Gruppenreisen",
        },
        blurb: {
          en: "Room for passengers and luggage on family trips or reunions.",
          ar: "مساحة للركاب والأمتعة في رحلات العائلة أو لقاءات الشمل.",
          ru: "Достаточно места для пассажиров и багажа в семейных поездках или на встречах.",
          zh: "为家庭旅行或团聚活动提供充裕的乘客与行李空间。",
          fr: "De la place pour les passagers et les bagages lors de voyages en famille ou de retrouvailles.",
          de: "Platz für Passagiere und Gepäck bei Familienausflügen oder Wiedersehensfeiern.",
        },
      },
      {
        title: {
          en: "Airport Transfers",
          ar: "نقل المطار",
          ru: "Трансфер из аэропорта",
          zh: "机场接送",
          fr: "Transferts aéroport",
          de: "Flughafentransfers",
        },
        blurb: {
          en: "Hassle-free pickups with luggage space for the whole group.",
          ar: "استلام سلس مع مساحة أمتعة تكفي المجموعة بأكملها.",
          ru: "Беспроблемная встреча с местом для багажа всей группы.",
          zh: "轻松接机,并为整个团队提供充裕的行李空间。",
          fr: "Prise en charge sans tracas avec de l'espace bagages pour tout le groupe.",
          de: "Unkomplizierte Abholung mit Gepäckraum für die ganze Gruppe.",
        },
      },
      {
        title: {
          en: "Corporate & Executive Travel",
          ar: "السفر التنفيذي والشركات",
          ru: "Деловые и представительские поездки",
          zh: "商务与行政出行",
          fr: "Voyages d'entreprise et executive",
          de: "Geschäftsreisen & Executive",
        },
        blurb: {
          en: "Impress clients with comfortable, professional group transport.",
          ar: "أبهروا عملاءكم بنقل جماعي مريح ومحترف.",
          ru: "Впечатлите клиентов комфортным профессиональным групповым транспортом.",
          zh: "以舒适专业的团体用车给客户留下深刻印象。",
          fr: "Impressionnez vos clients avec un transport de groupe confortable et professionnel.",
          de: "Beeindrucken Sie Kunden mit komfortablem, professionellem Gruppentransport.",
        },
      },
      {
        title: {
          en: "Event & VIP Transport",
          ar: "الفعاليات ونقل كبار الشخصيات",
          ru: "Мероприятия и VIP-транспорт",
          zh: "活动与贵宾用车",
          fr: "Événements et transport VIP",
          de: "Veranstaltungen & VIP-Transport",
        },
        blurb: {
          en: "Arrive together in comfort for weddings, galas, and private events.",
          ar: "صلوا معًا براحة إلى حفلات الزفاف والحفلات الخاصة والمناسبات.",
          ru: "Приезжайте вместе с комфортом на свадьбы, гала-вечера и частные мероприятия.",
          zh: "舒适地共同抵达婚礼、晚宴及私人活动现场。",
          fr: "Arrivez ensemble dans le confort pour mariages, galas et événements privés.",
          de: "Kommen Sie gemeinsam komfortabel zu Hochzeiten, Galas und privaten Events.",
        },
      },
    ],
    faqs: [
      {
        question: {
          en: "What SUVs are available in your fleet?",
          ar: "ما السيارات الرياضية متعددة الاستخدامات المتوفرة في أسطولكم؟",
          ru: "Какие внедорожники есть в вашем автопарке?",
          zh: "贵车队提供哪些SUV车型?",
          fr: "Quels SUV sont disponibles dans votre flotte ?",
          de: "Welche SUVs sind in Ihrer Flotte verfügbar?",
        },
        answer: {
          en: "Our SUV fleet features spacious, late-model vehicles with professional chauffeurs, generous luggage capacity, and flexible hourly or transfer packages.",
          ar: "يضم أسطول السيارات الرياضية متعددة الاستخدامات لدينا مركبات فسيحة بأحدث الطرازات مع سائقين محترفين وسعة أمتعة واسعة وباقات مرنة بالساعة أو للنقل.",
          ru: "Наш парк внедорожников включает просторные автомобили последних моделей с профессиональными водителями, щедрой вместимостью багажа и гибкими почасовыми или трансферными пакетами.",
          zh: "我们的SUV车队配备宽敞的新款车型,均配有专业司机、充裕的行李容量,以及灵活的按小时或接送套餐。",
          fr: "Notre flotte de SUV comprend des véhicules spacieux et récents avec chauffeurs professionnels, une généreuse capacité de bagages et des forfaits flexibles à l'heure ou pour transfert.",
          de: "Unsere SUV-Flotte umfasst geräumige, aktuelle Fahrzeuge mit professionellen Chauffeuren, großzügigem Gepäckraum und flexiblen Stunden- oder Transferpaketen.",
        },
      },
      {
        question: {
          en: "How many passengers can an SUV accommodate?",
          ar: "كم عدد الركاب الذين يمكن أن تستوعبهم السيارة الرياضية متعددة الاستخدامات؟",
          ru: "Сколько пассажиров вмещает внедорожник?",
          zh: "一辆SUV可容纳多少乘客?",
          fr: "Combien de passagers un SUV peut-il accueillir ?",
          de: "Wie viele Passagiere fasst ein SUV?",
        },
        answer: {
          en: "Most SUVs in our fleet seat up to 6 passengers comfortably, with ample space for luggage — ideal for families or small groups.",
          ar: "تتسع معظم سياراتنا الرياضية متعددة الاستخدامات بشكل مريح لـ6 ركاب، مع مساحة واسعة للأمتعة — مثالية للعائلات أو المجموعات الصغيرة.",
          ru: "Большинство наших внедорожников комфортно вмещают до 6 пассажиров с достаточным местом для багажа — идеально для семей или небольших групп.",
          zh: "我们大多数SUV可舒适容纳最多6位乘客,并配有充裕的行李空间——非常适合家庭或小型团体。",
          fr: "La plupart de nos SUV accueillent confortablement jusqu'à 6 passagers, avec beaucoup d'espace pour les bagages — idéal pour les familles ou petits groupes.",
          de: "Die meisten unserer SUVs bieten komfortabel Platz für bis zu 6 Passagiere mit reichlich Gepäckraum — ideal für Familien oder kleine Gruppen.",
        },
      },
      {
        question: {
          en: "Are SUVs suitable for longer journeys?",
          ar: "هل السيارات الرياضية متعددة الاستخدامات مناسبة للرحلات الطويلة؟",
          ru: "Подходят ли внедорожники для дальних поездок?",
          zh: "SUV适合长途旅行吗?",
          fr: "Les SUV conviennent-ils aux longs trajets ?",
          de: "Sind SUVs für längere Fahrten geeignet?",
        },
        answer: {
          en: "Yes — SUVs are a comfortable choice for longer trips, offering more legroom, luggage space, and climate comfort than a sedan.",
          ar: "نعم — تُعد السيارات الرياضية متعددة الاستخدامات خيارًا مريحًا للرحلات الطويلة، إذ توفر مساحة أرجل أكبر ومساحة أمتعة وراحة مناخية أكثر من السيدان.",
          ru: "Да — внедорожники являются комфортным выбором для дальних поездок, предлагая больше места для ног, багажа и климатического комфорта, чем седан.",
          zh: "是的——SUV是长途旅行的舒适之选,相比轿车提供更多腿部空间、行李空间及空调舒适度。",
          fr: "Oui — les SUV sont un choix confortable pour les longs trajets, offrant plus d'espace pour les jambes, de bagages et de confort climatique qu'une berline.",
          de: "Ja — SUVs sind eine komfortable Wahl für längere Fahrten und bieten mehr Beinfreiheit, Gepäckraum und Klimakomfort als eine Limousine.",
        },
      },
      {
        question: {
          en: "Can SUVs be used for multiple stops or day tours?",
          ar: "هل يمكن استخدام السيارات الرياضية متعددة الاستخدامات لعدة توقفات أو جولات يومية؟",
          ru: "Можно ли использовать внедорожники для нескольких остановок или экскурсий?",
          zh: "SUV可用于多个停靠点或一日游吗?",
          fr: "Les SUV peuvent-ils être utilisés pour plusieurs arrêts ou circuits journaliers ?",
          de: "Können SUVs für mehrere Stopps oder Tagestouren genutzt werden?",
        },
        answer: {
          en: "Yes — SUVs can be booked hourly, half-day, or full-day with multiple stops, well suited to shopping trips, city tours, or day excursions.",
          ar: "نعم — يمكن حجز السيارات الرياضية متعددة الاستخدامات بالساعة أو لنصف يوم أو يوم كامل مع عدة توقفات، وهي مناسبة تمامًا لرحلات التسوق أو جولات المدينة أو الرحلات اليومية.",
          ru: "Да — внедорожники можно забронировать почасово, на полдня или полный день с несколькими остановками, что отлично подходит для шопинга, экскурсий по городу или однодневных поездок.",
          zh: "可以——SUV可按小时、半天或全天预订,并可包含多个停靠点,非常适合购物行程、城市游览或一日游。",
          fr: "Oui — les SUV peuvent être réservés à l'heure, à la demi-journée ou à la journée avec plusieurs arrêts, parfaitement adaptés au shopping, aux visites de la ville ou aux excursions journalières.",
          de: "Ja — SUVs können stundenweise, halbtags oder ganztags mit mehreren Stopps gebucht werden, ideal für Einkaufstouren, Stadtrundfahrten oder Tagesausflüge.",
        },
      },
    ],
  },
  van: {
    whyChoose: {
      en: [
        "Spacious, luxury interiors with generous seating and legroom",
        "Professional chauffeurs for every journey, no exceptions",
        "Flexible rental options — hourly, half-day, full-day, or point-to-point",
        "VIP treatment and attentive service, no matter the occasion",
      ],
      ar: [
        "مقصورة فاخرة وواسعة مع مساحة سعة للجلوس والأرجل",
        "سائقون محترفون في كل رحلة، دون استثناء",
        "خيارات استئجار مرنة — بالساعة أو نصف اليوم أو اليوم الكامل أو من نقطة إلى أخرى",
        "معاملة كبار الشخصيات وخدمة متميزة أيًا كانت المناسبة",
      ],
      ru: [
        "Просторный роскошный салон с щедрой посадкой и местом для ног",
        "Профессиональные водители в каждой поездке без исключений",
        "Гибкие варианты аренды — почасово, на полдня, полный день или точка-точка",
        "VIP-обслуживание и внимательный сервис независимо от повода",
      ],
      zh: [
        "宽敞豪华的内饰,座位与腿部空间充裕",
        "每一趟行程均配备专业司机,绝无例外",
        "灵活的租用方式——按小时、半天、全天或点对点",
        "无论何种场合,均提供贵宾级礼遇与周到服务",
      ],
      fr: [
        "Intérieur spacieux et luxueux avec une généreuse assise et de l'espace pour les jambes",
        "Chauffeur professionnel à chaque trajet, sans exception",
        "Options de location flexibles — à l'heure, à la demi-journée, à la journée ou point à point",
        "Un traitement VIP et un service attentionné, quelle que soit l'occasion",
      ],
      de: [
        "Geräumiges, luxuriöses Interieur mit großzügiger Bestuhlung und Beinfreiheit",
        "Professioneller Chauffeur bei jeder Fahrt, ohne Ausnahme",
        "Flexible Mietoptionen — stundenweise, halbtags, ganztags oder punktuell",
        "VIP-Behandlung und aufmerksamer Service, ganz gleich zu welchem Anlass",
      ],
    },
    occasions: [
      {
        title: {
          en: "Business & Corporate Travel",
          ar: "السفر التجاري والشركات",
          ru: "Деловые и корпоративные поездки",
          zh: "商务与企业出行",
          fr: "Voyages d'affaires et entreprise",
          de: "Geschäftsreisen & Unternehmen",
        },
        blurb: {
          en: "Impress clients and colleagues with comfortable, professional group transport.",
          ar: "أبهروا العملاء والزملاء بنقل جماعي مريح ومحترف.",
          ru: "Впечатлите клиентов и коллег комфортным профессиональным групповым транспортом.",
          zh: "以舒适专业的团体用车给客户与同事留下深刻印象。",
          fr: "Impressionnez clients et collègues avec un transport de groupe confortable et professionnel.",
          de: "Beeindrucken Sie Kunden und Kollegen mit komfortablem, professionellem Gruppentransport.",
        },
      },
      {
        title: {
          en: "Family & Group Transport",
          ar: "نقل العائلة والمجموعات",
          ru: "Семейный и групповой транспорт",
          zh: "家庭与团体出行",
          fr: "Transport familial et de groupe",
          de: "Familien- und Gruppentransport",
        },
        blurb: {
          en: "Perfect for families or small groups traveling together in comfort.",
          ar: "مثالية للعائلات أو المجموعات الصغيرة التي تسافر معًا براحة.",
          ru: "Идеально для семей или небольших групп, путешествующих вместе с комфортом.",
          zh: "非常适合家庭或小型团体舒适地结伴出行。",
          fr: "Parfait pour les familles ou petits groupes voyageant ensemble dans le confort.",
          de: "Perfekt für Familien oder kleine Gruppen, die gemeinsam komfortabel reisen.",
        },
      },
      {
        title: {
          en: "Airport Transfers",
          ar: "نقل المطار",
          ru: "Трансфер из аэропорта",
          zh: "机场接送",
          fr: "Transferts aéroport",
          de: "Flughafentransfers",
        },
        blurb: {
          en: "Hassle-free pickups and drop-offs, with luggage space for everyone.",
          ar: "استلام وإيصال سلس، مع مساحة أمتعة تكفي الجميع.",
          ru: "Беспроблемная встреча и высадка, с местом для багажа каждого.",
          zh: "轻松接送,为每位乘客提供充裕的行李空间。",
          fr: "Prise en charge et dépose sans tracas, avec de l'espace bagages pour tous.",
          de: "Unkomplizierte Abholung und Ablieferung, mit Gepäckraum für alle.",
        },
      },
      {
        title: {
          en: "Event & VIP Transport",
          ar: "الفعاليات ونقل كبار الشخصيات",
          ru: "Мероприятия и VIP-транспорт",
          zh: "活动与贵宾用车",
          fr: "Événements et transport VIP",
          de: "Veranstaltungen & VIP-Transport",
        },
        blurb: {
          en: "Arrive in style at weddings, corporate events, and celebrations.",
          ar: "صلوا بأناقة إلى حفلات الزفاف وفعاليات الشركات والاحتفالات.",
          ru: "Прибывайте со стилем на свадьбы, корпоративные мероприятия и торжества.",
          zh: "以优雅姿态抵达婚礼、企业活动及庆典现场。",
          fr: "Arrivez avec style aux mariages, événements d'entreprise et célébrations.",
          de: "Kommen Sie stilvoll zu Hochzeiten, Firmenevents und Feiern an.",
        },
      },
    ],
    faqs: [
      {
        question: {
          en: "What vans are available in your fleet?",
          ar: "ما سيارات الفان المتوفرة في أسطولكم؟",
          ru: "Какие минивэны есть в вашем автопарке?",
          zh: "贵车队提供哪些商务车车型?",
          fr: "Quels vans sont disponibles dans votre flotte ?",
          de: "Welche Vans sind in Ihrer Flotte verfügbar?",
        },
        answer: {
          en: "We offer premium vans such as the Mercedes-Benz V-Class and VIP Sprinter, each with a professional chauffeur, generous luggage space, and flexible hourly or transfer packages.",
          ar: "نقدم فانات فاخرة مثل مرسيدس V-Class وفان VIP سبرينتر، وكل منها مزودة بسائق محترف ومساحة أمتعة واسعة وباقات مرنة بالساعة أو للنقل.",
          ru: "Мы предлагаем премиальные минивэны, такие как Mercedes V-Class и VIP Sprinter, каждый — с профессиональным водителем, щедрым багажным пространством и гибкими почасовыми или трансферными пакетами.",
          zh: "我们提供高级商务车,如梅赛德斯V-Class及VIP版斯宾特,均配备专业司机、充裕的行李空间,以及灵活的按小时或接送套餐。",
          fr: "Nous proposons des vans premium tels que la Mercedes Classe V et le VIP Sprinter, chacun avec un chauffeur professionnel, un généreux espace bagages et des forfaits flexibles à l'heure ou pour transfert.",
          de: "Wir bieten Premium-Vans wie die Mercedes V-Klasse und den VIP Sprinter, jeweils mit professionellem Chauffeur, großzügigem Gepäckraum und flexiblen Stunden- oder Transferpaketen.",
        },
      },
      {
        question: {
          en: "How many people can a van accommodate?",
          ar: "كم عدد الأشخاص الذين يمكن أن تستوعبهم سيارة الفان؟",
          ru: "Сколько человек вмещает минивэн?",
          zh: "一辆商务车可容纳多少人?",
          fr: "Combien de personnes un van peut-il accueillir ?",
          de: "Wie viele Personen fasst ein Van?",
        },
        answer: {
          en: "Our vans comfortably seat up to 7 passengers with room for luggage, making them ideal for families, groups, and corporate travel.",
          ar: "تتسع فاناتنا بشكل مريح لـ7 ركاب مع مساحة للأمتعة، مما يجعلها مثالية للعائلات والمجموعات والسفر التجاري.",
          ru: "Наши минивэны комфортно вмещают до 7 пассажиров с местом для багажа, что делает их идеальными для семей, групп и деловых поездок.",
          zh: "我们的商务车可舒适容纳最多7位乘客,并配有行李空间,非常适合家庭、团体及商务出行。",
          fr: "Nos vans accueillent confortablement jusqu'à 7 passagers avec de la place pour les bagages, les rendant idéaux pour les familles, les groupes et les voyages d'affaires.",
          de: "Unsere Vans bieten komfortabel Platz für bis zu 7 Passagiere mit Gepäckraum und eignen sich damit ideal für Familien, Gruppen und Geschäftsreisen.",
        },
      },
      {
        question: {
          en: "When should I choose a van over other vehicles?",
          ar: "متى يجب أن أختار الفان بدلاً من المركبات الأخرى؟",
          ru: "Когда стоит выбрать минивэн вместо других автомобилей?",
          zh: "何时应选择商务车而非其他车型?",
          fr: "Quand choisir un van plutôt qu'un autre véhicule ?",
          de: "Wann sollte ich einen Van statt eines anderen Fahrzeugs wählen?",
        },
        answer: {
          en: "Vans are the best choice for larger groups traveling together, whether for airport transfers, corporate outings, or family trips, without needing to split into multiple cars.",
          ar: "الفان هو الخيار الأفضل للمجموعات الأكبر التي تسافر معًا، سواء لرحلات المطار أو الرحلات الترفيهية للشركات أو رحلات العائلة، دون الحاجة إلى تقسيم الركاب على عدة سيارات.",
          ru: "Минивэн — лучший выбор для больших групп, путешествующих вместе, будь то трансфер из аэропорта, корпоративные мероприятия или семейные поездки, без необходимости делиться на несколько машин.",
          zh: "商务车是较大团体结伴出行的最佳选择,无论是机场接送、企业活动还是家庭旅行,都无需分乘多辆车。",
          fr: "Le van est le meilleur choix pour les grands groupes voyageant ensemble, que ce soit pour des transferts aéroport, des sorties d'entreprise ou des voyages en famille, sans avoir à se répartir dans plusieurs véhicules.",
          de: "Ein Van ist die beste Wahl für größere Gruppen, die gemeinsam reisen — ob für Flughafentransfers, Firmenausflüge oder Familienreisen — ohne sich auf mehrere Fahrzeuge aufteilen zu müssen.",
        },
      },
      {
        question: {
          en: "Can vans be booked for multiple stops?",
          ar: "هل يمكن حجز الفان لعدة توقفات؟",
          ru: "Можно ли забронировать минивэн для нескольких остановок?",
          zh: "商务车可以预订多个停靠点吗?",
          fr: "Un van peut-il être réservé pour plusieurs arrêts ?",
          de: "Kann ein Van für mehrere Stopps gebucht werden?",
        },
        answer: {
          en: "Yes — our vans can be booked hourly or for full/half-day hire with multiple stops included, ideal for city tours, shopping trips, or event logistics.",
          ar: "نعم — يمكن حجز فاناتنا بالساعة أو لاستئجار نصف يوم أو يوم كامل مع عدة توقفات مشمولة، وهي مثالية لجولات المدينة أو رحلات التسوق أو تنظيم الفعاليات.",
          ru: "Да — наши минивэны можно забронировать почасово или на полный/полдня с несколькими остановками, что идеально для экскурсий по городу, шопинга или логистики мероприятий.",
          zh: "可以——我们的商务车可按小时或全天/半天预订,并可包含多个停靠点,非常适合城市游览、购物行程或活动接送安排。",
          fr: "Oui — nos vans peuvent être réservés à l'heure ou pour une location à la journée/demi-journée avec plusieurs arrêts inclus, idéal pour les visites de la ville, le shopping ou la logistique d'événements.",
          de: "Ja — unsere Vans können stundenweise oder für eine Ganztags-/Halbtagesmiete mit mehreren Stopps gebucht werden, ideal für Stadtrundfahrten, Einkaufstouren oder Veranstaltungslogistik.",
        },
      },
    ],
  },
  "ultra-luxury": {
    whyChoose: {
      en: [
        "The most exclusive vehicles in our fleet — Rolls-Royce and Mercedes-Maybach",
        "White-glove chauffeur service with bespoke amenities on every trip",
        "Reserved for weddings, milestone occasions, and VIP arrivals",
        "Uncompromising attention to every detail, from welcome to arrival",
      ],
      ar: [
        "أكثر المركبات تميزًا في أسطولنا — رولز رويس ومرسيدس مايباخ",
        "خدمة سائق راقية بمعايير رفيعة مع وسائل راحة مخصصة في كل رحلة",
        "مخصصة لحفلات الزفاف والمناسبات المميزة ووصولات كبار الشخصيات",
        "اهتمام لا يقبل المساومة بكل تفصيل، من الترحيب وحتى الوصول",
      ],
      ru: [
        "Самые эксклюзивные автомобили в нашем автопарке — Rolls-Royce и Mercedes-Maybach",
        "Безупречный сервис шофёра с индивидуальными удобствами в каждой поездке",
        "Зарезервированы для свадеб, знаковых событий и VIP-прибытий",
        "Безкомпромиссное внимание к каждой детали — от встречи до прибытия",
      ],
      zh: [
        "车队中最尊贵的车型——劳斯莱斯与梅赛德斯迈巴赫",
        "每趟行程均提供白手套级司机服务及定制礼遇",
        "专为婚礼、重要庆典及贵宾抵达而设",
        "从迎宾到抵达,对每个细节都精益求精",
      ],
      fr: [
        "Les véhicules les plus exclusifs de notre flotte — Rolls-Royce et Mercedes-Maybach",
        "Un service chauffeur d'exception avec des attentions sur mesure à chaque trajet",
        "Réservés aux mariages, occasions marquantes et arrivées VIP",
        "Une attention sans compromis à chaque détail, de l'accueil à l'arrivée",
      ],
      de: [
        "Die exklusivsten Fahrzeuge unserer Flotte — Rolls-Royce und Mercedes-Maybach",
        "Erstklassiger Chauffeurservice mit maßgeschneiderten Annehmlichkeiten bei jeder Fahrt",
        "Vorbehalten Hochzeiten, besonderen Anlässen und VIP-Ankünften",
        "Kompromisslose Aufmerksamkeit für jedes Detail, vom Empfang bis zur Ankunft",
      ],
    },
    occasions: [
      {
        title: {
          en: "Weddings & Ceremonies",
          ar: "حفلات الزفاف والاحتفالات",
          ru: "Свадьбы и церемонии",
          zh: "婚礼与仪式",
          fr: "Mariages et cérémonies",
          de: "Hochzeiten & Zeremonien",
        },
        blurb: {
          en: "Arrive in the Rolls-Royce Phantom with red carpet service available.",
          ar: "صلوا في رولز رويس فانتوم مع خدمة السجادة الحمراء المتاحة.",
          ru: "Прибудьте на Rolls-Royce Phantom с доступной услугой красной ковровой дорожки.",
          zh: "乘坐劳斯莱斯幻影抵达,并可提供红毯礼遇服务。",
          fr: "Arrivez à bord de la Rolls-Royce Phantom avec service tapis rouge disponible.",
          de: "Kommen Sie im Rolls-Royce Phantom an — Roter-Teppich-Service verfügbar.",
        },
      },
      {
        title: {
          en: "VIP & Executive Arrivals",
          ar: "وصولات كبار الشخصيات والتنفيذيين",
          ru: "VIP и представительские прибытия",
          zh: "贵宾与行政抵达",
          fr: "Arrivées VIP et executive",
          de: "VIP- & Executive-Ankünfte",
        },
        blurb: {
          en: "Make an unforgettable first impression for high-profile guests.",
          ar: "اتركوا انطباعًا أول لا يُنسى لدى الضيوف البارزين.",
          ru: "Произведите незабываемое первое впечатление на важных гостей.",
          zh: "为重要嘉宾留下难忘的第一印象。",
          fr: "Faites une première impression inoubliable auprès de vos invités de marque.",
          de: "Hinterlassen Sie bei hochkarätigen Gästen einen unvergesslichen ersten Eindruck.",
        },
      },
      {
        title: {
          en: "Milestone Celebrations",
          ar: "احتفالات المناسبات المهمة",
          ru: "Знаковые торжества",
          zh: "重要庆典",
          fr: "Célébrations marquantes",
          de: "Besondere Feiern",
        },
        blurb: {
          en: "Mark anniversaries, birthdays, and achievements in signature style.",
          ar: "احتفلوا بالذكرى السنوية وأعياد الميلاد والإنجازات بأسلوب مميز.",
          ru: "Отметьте годовщины, дни рождения и достижения в фирменном стиле.",
          zh: "以标志性风范纪念周年、生日及各类成就。",
          fr: "Marquez anniversaires, fêtes et réussites avec un style signature.",
          de: "Feiern Sie Jubiläen, Geburtstage und Erfolge im charakteristischen Stil.",
        },
      },
      {
        title: {
          en: "Photography & Media",
          ar: "التصوير والإعلام",
          ru: "Фото и медиа",
          zh: "摄影与媒体",
          fr: "Photographie et médias",
          de: "Fotografie & Medien",
        },
        blurb: {
          en: "A striking backdrop for photoshoots, films, and brand campaigns.",
          ar: "خلفية مميزة لجلسات التصوير والأفلام والحملات الإعلانية.",
          ru: "Эффектный фон для фотосессий, съёмок и брендовых кампаний.",
          zh: "为拍摄、影片及品牌宣传活动提供醒目的背景。",
          fr: "Une toile de fond saisissante pour séances photo, films et campagnes de marque.",
          de: "Eine eindrucksvolle Kulisse für Fotoshootings, Filme und Markenkampagnen.",
        },
      },
    ],
    faqs: [
      {
        question: {
          en: "What ultra-luxury vehicles are available?",
          ar: "ما المركبات الفائقة الفخامة المتوفرة؟",
          ru: "Какие ультра-люксовые автомобили доступны?",
          zh: "有哪些顶级豪华车型可供选择?",
          fr: "Quels véhicules ultra-luxe sont disponibles ?",
          de: "Welche Ultra-Luxusfahrzeuge sind verfügbar?",
        },
        answer: {
          en: "Our ultra-luxury fleet includes the Rolls-Royce Phantom and Mercedes-Maybach S-Class, each with a dedicated chauffeur, bespoke amenities, and white-glove service.",
          ar: "يضم أسطولنا الفائق الفخامة رولز رويس فانتوم ومرسيدس مايباخ S-Class، وكل منها مزودة بسائق مخصص ووسائل راحة مصممة خصيصًا وخدمة راقية.",
          ru: "Наш ультра-люксовый автопарк включает Rolls-Royce Phantom и Mercedes-Maybach S-Class, каждый — с личным шофёром, индивидуальными удобствами и безупречным сервисом.",
          zh: "我们的顶级豪华车队包括劳斯莱斯幻影与梅赛德斯迈巴赫S级,均配备专属司机、定制礼遇及白手套级服务。",
          fr: "Notre flotte ultra-luxe comprend la Rolls-Royce Phantom et la Mercedes-Maybach Classe S, chacune avec un chauffeur dédié, des attentions sur mesure et un service d'exception.",
          de: "Unsere Ultra-Luxusflotte umfasst den Rolls-Royce Phantom und die Mercedes-Maybach S-Klasse, jeweils mit einem dedizierten Chauffeur, maßgeschneiderten Annehmlichkeiten und erstklassigem Service.",
        },
      },
      {
        question: {
          en: "How far in advance should I book an ultra-luxury vehicle?",
          ar: "قبل كم من الوقت يجب حجز مركبة فائقة الفخامة؟",
          ru: "За сколько времени нужно бронировать ультра-люксовый автомобиль?",
          zh: "顶级豪华车型应提前多久预订?",
          fr: "Combien de temps à l'avance dois-je réserver un véhicule ultra-luxe ?",
          de: "Wie weit im Voraus sollte ich ein Ultra-Luxusfahrzeug buchen?",
        },
        answer: {
          en: "These vehicles are our most requested for weddings and peak dates, so we recommend booking at least 1–2 weeks ahead to guarantee availability.",
          ar: "هذه المركبات هي الأكثر طلبًا لدينا لحفلات الزفاف والمواعيد المزدحمة، لذا نوصي بالحجز قبل أسبوع إلى أسبوعين على الأقل لضمان التوفر.",
          ru: "Эти автомобили наиболее востребованы для свадеб и пиковых дат, поэтому мы рекомендуем бронировать как минимум за 1–2 недели, чтобы гарантировать наличие.",
          zh: "这些车型是婚礼及热门日期最受欢迎的选择,建议至少提前1至2周预订以确保车辆可用。",
          fr: "Ces véhicules sont les plus demandés pour les mariages et dates très prisées ; nous recommandons de réserver au moins 1 à 2 semaines à l'avance pour garantir la disponibilité.",
          de: "Diese Fahrzeuge sind für Hochzeiten und stark nachgefragte Termine am gefragtesten, daher empfehlen wir eine Buchung mindestens 1–2 Wochen im Voraus, um die Verfügbarkeit zu garantieren.",
        },
      },
      {
        question: {
          en: "Is red carpet service available?",
          ar: "هل خدمة السجادة الحمراء متاحة؟",
          ru: "Доступна ли услуга красной ковровой дорожки?",
          zh: "是否提供红毯礼遇服务?",
          fr: "Le service tapis rouge est-il disponible ?",
          de: "Ist Roter-Teppich-Service verfügbar?",
        },
        answer: {
          en: "Yes, red carpet service is available on request for weddings, ceremonies, and arrivals where presentation matters most.",
          ar: "نعم، خدمة السجادة الحمراء متاحة عند الطلب لحفلات الزفاف والاحتفالات والوصولات التي يهم فيها المظهر بشكل خاص.",
          ru: "Да, услуга красной ковровой дорожки доступна по запросу для свадеб, церемоний и прибытий, где презентация особенно важна.",
          zh: "可以,红毯礼遇服务可应要求提供,适用于婚礼、仪式及尤其注重礼仪的抵达场合。",
          fr: "Oui, le service tapis rouge est disponible sur demande pour les mariages, cérémonies et arrivées où la présentation compte le plus.",
          de: "Ja, der Roter-Teppich-Service ist auf Anfrage für Hochzeiten, Zeremonien und Ankünfte verfügbar, bei denen die Präsentation am wichtigsten ist.",
        },
      },
      {
        question: {
          en: "Can ultra-luxury vehicles be booked hourly?",
          ar: "هل يمكن حجز المركبات الفائقة الفخامة بالساعة؟",
          ru: "Можно ли забронировать ультра-люксовый автомобиль почасово?",
          zh: "顶级豪华车型可以按小时预订吗?",
          fr: "Un véhicule ultra-luxe peut-il être réservé à l'heure ?",
          de: "Können Ultra-Luxusfahrzeuge stundenweise gebucht werden?",
        },
        answer: {
          en: "Yes — our ultra-luxury vehicles can be booked hourly for ceremonies and photo sessions, in addition to half-day and full-day hire.",
          ar: "نعم — يمكن حجز مركباتنا الفائقة الفخامة بالساعة للحفلات وجلسات التصوير، بالإضافة إلى استئجار نصف يوم أو يوم كامل.",
          ru: "Да — наши ультра-люксовые автомобили можно забронировать почасово для церемоний и фотосессий, помимо аренды на полдня и полный день.",
          zh: "可以——我们的顶级豪华车型除半天及全天租用外,还可按小时预订,适用于仪式及拍摄环节。",
          fr: "Oui — nos véhicules ultra-luxe peuvent être réservés à l'heure pour des cérémonies et séances photo, en plus de la location à la demi-journée ou à la journée.",
          de: "Ja — unsere Ultra-Luxusfahrzeuge können neben der Halbtags- und Ganztagesmiete auch stundenweise für Zeremonien und Fotoshootings gebucht werden.",
        },
      },
    ],
  },
  electric: {
    whyChoose: {
      en: [
        "Quiet, modern electric vehicles with zero tailpipe emissions",
        "The same professional chauffeur standard as the rest of our fleet",
        "A sustainable choice without compromising on comfort",
        "Flexible hourly, transfer, and full-day packages",
      ],
      ar: [
        "مركبات كهربائية هادئة وعصرية بدون أي انبعاثات من العادم",
        "نفس معيار السائق المحترف المعتمد في باقي أسطولنا",
        "خيار مستدام دون التضحية بالراحة",
        "باقات مرنة بالساعة والنقل واليوم الكامل",
      ],
      ru: [
        "Тихие, современные электромобили с нулевым уровнем выхлопных выбросов",
        "Тот же стандарт профессионального шофёра, что и в остальном автопарке",
        "Экологичный выбор без ущерба комфорту",
        "Гибкие почасовые, трансферные и полнодневные пакеты",
      ],
      zh: [
        "静谧现代的电动车型,零尾气排放",
        "与车队其他车型相同的专业司机标准",
        "兼具可持续性与舒适性的理想之选",
        "灵活的按小时、接送及全天套餐",
      ],
      fr: [
        "Des véhicules électriques silencieux et modernes, sans aucune émission à l'échappement",
        "Le même niveau de chauffeur professionnel que le reste de notre flotte",
        "Un choix durable sans compromis sur le confort",
        "Des forfaits flexibles à l'heure, pour transfert et à la journée",
      ],
      de: [
        "Leise, moderne Elektrofahrzeuge ganz ohne Abgasemissionen",
        "Derselbe professionelle Chauffeur-Standard wie im Rest unserer Flotte",
        "Eine nachhaltige Wahl ohne Komfortverlust",
        "Flexible Stunden-, Transfer- und Ganztagespakete",
      ],
    },
    occasions: [
      {
        title: {
          en: "Eco-Conscious Travel",
          ar: "السفر الصديق للبيئة",
          ru: "Экологичные поездки",
          zh: "环保出行",
          fr: "Voyages écoresponsables",
          de: "Umweltbewusstes Reisen",
        },
        blurb: {
          en: "A sustainable choice for clients who care about their footprint.",
          ar: "خيار مستدام للعملاء المهتمين ببصمتهم البيئية.",
          ru: "Устойчивый выбор для клиентов, заботящихся о своём экослед.",
          zh: "适合注重环保足迹的客户的可持续之选。",
          fr: "Un choix durable pour les clients soucieux de leur empreinte.",
          de: "Eine nachhaltige Wahl für Kunden, denen ihr ökologischer Fußabdruck wichtig ist.",
        },
      },
      {
        title: {
          en: "Airport Transfers",
          ar: "نقل المطار",
          ru: "Трансфер из аэропорта",
          zh: "机场接送",
          fr: "Transferts aéroport",
          de: "Flughafentransfers",
        },
        blurb: {
          en: "Quiet, comfortable transfers with zero emissions.",
          ar: "نقل هادئ ومريح بدون أي انبعاثات.",
          ru: "Тихий, комфортный трансфер с нулевыми выбросами.",
          zh: "安静舒适的接送体验,零排放。",
          fr: "Des transferts silencieux et confortables, sans émissions.",
          de: "Leise, komfortable Transfers ganz ohne Emissionen.",
        },
      },
      {
        title: {
          en: "Corporate Travel",
          ar: "السفر التجاري",
          ru: "Деловые поездки",
          zh: "商务出行",
          fr: "Voyages d'affaires",
          de: "Geschäftsreisen",
        },
        blurb: {
          en: "A modern, responsible choice for business trips and client pickups.",
          ar: "خيار عصري ومسؤول لرحلات العمل واستقبال العملاء.",
          ru: "Современный, ответственный выбор для бизнес-поездок и встреч клиентов.",
          zh: "适用于商务出行及客户接送的现代、负责任之选。",
          fr: "Un choix moderne et responsable pour les déplacements professionnels et l'accueil de clients.",
          de: "Eine moderne, verantwortungsvolle Wahl für Geschäftsreisen und Kundenabholungen.",
        },
      },
      {
        title: {
          en: "City Journeys",
          ar: "التنقل داخل المدينة",
          ru: "Городские поездки",
          zh: "市内出行",
          fr: "Trajets urbains",
          de: "Stadtfahrten",
        },
        blurb: {
          en: "Smooth, silent rides across Dubai for everyday travel.",
          ar: "رحلات سلسة وهادئة في أنحاء دبي للتنقلات اليومية.",
          ru: "Плавные, бесшумные поездки по Дубаю для повседневных нужд.",
          zh: "平顺静谧地穿梭于迪拜市内,满足日常出行需求。",
          fr: "Des trajets fluides et silencieux à travers Dubaï pour le quotidien.",
          de: "Ruhige, geräuschlose Fahrten durch Dubai für den Alltag.",
        },
      },
    ],
    faqs: [
      {
        question: {
          en: "What electric vehicles are available in your fleet?",
          ar: "ما المركبات الكهربائية المتوفرة في أسطولكم؟",
          ru: "Какие электромобили есть в вашем автопарке?",
          zh: "贵车队提供哪些电动车型?",
          fr: "Quels véhicules électriques sont disponibles dans votre flotte ?",
          de: "Welche Elektrofahrzeuge sind in Ihrer Flotte verfügbar?",
        },
        answer: {
          en: "Our electric lineup features quiet, modern vehicles with the same professional chauffeur standard and premium comfort as the rest of our fleet.",
          ar: "تضم تشكيلتنا الكهربائية مركبات هادئة وعصرية بنفس معيار السائق المحترف والراحة الفاخرة المتوفرة في باقي أسطولنا.",
          ru: "Наша электрическая линейка включает тихие, современные автомобили с тем же стандартом профессионального шофёра и премиальным комфортом, что и остальной автопарк.",
          zh: "我们的电动车阵容配备静谧现代的车型,享有与车队其他车型相同的专业司机标准及高级舒适度。",
          fr: "Notre gamme électrique propose des véhicules silencieux et modernes avec le même niveau de chauffeur professionnel et le même confort premium que le reste de notre flotte.",
          de: "Unser Elektro-Angebot umfasst leise, moderne Fahrzeuge mit demselben professionellen Chauffeur-Standard und Premium-Komfort wie der Rest unserer Flotte.",
        },
      },
      {
        question: {
          en: "Are electric vehicles as comfortable as petrol models?",
          ar: "هل المركبات الكهربائية مريحة بقدر الطرازات التقليدية؟",
          ru: "Так же ли комфортны электромобили, как бензиновые модели?",
          zh: "电动车是否与燃油车型一样舒适?",
          fr: "Les véhicules électriques sont-ils aussi confortables que les modèles à essence ?",
          de: "Sind Elektrofahrzeuge genauso komfortabel wie Benzinmodelle?",
        },
        answer: {
          en: "Yes — our electric vehicles offer the same premium interiors, climate comfort, and amenities as our other vehicles, with a smoother, quieter ride.",
          ar: "نعم — توفر مركباتنا الكهربائية نفس المقصورات الفاخرة والراحة المناخية ووسائل الراحة كباقي مركباتنا، مع رحلة أكثر سلاسة وهدوءًا.",
          ru: "Да — наши электромобили предлагают тот же премиальный салон, климатический комфорт и удобства, что и остальные автомобили, с более плавной и тихой поездкой.",
          zh: "是的——我们的电动车型提供与其他车型相同的高级内饰、空调舒适度及配套礼遇,且乘坐体验更平顺、更安静。",
          fr: "Oui — nos véhicules électriques offrent les mêmes intérieurs premium, confort climatique et prestations que nos autres véhicules, avec un trajet plus fluide et plus silencieux.",
          de: "Ja — unsere Elektrofahrzeuge bieten dieselben hochwertigen Interieurs, denselben Klimakomfort und dieselben Annehmlichkeiten wie unsere anderen Fahrzeuge, mit einer noch ruhigeren, leiseren Fahrt.",
        },
      },
      {
        question: {
          en: "Can electric vehicles be booked for airport transfers?",
          ar: "هل يمكن حجز المركبات الكهربائية لرحلات المطار؟",
          ru: "Можно ли забронировать электромобиль для трансфера из аэропорта?",
          zh: "电动车可以预订用于机场接送吗?",
          fr: "Les véhicules électriques peuvent-ils être réservés pour des transferts aéroport ?",
          de: "Können Elektrofahrzeuge für Flughafentransfers gebucht werden?",
        },
        answer: {
          en: "Yes, with the same flight tracking and meet-and-greet service as the rest of our fleet.",
          ar: "نعم، مع نفس خدمة تتبع الرحلات والاستقبال الشخصي المتوفرة في باقي الأسطول.",
          ru: "Да, с тем же отслеживанием рейса и персональной встречей, что и для остального автопарка.",
          zh: "可以,并享有与车队其他车型相同的航班追踪与专人接机服务。",
          fr: "Oui, avec le même suivi de vol et service d'accueil personnalisé que le reste de notre flotte.",
          de: "Ja, mit derselben Flugverfolgung und demselben Meet-and-Greet-Service wie der Rest unserer Flotte.",
        },
      },
      {
        question: {
          en: "Is there a range limitation for longer trips?",
          ar: "هل هناك قيود على المسافة للرحلات الطويلة؟",
          ru: "Есть ли ограничение по запасу хода для дальних поездок?",
          zh: "长途行程是否存在续航限制?",
          fr: "Y a-t-il une limitation d'autonomie pour les longs trajets ?",
          de: "Gibt es eine Reichweitenbeschränkung für längere Fahrten?",
        },
        answer: {
          en: "Our chauffeurs plan routes and charging around your itinerary, so range is never a concern for your journey.",
          ar: "يخطط سائقونا للمسارات والشحن وفقًا لبرنامج رحلتكم، لذا فإن المسافة ليست مصدر قلق أبدًا لرحلتكم.",
          ru: "Наши шофёры планируют маршруты и подзарядку с учётом вашего маршрута, поэтому запас хода никогда не станет проблемой для вашей поездки.",
          zh: "我们的司机会根据您的行程规划路线与充电安排,因此续航里程不会成为您行程中的困扰。",
          fr: "Nos chauffeurs planifient les itinéraires et la recharge en fonction de votre programme, l'autonomie n'est donc jamais un souci pour votre trajet.",
          de: "Unsere Chauffeure planen Routen und Ladestopps passend zu Ihrem Reiseplan, sodass die Reichweite für Ihre Fahrt nie ein Problem darstellt.",
        },
      },
    ],
  },
};

export interface PlainFleetCategoryOccasion {
  title: string;
  blurb: string;
}

export interface PlainFleetCategoryContent {
  whyChoose: string[];
  occasions: PlainFleetCategoryOccasion[];
  faqs: { question: string; answer: string }[];
}

export function getFleetCategoryContent(
  category: FleetCategorySlug,
  locale: Locale
): PlainFleetCategoryContent {
  const content = FLEET_CATEGORY_CONTENT[category];
  return {
    whyChoose: pick(content.whyChoose, locale),
    occasions: content.occasions.map((occasion) => ({
      title: pick(occasion.title, locale),
      blurb: pick(occasion.blurb, locale),
    })),
    faqs: content.faqs.map((faq) => ({
      question: pick(faq.question, locale),
      answer: pick(faq.answer, locale),
    })),
  };
}

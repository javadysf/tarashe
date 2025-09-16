export interface Province {
  id: number
  name: string
  center: string
  cities: string[]
}

const provincesData = [
  {"name":"آذربايجان شرقی","center":"تبریز","id":1},
  {"name":"آذربايجان غربی","center":"ارومیه","id":2},
  {"name":"اردبيل","center":"اردبیل","id":3},
  {"name":"اصفهان","center":"اصفهان","id":4},
  {"name":"ايلام","center":"ايلام","id":5},
  {"name":"بوشهر","center":"بوشهر","id":6},
  {"name":"تهران","center":"تهران","id":7},
  {"name":"چهارمحال بختیاری","center":"شهركرد","id":8},
  {"name":"خراسان جنوبی","center":"بيرجند","id":9},
  {"name":"خراسان رضوی","center":"مشهد","id":10},
  {"name":"خراسان شمالی","center":"بجنورد","id":11},
  {"name":"خوزستان","center":"اهواز","id":12},
  {"name":"زنجان","center":"زنجان","id":13},
  {"name":"سمنان","center":"سمنان","id":14},
  {"name":"سيستان و بلوچستان","center":"زاهدان","id":15},
  {"name":"فارس","center":"شيراز","id":16},
  {"name":"قزوين","center":"قزوين","id":17},
  {"name":"قم","center":"قم","id":18},
  {"name":"البرز","center":"کرج","id":19},
  {"name":"كردستان","center":"سنندج","id":20},
  {"name":"کرمان","center":"کرمان","id":21},
  {"name":"كرمانشاه","center":"كرمانشاه","id":22},
  {"name":"کهگیلویه و بويراحمد","center":"ياسوج","id":23},
  {"name":"گلستان","center":"گرگان","id":24},
  {"name":"گيلان","center":"رشت","id":25},
  {"name":"لرستان","center":"خرم آباد","id":26},
  {"name":"مازندران","center":"ساري","id":27},
  {"name":"مرکزی","center":"اراک","id":28},
  {"name":"هرمزگان","center":"بندرعباس","id":29},
  {"name":"همدان","center":"همدان","id":30},
  {"name":"يزد","center":"يزد","id":31}
]

const citiesData = [
  {"name":"تبريز","provinceId":1},{"name":"مراغه","provinceId":1},{"name":"ميانه","provinceId":1},{"name":"شبستر","provinceId":1},{"name":"مرند","provinceId":1},{"name":"جلفا","provinceId":1},{"name":"سراب","provinceId":1},{"name":"هاديشهر","provinceId":1},{"name":"بناب","provinceId":1},{"name":"تسوج","provinceId":1},{"name":"اهر","provinceId":1},{"name":"هريس","provinceId":1},{"name":"هشترود","provinceId":1},{"name":"ملكان","provinceId":1},{"name":"بستان آباد","provinceId":1},{"name":"ورزقان","provinceId":1},{"name":"اسكو","provinceId":1},{"name":"ممقان","provinceId":1},{"name":"صوفیان","provinceId":1},{"name":"ایلخچی","provinceId":1},{"name":"خسروشهر","provinceId":1},{"name":"باسمنج","provinceId":1},{"name":"سهند","provinceId":1},
  {"name":"اروميه","provinceId":2},{"name":"نقده","provinceId":2},{"name":"ماكو","provinceId":2},{"name":"تكاب","provinceId":2},{"name":"خوي","provinceId":2},{"name":"مهاباد","provinceId":2},{"name":"سر دشت","provinceId":2},{"name":"چالدران","provinceId":2},{"name":"بوكان","provinceId":2},{"name":"مياندوآب","provinceId":2},{"name":"سلماس","provinceId":2},{"name":"شاهين دژ","provinceId":2},{"name":"پيرانشهر","provinceId":2},{"name":"اشنويه","provinceId":2},{"name":"پلدشت","provinceId":2},
  {"name":"اردبيل","provinceId":3},{"name":"پارس آباد","provinceId":3},{"name":"خلخال","provinceId":3},{"name":"مشگين شهر","provinceId":3},{"name":"نمين","provinceId":3},{"name":"نير","provinceId":3},{"name":"گرمي","provinceId":3},
  {"name":"اصفهان","provinceId":4},{"name":"فلاورجان","provinceId":4},{"name":"گلپايگان","provinceId":4},{"name":"دهاقان","provinceId":4},{"name":"نطنز","provinceId":4},{"name":"تيران","provinceId":4},{"name":"كاشان","provinceId":4},{"name":"اردستان","provinceId":4},{"name":"سميرم","provinceId":4},{"name":"درچه","provinceId":4},{"name":"کوهپایه","provinceId":4},{"name":"مباركه","provinceId":4},{"name":"شهرضا","provinceId":4},{"name":"خميني شهر","provinceId":4},{"name":"نجف آباد","provinceId":4},{"name":"زرين شهر","provinceId":4},{"name":"آران و بيدگل","provinceId":4},{"name":"باغ بهادران","provinceId":4},{"name":"خوانسار","provinceId":4},{"name":"علويجه","provinceId":4},{"name":"عسگران","provinceId":4},{"name":"حاجي آباد","provinceId":4},{"name":"تودشک","provinceId":4},{"name":"ورزنه","provinceId":4},
  {"name":"ايلام","provinceId":5},{"name":"مهران","provinceId":5},{"name":"دهلران","provinceId":5},{"name":"آبدانان","provinceId":5},{"name":"دره شهر","provinceId":5},{"name":"ايوان","provinceId":5},{"name":"سرابله","provinceId":5},
  {"name":"بوشهر","provinceId":6},{"name":"دير","provinceId":6},{"name":"كنگان","provinceId":6},{"name":"گناوه","provinceId":6},{"name":"خورموج","provinceId":6},{"name":"اهرم","provinceId":6},{"name":"برازجان","provinceId":6},{"name":"جم","provinceId":6},{"name":"کاکی","provinceId":6},{"name":"عسلویه","provinceId":6},
  {"name":"تهران","provinceId":7},{"name":"ورامين","provinceId":7},{"name":"فيروزكوه","provinceId":7},{"name":"ري","provinceId":7},{"name":"دماوند","provinceId":7},{"name":"اسلامشهر","provinceId":7},{"name":"رودهن","provinceId":7},{"name":"لواسان","provinceId":7},{"name":"بومهن","provinceId":7},{"name":"تجريش","provinceId":7},{"name":"فشم","provinceId":7},{"name":"كهريزك","provinceId":7},{"name":"پاكدشت","provinceId":7},{"name":"چهاردانگه","provinceId":7},{"name":"شريف آباد","provinceId":7},{"name":"قرچك","provinceId":7},{"name":"باقرشهر","provinceId":7},{"name":"شهريار","provinceId":7},{"name":"رباط كريم","provinceId":7},{"name":"قدس","provinceId":7},{"name":"ملارد","provinceId":7},
  {"name":"شهركرد","provinceId":8},{"name":"فارسان","provinceId":8},{"name":"بروجن","provinceId":8},{"name":"چلگرد","provinceId":8},{"name":"اردل","provinceId":8},{"name":"لردگان","provinceId":8},
  {"name":"قائن","provinceId":9},{"name":"فردوس","provinceId":9},{"name":"بيرجند","provinceId":9},{"name":"نهبندان","provinceId":9},{"name":"سربيشه","provinceId":9},{"name":"طبس","provinceId":9},
  {"name":"مشهد","provinceId":10},{"name":"نيشابور","provinceId":10},{"name":"سبزوار","provinceId":10},{"name":"كاشمر","provinceId":10},{"name":"گناباد","provinceId":10},{"name":"تربت حيدريه","provinceId":10},{"name":"خواف","provinceId":10},{"name":"تربت جام","provinceId":10},{"name":"تايباد","provinceId":10},{"name":"قوچان","provinceId":10},{"name":"سرخس","provinceId":10},{"name":"فريمان","provinceId":10},{"name":"چناران","provinceId":10},{"name":"درگز","provinceId":10},{"name":"طرقبه","provinceId":10},
  {"name":"بجنورد","provinceId":11},{"name":"اسفراين","provinceId":11},{"name":"جاجرم","provinceId":11},{"name":"شيروان","provinceId":11},{"name":"آشخانه","provinceId":11},
  {"name":"اهواز","provinceId":12},{"name":"ايرانشهر","provinceId":12},{"name":"شوش","provinceId":12},{"name":"آبادان","provinceId":12},{"name":"خرمشهر","provinceId":12},{"name":"مسجد سليمان","provinceId":12},{"name":"ايذه","provinceId":12},{"name":"شوشتر","provinceId":12},{"name":"انديمشك","provinceId":12},{"name":"سوسنگرد","provinceId":12},{"name":"هويزه","provinceId":12},{"name":"دزفول","provinceId":12},{"name":"شادگان","provinceId":12},{"name":"بندر ماهشهر","provinceId":12},{"name":"بندر امام خميني","provinceId":12},{"name":"بهبهان","provinceId":12},{"name":"رامهرمز","provinceId":12},{"name":"باغ ملك","provinceId":12},{"name":"هنديجان","provinceId":12},{"name":"لالي","provinceId":12},{"name":"رامشیر","provinceId":12},{"name":"حمیدیه","provinceId":12},{"name":"ملاثانی","provinceId":12},
  {"name":"زنجان","provinceId":13},{"name":"ابهر","provinceId":13},{"name":"خدابنده","provinceId":13},{"name":"ماهنشان","provinceId":13},{"name":"خرمدره","provinceId":13},{"name":"آب بر","provinceId":13},{"name":"قيدار","provinceId":13},
  {"name":"سمنان","provinceId":14},{"name":"شاهرود","provinceId":14},{"name":"گرمسار","provinceId":14},{"name":"ايوانكي","provinceId":14},{"name":"دامغان","provinceId":14},{"name":"بسطام","provinceId":14},
  {"name":"زاهدان","provinceId":15},{"name":"چابهار","provinceId":15},{"name":"خاش","provinceId":15},{"name":"سراوان","provinceId":15},{"name":"زابل","provinceId":15},{"name":"سرباز","provinceId":15},{"name":"ايرانشهر","provinceId":15},{"name":"ميرجاوه","provinceId":15},
  {"name":"شيراز","provinceId":16},{"name":"اقليد","provinceId":16},{"name":"داراب","provinceId":16},{"name":"فسا","provinceId":16},{"name":"مرودشت","provinceId":16},{"name":"آباده","provinceId":16},{"name":"كازرون","provinceId":16},{"name":"سپيدان","provinceId":16},{"name":"لار","provinceId":16},{"name":"فيروز آباد","provinceId":16},{"name":"جهرم","provinceId":16},{"name":"استهبان","provinceId":16},{"name":"لامرد","provinceId":16},{"name":"مهر","provinceId":16},{"name":"اردكان","provinceId":16},{"name":"صفاشهر","provinceId":16},{"name":"ارسنجان","provinceId":16},{"name":"سوريان","provinceId":16},{"name":"فراشبند","provinceId":16},{"name":"سروستان","provinceId":16},{"name":"زرقان","provinceId":16},{"name":"کوار","provinceId":16},{"name":"بوانات","provinceId":16},{"name":"خرامه","provinceId":16},{"name":"خنج","provinceId":16},
  {"name":"قزوين","provinceId":17},{"name":"تاكستان","provinceId":17},{"name":"آبيك","provinceId":17},{"name":"بوئين زهرا","provinceId":17},
  {"name":"قم","provinceId":18},{"name":"قنوات","provinceId":18},{"name":"جعفریه","provinceId":18},{"name":"کهک","provinceId":18},{"name":"دستجرد","provinceId":18},{"name":"سلفچگان","provinceId":18},
  {"name":"کرج","provinceId":19},{"name":"طالقان","provinceId":19},{"name":"نظرآباد","provinceId":19},{"name":"اشتهارد","provinceId":19},{"name":"هشتگرد","provinceId":19},{"name":"ماهدشت","provinceId":19},
  {"name":"سنندج","provinceId":20},{"name":"بانه","provinceId":20},{"name":"بيجار","provinceId":20},{"name":"سقز","provinceId":20},{"name":"قروه","provinceId":20},{"name":"مريوان","provinceId":20},{"name":"صلوات آباد","provinceId":20},{"name":"حسن آباد","provinceId":20},
  {"name":"کرمان","provinceId":21},{"name":"راور","provinceId":21},{"name":"انار","provinceId":21},{"name":"کوهبنان","provinceId":21},{"name":"رفسنجان","provinceId":21},{"name":"بافت","provinceId":21},{"name":"سيرجان","provinceId":21},{"name":"كهنوج","provinceId":21},{"name":"زرند","provinceId":21},{"name":"بم","provinceId":21},{"name":"جيرفت","provinceId":21},{"name":"بردسير","provinceId":21},
  {"name":"كرمانشاه","provinceId":22},{"name":"اسلام آباد غرب","provinceId":22},{"name":"كنگاور","provinceId":22},{"name":"سنقر","provinceId":22},{"name":"قصر شيرين","provinceId":22},{"name":"هرسين","provinceId":22},{"name":"صحنه","provinceId":22},{"name":"پاوه","provinceId":22},{"name":"جوانرود","provinceId":22},
  {"name":"ياسوج","provinceId":23},{"name":"گچساران","provinceId":23},{"name":"دوگنبدان","provinceId":23},{"name":"سي سخت","provinceId":23},{"name":"دهدشت","provinceId":23},
  {"name":"گرگان","provinceId":24},{"name":"آق قلا","provinceId":24},{"name":"گنبد كاووس","provinceId":24},{"name":"علي آباد كتول","provinceId":24},{"name":"كردكوی","provinceId":24},{"name":"كلاله","provinceId":24},{"name":"آزاد شهر","provinceId":24},{"name":"راميان","provinceId":24},
  {"name":"رشت","provinceId":25},{"name":"منجيل","provinceId":25},{"name":"لنگرود","provinceId":25},{"name":"تالش","provinceId":25},{"name":"آستارا","provinceId":25},{"name":"ماسوله","provinceId":25},{"name":"رودبار","provinceId":25},{"name":"فومن","provinceId":25},{"name":"صومعه سرا","provinceId":25},{"name":"هشتپر","provinceId":25},{"name":"ماسال","provinceId":25},{"name":"شفت","provinceId":25},{"name":"املش","provinceId":25},{"name":"لاهیجان","provinceId":25},
  {"name":"خرم آباد","provinceId":26},{"name":"ماهشهر","provinceId":26},{"name":"دزفول","provinceId":26},{"name":"بروجرد","provinceId":26},{"name":"دورود","provinceId":26},{"name":"اليگودرز","provinceId":26},{"name":"ازنا","provinceId":26},{"name":"نور آباد","provinceId":26},{"name":"كوهدشت","provinceId":26},{"name":"الشتر","provinceId":26},
  {"name":"ساري","provinceId":27},{"name":"آمل","provinceId":27},{"name":"بابل","provinceId":27},{"name":"بابلسر","provinceId":27},{"name":"بهشهر","provinceId":27},{"name":"تنكابن","provinceId":27},{"name":"جويبار","provinceId":27},{"name":"چالوس","provinceId":27},{"name":"رامسر","provinceId":27},{"name":"قائم شهر","provinceId":27},{"name":"نكا","provinceId":27},{"name":"نور","provinceId":27},{"name":"بلده","provinceId":27},{"name":"نوشهر","provinceId":27},{"name":"محمود آباد","provinceId":27},
  {"name":"اراک","provinceId":28},{"name":"آشتيان","provinceId":28},{"name":"تفرش","provinceId":28},{"name":"خمين","provinceId":28},{"name":"دليجان","provinceId":28},{"name":"ساوه","provinceId":28},{"name":"محلات","provinceId":28},{"name":"شازند","provinceId":28},
  {"name":"بندرعباس","provinceId":29},{"name":"قشم","provinceId":29},{"name":"كيش","provinceId":29},{"name":"بندر لنگه","provinceId":29},{"name":"بستك","provinceId":29},{"name":"دهبارز","provinceId":29},{"name":"ميناب","provinceId":29},{"name":"بندر جاسك","provinceId":29},{"name":"بندر خمیر","provinceId":29},
  {"name":"همدان","provinceId":30},{"name":"ملاير","provinceId":30},{"name":"نهاوند","provinceId":30},{"name":"رزن","provinceId":30},{"name":"اسدآباد","provinceId":30},{"name":"بهار","provinceId":30},
  {"name":"يزد","provinceId":31},{"name":"تفت","provinceId":31},{"name":"اردكان","provinceId":31},{"name":"ابركوه","provinceId":31},{"name":"ميبد","provinceId":31},{"name":"بافق","provinceId":31},{"name":"مهريز","provinceId":31},{"name":"اشكذر","provinceId":31},{"name":"هرات","provinceId":31},{"name":"خضرآباد","provinceId":31},{"name":"زارچ","provinceId":31}
]

export const iranProvinces: Province[] = provincesData.map(province => ({
  ...province,
  cities: citiesData.filter(city => city.provinceId === province.id).map(city => city.name)
}))
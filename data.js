var Months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

var data = []
var wheel = {}

wheel.category = 'month';
wheel.data = []

$.each(Months, function (index, month) {
    var temData = {}
    temData.navitemtext = month;
    temData.name = month;
    temData.fullName = month;
    temData.addtlInfo = [];
    var tempAddtlInfo = {}
    wheel.data.push(temData)
});

data.push(wheel);
generateWheelMarkup()

function generateWheelMarkup() {
    var htmlMarkup = ''
    htmlMarkup += ''
    $.each(data, function (index, item) {
        htmlMarkup += '<section id="wheel" data-study-wheel="' + item.category + '">'
        htmlMarkup += '<div id="monthMenu" data-wheelnav data-wheelnav-navangle="0" data-wheelnav-slicepath="Pieslice" data-wheelnav-navangle="30" data-wheelnav-colors="#006648,#298043,#41ad49,#009a6d" data-wheelnav-init>'

        $.each(item.data, function (dindex, ditem) {
            htmlMarkup += '<div data-wheelnav-navitemtext="' + ditem.navitemtext + '" onclick="swapProgramData();"></div>'
            htmlMarkup += '<div class="wheel-data">'
            htmlMarkup += '</div>'
        });

        htmlMarkup += '</div>'
        htmlMarkup + '</section>'
        $("#wheel-div").html(htmlMarkup)
    });
}

var folder = "/Sheehan/thumbs/";
var actualFolder = "/Sheehan/"

function getImagesFromFolder() {
  return data = [
    "IMG-20180315-WA0043-t.jpg",
    "IMG-20180315-WA0047-t.jpg",
    "IMG-20180315-WA0049-t.jpg",
    "IMG-20180315-WA0050-t.jpg",
    "IMG-20180315-WA0051-t.jpg",
    "IMG-20180325-WA0047-t.jpg",
    "IMG-20180325-WA0048-t.jpg",
    "IMG-20180325-WA0049-t.jpg",
    "IMG-20180325-WA0050-t.jpg",
    "IMG-20180325-WA0051-t.jpg",
    "IMG-20180530-WA0012-t.jpeg",
    "IMG-20180607-WA0075-t.jpg",
    "IMG-20180607-WA0076-t.jpg",
    "IMG-20180607-WA0077-t.jpg",
    "IMG-20180718-WA0011-t.jpeg",
    "IMG-20180718-WA0022-t.jpeg",
    "IMG-20180722-WA0009-t.jpg",
    "IMG-20180722-WA0010-t.jpg",
    "IMG-20180722-WA0011-t.jpg",
    "IMG-20180722-WA0012-t.jpg",
    "IMG-20180722-WA0013-t.jpg",
    "IMG-20180722-WA0014-t.jpg",
    "IMG-20180722-WA0015-t.jpg",
    "IMG-20180722-WA0016-t.jpg",
    "IMG-20180722-WA0017-t.jpg",
    "IMG-20180722-WA0018-t.jpg",
    "IMG-20180722-WA0019-t.jpg",
    "IMG-20180722-WA0020-t.jpg",
    "IMG-20180722-WA0021-t.jpg",
    "IMG-20180722-WA0022-t.jpg",
    "IMG-20180722-WA0023-t.jpg",
    "IMG-20180722-WA0024-t.jpg",
    "IMG-20180722-WA0025-t.jpg",
    "IMG-20180722-WA0026-t.jpg",
    "IMG-20180722-WA0027-t.jpg",
    "IMG-20180722-WA0028-t.jpg",
    "IMG-20180722-WA0029-t.jpg",
    "IMG-20180722-WA0030-t.jpg",
    "IMG-20180722-WA0031-t.jpg",
    "IMG-20180722-WA0032-t.jpg",
    "IMG-20180722-WA0033-t.jpg",
    "IMG-20180722-WA0034-t.jpg",
    "IMG-20180722-WA0035-t.jpg",
    "IMG-20180722-WA0036-t.jpg",
    "IMG-20180722-WA0038-t.jpg",
    "IMG-20180722-WA0039-t.jpg",
    "IMG-20180722-WA0040-t.jpg",
    "IMG-20180722-WA0041-t.jpg",
    "IMG-20180722-WA0042-t.jpg",
    "IMG-20180722-WA0044-t.jpg",
    "IMG-20180722-WA0045-t.jpg",
    "IMG-20180722-WA0046-t.jpg",
    "IMG-20180722-WA0047-t.jpg",
    "IMG-20180722-WA0048-t.jpg",
    "IMG-20180722-WA0049-t.jpg",
    "IMG-20180722-WA0050-t.jpg",
    "IMG-20180722-WA0051-t.jpg",
    "IMG-20180722-WA0052-t.jpg",
    "IMG-20180722-WA0054-t.jpg",
    "IMG-20180722-WA0055-t.jpg",
    "IMG-20180722-WA0056-t.jpg",
    "IMG-20180722-WA0057-t.jpg",
    "IMG-20180722-WA0058-t.jpg",
    "IMG-20180722-WA0059-t.jpg",
    "IMG-20180722-WA0060-t.jpg",
    "IMG-20180722-WA0061-t.jpg",
    "IMG-20180722-WA0062-t.jpg",
    "IMG-20180723-WA0013-t.jpg",
    "IMG-20180801-WA0011-t.jpeg",
    "IMG-20180805-WA0034-t.jpg",
    "IMG-20180805-WA0035-t.jpg",
    "IMG-20180805-WA0036-t.jpg",
    "IMG-20180805-WA0045-t.jpg",
    "IMG-20180805-WA0046-t.jpg",
    "IMG-20180805-WA0048-t.jpg",
    "IMG-20180805-WA0050-t.jpg",
    "IMG-20180805-WA0051-t.jpg",
    "IMG-20180805-WA0052-t.jpg",
    "IMG-20180805-WA0053-t.jpg",
    "IMG-20180805-WA0054-t.jpg",
    "IMG-20180805-WA0055-t.jpg",
    "IMG-20180805-WA0056-t.jpg",
    "IMG-20180805-WA0057-t.jpg",
    "IMG-20180805-WA0058-t.jpg",
    "IMG-20180805-WA0061-t.jpg",
    "IMG-20180805-WA0067-t.jpg",
    "IMG-20180805-WA0068-t.jpg",
    "IMG-20180805-WA0070-t.jpg",
    "IMG-20180805-WA0072-t.jpg",
    "IMG-20180805-WA0073-t.jpg",
    "IMG-20180805-WA0077-t.jpg",
    "IMG_20180207_151531474_t.jpg",
    "IMG_20180207_151544301_t.jpg",
    "IMG_20180207_182932877_t.jpg",
    "IMG_20180207_182938197_t.jpg",
    "IMG_20180209_104527199_t.jpg",
    "IMG_20180209_104557867_t.jpg",
    "IMG_20180209_104653279_t.jpg",
    "IMG_20180209_104831622_t.jpg",
    "IMG_20180209_104930_t.jpg",
    "IMG_20180211_162045326_t.jpg",
    "IMG_20180211_162055889_t.jpg",
    "IMG_20180211_162100931_t.jpg",
    "IMG_20180211_162116562_t.jpg",
    "IMG_20180211_162133008_t.jpg",
    "IMG_20180211_162204463_t.jpg",
    "IMG_20180213_105939686_t.jpg",
    "IMG_20180213_105943705_t.jpg",
    "IMG_20180213_105956340_t.jpg",
    "IMG_20180213_110007611_t.jpg",
    "IMG_20180213_154504069_t.jpg",
    "IMG_20180213_154506454_t.jpg",
    "IMG_20180213_154510019_t.jpg",
    "IMG_20180213_154514873_t.jpg",
    "IMG_20180213_154517826_t.jpg",
    "IMG_20180213_154603891_t.jpg",
    "IMG_20180213_154605485_t.jpg",
    "IMG_20180213_154614405_t.jpg",
    "IMG_20180213_154629184_t.jpg",
    "IMG_20180213_154649651_t.jpg",
    "IMG_20180213_154653412_t.jpg",
    "IMG_20180213_154711689_t.jpg",
    "IMG_20180213_154745872_t.jpg",
    "IMG_20180213_154827238_t.jpg",
    "IMG_20180213_154903166_t.jpg",
    "IMG_20180213_154908260_t.jpg",
    "IMG_20180213_154925673_t.jpg",
    "IMG_20180213_154949052_t.jpg",
    "IMG_20180213_155003265_t.jpg",
    "IMG_20180213_155025692_t.jpg",
    "IMG_20180213_155027445_t.jpg",
    "IMG_20180213_155031659_t.jpg",
    "IMG_20180213_155036415_t.jpg",
    "IMG_20180213_155045251_t.jpg",
    "IMG_20180214_175602464_t.jpg",
    "IMG_20180214_175617702_t.jpg",
    "IMG_20180214_175633861_t.jpg",
    "IMG_20180214_194051677_t.jpg",
    "IMG_20180216_243106643_t.jpg",
    "IMG_20180216_243114398_t.jpg",
    "IMG_20180217_112116206_t.jpg",
    "IMG_20180217_112121089_t.jpg",
    "IMG_20180219_154220002_t.jpg",
    "IMG_20180219_154225773_t.jpg",
    "IMG_20180219_154228714_t.jpg",
    "IMG_20180220_210547138_t.jpg",
    "IMG_20180220_210549094_t.jpg",
    "IMG_20180220_210551512_t.jpg",
    "IMG_20180220_210614185_t.jpg",
    "IMG_20180220_210616088_t.jpg",
    "IMG_20180220_210618013_t.jpg",
    "IMG_20180223_165543452_t.jpg",
    "IMG_20180223_165603191_t.jpg",
    "IMG_20180225_114615359_t.jpg",
    "IMG_20180225_114635286_t.jpg",
    "IMG_20180225_114641322_t.jpg",
    "IMG_20180225_114647720_t.jpg",
    "IMG_20180225_114652119_t.jpg",
    "IMG_20180225_114736669_t.jpg",
    "IMG_20180225_114743893_t.jpg",
    "IMG_20180306_231717207_t.jpg",
    "IMG_20180306_231816402_t.jpg",
    "IMG_20180306_231845343_t.jpg",
    "IMG_20180308_245537562_t.jpg",
    "IMG_20180308_245541912_t.jpg",
    "IMG_20180308_245545200_t.jpg",
    "IMG_20180308_245554097_t.jpg",
    "IMG_20180308_245603258_t.jpg",
    "IMG_20180308_245605057_t.jpg",
    "IMG_20180308_245609895_t.jpg",
    "IMG_20180308_245615091_t.jpg",
    "IMG_20180308_245618141_t.jpg",
    "IMG_20180308_245624451_t.jpg",
    "IMG_20180308_245626070_t.jpg",
    "IMG_20180308_245724696_t.jpg",
    "IMG_20180308_245751576_t.jpg",
    "IMG_20180308_245754103_t.jpg",
    "IMG_20180308_245810709_t.jpg",
    "IMG_20180308_245828901_t.jpg",
    "IMG_20180308_245831592_t.jpg",
    "IMG_20180308_245842591_t.jpg",
    "IMG_20180308_245844066_t.jpg",
    "IMG_20180308_245854629_t.jpg",
    "IMG_20180308_245905325_t.jpg",
    "IMG_20180308_245933176_t.jpg",
    "IMG_20180309_150004020_t.jpg",
    "IMG_20180309_150007455_t.jpg",
    "IMG_20180309_150014594_t.jpg",
    "IMG_20180309_150030474_t.jpg",
    "IMG_20180309_150036442_t.jpg",
    "IMG_20180309_150047808_t.jpg",
    "IMG_20180313_163720593_t.jpg",
    "IMG_20180313_163722589_t.jpg",
    "IMG_20180313_163730712_t.jpg",
    "IMG_20180313_163740134_t.jpg",
    "IMG_20180313_163802686_t.jpg",
    "IMG_20180313_163856005_t.jpg",
    "IMG_20180313_163937590_t.jpg",
    "IMG_20180325_161217895_t.jpg",
    "IMG_20180325_161221782_t.jpg",
    "IMG_20180325_161235207_t.jpg",
    "IMG_20180325_161240698_t.jpg",
    "IMG_20180325_161404506_t.jpg",
    "IMG_20180325_161414048_t.jpg",
    "IMG_20180325_161416904_t.jpg",
    "IMG_20180325_161546488_t.jpg",
    "IMG_20180325_161554108_t.jpg",
    "IMG_20180325_161600935_t.jpg",
    "IMG_20180325_161604695_t.jpg",
    "IMG_20180325_161629502_t.jpg",
    "IMG_20180325_161633433_t.jpg",
    "IMG_20180325_161638366_t.jpg",
    "IMG_20180325_161645812_t.jpg",
    "IMG_20180325_162320691_t.jpg",
    "IMG_20180325_162335456_t.jpg",
    "IMG_20180325_162343037_t.jpg",
    "IMG_20180325_162345291_t.jpg",
    "IMG_20180325_162411007_t.jpg",
    "IMG_20180325_162418598_t.jpg",
    "IMG_20180325_162430869_t.jpg",
    "IMG_20180325_162433758_t.jpg",
    "IMG_20180325_162624558_t.jpg",
    "IMG_20180325_162651120_t.jpg",
    "IMG_20180325_162656528_t.jpg",
    "IMG_20180326_231610557_t.jpg",
    "IMG_20180330_224851509_t.jpg",
    "IMG_20180330_224855485_t.jpg",
    "IMG_20180330_224858245_t.jpg",
    "IMG_20180330_224904678_t.jpg",
    "IMG_20180331_152653835_t.jpg",
    "IMG_20180331_231632446_t.jpg",
    "IMG_20180331_231635891_t.jpg",
    "IMG_20180408_151002526_t.jpg",
    "IMG_20180408_151025687_t.jpg",
    "IMG_20180408_165421095_t.jpg",
    "IMG_20180408_165422279_t.jpg",
    "IMG_20180408_165427473_t.jpg",
    "IMG_20180408_165432842_t.jpg",
    "IMG_20180408_165444345_t.jpg",
    "IMG_20180408_165445767_t.jpg",
    "IMG_20180408_165458091_t.jpg",
    "IMG_20180408_165506822_t.jpg",
    "IMG_20180414_212752576_t.jpg",
    "IMG_20180428_224228207_t.jpg",
    "IMG_20180428_224311635_t.jpg",
    "IMG_20180428_224315882_t.jpg",
    "IMG_20180428_224320425_t.jpg",
    "IMG_20180428_224323826_t.jpg",
    "IMG_20180428_224325528_t.jpg",
    "IMG_20180428_224335181_t.jpg",
    "IMG_20180428_224341732_t.jpg",
    "IMG_20180428_224402553_t.jpg",
    "IMG_20180428_224404348_t.jpg",
    "IMG_20180428_224407713_t.jpg",
    "IMG_20180428_224409373_t.jpg",
    "IMG_20180428_224410893_t.jpg",
    "IMG_20180428_224414738_t.jpg",
    "IMG_20180428_224416172_t.jpg",
    "IMG_20180428_224457143_t.jpg",
    "IMG_20180428_224505655_t.jpg",
    "IMG_20180428_224509609_t.jpg",
    "IMG_20180428_224518242_t.jpg",
    "IMG_20180428_224525178_t.jpg",
    "IMG_20180428_224539574_t.jpg",
    "IMG_20180605_155750959_t.jpg",
    "IMG_20180605_155944929_t.jpg",
    "IMG_20180606_105243678_t.jpg",
    "IMG_20180606_105252226_t.jpg",
    "IMG_20180606_105255367_t.jpg",
    "IMG_20180606_105303781_t.jpg",
    "IMG_20180606_145718315_t.jpg",
    "IMG_20180606_145733410_t.jpg",
    "IMG_20180607_132709567_t.jpg",
    "IMG_20180607_132819093_t.jpg",
    "IMG_20180607_132825054_t.jpg",
    "IMG_20180608_123611716_t.jpg",
    "IMG_20180608_123619768_t.jpg",
    "IMG_20180608_123639017_t.jpg",
    "IMG_20180608_123642556_t.jpg",
    "IMG_20180608_183507237_t.jpg",
    "IMG_20180608_183511574_t.jpg",
    "IMG_20180608_183514896_t.jpg",
    "IMG_20180608_183520494_t.jpg",
    "IMG_20180608_183527923_t.jpg",
    "IMG_20180608_183535450_t.jpg",
    "IMG_20180619_222517944_t.jpg",
    "IMG_20180619_222530977_t.jpg",
    "IMG_20180620_144701275_t.jpg",
    "IMG_20180620_144708273_t.jpg",
    "IMG_20180620_144726049_t.jpg",
    "IMG_20180620_144728334_t.jpg",
    "IMG_20180620_144733176_t.jpg",
    "IMG_20180620_144740732_t.jpg",
    "IMG_20180629_103349563_t.jpg",
    "IMG_20180629_103352536_t.jpg",
    "IMG_20180629_103403397_t.jpg",
    "IMG_20180629_103409868_t.jpg",
    "IMG_20180629_103412076_t.jpg",
    "IMG_20180629_103418289_t.jpg",
    "IMG_20180629_103420746_t.jpg",
    "IMG_20180629_103424679_t.jpg",
    "IMG_20180629_103427248_t.jpg",
    "IMG_20180629_103432474_t.jpg",
    "IMG_20180629_113335209_t.jpg",
    "IMG_20180629_113351043_t.jpg",
    "IMG_20180707_093625307_t.jpg",
    "IMG_20180707_093636006_t.jpg",
    "IMG_20180707_093637742_t.jpg",
    "IMG_20180707_093644763_t.jpg",
    "IMG_20180711_112635210_t.jpg",
    "IMG_20180711_112657043_t.jpg",
    "IMG_20180711_112702928_t.jpg",
    "IMG_20180711_150735204_t.jpg",
    "IMG_20180711_150739299_t.jpg",
    "IMG_20180711_150831594_t.jpg",
    "IMG_20180711_150836576_t.jpg",
    "IMG_20180711_150841988_t.jpg",
    "IMG_20180711_150851135_t.jpg",
    "IMG_20180711_150933392_t.jpg",
    "IMG_20180711_151205708_t.jpg",
    "IMG_20180711_151558_t.jpg",
    "IMG_20180722_115507917_t.jpg",
    "IMG_20180722_115511071_t.jpg",
    "IMG_20180722_115512945_t.jpg",
    "IMG_20180722_115712820_t.jpg",
    "IMG_20180722_115729747_t.jpg",
    "IMG_20180722_115731682_t.jpg",
    "IMG_20180722_115742750_t.jpg",
    "IMG_20180722_115744335_t.jpg",
    "IMG_20180722_115746146_t.jpg",
    "IMG_20180722_115749933_t.jpg",
    "IMG_20180722_115752182_t.jpg",
    "IMG_20180722_115753381_t.jpg",
    "IMG_20180722_115754864_t.jpg",
    "IMG_20180722_115758567_t.jpg",
    "IMG_20180722_115810745_t.jpg",
    "IMG_20180722_115812443_t.jpg",
    "IMG_20180722_115814234_t.jpg",
    "IMG_20180722_115817524_t.jpg",
    "IMG_20180722_115819229_t.jpg",
    "IMG_20180722_115820286_t.jpg",
    "IMG_20180722_115824492_t.jpg",
    "IMG_20180722_115828799_t.jpg",
    "IMG_20180722_115830553_t.jpg",
    "IMG_20180722_115836552_t.jpg",
    "IMG_20180722_115837778_t.jpg",
    "IMG_20180722_115838973_t.jpg",
    "IMG_20180722_115842890_t.jpg",
    "IMG_20180722_115846050_t.jpg",
    "IMG_20180722_115848723_t.jpg",
    "IMG_20180722_115917829_t.jpg",
    "IMG_20180722_115920073_t.jpg",
    "IMG_20180722_120122717_t.jpg",
    "IMG_20180722_120124803_t.jpg",
    "IMG_20180722_120126187_t.jpg",
    "IMG_20180722_120127255_t.jpg",
    "IMG_20180727_200939700_t.jpg",
    "IMG_20180804_245416659_t.jpg",
    "IMG_20180804_245419125_t.jpg",
    "IMG_20180804_245420806_t.jpg",
    "IMG_20180804_245422918_t.jpg",
    "IMG_20180804_245424528_t.jpg",
    "IMG_20180805_113746781_t.jpg",
    "IMG_20180805_113752637_t.jpg",
    "IMG_20180805_113754385_t.jpg",
    "IMG_20180805_113800200_t.jpg",
    "IMG_20180805_113805594_t.jpg",
    "IMG_20180805_113812080_t.jpg",
    "IMG_20180805_113823045_t.jpg",
    "IMG_20180805_113826644_t.jpg",
    "IMG_20180805_114009866_t.jpg",
    "IMG_20180805_114032235_t.jpg",
    "IMG_20180805_114034717_t.jpg",
    "IMG_20180805_114039625_t.jpg",
    "IMG_20180805_114046260_t.jpg",
    "IMG_20180805_114047268_t.jpg",
    "IMG_20180805_114048795_t.jpg",
    "IMG_20180805_114049678_t.jpg",
    "IMG_20180805_114051401_t.jpg",
    "IMG_20180805_114052397_t.jpg",
    "IMG_20180805_114053633_t.jpg",
    "IMG_20180805_114221166_t.jpg",
    "IMG_20180805_114226100_t.jpg",
    "IMG_20180805_114228851_t.jpg",
    "IMG_20180807_180207639_t.jpg",
    "IMG_20180807_180220614_t.jpg",
    "IMG_20180807_180225538_t.jpg",
    "IMG_20180810_165400423_t.jpg",
    "IMG_20180810_165404020_t.jpg",
    "IMG_20180820_154312710_t.jpg",
    "IMG_20180820_154314870_t.jpg",
    "IMG_20180820_154316245_t.jpg",
    "IMG_20180820_154341129_t.jpg",
    "IMG_20180820_154343495_t.jpg",
    "IMG_20180820_154419566_t.jpg",
    "IMG_20180820_154422834_t.jpg,"
   ]
}

$(document).on("change","#year",function(){
    swapProgramData()
})

function getImages(data, month) {
    var fileExt = [];
    fileExt[0] = ".png";
    fileExt[1] = ".jpg";
    fileExt[2] = ".gif";
    var imgNotFound = false
    var imgMarkup = ''
    imgMarkup += '<div class="demo-gallery mrb50">'
    imgMarkup += '<div id="aniimated-thumbnials" class="list-unstyled">'
    $.each(data,function (i, val) {
        if (val.match(/\.(jpe?g|png|gif|mp4)$/)) {
            if (val != '' && (val.indexOf('IMG') != -1)) {

                var actImage = val
                var imageName = actImage.split("_");
                var delimterEx = '_'
                if (imageName.length == 1) {
                    imageName = actImage.split("-");
                    delimterEx = "-"
                }
                var imageMonth = imageName[1].substring(4, 6)
                var imageYear = imageName[1].substring(0, 4)
                if (imageMonth == month && imageYear == $("#year").val()) {
                    imgNotFound = true;
                    var ext = imageName[3].split(".")
                    var name = imageName[0] + delimterEx + imageName[1] + delimterEx + imageName[2] + "." + ext[1]
                    imgMarkup += '<a class="" href="' + actualFolder + name + '">'
                    imgMarkup += '<img class="img-responsive" src="' + folder + val + '" />'
                    imgMarkup += '<div class="demo-gallery-poster">'
                    imgMarkup += '<img src="light/dist/img/zoom.png">'
                    imgMarkup += '</div>'
                    imgMarkup += '</a>'
                }
            }
        }
    });

    if (!imgNotFound) {
        imgMarkup += '<a class="" href="images/IMG-20171228-WA0003.jpg">'
        imgMarkup += '<img class="img-responsive" src="images/IMG-20171228-WA0003.jpg" />'
        imgMarkup += '<div class="demo-gallery-poster">'
        imgMarkup += '<img src="light/dist/img/zoom.png">'
        imgMarkup += '</div>'
        imgMarkup += '</a>'
    }
    imgMarkup += '</div>'
    imgMarkup += '</div>'
    return imgMarkup;
}

/**
 * Smart Event Banner Calendar for Vastra Kuteer
 * -----------------------------------------------
 * Discount Policy:
 *   - Major Festivals (Diwali, Eid, Holi, etc.) : 20%
 *   - Normal/Smaller Events                      : 15%
 *   - Summer Sale                                : 20%
 *   - Default (no event)                         : 20%
 *
 * NOTE: Festival dates change every year (lunar calendar).
 *       Update month/day values at the start of each year.
 */

const EVENTS = [
    // ─────────── JANUARY ───────────
    {
        id: 'new_year', name: 'New Year', emoji: '🎆', start: { month: 1, day: 1 }, end: { month: 1, day: 4 },
        colors: { bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)', accent: '#f59e0b', text: '#fde68a' },
        announcements: [{ text: '🎆 New Year Special — Flat 20% OFF Sitewide!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'New Year Sale — Flat 20% OFF', subText: 'Start the year in style! 20% off.', coupon: 'NEWYEAR20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '300+', label: 'Sale Items' }],
        popupTitle: 'Happy New Year! 🎆', popupOffer: 'Flat 20% off — New Year Special', popupCoupon: 'NEWYEAR20'
    },
    {
        id: 'pongal', name: 'Pongal / Makar Sankranti', emoji: '🌾', start: { month: 1, day: 13 }, end: { month: 1, day: 17 },
        colors: { bg: 'linear-gradient(135deg,#78350f 0%,#b45309 60%,#d97706 100%)', accent: '#fde68a', text: '#fef3c7' },
        announcements: [{ text: '🌾 Pongal Vibes — Traditional Silk Sarees at 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Pongal / Sankranti Sale — Flat 20% OFF', subText: 'Celebrate the harvest in traditional silks.', coupon: 'SANKRANTI20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '150+', label: 'Silk Collection' }],
        popupTitle: 'Happy Sankranti! 🌾', popupOffer: 'Flat 20% off on Silks', popupCoupon: 'SANKRANTI20'
    },
    {
        id: 'republic_day', name: 'Republic Day', emoji: '🇮🇳', start: { month: 1, day: 24 }, end: { month: 1, day: 27 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#15803d 40%,#1d4ed8 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🇮🇳 Republic Day Sale — Flat 20% OFF Every Saree!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Republic Day Sale — Flat 20% OFF', subText: 'Celebrate the Republic in ethnic wear.', coupon: 'REPUBLIC20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '200+', label: 'Products' }],
        popupTitle: 'Jai Hind! 🇮🇳', popupOffer: 'Flat 20% off — Republic Day Special', popupCoupon: 'REPUBLIC20'
    },
    // ─────────── FEBRUARY ───────────
    {
        id: 'valentines', name: "Valentine's Day", emoji: '💕', start: { month: 2, day: 12 }, end: { month: 2, day: 15 },
        colors: { bg: 'linear-gradient(135deg,#9f1239 0%,#be185d 60%,#db2777 100%)', accent: '#fde68a', text: '#fce7f3' },
        announcements: [{ text: "💕 Valentine's Special — Gift a Saree at 20% OFF!", linkText: 'Gift Now', link: '/shop' }],
        saleHeadline: "Valentine's Special — Flat 20% OFF", subText: "Gift the woman you love a beautiful silk saree.", coupon: 'LOVE20',
        stats: [{ value: '20%', label: 'Gift Discount' }, { value: '100+', label: 'Gift Ideas' }],
        popupTitle: 'Gift of Love 💕', popupOffer: '20% off — Valentine Special', popupCoupon: 'LOVE20'
    },
    // ─────────── MARCH ───────────
    {
        id: 'holi', name: 'Holi Dhamaka', emoji: '🎨', start: { month: 3, day: 3 }, end: { month: 3, day: 6 },
        colors: { bg: 'linear-gradient(135deg,#7c3aed 0%,#db2777 40%,#f59e0b 100%)', accent: '#fde68a', text: '#faf5ff' },
        announcements: [{ text: '🎨 Holi Dhamaka — Flat 20% OFF Sitewide!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Holi Dhamaka — Flat 20% OFF', subText: 'Celebrate the colors of joy in vibrant ethnic wear.', coupon: 'HOLI20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '250+', label: 'Coloured Picks' }],
        popupTitle: 'Happy Holi! 🎨', popupOffer: 'Flat 20% off on all orders', popupCoupon: 'HOLI20'
    },
    {
        id: 'ugadi', name: 'Ugadi / Gudi Padwa', emoji: '🌸', start: { month: 3, day: 18 }, end: { month: 3, day: 21 },
        colors: { bg: 'linear-gradient(135deg,#14532d 0%,#166534 60%,#15803d 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🌸 Ugadi Special — Traditional Sarees at 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Ugadi / Gudi Padwa Sale — 20% OFF', subText: 'Standard handloom sarees for the new year.', coupon: 'UGADI20',
        stats: [{ value: '20%', label: 'New Year OFF' }, { value: '175+', label: 'Pure Sarees' }],
        popupTitle: 'Happy New Year! 🌸', popupOffer: 'Flat 20% off on all orders', popupCoupon: 'UGADI20'
    },
    {
        id: 'eid_fitr', name: 'Eid ul-Fitr', emoji: '🌙', start: { month: 3, day: 20 }, end: { month: 3, day: 23 },
        colors: { bg: 'linear-gradient(135deg,#1e3a5f 0%,#065f46 60%,#0d9488 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🌙 Eid Mubarak — Special Eid Collection at 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Eid Mubarak Sale — Flat 20% OFF', subText: 'Adorn yourself in elegance this Eid.', coupon: 'EID20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '200+', label: 'Picks' }],
        popupTitle: 'Eid Mubarak! 🌙', popupOffer: 'Flat 20% off + Free Shipping', popupCoupon: 'EID20'
    },
    // ─────────── APRIL ───────────
    {
        id: 'ram_navami', name: 'Rama Navami', emoji: '🙏', start: { month: 4, day: 5 }, end: { month: 4, day: 7 },
        colors: { bg: 'linear-gradient(135deg,#78350f 0%,#b45309 60%,#d97706 100%)', accent: '#fde68a', text: '#fef3c7' },
        announcements: [{ text: '🙏 Ram Navami — Festive Ethnic at 15% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Ram Navami Special — 15% OFF', subText: 'Traditional handloom sarees for this auspicious day.', coupon: 'RAMNAVAMI15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '120+', label: 'Festive Picks' }],
        popupTitle: 'Shri Ram! 🙏', popupOffer: 'Flat 15% off on festive wear', popupCoupon: 'RAMNAVAMI15'
    },
    {
        id: 'vishu_baisakhi', name: 'Vishu / Baisakhi', emoji: '🌾', start: { month: 4, day: 13 }, end: { month: 4, day: 16 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#15803d 60%,#166534 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🌾 Harvest Festival — 20% OFF on Traditional Wear!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Baisakhi / Vishu Sale — 20% OFF', subText: 'Traditional silk designs at 20% off.', coupon: 'HARVEST20',
        stats: [{ value: '20%', label: 'Grand Discount' }, { value: '150+', label: 'Silk items' }],
        popupTitle: 'Happy Baisakhi! 🌾', popupOffer: 'Flat 20% off on all items', popupCoupon: 'HARVEST20'
    },
    {
        id: 'akshaya_tritiya', name: 'Akshaya Tritiya', emoji: '🪙', start: { month: 4, day: 18 }, end: { month: 4, day: 21 },
        colors: { bg: 'linear-gradient(135deg,#713f12 0%,#92400e 40%,#C9960C 100%)', accent: '#fef3c7', text: '#fef3c7' },
        announcements: [{ text: '🪙 Akshaya Tritiya — Prosperity Sale! 20% OFF SITEWIDE', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Akshaya Tritiya — Prosperity Sale', subText: 'Shop Gold Zari & Silks for prosperity.', coupon: 'AKSHAYA20',
        stats: [{ value: '20%', label: 'Sitewide Discount' }, { value: '100+', label: 'Gold Zari' }],
        popupTitle: 'Akshaya Tritiya! 🪙', popupOffer: 'Flat 20% off Sitewide!', popupCoupon: 'AKSHAYA20'
    },
    // ─────────── MAY/JUNE ───────────
    {
        id: 'summer_sale', name: 'Summer Sizzle', emoji: '☀️', start: { month: 4, day: 25 }, end: { month: 6, day: 20 },
        colors: { bg: 'linear-gradient(135deg,#ea580c 0%,#f59e0b 50%,#facc15 100%)', accent: '#fef3c7', text: '#1a1a2e' },
        announcements: [{ text: '☀️ Summer Sale — Airy Cottons at 15% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Summer Sale — Flat 15% OFF', subText: 'Beat the heat in breezey cotton ethnic wear.', coupon: 'SUMMER15',
        stats: [{ value: '15%', label: 'Summer OFF' }, { value: '500+', label: 'Cool Styles' }],
        popupTitle: 'Summer Sizzle! ☀️', popupOffer: 'Flat 15% off ALL summer wear', popupCoupon: 'SUMMER15'
    },
    {
        id: 'eid_adha', name: 'Eid ul-Adha', emoji: '🕌', start: { month: 5, day: 27 }, end: { month: 5, day: 30 },
        colors: { bg: 'linear-gradient(135deg,#1e3a5f 0%,#065f46 60%,#0d9488 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🕌 Eid ul-Adha — Flat 20% OFF Festive Collection!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Eid ul-Adha Sale — 20% OFF', subText: 'Premium festive ethnic wear at 20% off.', coupon: 'EIDADHA20',
        stats: [{ value: '20%', label: 'Sitewide Discount' }, { value: '200+', label: 'Picks' }],
        popupTitle: 'Eid Mubarak! 🕌', popupOffer: 'Flat 20% off on all orders', popupCoupon: 'EIDADHA20'
    },
    // ─────────── AUGUST ───────────
    {
        id: 'independence_day', name: 'Independence Day', emoji: '🇮🇳', start: { month: 8, day: 13 }, end: { month: 8, day: 16 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#14532d 50%,#ea580c 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🇮🇳 Independence Day — Mega Freedom Sale at 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Independence Day — 20% OFF', subText: 'Celebrate India with handcrafted tradition.', coupon: 'AZADI20',
        stats: [{ value: '20%', label: 'Freedom OFF' }, { value: '400+', label: 'Products' }],
        popupTitle: 'Jai Hind! 🇮🇳', popupOffer: 'Flat 20% off Sitewide!', popupCoupon: 'AZADI20'
    },
    {
        id: 'raksha_bandhan', name: 'Raksha Bandhan', emoji: '🎀', start: { month: 8, day: 27 }, end: { month: 8, day: 30 },
        colors: { bg: 'linear-gradient(135deg,#9d174d 0%,#db2777 60%,#f472b6 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [{ text: '🎀 Raksha Bandhan — Gift Your Sister a Saree at 15% OFF!', linkText: 'Gift Now', link: '/shop' }],
        saleHeadline: 'Raksha Bandhan — 15% OFF', subText: "Buy the best gift for your sister.", coupon: 'RAKHI15',
        stats: [{ value: '15%', label: 'Sister Special' }, { value: '200+', label: 'Gifts' }],
        popupTitle: 'Happy Raksha Bandhan! 🎀', popupOffer: '15% off + Free Gift Wrap', popupCoupon: 'RAKHI15'
    },
    // ─────────── SEPTEMBER ───────────
    {
        id: 'janmashtami', name: 'Janmashtami', emoji: '🦚', start: { month: 9, day: 3 }, end: { month: 9, day: 6 },
        colors: { bg: 'linear-gradient(135deg,#1e3a5f 0%,#3730a3 60%,#7c3aed 100%)', accent: '#fde68a', text: '#ede9fe' },
        announcements: [{ text: '🦚 Janmashtami Special — Traditional Etnhic at 15% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Janmashtami Sale — 15% OFF', subText: 'Celebrate the birth of Lord Krishna in silks.', coupon: 'KRISHNA15',
        stats: [{ value: '15%', label: 'Auspicious Discount' }, { value: '150+', label: 'Auspicious Wear' }],
        popupTitle: 'Jai Katiah! 🦚', popupOffer: 'Flat 15% off on Ethnic collection', popupCoupon: 'KRISHNA15'
    },
    {
        id: 'ganesh_chaturthi', name: 'Ganesh Chaturthi', emoji: '🐘', start: { month: 9, day: 13 }, end: { month: 9, day: 23 },
        colors: { bg: 'linear-gradient(135deg,#78350f 0%,#b45309 50%,#f59e0b 100%)', accent: '#fde68a', text: '#fef3c7' },
        announcements: [{ text: '🐘 Ganpati Bappa Morya — Big Festive Sale at 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Ganesh Chaturthi — 20% OFF', subText: '10 days of divine style & traditional silks.', coupon: 'GANESH20',
        stats: [{ value: '20%', label: 'Big Festival OFF' }, { value: '300+', label: 'Picks' }],
        popupTitle: 'Ganpati Bappa Morya! 🐘', popupOffer: 'Flat 20% off on all festive orders', popupCoupon: 'GANESH20'
    },
    {
        id: 'onam', name: 'Onam Festival', emoji: '🌺', start: { month: 9, day: 24 }, end: { month: 9, day: 28 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#16a34a 50%,#f59e0b 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [{ text: '🌺 Onam Special — Kasavu Sarees at 15% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Onam Sale — 15% OFF', subText: "Celebrate harvests in Kerala's finest silks.", coupon: 'ONAM15',
        stats: [{ value: '15%', label: 'Harvest Discount' }, { value: '100+', label: 'Kasavu silk' }],
        popupTitle: 'Happy Onam! 🌺', popupOffer: 'Flat 15% off on all Kasavu silk', popupCoupon: 'ONAM15'
    },
    // ─────────── OCTOBER ───────────
    {
        id: 'navratri', name: 'Navratri Dhamaka', emoji: '🪔', start: { month: 10, day: 12 }, end: { month: 10, day: 21 },
        colors: { bg: 'linear-gradient(135deg,#be185d 0%,#db2777 30%,#f97316 60%,#dc2626 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [{ text: '🪔 Navratri Sizzle — 9 Nights, 9 Outfits at 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Navratri Festive Sale — 20% OFF', subText: 'Dress for Dandiya in vibrant silk collections.', coupon: 'NAVRATRI20',
        stats: [{ value: '20%', label: 'Night Discount' }, { value: '400+', label: 'Garba wear' }],
        popupTitle: 'Happy Navratri! 🪔', popupOffer: 'Flat 20% off on all festive orders', popupCoupon: 'NAVRATRI20'
    },
    {
        id: 'dussehra', name: 'Happy Dussehra', emoji: '🏹', start: { month: 10, day: 20 }, end: { month: 10, day: 22 },
        colors: { bg: 'linear-gradient(135deg,#7c2d12 0%,#dc2626 60%,#b45309 100%)', accent: '#fde68a', text: '#fef2f2' },
        announcements: [{ text: '🏹 Victory of Style — Dussehra Special 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Dussehra Sale — 20% OFF', subText: 'Celebrating the victory of style and tradition.', coupon: 'DUSSEHRA20',
        stats: [{ value: '20%', label: 'Victory OFF' }, { value: '250+', label: 'Premium items' }],
        popupTitle: 'Happy Dussehra! 🏹', popupOffer: 'Flat 20% off Sitewide!', popupCoupon: 'DUSSEHRA20'
    },
    {
        id: 'karva_chauth', name: 'Karwa Chauth', emoji: '🌕', start: { month: 10, day: 28 }, end: { month: 10, day: 30 },
        colors: { bg: 'linear-gradient(135deg,#9d174d 0%,#be185d 60%,#f59e0b 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [{ text: '🌕 Karwa Chauth — Red Bridal Silks at 15% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Karwa Chauth — 15% OFF', subText: "Stunning red silks for your special day.", coupon: 'CHAUTH15',
        stats: [{ value: '15%', label: 'Bridal Discount' }, { value: '100+', label: 'Pure Bridal' }],
        popupTitle: 'Shubh Chauth! 🌕', popupOffer: 'Flat 15% off on all Red Silks', popupCoupon: 'CHAUTH15'
    },
    // ─────────── NOVEMBER ───────────
    {
        id: 'diwali', name: 'Diwali Dhamaka', emoji: '🪔', start: { month: 11, day: 8 }, end: { month: 11, day: 12 },
        colors: { bg: 'linear-gradient(135deg,#1c0010 0%,#3b0764 40%,#713f12 100%)', accent: '#f59e0b', text: '#fde68a' },
        announcements: [{ text: '🪔 Happy Diwali — SITEWIDE 20% OFF!', linkText: 'Shop Now', link: '/shop' }],
        saleHeadline: 'Diwali Dhamaka — 20% OFF', subText: 'The Festival of Lights! Shop Premium Banarasi & Silks.', coupon: 'DIWALI20',
        stats: [{ value: '20%', label: 'Grand Festival OFF' }, { value: '500+', label: 'Pure Silks' }],
        popupTitle: 'Happy Diwali! 🪔', popupOffer: 'Flat 20% off Sitewide!', popupCoupon: 'DIWALI20'
    },
    {
        id: 'bhaidooj', name: 'Bhai Dooj', emoji: '🤝', start: { month: 11, day: 10 }, end: { month: 11, day: 13 },
        colors: { bg: 'linear-gradient(135deg,#9d174d 0%,#db2777 60%,#f472b6 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [{ text: '🤝 Bhai Dooj Gift Sale — Flat 15% OFF!', linkText: 'Gift Now', link: '/shop' }],
        saleHeadline: 'Bhai Dooj Sale — 15% OFF', subText: "Gift your sister the best Banarasi Silk.", coupon: 'BHAIDOOJ15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '200+', label: 'Gift options' }],
        popupTitle: 'Happy Bhai Dooj! 🤝', popupOffer: '15% off + Free Gift Wrap', popupCoupon: 'BHAIDOOJ15'
    },
    // ─────────── DECEMBER ───────────
    {
        id: 'christmas', name: 'Christmas Sale', emoji: '🎄', start: { month: 12, day: 22 }, end: { month: 12, day: 26 },
        colors: { bg: 'linear-gradient(135deg,#14532d 0%,#166534 50%,#dc2626 100%)', accent: '#fde68a', text: '#f0fdf4' },
        saleHeadline: 'Year-End Mega Sale — Flat 20% OFF',
        subText: "Last sale of the year! Shop our finest collection at flat 20% off.",
        coupon: 'YEAREND20',
        stats: [{ value: '20%', label: 'Flat OFF' }, { value: '600+', label: 'Products' }, { value: '₹499', label: 'Starts From' }],
        popupTitle: 'Year-End Bonanza! 🎆',
        popupOffer: 'Flat 20% off on everything',
        popupCoupon: 'YEAREND20',
    },

    // ─────────── DEFAULT (no active event) ───────────
    {
        id: 'default',
        name: 'Special Offer',
        emoji: '✨',
        start: null,
        end: null,
        colors: { bg: 'linear-gradient(135deg, #065f46 0%, #0d9488 50%, #065f46 100%)', accent: '#fde68a', text: 'white' },
        announcements: [
            { text: '✨ Flat 10% OFF on all Sarees — Use code VASTRA10!', linkText: 'Shop Now', link: '/shop' },
            { text: '🚚 FREE Shipping on orders above ₹2999', linkText: 'Order Now', link: '/shop' },
            { text: '✨ New Arrivals: Premium Banarasi Silk Collection', linkText: 'Explore', link: '/collections' },
            { text: '🎁 Use code VASTRA10 for 10% off your order', linkText: 'Grab Deal', link: '/shop' },
        ],
        saleHeadline: 'Special Offer — Flat 10% OFF',
        subText: 'Handpicked sarees, silk dupattas & ethnic wear at flat 10% off. Use code VASTRA10.',
        coupon: 'VASTRA10',
        stats: [{ value: '10%', label: 'Flat Discount' }, { value: '200+', label: 'Products' }, { value: '₹999', label: 'Starts From' }],
        popupTitle: 'Special Offer! ✨',
        popupOffer: 'Flat 10% off on all orders',
        popupCoupon: 'VASTRA10',
    },
];

/**
 * Returns the active event config for today's date.
 * Falls back to 'default' if no event matches.
 */
export const getActiveEvent = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day   = today.getDate();

    const toNum = (m, d) => m * 100 + d;
    const todayNum = toNum(month, day);

    for (const event of EVENTS) {
        if (!event.start) continue;
        const startNum = toNum(event.start.month, event.start.day);
        const endNum   = toNum(event.end.month,   event.end.day);

        if (startNum <= endNum) {
            if (todayNum >= startNum && todayNum <= endNum) return event;
        } else {
            if (todayNum >= startNum || todayNum <= endNum) return event;
        }
    }

    return EVENTS.find(e => e.id === 'default');
};

export default EVENTS;

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
        id: 'new_year',
        name: 'New Year',
        emoji: '🎆',
        start: { month: 1, day: 1 },
        end:   { month: 1, day: 4 },
        colors: { bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)', accent: '#f59e0b', text: '#fde68a' },
        announcements: [
            { text: '🎆 New Year Special — Flat 20% OFF Sitewide!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ New Year, New Looks — Explore Fresh Arrivals', linkText: 'Explore', link: '/collections' },
            { text: '🎁 Gift a Saree this New Year — Use code NEWYEAR20', linkText: 'Order Now', link: '/shop' },
        ],
        saleHeadline: 'New Year Sale — Flat 20% OFF',
        subText: 'Start the year in style! Premium sarees & ethnic wear at 20% off.',
        coupon: 'NEWYEAR20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '300+', label: 'Sale Items' }, { value: '₹799', label: 'Starts From' }],
        popupTitle: 'Happy New Year! 🎆',
        popupOffer: 'Flat 20% off — New Year Special',
        popupCoupon: 'NEWYEAR20',
    },
    {
        id: 'pongal',
        name: 'Pongal / Makar Sankranti',
        emoji: '🌾',
        start: { month: 1, day: 12 },
        end:   { month: 1, day: 16 },
        colors: { bg: 'linear-gradient(135deg,#78350f 0%,#b45309 60%,#d97706 100%)', accent: '#fde68a', text: '#fef3c7' },
        announcements: [
            { text: '🌾 Pongal Vibes — Traditional Silk Sarees at 20% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '🌞 Makar Sankranti Collection is LIVE!', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Pongal Sale — Flat 20% OFF',
        subText: 'Celebrate the harvest festival in traditional Kanjivaram & Silk sarees.',
        coupon: 'PONGAL20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '150+', label: 'Silk Sarees' }, { value: '₹899', label: 'Starts From' }],
        popupTitle: 'Pongal Wishes! 🌾',
        popupOffer: 'Flat 20% off on Silk Sarees',
        popupCoupon: 'PONGAL20',
    },
    {
        id: 'republic_day',
        name: 'Republic Day',
        emoji: '🇮🇳',
        start: { month: 1, day: 24 },
        end:   { month: 1, day: 27 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#15803d 40%,#1d4ed8 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🇮🇳 Republic Day Sale — Flat 20% OFF on all ethnic wear!', linkText: 'Shop Now', link: '/shop' },
            { text: '🎖️ Celebrate India in style — Traditional wear collection', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Republic Day Sale — Flat 20% OFF',
        subText: 'Celebrate the Republic in handcrafted traditional ethnic wear.',
        coupon: 'INDIA20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '200+', label: 'Products' }, { value: '₹699', label: 'Starts From' }],
        popupTitle: 'Jai Hind! 🇮🇳',
        popupOffer: 'Flat 20% off — Republic Day Special',
        popupCoupon: 'INDIA20',
    },

    // ─────────── FEBRUARY ───────────
    {
        id: 'valentines',
        name: "Valentine's Day",
        emoji: '💕',
        start: { month: 2, day: 12 },
        end:   { month: 2, day: 15 },
        colors: { bg: 'linear-gradient(135deg,#9f1239 0%,#be185d 60%,#db2777 100%)', accent: '#fde68a', text: '#fce7f3' },
        announcements: [
            { text: "💕 Valentine's Special — Gift a Saree at 20% OFF!", linkText: 'Gift Now', link: '/shop' },
            { text: '🌹 Romantic ethnic wear | Express your love in silk', linkText: 'Shop', link: '/collections' },
        ],
        saleHeadline: "Valentine's Special — Flat 20% OFF",
        subText: "Gift the woman you love a beautiful handcrafted saree this Valentine's Day.",
        coupon: 'LOVE20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '100+', label: 'Gift Ideas' }, { value: '₹999', label: 'Starts From' }],
        popupTitle: 'Gift of Love 💕',
        popupOffer: '20% off + free gift wrapping',
        popupCoupon: 'LOVE20',
    },

    // ─────────── MARCH ───────────
    {
        id: 'holi',
        name: 'Holi',
        emoji: '🎨',
        start: { month: 3, day: 12 },
        end:   { month: 3, day: 16 },
        colors: { bg: 'linear-gradient(135deg,#7c3aed 0%,#db2777 40%,#f59e0b 100%)', accent: '#fde68a', text: '#faf5ff' },
        announcements: [
            { text: '🎨 Holi Dhamaka — Flat 20% OFF on all Ethnic Wear!', linkText: 'Shop Now', link: '/shop' },
            { text: '🌈 Celebrate colours of joy in vibrant ethnic wear!', linkText: 'Explore', link: '/collections' },
            { text: '🎁 Use code HOLI20 at checkout!', linkText: 'Shop', link: '/shop' },
        ],
        saleHeadline: 'Holi Dhamaka — Flat 20% OFF',
        subText: 'Celebrate the festival of colours in vibrant traditional ethnic wear.',
        coupon: 'HOLI20',
        stats: [{ value: '20%', label: 'Flat OFF' }, { value: '250+', label: 'Colourful Picks' }, { value: '₹599', label: 'Starts From' }],
        popupTitle: 'Happy Holi! 🎨',
        popupOffer: 'Flat 20% off on all orders',
        popupCoupon: 'HOLI20',
    },
    {
        id: 'eid_fitr',
        name: 'Eid al-Fitr',
        emoji: '🌙',
        start: { month: 3, day: 29 },
        end:   { month: 4, day: 3 },
        colors: { bg: 'linear-gradient(135deg,#1e3a5f 0%,#065f46 60%,#0d9488 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🌙 Eid Mubarak — Special Collection at 20% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Celebrate Eid in beautiful ethnic elegance', linkText: 'Explore', link: '/collections' },
            { text: '🎁 Eid gifts — Free shipping on all orders!', linkText: 'Order', link: '/shop' },
        ],
        saleHeadline: 'Eid Mubarak Sale — Flat 20% OFF',
        subText: 'Adorn yourself in elegant ethnic wear this Eid. Use code EID20 at checkout.',
        coupon: 'EID20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '200+', label: 'Picks' }, { value: '₹799', label: 'Starts From' }],
        popupTitle: 'Eid Mubarak! 🌙',
        popupOffer: 'Flat 20% off + Free shipping on Eid orders',
        popupCoupon: 'EID20',
    },

    // ─────────── APRIL ───────────
    {
        id: 'vishu_baisakhi',
        name: 'Vishu / Baisakhi / Tamil New Year',
        emoji: '🌾',
        start: { month: 4, day: 12 },
        end:   { month: 4, day: 16 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#15803d 60%,#166534 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🌾 Harvest Festival Special — Flat 20% OFF on Traditional Ethnic!', linkText: 'Shop Now', link: '/shop' },
            { text: '🎊 Happy Vishu & Baisakhi — New Beginnings, New Styles!', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Harvest Sale — Flat 20% OFF',
        subText: 'Celebrate the solar new year in vibrant traditional silks and handloom sarees.',
        coupon: 'HARVEST20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '150+', label: 'Silk Collection' }, { value: '₹899', label: 'Starts From' }],
        popupTitle: 'Happy Harvest! 🌾',
        popupOffer: 'Flat 20% off on traditional ethnic wear',
        popupCoupon: 'HARVEST20',
    },
    {
        id: 'akshaya_tritiya',
        name: 'Akshaya Tritiya',
        emoji: '🪙',
        start: { month: 4, day: 17 },
        end:   { month: 4, day: 22 },
        colors: { bg: 'linear-gradient(135deg,#713f12 0%,#92400e 40%,#C9960C 100%)', accent: '#fef3c7', text: '#fef3c7' },
        announcements: [
            { text: '🪙 Akshaya Tritiya — Bring Home Eternal Prosperity at 20% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Auspicious Gold Zari & Silk Sarees — Flat 20% OFF', linkText: 'Explore', link: '/shop' },
        ],
        saleHeadline: 'Akshaya Tritiya Sale — Flat 20% OFF',
        subText: 'An auspicious day for new beginnings. Shop our premium gold zari collections at 20% off.',
        coupon: 'AKSHAYA20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '200+', label: 'Premium Picks' }, { value: '₹1299', label: 'Starts From' }],
        popupTitle: 'Shubh Akshaya Tritiya! 🪙',
        popupOffer: 'Flat 20% off on all items — One day only!',
        popupCoupon: 'AKSHAYA20',
    },
    {
        id: 'ram_navami',
        name: 'Ram Navami',
        emoji: '🪔',
        start: { month: 4, day: 5 },
        end:   { month: 4, day: 7 },
        colors: { bg: 'linear-gradient(135deg,#78350f 0%,#b45309 60%,#d97706 100%)', accent: '#fde68a', text: '#fef3c7' },
        announcements: [
            { text: '🪔 Ram Navami Celebration — Flat 15% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '🙏 Traditional ethnic wear for the auspicious occasion', linkText: 'Explore', link: '/shop' },
        ],
        saleHeadline: 'Ram Navami Special — Flat 15% OFF',
        subText: 'Dress traditionally for this auspicious celebration using code RAMNAVAMI15.',
        coupon: 'RAMNAVAMI15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '120+', label: 'Festive Picks' }, { value: '₹749', label: 'Starts From' }],
        popupTitle: 'Jai Shri Ram! 🪔',
        popupOffer: 'Flat 15% off on festive wear',
        popupCoupon: 'RAMNAVAMI15',
    },
    // ─────────── APRIL/MAY/JUNE — SUMMER SALE ───────────
    {
        id: 'summer_sale',
        name: 'Summer Sale',
        emoji: '☀️',
        start: { month: 4, day: 25 },
        end:   { month: 6, day: 20 },
        colors: { bg: 'linear-gradient(135deg,#ea580c 0%,#f59e0b 50%,#facc15 100%)', accent: '#fef3c7', text: '#1a1a1a' },
        announcements: [
            { text: '☀️ Summer Sale — Flat 15% OFF on all ethnic wear!', linkText: 'Shop Now', link: '/shop' },
            { text: '🌸 Light & breezy cotton sarees for summer', linkText: 'Explore', link: '/shop' },
            { text: '🧡 Use SUMMER15 for 15% off at checkout', linkText: 'Shop', link: '/shop' },
        ],
        saleHeadline: 'Summer Sale — Flat 15% OFF',
        subText: 'Beat the heat in style! Shop lightweight cotton & georgette sarees at 15% off.',
        coupon: 'SUMMER15',
        stats: [{ value: '15%', label: 'Flat OFF' }, { value: '500+', label: 'Summer Items' }, { value: '₹599', label: 'Starts From' }],
        popupTitle: 'Summer Sizzle! ☀️',
        popupOffer: 'Flat 15% off on all summer styles',
        popupCoupon: 'SUMMER15',
    },
    {
        id: 'eid_adha',
        name: 'Eid al-Adha',
        emoji: '🌙',
        start: { month: 6, day: 5 },
        end:   { month: 6, day: 10 },
        colors: { bg: 'linear-gradient(135deg,#1e3a5f 0%,#065f46 60%,#0d9488 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🌙 Eid ul-Adha Mubarak — Flat 20% OFF Sitewide!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Celebrate with beautiful ethnic elegance', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Eid ul-Adha Sale — Flat 20% OFF',
        subText: 'Celebrate the festival of sacrifice in the finest ethnic wear.',
        coupon: 'EIDADHA20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '200+', label: 'Picks' }, { value: '₹799', label: 'Starts From' }],
        popupTitle: 'Eid ul-Adha Mubarak! 🌙',
        popupOffer: 'Flat 20% off on all orders',
        popupCoupon: 'EIDADHA20',
    },

    // ─────────── AUGUST ───────────
    {
        id: 'independence_day',
        name: 'Independence Day',
        emoji: '🇮🇳',
        start: { month: 8, day: 13 },
        end:   { month: 8, day: 16 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#14532d 50%,#ea580c 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🇮🇳 Independence Day — Flat 20% OFF on all ethnic wear!', linkText: 'Shop Now', link: '/shop' },
            { text: '🎖️ Freedom to shop — Use code AZADI20 at checkout', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Independence Day Sale — Flat 20% OFF',
        subText: "Celebrate India's freedom with Indian craftsmanship. Use code AZADI20.",
        coupon: 'AZADI20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '400+', label: 'Products' }, { value: '₹699', label: 'Starts From' }],
        popupTitle: 'Jai Hind! 🇮🇳',
        popupOffer: 'Flat 20% off — Independence Day special',
        popupCoupon: 'AZADI20',
    },
    {
        id: 'raksha_bandhan',
        name: 'Raksha Bandhan',
        emoji: '🎀',
        start: { month: 8, day: 7 },
        end:   { month: 8, day: 11 },
        colors: { bg: 'linear-gradient(135deg,#9d174d 0%,#db2777 60%,#f472b6 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [
            { text: '🎀 Raksha Bandhan — Gift Your Sister a Saree! 15% OFF', linkText: 'Gift Now', link: '/shop' },
            { text: '💝 Beautiful sarees for your beloved sister', linkText: 'Explore', link: '/collections' },
            { text: '🎁 Free gift wrapping on all Rakhi orders!', linkText: 'Order', link: '/shop' },
        ],
        saleHeadline: 'Raksha Bandhan — Flat 15% OFF',
        subText: "Gift the most beautiful thing to your sister. Free gift wrapping on all orders!",
        coupon: 'RAKHI15',
        stats: [{ value: '15%', label: 'Sister Special' }, { value: '200+', label: 'Gift Ideas' }, { value: '₹799', label: 'Starts From' }],
        popupTitle: 'Happy Raksha Bandhan! 🎀',
        popupOffer: '15% off + free gift wrap for sisters',
        popupCoupon: 'RAKHI15',
    },
    {
        id: 'janmashtami',
        name: 'Janmashtami',
        emoji: '🦚',
        start: { month: 8, day: 14 },
        end:   { month: 8, day: 18 },
        colors: { bg: 'linear-gradient(135deg,#1e3a5f 0%,#3730a3 60%,#7c3aed 100%)', accent: '#fde68a', text: '#ede9fe' },
        announcements: [
            { text: '🦚 Janmashtami Special — Flat 15% OFF on Traditional Wear!', linkText: 'Shop Now', link: '/shop' },
            { text: '🙏 Celebrate Krishna Jayanti in elegant ethnic wear', linkText: 'Explore', link: '/shop' },
        ],
        saleHeadline: 'Janmashtami Sale — Flat 15% OFF',
        subText: 'Celebrate the birth of Lord Krishna in traditional handloom elegance.',
        coupon: 'KRISHNA15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '150+', label: 'Festive Picks' }, { value: '₹699', label: 'Starts From' }],
        popupTitle: 'Jai Shri Krishna! 🦚',
        popupOffer: 'Flat 15% off on ethnic wear',
        popupCoupon: 'KRISHNA15',
    },

    // ─────────── SEPTEMBER ───────────
    {
        id: 'ganesh_chaturthi',
        name: 'Ganesh Chaturthi',
        emoji: '🐘',
        start: { month: 8, day: 20 },
        end:   { month: 9, day: 5 },
        colors: { bg: 'linear-gradient(135deg,#78350f 0%,#b45309 50%,#f59e0b 100%)', accent: '#fde68a', text: '#fef3c7' },
        announcements: [
            { text: '🐘 Ganesh Chaturthi Dhamaka — Flat 20% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Festive sarees for 10 days of celebrations!', linkText: 'Explore', link: '/collections' },
            { text: '🎊 Use code GANESH20 at checkout', linkText: 'Shop', link: '/shop' },
        ],
        saleHeadline: 'Ganesh Chaturthi — Flat 20% OFF',
        subText: 'Celebrate 10 days of Bappa in the most beautiful traditional ethnic wear!',
        coupon: 'GANESH20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '300+', label: 'Festive Items' }, { value: '₹799', label: 'Starts From' }],
        popupTitle: 'Ganpati Bappa Morya! 🐘',
        popupOffer: 'Flat 20% off on all festive orders',
        popupCoupon: 'GANESH20',
    },
    {
        id: 'onam',
        name: 'Onam',
        emoji: '🌺',
        start: { month: 9, day: 1 },
        end:   { month: 9, day: 10 },
        colors: { bg: 'linear-gradient(135deg,#166534 0%,#16a34a 50%,#f59e0b 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🌺 Onam Special — Kerala Kasavu Sarees at 15% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '🌸 Celebrate harvest with beautiful ethnic wear', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Onam Sale — Flat 15% OFF',
        subText: 'Celebrate Onam in traditional Kerala Kasavu & Kanchipuram silk sarees.',
        coupon: 'ONAM15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '100+', label: 'Kerala Sarees' }, { value: '₹999', label: 'Starts From' }],
        popupTitle: 'Happy Onam! 🌺',
        popupOffer: 'Flat 15% off on Kasavu sarees',
        popupCoupon: 'ONAM15',
    },

    // ─────────── OCTOBER ───────────
    {
        id: 'navratri',
        name: 'Navratri',
        emoji: '🪷',
        start: { month: 9, day: 22 },
        end:   { month: 10, day: 2 },
        colors: { bg: 'linear-gradient(135deg,#be185d 0%,#db2777 30%,#f97316 60%,#dc2626 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [
            { text: '🪷 Navratri Special — Sarees & Ethnic Wear at 20% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '💃 9 nights of celebration — 9 stunning outfits!', linkText: 'Explore', link: '/collections' },
            { text: '🌺 Garba-ready collection — Use code NAVRATRI20', linkText: 'Shop', link: '/shop' },
        ],
        saleHeadline: 'Navratri Festive Sale — Flat 20% OFF',
        subText: 'Garba nights are here! Shop vibrant ethnic wear at flat 20% off.',
        coupon: 'NAVRATRI20',
        stats: [{ value: '20%', label: 'Festive OFF' }, { value: '400+', label: 'Garba Picks' }, { value: '₹699', label: 'Starts From' }],
        popupTitle: 'Navratri Dhamaka! 🪷',
        popupOffer: 'Flat 20% off on all Garba outfits',
        popupCoupon: 'NAVRATRI20',
    },
    {
        id: 'dussehra',
        name: 'Dussehra',
        emoji: '🏹',
        start: { month: 10, day: 2 },
        end:   { month: 10, day: 6 },
        colors: { bg: 'linear-gradient(135deg,#7c2d12 0%,#dc2626 60%,#b45309 100%)', accent: '#fde68a', text: '#fef2f2' },
        announcements: [
            { text: '🏹 Dussehra Sale — Victory of Style! Flat 20% OFF', linkText: 'Shop Now', link: '/shop' },
            { text: '🎊 Vijayadashami Special Ethnic Collection', linkText: 'Explore', link: '/collections' },
        ],
        saleHeadline: 'Dussehra Sale — Flat 20% OFF',
        subText: 'Victory of Good. Celebrate Vijayadashami in stunning traditional ethnic wear.',
        coupon: 'DUSSEHRA20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '250+', label: 'Products' }, { value: '₹749', label: 'Starts From' }],
        popupTitle: 'Happy Dussehra! 🏹',
        popupOffer: 'Flat 20% off — Victory Sale',
        popupCoupon: 'DUSSEHRA20',
    },
    {
        id: 'karva_chauth',
        name: 'Karva Chauth',
        emoji: '🌕',
        start: { month: 10, day: 18 },
        end:   { month: 10, day: 22 },
        colors: { bg: 'linear-gradient(135deg,#9d174d 0%,#be185d 60%,#f59e0b 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [
            { text: '🌕 Karva Chauth — Bridal Red Sarees at 15% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '💕 Dress up beautifully for your husband', linkText: 'Explore', link: '/shop' },
        ],
        saleHeadline: 'Karva Chauth Special — Flat 15% OFF',
        subText: 'Look stunning for your husband. Shop beautiful red & bridal ethnic wear.',
        coupon: 'KARVA15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '100+', label: 'Bridal Looks' }, { value: '₹999', label: 'Starts From' }],
        popupTitle: 'Happy Karva Chauth! 🌕',
        popupOffer: 'Flat 15% off on bridal red sarees',
        popupCoupon: 'KARVA15',
    },

    // ─────────── OCTOBER/NOVEMBER ───────────
    {
        id: 'dhanteras',
        name: 'Dhanteras',
        emoji: '🪙',
        start: { month: 10, day: 26 },
        end:   { month: 10, day: 29 },
        colors: { bg: 'linear-gradient(135deg,#713f12 0%,#92400e 40%,#C9960C 100%)', accent: '#fef3c7', text: '#fef3c7' },
        announcements: [
            { text: '🪙 Dhanteras — Auspicious Shopping at Flat 15% OFF!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Gold Zari Sarees — Buy on the most auspicious day!', linkText: 'Explore', link: '/shop' },
        ],
        saleHeadline: 'Dhanteras Special — Flat 15% OFF',
        subText: 'An auspicious day to buy. Gold Zari & silk sarees at 15% off!',
        coupon: 'DHAN15',
        stats: [{ value: '15%', label: 'Auspicious OFF' }, { value: '80+', label: 'Gold Zari Sarees' }, { value: '₹1299', label: 'Starts From' }],
        popupTitle: 'Shubh Dhanteras! 🪙',
        popupOffer: 'Flat 15% off + free shipping',
        popupCoupon: 'DHAN15',
    },
    {
        id: 'diwali',
        name: 'Diwali',
        emoji: '🪔',
        start: { month: 10, day: 28 },
        end:   { month: 11, day: 3 },
        colors: { bg: 'linear-gradient(135deg,#1c0010 0%,#3b0764 40%,#713f12 100%)', accent: '#f59e0b', text: '#fde68a' },
        announcements: [
            { text: '🪔 Diwali Dhamaka — FLAT 20% OFF SITEWIDE!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Biggest Festive Sale — Silk, Banarasi & More!', linkText: 'Explore', link: '/collections' },
            { text: '🎁 Diwali Gifts — Gift a saree, spread love & light!', linkText: 'Gift Now', link: '/shop' },
            { text: '🪙 Use DIWALI20 at checkout — Limited time!', linkText: 'Shop', link: '/shop' },
        ],
        saleHeadline: '🪔 Diwali Dhamaka — FLAT 20% OFF',
        subText: 'The Festival of Lights! Shop premium silk & Banarasi sarees at flat 20% off.',
        coupon: 'DIWALI20',
        stats: [{ value: '20%', label: 'FLAT OFF' }, { value: '500+', label: 'Festive Items' }, { value: '₹599', label: 'Starts From' }],
        popupTitle: 'Happy Diwali! 🪔',
        popupOffer: 'Flat 20% off on all festive orders',
        popupCoupon: 'DIWALI20',
    },
    {
        id: 'bhai_dooj',
        name: 'Bhai Dooj',
        emoji: '🎀',
        start: { month: 11, day: 1 },
        end:   { month: 11, day: 4 },
        colors: { bg: 'linear-gradient(135deg,#9d174d 0%,#db2777 60%,#f472b6 100%)', accent: '#fde68a', text: '#fff1f2' },
        announcements: [
            { text: '🎀 Bhai Dooj — Gift Your Sister at 15% OFF!', linkText: 'Gift Now', link: '/shop' },
            { text: '💝 Brothers, gift your sisters the best ethnic wear!', linkText: 'Shop', link: '/shop' },
        ],
        saleHeadline: 'Bhai Dooj Gift Sale — Flat 15% OFF',
        subText: "Brothers — gift your sister the most beautiful ethnic wear at 15% off!",
        coupon: 'BHAI15',
        stats: [{ value: '15%', label: 'Flat Discount' }, { value: '200+', label: 'Gift Options' }, { value: '₹799', label: 'Starts From' }],
        popupTitle: 'Happy Bhai Dooj! 🎀',
        popupOffer: '15% off + free gift wrap',
        popupCoupon: 'BHAI15',
    },

    // ─────────── DECEMBER ───────────
    {
        id: 'christmas',
        name: 'Christmas',
        emoji: '🎄',
        start: { month: 12, day: 22 },
        end:   { month: 12, day: 26 },
        colors: { bg: 'linear-gradient(135deg,#14532d 0%,#166534 50%,#dc2626 100%)', accent: '#fde68a', text: '#f0fdf4' },
        announcements: [
            { text: '🎄 Christmas Sale — Flat 20% OFF on all Ethnic Wear!', linkText: 'Shop Now', link: '/shop' },
            { text: '🎁 Gift a beautiful saree this Christmas!', linkText: 'Gift Now', link: '/shop' },
        ],
        saleHeadline: 'Christmas Sale — Flat 20% OFF',
        subText: "Celebrate Christmas in style! Gift ethnic wear at flat 20% off.",
        coupon: 'XMAS20',
        stats: [{ value: '20%', label: 'Flat Discount' }, { value: '300+', label: 'Gift Ideas' }, { value: '₹699', label: 'Starts From' }],
        popupTitle: 'Merry Christmas! 🎄',
        popupOffer: '20% off + free gift wrapping',
        popupCoupon: 'XMAS20',
    },
    {
        id: 'year_end_sale',
        name: 'Year-End Sale',
        emoji: '🎆',
        start: { month: 12, day: 26 },
        end:   { month: 12, day: 31 },
        colors: { bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)', accent: '#f59e0b', text: '#fde68a' },
        announcements: [
            { text: '🎆 Year-End MEGA Sale — Flat 20% OFF Sitewide!', linkText: 'Shop Now', link: '/shop' },
            { text: '✨ Last chance deals of the year — Don\'t miss out!', linkText: 'Explore', link: '/shop' },
            { text: '🎁 New Year Gifting — Shop ethnic wear for loved ones', linkText: 'Gift', link: '/shop' },
        ],
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

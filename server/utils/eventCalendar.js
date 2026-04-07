/**
 * Event Calendar — Server-Side Mirror (CommonJS)
 * Mirrors the frontend eventBannerConfig.js so the backend cron job
 * can detect upcoming events and send flash sale emails.
 */

const EVENTS = [
    // JANUARY
    { id: 'new_year',      name: 'New Year',                emoji: '🎆', start: { month: 1, day: 1  }, end: { month: 1, day: 4  }, coupon: 'NEWYEAR20',    discount: 20 },
    { id: 'pongal',        name: 'Pongal / Makar Sankranti',emoji: '🌾', start: { month: 1, day: 12 }, end: { month: 1, day: 16 }, coupon: 'SANKRANTI20',  discount: 20 },
    { id: 'republic_day',  name: 'Republic Day',            emoji: '🇮🇳', start: { month: 1, day: 24 }, end: { month: 1, day: 27 }, coupon: 'REPUBLIC20',   discount: 20 },
    // FEBRUARY
    { id: 'valentines',    name: "Valentine's Day",         emoji: '💕', start: { month: 2, day: 12 }, end: { month: 2, day: 15 }, coupon: 'VDAY20',       discount: 20 },
    // MARCH
    { id: 'holi',          name: 'Holi',                    emoji: '🎨', start: { month: 3, day: 12 }, end: { month: 3, day: 15 }, coupon: 'HOLI20',       discount: 20 },
    // APRIL
    // APRIL
    { id: 'ugadi',         name: 'Ugadi / Gudi Padwa',      emoji: '🌸', start: { month: 3, day: 25 }, end: { month: 3, day: 29 }, coupon: 'UGADI20',      discount: 20 },
    { id: 'ramnavami',     name: 'Ram Navami',               emoji: '🙏', start: { month: 4, day: 5  }, end: { month: 4, day: 7  }, coupon: 'RAMNAVAMI15', discount: 15 },
    { id: 'vishu',         name: 'Vishu / Baisakhi',        emoji: '🌾', start: { month: 4, day: 12 }, end: { month: 4, day: 16 }, coupon: 'HARVEST20',    discount: 20 },
    { id: 'akshaya',       name: 'Akshaya Tritiya',          emoji: '🪙', start: { month: 4, day: 17 }, end: { month: 4, day: 22 }, coupon: 'AKSHAYA20',    discount: 20 },
    // MAY-JUNE
    { id: 'summer_sale',   name: 'Summer Sale',              emoji: '☀️', start: { month: 4, day: 25 }, end: { month: 6, day: 20 }, coupon: 'SUMMER15',     discount: 15 },
    // JULY-AUGUST
    { id: 'eid_adha',      name: 'Eid ul-Adha',              emoji: '🕌', start: { month: 6, day: 6  }, end: { month: 6, day: 9  }, coupon: 'EIDADHA20',    discount: 20 },
    { id: 'rakhi',         name: 'Raksha Bandhan',           emoji: '🎀', start: { month: 8, day: 7  }, end: { month: 8, day: 10 }, coupon: 'RAKHI15',      discount: 15 },
    { id: 'independence',  name: 'Independence Day',         emoji: '🇮🇳', start: { month: 8, day: 13 }, end: { month: 8, day: 16 }, coupon: 'AZADI20',      discount: 20 },
    { id: 'krishna',       name: 'Janmashtami',              emoji: '🦚', start: { month: 8, day: 14 }, end: { month: 8, day: 16 }, coupon: 'KRISHNA15',    discount: 15 },
    // SEPTEMBER
    { id: 'ganesh',        name: 'Ganesh Chaturthi',         emoji: '🐘', start: { month: 8, day: 27 }, end: { month: 9, day: 5  }, coupon: 'GANESH20',     discount: 20 },
    // SEPTEMBER-OCTOBER
    { id: 'onam',          name: 'Onam',                     emoji: '🌺', start: { month: 9, day: 3  }, end: { month: 9, day: 8  }, coupon: 'ONAM15',       discount: 15 },
    { id: 'navratri',      name: 'Navratri',                 emoji: '🪔', start: { month: 10, day: 2 }, end: { month: 10, day: 12 }, coupon: 'NAVRATRI20',  discount: 20 },
    { id: 'dussehra',      name: 'Dussehra',                 emoji: '🏹', start: { month: 10, day: 12 }, end: { month: 10, day: 14 }, coupon: 'DUSSEHRA20', discount: 20 },
    // NOVEMBER
    { id: 'chauth',        name: 'Karwa Chauth',             emoji: '🌕', start: { month: 10, day: 28 }, end: { month: 10, day: 30 }, coupon: 'CHAUTH15',   discount: 15 },
    { id: 'dhanteras',     name: 'Dhanteras',                emoji: '✨', start: { month: 10, day: 29 }, end: { month: 10, day: 31 }, coupon: 'DHANTERAS15', discount: 15 },
    { id: 'diwali',        name: 'Diwali',                   emoji: '🪔', start: { month: 11, day: 1  }, end: { month: 11, day: 5  }, coupon: 'DIWALI20',   discount: 20 },
    { id: 'bhaidooj',      name: 'Bhai Dooj',                emoji: '🤝', start: { month: 11, day: 3  }, end: { month: 11, day: 6  }, coupon: 'BHAIDOOJ15', discount: 15 },
    // DECEMBER
    { id: 'christmas',     name: 'Christmas',                emoji: '🎄', start: { month: 12, day: 22 }, end: { month: 12, day: 26 }, coupon: 'XMAS20',     discount: 20 },
    { id: 'year_end',      name: 'Year End Sale',            emoji: '🎇', start: { month: 12, day: 26 }, end: { month: 12, day: 31 }, coupon: 'YEAREND20',  discount: 20 },
];

const toNum = (m, d) => m * 100 + d;

/** Get the event happening TODAY */
const getActiveEvent = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayNum = toNum(month, day);

    for (const event of EVENTS) {
        const startNum = toNum(event.start.month, event.start.day);
        const endNum   = toNum(event.end.month,   event.end.day);
        if (startNum <= endNum) {
            if (todayNum >= startNum && todayNum <= endNum) return event;
        } else {
            if (todayNum >= startNum || todayNum <= endNum) return event;
        }
    }
    return null; // No event today
};

/** Get any event starting TOMORROW — used for advance flash-news emails */
const getUpcomingEvent = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const month = tomorrow.getMonth() + 1;
    const day   = tomorrow.getDate();
    const tomorrowNum = toNum(month, day);

    for (const event of EVENTS) {
        const startNum = toNum(event.start.month, event.start.day);
        if (startNum === tomorrowNum) return event;
    }
    return null;
};

module.exports = { EVENTS, getActiveEvent, getUpcomingEvent };

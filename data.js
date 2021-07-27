if (!window.Pywb) window.Pywb = {};
Pywb.makeData = (rawSnaps) => {
    const all = new PywbPeriod({type: PywbPeriod.Type.all, id: 'all'});

    rawSnaps.forEach(rawSnap => {
        const snap = new PywbSnapshot(rawSnap);
        let yearPeriod, monthPeriod, dayPeriod, hourPeriod;
        if (!(yearPeriod = all.getChildById(snap.year))) {
            yearPeriod = new PywbPeriod({type: PywbPeriod.Type.year, id: snap.year, parent: all});
            all.addChild(yearPeriod);
        }
        if (!(monthPeriod = yearPeriod.getChildById(snap.month))) {
            monthPeriod = new PywbPeriod({type: PywbPeriod.Type.month, id: snap.month, parent: yearPeriod});
            yearPeriod.addChild(monthPeriod);
        }

        if (!(dayPeriod = monthPeriod.getChildById(snap.day))) {
            dayPeriod = new PywbPeriod({type: PywbPeriod.Type.day, id: snap.day, parent: monthPeriod});
            monthPeriod.addChild(dayPeriod);
        }
        if (!(hourPeriod = dayPeriod.getChildById(snap.hour))) {
            hourPeriod = new PywbPeriod({type: PywbPeriod.Type.hour, id: snap.hour, parent: dayPeriod});
            dayPeriod.addChild(hourPeriod);
        }

        hourPeriod.addSnapshot(snap);
        all.addSnapshot(snap, true);
    });

    //console.log('monthly max for all time',all.max);
    return all;
};

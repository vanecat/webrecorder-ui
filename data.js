if (!window.Pywb) window.Pywb = {};
Pywb.makeData = (rawSnaps) => {
    const all = new PywbPeriod({type: PywbPeriod.Type.all, id: 'all'});
    const linear = [];
    rawSnaps.forEach(rawSnap => {
        const snap = new PywbSnapshot(rawSnap);
        let yearPeriod, monthPeriod, dayPeriod, hourPeriod, snapPeriod;
        if (!(yearPeriod = all.getChildById(snap.year))) {
            yearPeriod = new PywbPeriod({type: PywbPeriod.Type.year, id: snap.year, parent: all});
        }
        if (!(monthPeriod = yearPeriod.getChildById(snap.month))) {
            monthPeriod = new PywbPeriod({type: PywbPeriod.Type.month, id: snap.month, parent: yearPeriod});
        }

        if (!(dayPeriod = monthPeriod.getChildById(snap.day))) {
            dayPeriod = new PywbPeriod({type: PywbPeriod.Type.day, id: snap.day, parent: monthPeriod});
        }
        if (!(hourPeriod = dayPeriod.getChildById(snap.hour))) {
            hourPeriod = new PywbPeriod({type: PywbPeriod.Type.hour, id: snap.hour, parent: dayPeriod});
        }
        if (!(snapPeriod = hourPeriod.getChildById(snap.id))) {
            snapPeriod = new PywbPeriod({type: PywbPeriod.Type.snapshot, id: snap.id, parent: hourPeriod});
        }
        snapPeriod.setSnapshot(snap);

        linear.push(snap);
    });

    //console.log('monthly max for all time',all.max);
    return {groupped: all, linear};
};

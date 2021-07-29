if (!window.Pywb) window.Pywb = {};
Pywb.makeData = (rawSnaps) => {
    const all = new PywbPeriod({type: PywbPeriod.Type.all, id: 'all'});
    const linear = [];
    let lastYear, lastMonth, lastDay, lastHour;
    rawSnaps.forEach(rawSnap => {
        const snap = new PywbSnapshot(rawSnap);
        let year, month, day, hour, single;
        if (!(year = all.getChildById(snap.year))) {
            year = new PywbPeriod({type: PywbPeriod.Type.year, id: snap.year});
            all.addChild(year);
        }
        if (!(month = year.getChildById(snap.month))) {
            month = new PywbPeriod({type: PywbPeriod.Type.month, id: snap.month});
            year.addChild(month);
        }
        if (!(day = month.getChildById(snap.day))) {
            day = new PywbPeriod({type: PywbPeriod.Type.day, id: snap.day});
            month.addChild(day);
        }
        if (!(hour = day.getChildById(snap.hour))) {
            hour = new PywbPeriod({type: PywbPeriod.Type.hour, id: snap.hour});
            day.addChild(hour);
        }
        if (!(single = hour.getChildById(snap.id))) {
            single = new PywbPeriod({type: PywbPeriod.Type.snapshot, id: snap.id});
            hour.addChild(single);
        }
        single.setSnapshot(snap);
        linear.push(snap);
    });

    return {groupped: all, linear};
};
